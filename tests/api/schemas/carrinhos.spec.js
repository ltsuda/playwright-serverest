const { expect } = require("@playwright/test")
const Joi = require("joi")
const test = require("../../../api/fixtures")
const carrinhos = require("../../../api/schemas/carrinhos")

test.describe.parallel("@schema-carrinhos", () => {
    let authorization

    test.beforeAll(async ({ login, cadastrarUsuario }) => {
        const { email, password } = await cadastrarUsuario({ administrador: true })
        const admin = await login(email, password)
        authorization = admin.authorization
    })

    test("Listar carrinhos cadastrados", async ({
        baseURL,
        cartPath,
        request,
        cadastrarCarrinho,
        cadastrarProduto,
    }) => {
        const produto = await cadastrarProduto(authorization)
        await cadastrarCarrinho(authorization, produto)
        const response = await request.get(`${baseURL}${cartPath}`)

        expect(response.ok()).toBeTruthy()
        Joi.assert(await response.json(), carrinhos.get)
    })

    test("Cadastrar carrinho com body vazio", async ({ baseURL, cartPath, request }) => {
        const response = await request.post(`${baseURL}${cartPath}`, { headers: { Authorization: authorization } })

        expect(response.ok()).toBeFalsy()
        Joi.assert(await response.json(), carrinhos.post)
    })

    test("Cadastrar carrinho sem produtos", async ({ baseURL, cartPath, request }) => {
        const response = await request.post(`${baseURL}${cartPath}`, {
            data: {
                produtos: [{}],
            },
            headers: { Authorization: authorization },
        })

        expect(response.ok()).toBeFalsy()
        Joi.assert(await response.json(), carrinhos.postSemProduto)
    })
})
