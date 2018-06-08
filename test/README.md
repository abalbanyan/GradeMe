# Testing GradeMe

There are three types of testing done for GradeMe: unit, integration, and UI tests. Unit and integration tests are done with [Jest](https://facebook.github.io/jest/), and UI testing is done with [CasperJS](http://casperjs.org/).

If you want to only run unit and integration tests use:

```bash
yarn test
```

And if you want to only run UI tests use:

```bash
yarn test-ui
```

Whenever a commit is pushed to GitHub all test suites will automatically be run by [Travis CI](https://travis-ci.org/), and you can view the results of these commits [here](https://travis-ci.org/abalbanyan/GradeMe).

## Creating a Test with Jest

There are two ways to create a test. One is to put the JavaScript files in a `__tests__` directory, the other is to name the file `something.test.js`. Either way is fine and can be adapted to how you best see fit.

For a few examples of how to write some basic tests, take a look on the [Jest Docs](https://facebook.github.io/jest/docs/en/getting-started.html) or in our repo [here](example).

After you've written some new code or tests you can quickly run them locally with `yarn test`.

One major point is that each test suite (.test.js file) will create a new MongoDB server in memory, hence you don't need to worry about Jest messing up your local database instance or any test files conflicting with each other.

A few quick gotchas that can pop up frequently:

- Make sure to use `await` for any asynchronous function call. Some frequent culprits are database saves or queries.
- Make sure to open and close the database in beforeAll/afterAll or beforeEach/afterEach

## Creating a Test with CasperJS

For UI testing with CasperJS, the server will be run locally and it will start up a MongoDB server in memory similar to Jest. However, in this case that server will be persistent for all UI tests, so you need to be careful to cleanup anything you don't want in the database.

When creating tests the [CasperJS Docs](http://docs.casperjs.org/en/latest/testing.html) are a great place to get started.

One nice part of testing with CasperJS is that a browser window does not need to be run in order for the UI to be tested. This is great in many respects; however, if your tests start failing it can be frustrating. To alleviate this issue use CasperJS's [snapshot function](https://thejsguy.com/2015/04/30/taking-screenshots-with-casper.html), to get a view of what the webpage would currently look like in the browser.
