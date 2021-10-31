const { expect } = require("@playwright/test")
const test = require("../../api/fixtures")

test.describe.parallel("Login endpoint @login", () => {
    test("Login com usuário válido", async ({ baseURL, loginPath, cadastrarUsuario, request }) => {
        const { email, password } = await cadastrarUsuario()
        const response = await request.post(`${baseURL}${loginPath}`, {
            data: { email: email, password: password },
        })

        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Login realizado com sucesso")
        expect(responseData).toHaveProperty("authorization", responseData.authorization)
    })

    test("Login com email e/ou senha inválidos", async ({ baseURL, loginPath, request }) => {
        const response = await request.post(`${baseURL}${loginPath}`, {
            data: { email: "user@qa.com", password: "invalido" },
        })
        expect(response.status()).toBe(401)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Email e/ou senha inválidos")
    })

    test("Login com campo inválido", async ({ baseURL, loginPath, cadastrarUsuario, request }) => {
        const { email, password } = await cadastrarUsuario()
        const response = await request.post(`${baseURL}${loginPath}`, {
            data: { email: email, password: password, invalido: "invalido" },
        })
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("invalido", "invalido não é permitido")
    })

    test("Login com email inválido", async ({ baseURL, loginPath, cadastrarUsuario, request }) => {
        const { password } = await cadastrarUsuario()
        const response = await request.post(`${baseURL}${loginPath}`, {
            data: { email: "email", password: password },
        })
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("email", "email deve ser um email válido")
    })

    test("Login com email em branco", async ({ baseURL, loginPath, cadastrarUsuario, request }) => {
        const { email, password } = await cadastrarUsuario()
        const response = await request.post(`${baseURL}${loginPath}`, {
            data: { email: "", password: password },
        })
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("email", "email não pode ficar em branco")
    })
})
