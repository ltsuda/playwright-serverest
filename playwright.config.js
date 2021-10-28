const config = {
    testDir: "tests/api",
    retries: 1,
    reporter: process.env.CI
        ? [["dot"], ["html", { outputFolder: "test-results" }]]
        : [["line"], ["html", { outputFolder: "test-results" }]],
    workers: process.env.CI ? 2 : undefined,

    webServer: {
        command: "NODE_ENV=serverest-test npx serverest --nodoc",
        port: 3000,
        timeout: 60 * 1000,
        reuseExistingServer: !process.env.CI,
        cwd: "serverest",
    },

    use: {
        headless: true,
        baseURL: "http://localhost:3000",
    },
}

module.exports = config
