const { expect } = require("@playwright/test")
const Joi = require("joi")
const test = require("../../../api/fixtures")
const usuarios = require("../../../api/schemas/usuarios")

test.describe.parallel("@schema-usuarios", () => {
    test("Listar usuários cadastrados", async ({ baseURL, userPath, request, cadastrarUsuario }) => {
        await cadastrarUsuario()
        const response = await request.get(`${baseURL}${userPath}`, { headers: { monitor: "false" } })

        expect(response.ok()).toBeTruthy()
        Joi.assert(await response.json(), usuarios.get)
    })

    test("Cadastrar usuário body vazio", async ({ baseURL, userPath, request }) => {
        const response = await request.post(`${baseURL}${userPath}`, { headers: { monitor: "false" } })

        expect(response.ok()).toBeFalsy()
        Joi.assert(await response.json(), usuarios.post)
    })

    test("Editar usuário body vazio", async ({ baseURL, userPath, request, cadastrarUsuario }) => {
        const { _id } = await cadastrarUsuario()
        const response = await request.put(`${baseURL}${userPath}/${_id}`, { headers: { monitor: "false" } })

        expect(response.ok()).toBeFalsy()
        Joi.assert(await response.json(), usuarios.put)
    })
})
