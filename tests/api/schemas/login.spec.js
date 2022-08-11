const { expect } = require("@playwright/test")
const test = require("../../../api/fixtures")
const Joi = require("joi")
const login = require("../../../api/schemas/login")

test.describe("Login endpoint @schema-login", () => {
    test("Login com body vazio", async ({ baseURL, loginPath, request }) => {
        const response = await request.post(`${baseURL}${loginPath}`, { headers: { monitor: "false" } })

        expect(response.ok()).toBeFalsy()
        Joi.assert(await response.json(), login.get)
    })
})
