### Development Instructions
Make sure you have mongodb installed. Run `mongod` in a separate tab before starting the server.
If you want to initialize the db with some random sample data, also run `node initdb.js` from the base directory. You can also refer to this file if you want to look at some sample mongoose code.

To run the express server, use:
```
yarn dev
```
This will use nodemon to run the server. This very conveniently restarts the server when you change files.

The server runs on **localhost:3200**.
