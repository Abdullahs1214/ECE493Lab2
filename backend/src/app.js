const express = require('express');
const session = require('express-session');
const routes = require('./routes');
const { migrate } = require('./models/migrate');

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

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const migratePromise = migrate();

if (require.main === module) {
  const port = process.env.PORT || DEFAULT_PORT;
  migratePromise
    .then(() => {
      app.listen(port, () => {
        console.log(`CMS backend listening on ${port}`);
      });
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { app, migratePromise };
