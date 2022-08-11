const config = {
    testDir: "tests/api",
    retries: 1,
    reporter: process.env.CI ? [["dot"], ["html", { open: "never" }]] : [["line"], ["html", { open: "never" }]],
    workers: process.env.CI ? 2 : undefined,

    webServer: {
        command: "npx serverest --nodoc",
        port: 3000,
        timeout: 60 * 1000,
        reuseExistingServer: !process.env.CI,
        cwd: ".",
    },

    use: {
        headless: true,
        baseURL: "http://localhost:3000",
    },

    projects: [
        {
            name: "api",
            grepInvert: /@schema/,
        },
        {
            name: "schema",
            grep: /@schema/,
        },
    ],
}

module.exports = config
