### Development Instructions
To launch the React app and run the server at the same time, run:
```
yarn dev
```
If either Express or React exit with a non-zero status code, the other process will be killed.

The React client will run on port *3000*.
The Express backend runs on port *3200*.
The React client is configured to proxy unrecognized URLs to the Express backend.
(e.g. making a `fetch('/api/test')` call will make a request to the Express server.)

Try to write each of the views in React, while serving data from the Express API through /api/path.