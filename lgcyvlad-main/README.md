# LGCY Backend

This is LGCY backend server

## Manual Installation

Install the dependencies:

```bash
yarn install
```

Set the environment variables:

```bash
cp .env.example .env

```

## Commands

Running locally:

```bash
yarn dev
```

Running in production:

```bash
yarn start
```

Testing:

```bash
# run all tests
yarn test

# run all tests in watch mode
yarn test:watch

# run test coverage
yarn coverage
```

Docker:

```bash
# run docker container in development mode
yarn docker:dev

# run docker container in production mode
yarn docker:prod

# run all tests in a docker container
yarn docker:test
```
