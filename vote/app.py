from flask import Flask, render_template, request, make_response, g
from redis import Redis
from prometheus_flask_exporter import PrometheusMetrics

import os
import socket
# import random
import json
import logging
import uuid

option_a = os.getenv('OPTION_A', "Cats")
option_b = os.getenv('OPTION_B', "Dogs")
hostname = socket.gethostname()

app = Flask(__name__)

# -----------------------------
# PROMETHEUS METRICS
# -----------------------------
metrics = PrometheusMetrics(app)

vote_counter = metrics.counter(
    'vote_requests_total',
    'Total vote requests',
    labels={'vote': lambda: request.form.get('vote', 'unknown')}
)

# -----------------------------
# LOGGING
# -----------------------------
gunicorn_error_logger = logging.getLogger('gunicorn.error')

app.logger.handlers.extend(gunicorn_error_logger.handlers)
app.logger.setLevel(logging.INFO)

# -----------------------------
# REDIS CONNECTION
# -----------------------------
def get_redis():
    if not hasattr(g, 'redis'):
        # g.redis = Redis(
        #     # host="redis",
        #     host=os.getenv("REDIS_HOST", "redis"),
        #     db=0,
        #     socket_timeout=5,
        #     decode_responses=True
        # )
        g.redis = Redis(
            host=os.getenv("REDIS_HOST", "redis"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            db=0,
            socket_timeout=2,
            socket_connect_timeout=2,
            health_check_interval=30,
            decode_responses=True
        )
    return g.redis

@app.teardown_appcontext
def close_redis(exception):
    redis = g.pop('redis', None)

    if redis is not None:
        redis.close()

# -----------------------------
# LIVENESS PROBE
# ONLY CHECKS APP PROCESS
# -----------------------------
@app.route("/livez")
def livez():
    return {
        "status": "alive",
        "hostname": hostname
    }, 200

# -----------------------------
# READINESS PROBE
# CHECKS REDIS CONNECTIVITY
# -----------------------------
@app.route("/readyz")
def readyz():

    try:
        redis = get_redis()

        # lightweight redis health check
        redis.ping()

        return {
            "status": "ready",
            "redis": "connected",
            "hostname": hostname
        }, 200

    except Exception as e:

        app.logger.error("Redis readiness check failed: %s", str(e))

        return {
            "status": "not ready",
            "redis": "disconnected",
            "error": str(e)
        }, 503

# -----------------------------
# MAIN APPLICATION
# -----------------------------
@app.route("/", methods=['POST', 'GET'])
@vote_counter
def hello():

    voter_id = request.cookies.get('voter_id')

    if not voter_id:
        # voter_id = hex(random.getrandbits(64))[2:-1]
        voter_id = str(uuid.uuid4())

    vote = None

    if request.method == 'POST':

        try:
            redis = get_redis()

            vote = request.form['vote']
            if vote not in ['a', 'b']:
                return {
                    "error": "invalid vote"
                }, 400

            app.logger.info('Received vote for %s', vote)

            data = json.dumps({
                'voter_id': voter_id,
                'vote': vote
            })

            redis.rpush('votes', data)

        except Exception as e:

            app.logger.error("Failed to push vote to Redis: %s", str(e))

            return {
                "error": "Redis unavailable"
            }, 500

    resp = make_response(render_template(
        'index.html',
        option_a=option_a,
        option_b=option_b,
        hostname=hostname,
        vote=vote,
    ))

    resp.set_cookie('voter_id', voter_id)

    return resp

# -----------------------------
# APPLICATION ENTRYPOINT
# -----------------------------
if __name__ == "__main__":
    app.run(
        host='0.0.0.0',
        port=80,
        debug=False,
        threaded=True
    )