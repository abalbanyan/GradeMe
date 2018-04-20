const express = require('express');

const app = express();
const port = process.env.PORT || 3200;

app.get('/api/test', (req, res) => {
  res.send({ express: 'test' });
});

app.listen(port, () => console.log(`Listening on port ${port}`));