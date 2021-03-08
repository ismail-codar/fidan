const Bundler = require('parcel-bundler');
const express = require('express');

const bundler = new Bundler('index.html', {
  open: true,
  cache: false,
});

const app = express();
app.use(bundler.middleware());

const port = process.env.PORT || 1234;
console.warn(' http://localhost:' + port);
app.listen(Number(port));
