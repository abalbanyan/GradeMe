# GradeMe

[![Build Status](https://travis-ci.org/abalbanyan/GradeMe.svg?branch=master)](https://travis-ci.org/abalbanyan/GradeMe)

GradeMe is a desktop web application designed to be a grade portal for computer science classes. It has the standard features one might expect like the ability to: create courses, create assignments, upload assignment specifications, accept student submissions, etc, but also the novel feature of automating the testing and grading of assignments. In addition, we offer the ability for instructors to allow students to pregrade assignments using the test scripts uploaded by the instructor. This allows students to get immediate feedback and fix their program should anything be wrong.

### Development Instructions
Make sure you have mongodb installed. Run `mongod` in a separate tab before starting the server.
If you want to initialize the db with some random sample data, also run `node initdb.js` from the base directory. You can also refer to this file if you want to look at some sample mongoose code.

To run the express server, use:
```
yarn dev
```
This will use nodemon to run the server. This very conveniently restarts the server when you change files.

The server runs on **localhost:3200**.

#### NOTE:
```
yarn install
```
Will also symlink autograder.js into the node_modules directory if it doesn't already exist.
(Linux is *required*, our app assumes this)

### Testcases UI

The testcases UI is still highly experimental, and we considered it too risky to merge into master. It can be checked out and viewed on the `rodrigo/testcases` branch. Setup instructions are the same.

### Testing Instructions

To start running tests all you need to do is run `yarn test`. This will run through all of the testing suites and give you back the results. Also, when running the tests they will use a different database than your local instance of Mongo, so you don't have to worry about your current database instance being modified when running tests.

To get started building your own tests you can check out the README [here](test).
