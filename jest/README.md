# Testing with Jest

For our unit and integration tests [Jest](https://facebook.github.io/jest/) will be our main testing framework. There's a huge amount of functionality in Jest, but below we'll highlight a few concepts that are important for using Jest in GradeMe.

### Creating a Test

There are two ways to create a test. One is to put the JavaScript files in a `__tests__` directory, the other is to name the file `something.test.js`. Either way is fine and can be adapted to how you best see fit.

For a few examples of how to write some basic tests, take a look on the [Jest Docs](https://facebook.github.io/jest/docs/en/getting-started.html) or in our repo [here](jest/example).

A few quick gotchas that can pop up frequently:

- Make sure to use `await` for any asynchronous function call. Some frequent culprits are database saves or queries.
- Make sure to open and close the database in beforeAll/afterAll or beforeEach/afterEach
