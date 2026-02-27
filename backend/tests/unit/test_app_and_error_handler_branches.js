const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { apiNotFound, errorHandler } = require('../../src/middleware/error_handler');
const { app, startServer, maybeAutoStart } = require('../../src/app');

test('apiNotFound calls next for non-api paths', () => {
  let called = false;
  const req = { path: '/health' };
  const res = {};
  apiNotFound(req, res, () => {
    called = true;
  });
  assert.equal(called, true);
});

test('errorHandler forwards when headers already sent', () => {
  const err = new Error('already sent');
  let forwarded = null;
  const res = { headersSent: true };
  errorHandler(err, {}, res, (nextErr) => {
    forwarded = nextErr;
  });
  assert.equal(forwarded, err);
});

test('errorHandler returns internal_error for generic exceptions', () => {
  let statusCode = 0;
  let payload = null;
  const res = {
    headersSent: false,
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      payload = body;
      return this;
    }
  };

  errorHandler(new Error('boom'), {}, res, () => {});

  assert.equal(statusCode, 500);
  assert.equal(payload.error.code, 'internal_error');
});

test('startServer starts app when migrate succeeds', async () => {
  let listenedPort = null;
  let logMessage = '';
  const fakeServer = { close() {} };

  const appInstance = {
    listen(port, cb) {
      listenedPort = port;
      cb();
      return fakeServer;
    }
  };

  const server = await startServer({
    appInstance,
    migrateTask: Promise.resolve(),
    port: 4321,
    logger: { log: (msg) => { logMessage = msg; }, error: () => {} },
    processRef: { exit: () => {} }
  });

  assert.equal(server, fakeServer);
  assert.equal(listenedPort, 4321);
  assert.equal(logMessage, 'CMS backend listening on 4321');
});

test('startServer exits process when migrate fails', async () => {
  let errorArgs = null;
  let exitCode = null;

  const server = await startServer({
    appInstance: {
      listen() {
        throw new Error('should not listen');
      }
    },
    migrateTask: Promise.reject(new Error('migration failed')),
    logger: {
      log: () => {},
      error: (...args) => {
        errorArgs = args;
      }
    },
    processRef: {
      exit(code) {
        exitCode = code;
      }
    }
  });

  assert.equal(server, null);
  assert.equal(exitCode, 1);
  assert.equal(errorArgs[0], 'Migration failed:');
});

test('app health endpoint returns ok payload', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, 'ok');
});

test('maybeAutoStart does not start when modules differ', () => {
  const result = maybeAutoStart({ mainModule: {}, currentModule: {} });
  assert.equal(result, null);
});

test('maybeAutoStart starts when modules match', () => {
  let started = false;
  const token = Symbol('started');
  const result = maybeAutoStart({
    mainModule: app,
    currentModule: app,
    startFn: () => {
      started = true;
      return token;
    }
  });
  assert.equal(started, true);
  assert.equal(result, token);
});
