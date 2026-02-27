const express = require('express');
const session = require('express-session');
const routes = require('./routes');
const { migrate } = require('./models/migrate');
const { apiNotFound, errorHandler } = require('./middleware/error_handler');

const JSON_LIMIT = '1mb';
const DEFAULT_SESSION_SECRET = 'dev-secret';
const DEFAULT_PORT = 3000;

const app = express();

app.use(express.json({ limit: JSON_LIMIT }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use('/api', routes);
app.use(apiNotFound);
app.use(errorHandler);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const migratePromise = migrate();

function startServer({
  appInstance = app,
  migrateTask = migratePromise,
  port = process.env.PORT || DEFAULT_PORT,
  logger = console,
  processRef = process
} = {}) {
  return migrateTask
    .then(() => {
      const server = appInstance.listen(port, () => {
        logger.log(`CMS backend listening on ${port}`);
      });
      return server;
    })
    .catch((err) => {
      logger.error('Migration failed:', err);
      processRef.exit(1);
      return null;
    });
}

function maybeAutoStart({
  mainModule = require.main,
  currentModule = module,
  startFn = startServer
} = {}) {
  if (mainModule === currentModule) {
    return startFn();
  }
  return null;
}

maybeAutoStart();

module.exports = { app, migratePromise, startServer, maybeAutoStart };
