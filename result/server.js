const express = require('express');
const async = require('async');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const client = require('prom-client');
const register = client.register;

client.collectDefaultMetrics();

/*
|--------------------------------------------------------------------------
| App Initialization
|--------------------------------------------------------------------------
*/

const app = express();
const server = http.Server(app);
const io = socketIo(server);

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
| PostgreSQL Connection
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

  function(callback) {

    pool.connect(function(err, client, done) {

      if (err) {

        console.error('Waiting for db...');
        console.error(err.message);

        return callback(err);
      }

      console.log('Database connection acquired');

      callback(null, client);
    });
  },

  function(err, client) {

    if (err) {

      console.error('Giving up connecting to database');

      process.exit(1);
    }

    console.log('Connected to db');

    getVotes(client);
  }
);

/*
|--------------------------------------------------------------------------
| Poll Votes
|--------------------------------------------------------------------------
*/

function getVotes(client) {

  client.query(
    'SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote',
    [],
    function(err, result) {

      if (err) {

        console.error('Error performing query');
        console.error(err.message);

      } else {

        const votes = collectVotesFromResult(result);

        io.sockets.emit('scores', JSON.stringify(votes));
      }

      setTimeout(function () {

        getVotes(client);

      }, 1000);
    }
  );
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
| Prometheus Metrics
|--------------------------------------------------------------------------
*/

app.get('/metrics', async (req, res) => {

  res.set('Content-Type', register.contentType);

  res.end(await register.metrics());
});

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get('/healthz', function (req, res) {

  res.status(200).send('OK');
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

server.listen(port, function () {

  console.log(`App running on port ${port}`);
});