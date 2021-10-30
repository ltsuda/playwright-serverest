const { expect } = require("@playwright/test")
const Joi = require("joi")
const test = require("../../../api/fixtures")
const usuarios = require("../../../api/schemas/usuarios")

test.describe.parallel("@schema-usuarios", () => {
    test("Listar usuários cadastrados", async ({ baseURL, userPath, request, cadastrarUsuario }) => {
        await cadastrarUsuario()
        const response = await request.get(`${baseURL}${userPath}`)

        expect(response.ok()).toBeTruthy()
        Joi.assert(await response.json(), usuarios.get)
    })

    test("Cadastrar usuário body vazio", async ({ baseURL, userPath, request }) => {
        const response = await request.post(`${baseURL}${userPath}`, {})

        expect(response.ok()).not.toBeTruthy()
        Joi.assert(await response.json(), usuarios.post)
    })

    test("Editar usuário body vazio", async ({ baseURL, userPath, request, cadastrarUsuario }) => {
        const { _id } = await cadastrarUsuario()
        const response = await request.put(`${baseURL}${userPath}/${_id}`, {})

        expect(response.ok()).not.toBeTruthy()
        Joi.assert(await response.json(), usuarios.put)
    })
})