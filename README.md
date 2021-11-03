[![API Tests](https://github.com/ltsuda/playwright-serverest/actions/workflows/main.yml/badge.svg)](https://github.com/ltsuda/playwright-serverest/actions/workflows/main.yml) [![README Portuguese](https://img.shields.io/badge/README-Portuguese-blue)](https://github.com/ltsuda/playwright-serverest/blob/main/README-ptbr.md)
[![Badge ServeRest](https://img.shields.io/badge/API-ServeRest-green)](https://github.com/ServeRest/ServeRest/)

# [Playwright ServeRest](https://ltsuda.github.io/playwright-serverest/)

Repository with the purpose of learning a new E2E testing framework using Microsoft's 🎭 Playwright with Javascript

## System Under Test

<a href="https://serverest.dev/">
<img src="https://user-images.githubusercontent.com/29241659/115161869-6a017e80-a076-11eb-9bbe-c391eff410db.png" width=240>
</a>

The REST Server used in this repository is a open source REST API provided by [Paulo Gonçalves](https://github.com/PauloGoncalvesBH) to help developers to learn about API testing.

## Installation and execution

### Requirements

-   [git](https://git-scm.com/downloads)
-   [node 14+](https://nodejs.org/en/)
    -   or use [nvm](https://github.com/nvm-sh/nvm) to manage multiple node versions
-   Docker (Optional) for running tests on container

#### Cloning repository with submodule

```text
git clone https://github.com/ltsuda/playwright-serverest
```

#### Installing dependencies

```bash
# this will install all necessary development packages to run the tests. See package.json to see all packages installed
npm install
```

#### Running the tests

In this repository there are multiple test scripts with different configurations. Please, see the `package.json/scripts` to see all options and to see the Playwrights' configuration, see file `playwright.config.js`

**The following scripts was tested on Ubuntu 20.04/WSL**

For example:

```bash
# to run all API tests
npx playwright test:api

# to run all Schema tests
npx playwright test:schema

# to run both API and Schema tests
npx playwright test:all

# to run all test with specific tag
npx playwright test --grep <tag>
```

All test scripts will generate the tests results using the HTML Reporter. To show the report, use the following scripts:

```bash
npm run reporter:html
# directory 'test-results' is configured on playwright.config.js
```

This will start a webserver with the tests report, just ctrl+click or open the URL that is showing on your terminal

**Building docker image to run the tests**

The `Docker` image runs the tests with the HTML reporter and starts the web server on port 9323 serving the tests reports.

To build the image and run all tests, run the following commands:

```bash
> docker build -f Dockerfile . -t test:docker
# wait ...

# To run the default node script, use the following command
# The container will continue running with the webserver open, navigate to http://localhost to see the test reports and press CTRL+C to stop the webserver and remove the container
# optionally, if you want the test results in case some test fails, bind a volume to host with "-v /fullpath:/tester/test-results/" on the docker command

❯ docker run --rm --ipc=host -p 80:9323 playwright:docker

> playwright-serverest@1.0.0 test:docker
> npx playwright test

[WebServer] event-loop-stats not found, ignoring event loop metrics...

  92 passed (2s)

All tests passed. To open last HTML report run:

  npx playwright show-report


> playwright-serverest@1.0.0 posttest:docker
> npm run reporter:html


> playwright-serverest@1.0.0 reporter:html
> npx playwright show-report test-results


  Serving HTML report at http://127.0.0.1:9323. Press Ctrl+C to quit.

# or, for example, if you want to change the test reporter
# in this case, the HTML report will not be generated and the web server will not run
> docker run --rm --ipc=host test:docker npx playwright test --reporter=list
```

## Directory structure

```text
.
├──.github/workflows
├── Dockerfile
├── README.md
├── README-ptbr.md
├── api
│   ├── fixtures.js
│   └── schemas
│       ├── carrinhos.js
│       ├── login.js
│       ├── produtos.js
│       └── usuarios.js
├── package-lock.json
├── package.json
├── playwright.config.js
└── tests
    └── api
        ├── carrinhos.spec.js
        ├── login.spec.js
        ├── produtos.spec.js
        ├── schemas
        │   ├── carrinhos.spec.js
        │   ├── login.spec.js
        │   ├── produtos.spec.js
        │   └── usuarios.spec.js
        └── usuarios.spec.js
```

-   [.github/workflows](https://github.com/ltsuda/playwright-serverest/tree/main/.github/workflows): directory with github workflows that runs at every `push` to main or every `pull request` open.
    -   [main.yaml](https://github.com/ltsuda/playwright-serverest/blob/main/.github/workflows/main.yml): run api and schema test jobs on `pull request` or run all tests when `push` to `main`, then generate the HTML report and deploy it to github-pages
    -   [docker.yaml](https://github.com/ltsuda/playwright-serverest/blob/main/.github/workflows/docker.yaml): build image `Dockerfile`, run respective scripts for both api and schema tags. This workflow runs on every `pull request` or push to the `main` branch.
-   [Dockerfile](https://github.com/ltsuda/playwright-serverest/blob/main/Dockerfile): docker image file to run locally in case of node it's not installed.
-   [api/schemas](https://github.com/ltsuda/playwright-serverest/tree/main/api/schemas): directory with schemas for all endpoints and using https://joi.dev/ library
-   [api/pageFixtures.js](https://github.com/ltsuda/playwright-serverest/blob/main/api/fixtures.js): file with shared functions ([Fixtures](https://playwright.dev/docs/test-fixtures)) that extends playwright's `test` to instantiate all endpoints and helper functions so each test case loads only what it needs.
-   [playwright.config.js](https://github.com/ltsuda/playwright-serverest/blob/main/playwright.config.js): playwright's configuration file to setup things like which reporter library to use, how many test workers to be used and how to start the REST server.
-   [tests/api](https://github.com/ltsuda/playwright-serverest/tree/main/tests/api): directory with all API test specs files, including the test schema directory
-   [tests/api/schema](https://github.com/ltsuda/playwright-serverest/tree/main/tests/api/schemas): directory with all Schema test spec files
