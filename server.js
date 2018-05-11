const app = require('./app.js');
const port = process.env.PORT || 3200;

app.listen(port, () => console.log(`Listening on port ${port}`));
