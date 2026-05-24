const express = require('express');
const async = require('async');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const client = require('prom-client');

const register = client.register;

/*
|--------------------------------------------------------------------------
| Prometheus Metrics
|--------------------------------------------------------------------------
*/

client.collectDefaultMetrics({
  timeout: 5000
});

/*
|--------------------------------------------------------------------------
| App Initialization
|--------------------------------------------------------------------------
*/

const app = express();
const server = http.Server(app);
const io = socketIo(server, {
  cors: {
    origin: '*'
  }
});

const port = process.env.PORT || 4000;

/*
|--------------------------------------------------------------------------
| Socket.IO
|--------------------------------------------------------------------------
*/

io.on('connection', function (socket) {
  console.log('Client connected');
  socket.emit('message', {
    text: 'Welcome!'
  });

  socket.on('subscribe', function (data) {
    console.log(`Client subscribed to ${data.channel}`);
    socket.join(data.channel);
  });
  socket.on('disconnect', function () {
    console.log('Client disconnected');
  });
});

/*
|--------------------------------------------------------------------------
| PostgreSQL Connection Pool
|--------------------------------------------------------------------------
*/

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'postgres',

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

/*
|--------------------------------------------------------------------------
| Retry Database Connection
|--------------------------------------------------------------------------
*/

async.retry(
  {
    times: 1000,
    interval: 1000
  },

  async function () {
    const client = await pool.connect();
    console.log('Database connection acquired');
    client.release();
    return true;
  },

  async function (err) {
    if (err) {
      console.error('Giving up connecting to database');
      process.exit(1);
    }
    console.log('Connected to db');
    startVotePolling();
  }
);

/*
|--------------------------------------------------------------------------
| Poll Votes
|--------------------------------------------------------------------------
*/

async function getVotes() {
  try {
    const result = await pool.query(
      'SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote'
    );

    const votes = collectVotesFromResult(result);
    io.sockets.emit('scores', JSON.stringify(votes));
  } catch (err) {
    console.error('Error performing query');
    console.error(err.message);
  }
}

/*
|--------------------------------------------------------------------------
| Controlled Polling Loop
|--------------------------------------------------------------------------
*/

function startVotePolling() {
  setInterval(async () => {
    await getVotes();
  }, 2000);
}

/*
|--------------------------------------------------------------------------
| Transform Vote Result
|--------------------------------------------------------------------------
*/

function collectVotesFromResult(result) {
  const votes = {
    a: 0,
    b: 0
  };

  result.rows.forEach(function (row) {
    votes[row.vote] = parseInt(row.count);
  });

  return votes;
}

/*
|--------------------------------------------------------------------------
| Express Middleware
|--------------------------------------------------------------------------
*/

app.use(cookieParser());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'views')));

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.get('/', function (req, res) {
  res.sendFile(
    path.resolve(__dirname, 'views/index.html')
  );
});

/*
|--------------------------------------------------------------------------
| Prometheus Metrics Endpoint
|--------------------------------------------------------------------------
*/

app.get('/metrics', async (req, res) => {
  try {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType);
    res.status(200).end(metrics);
  } catch (err) {
    console.error('Metrics endpoint failed');
    console.error(err.message);
    res.status(500).end();
  }
});

/*
|--------------------------------------------------------------------------
| Health Checks
|--------------------------------------------------------------------------
*/

app.get('/healthz', function (req, res) {
  res.status(200).send('OK');
});

app.get('/readyz', async function (req, res) {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'ready',
      database: 'connected'
    });
  } catch (err) {
    console.error('Readiness check failed');
    console.error(err.message);
    res.status(503).json({
      status: 'not ready',
      database: 'disconnected'
    });
  }
});

/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

process.on('SIGTERM', async () => {
  console.log('SIGTERM received');
  try {
    await pool.end();
    console.log('Database pool closed');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/
server.listen(port, '0.0.0.0', function () {
  console.log(`App running on port ${port}`);
});