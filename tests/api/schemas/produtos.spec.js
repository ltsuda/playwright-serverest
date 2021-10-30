const { expect } = require("@playwright/test")
const Joi = require("joi")
const test = require("../../../api/fixtures")
const produtos = require("../../../api/schemas/produtos")

test.describe.parallel("@schema-produtos", () => {
    let authorization

    test.beforeAll(async ({ login, cadastrarUsuario }) => {
        const { email, password } = await cadastrarUsuario({ administrador: true })
        const admin = await login(email, password)
        authorization = admin.authorization
    })

    test("Listar produtos cadastrados", async ({ baseURL, productsPath, request, cadastrarProduto }) => {
        await cadastrarProduto(authorization)
        const response = await request.get(`${baseURL}${productsPath}`)

        expect(response.ok()).toBeTruthy()
        Joi.assert(await response.json(), produtos.get)
    })

    test("Cadastrar produto com body vazio", async ({ baseURL, productsPath, request }) => {
        const response = await request.post(`${baseURL}${productsPath}`, { headers: { Authorization: authorization } })

        expect(response.ok()).toBeFalsy()
        Joi.assert(await response.json(), produtos.post)
    })

    test("Editar usuário produto com vazio", async ({ baseURL, productsPath, request, cadastrarUsuario }) => {
        const { _id } = await cadastrarUsuario()
        const response = await request.put(`${baseURL}${productsPath}/${_id}`, {
            headers: { Authorization: authorization },
        })

        expect(response.ok()).toBeFalsy()
        Joi.assert(await response.json(), produtos.put)
    })
})
