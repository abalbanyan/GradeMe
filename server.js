const app = require('./app.js');
const port = process.env.PORT || 3200;
process.on('unhandledRejection', (reason, promise) => {
    console.warn('Unhandled promise rejection:', promise, 'reason:', reason.stack || reason);
});
console.log(process.version);

app.listen(port, () => console.log(`Listening on port ${port}`));
