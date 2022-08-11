const { expect } = require("@playwright/test")
const test = require("../../api/fixtures")
const faker = require("faker")

test.describe.parallel("Usuários endpoint @usuarios", () => {
    test("Listar usuários cadastrados", async ({ baseURL, userPath, request, cadastrarUsuario }) => {
        const usuario = await cadastrarUsuario()
        const response = await request.get(`${baseURL}${userPath}`, { headers: { monitor: "false" } })

        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("quantidade")
        expect(responseData).toHaveProperty("usuarios", expect.arrayContaining([usuario]))
    })

    test("Listar usuários filtrados por ID", async ({ baseURL, userPath, request, cadastrarUsuario }) => {
        const usuario = await cadastrarUsuario()
        const response = await request.get(`${baseURL}${userPath}?_id=${usuario["_id"]}`, {
            headers: { monitor: "false" },
        })

        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("quantidade", 1)
        expect(responseData).toHaveProperty("usuarios", expect.arrayContaining([usuario]))
    })

    test("Listar usuários filtrados por Nome", async ({ baseURL, userPath, request, cadastrarUsuario }) => {
        const usuario = await cadastrarUsuario()
        const response = await request.get(`${baseURL}${userPath}?nome=${usuario["nome"]}`, {
            headers: { monitor: "false" },
        })

        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toBeGreaterThanOrEqual(1)
        expect(responseData).toHaveProperty("usuarios", expect.arrayContaining([usuario]))
    })

    test("Listar usuários filtrados por Email", async ({ baseURL, userPath, request, cadastrarUsuario }) => {
        const usuario = await cadastrarUsuario()
        const response = await request.get(`${baseURL}${userPath}?email=${usuario["email"]}`, {
            headers: { monitor: "false" },
        })

        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("quantidade", 1)
        expect(responseData).toHaveProperty("usuarios", expect.arrayContaining([usuario]))
    })

    test("Listar usuários filtrados por Password", async ({ baseURL, userPath, request, cadastrarUsuario }) => {
        const usuario = await cadastrarUsuario()
        const response = await request.get(`${baseURL}${userPath}?password=${usuario["password"]}`, {
            headers: { monitor: "false" },
        })

        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toBeGreaterThanOrEqual(1)
        expect(responseData).toHaveProperty("usuarios", expect.arrayContaining([usuario]))
    })

    test("Listar usuários filtrados por Administrador", async ({ baseURL, userPath, request, cadastrarUsuario }) => {
        const usuario = await cadastrarUsuario({ administrador: true })
        const response = await request.get(`${baseURL}${userPath}?administrador=${usuario["administrador"]}`, {
            headers: { monitor: "false" },
        })

        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toBeGreaterThanOrEqual(1)
        expect(responseData).toHaveProperty(
            "usuarios",
            expect.arrayContaining([expect.objectContaining({ administrador: usuario["administrador"] })])
        )
        expect(responseData).not.toHaveProperty(
            "usuarios",
            expect.arrayContaining([expect.objectContaining({ administrador: "false" })])
        )
    })

    test("Listar usuários inexistente", async ({ baseURL, userPath, request }) => {
        const response = await request.get(`${baseURL}${userPath}?_id=a`, { headers: { monitor: "false" } })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toEqual(0)
        expect(responseData).toHaveProperty("usuarios", [])
    })

    test("Listar usuários por campo invalido", async ({ baseURL, userPath, request }) => {
        const response = await request.get(`${baseURL}${userPath}?invalido=a`, { headers: { monitor: "false" } })
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("invalido", "invalido não é permitido")
    })

    test("Cadastrar usuário com sucesso", async ({ baseURL, userPath, request }) => {
        const response = await request.post(`${baseURL}${userPath}`, {
            headers: { monitor: "false" },
            data: {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                password: faker.random.alphaNumeric(16),
                administrador: "false",
            },
        })

        expect(response.status()).toBe(201)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Cadastro realizado com sucesso")
        expect(responseData).toHaveProperty("_id", responseData._id)
    })

    test("Cadastrar usuário com email já existente", async ({ baseURL, userPath, cadastrarUsuario, request }) => {
        const { email } = await cadastrarUsuario()
        const response = await request.post(`${baseURL}${userPath}`, {
            headers: { monitor: "false" },
            data: {
                nome: faker.name.findName(),
                email: email,
                password: faker.random.alphaNumeric(16),
                administrador: "false",
            },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Este email já está sendo usado")
    })

    test("Cadastrar usuário sem campos obrigatórios", async ({ baseURL, userPath, request }) => {
        const response = await request.post(`${baseURL}${userPath}`, {
            headers: { monitor: "false" },
            data: {},
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("nome", "nome é obrigatório")
        expect(responseData).toHaveProperty("email", "email é obrigatório")
        expect(responseData).toHaveProperty("password", "password é obrigatório")
        expect(responseData).toHaveProperty("administrador", "administrador é obrigatório")
    })

    test("Cadastrar usuário com campo administrador numérico", async ({
        baseURL,
        userPath,
        request,
        cadastrarUsuario,
    }) => {
        const { email } = await cadastrarUsuario()
        const response = await request.post(`${baseURL}${userPath}`, {
            headers: { monitor: "false" },
            data: {
                nome: faker.name.findName(),
                email: email,
                password: faker.random.alphaNumeric(16),
                administrador: 1,
            },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("administrador", "administrador deve ser 'true' ou 'false'")
    })

    test("Cadastrar usuário com campo administrador booleano", async ({
        baseURL,
        userPath,
        cadastrarUsuario,
        request,
    }) => {
        const { email } = await cadastrarUsuario()
        const response = await request.post(`${baseURL}${userPath}`, {
            headers: { monitor: "false" },
            data: {
                nome: faker.name.findName(),
                email: email,
                password: faker.random.alphaNumeric(16),
                administrador: false,
            },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("administrador", "administrador deve ser 'true' ou 'false'")
    })

    test("Buscar usuário por ID", async ({ baseURL, userPath, request, cadastrarUsuario }) => {
        const usuario = await cadastrarUsuario()
        const response = await request.get(`${baseURL}${userPath}/${usuario["_id"]}`, { headers: { monitor: "false" } })

        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toEqual(usuario)
    })

    test("Buscar usuário não encontrado", async ({ baseURL, userPath, request }) => {
        const response = await request.get(`${baseURL}${userPath}/1`, { headers: { monitor: "false" } })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Usuário não encontrado")
    })

    test("Excluir usuário", async ({ baseURL, userPath, cadastrarUsuario, request }) => {
        const { _id } = await cadastrarUsuario()
        const response = await request.delete(`${baseURL}${userPath}/${_id}`, { headers: { monitor: "false" } })

        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Registro excluído com sucesso")
    })

    test("Excluir usuário não existente", async ({ baseURL, userPath, request }) => {
        const response = await request.delete(`${baseURL}${userPath}/1`, { headers: { monitor: "false" } })

        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Nenhum registro excluído")
    })

    test("Excluir usuário com carrinho", async ({
        baseURL,
        userPath,
        login,
        cadastrarUsuario,
        cadastrarProduto,
        cadastrarCarrinho,
        request,
    }) => {
        const { _id, email, password } = await cadastrarUsuario({ administrador: true })
        const { authorization } = await login(email, password)
        const produto = await cadastrarProduto(authorization)
        const carrinho = await cadastrarCarrinho(authorization, produto)
        const response = await request.delete(`${baseURL}${userPath}/${_id}`, { headers: { monitor: "false" } })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Não é permitido excluir usuário com carrinho cadastrado")
        expect(responseData).toHaveProperty("idCarrinho", carrinho._id)
    })

    test("Editar usuário", async ({ baseURL, userPath, cadastrarUsuario, request }) => {
        const usuario = await cadastrarUsuario()
        const response = await request.put(`${baseURL}${userPath}/${usuario._id}`, {
            headers: { monitor: "false" },
            data: {
                nome: usuario.nome,
                email: usuario.email,
                password: faker.random.alphaNumeric(16),
                administrador: usuario.administrador,
            },
        })

        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Registro alterado com sucesso")
    })

    test("Editar usuário com ID não encontrado", async ({ baseURL, userPath, request }) => {
        const response = await request.put(`${baseURL}${userPath}/${faker.random.alphaNumeric()}`, {
            headers: { monitor: "false" },
            data: {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                password: faker.random.alphaNumeric(16),
                administrador: "false",
            },
        })

        expect(response.status()).toBe(201)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Cadastro realizado com sucesso")
        expect(responseData).toHaveProperty("_id", responseData._id)
    })

    test("Editar usuário com email já existente", async ({ baseURL, userPath, cadastrarUsuario, request }) => {
        const usuario1 = await cadastrarUsuario()
        const { email } = await cadastrarUsuario()
        const response = await request.put(`${baseURL}${userPath}/${usuario1._id}`, {
            headers: { monitor: "false" },
            data: {
                nome: usuario1.nome,
                email: email,
                password: usuario1.password,
                administrador: usuario1.administrador,
            },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Este email já está sendo usado")
    })

    test("Editar usuário com campo invalido", async ({ baseURL, userPath, cadastrarUsuario, request }) => {
        const usuario = await cadastrarUsuario()
        const response = await request.put(`${baseURL}${userPath}/${usuario._id}`, {
            headers: { monitor: "false" },
            data: {
                nome: usuario.nome,
                email: usuario.email,
                password: usuario.password,
                administrador: usuario.administrador,
                invalido: "invalido",
            },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("invalido", "invalido não é permitido")
    })
})
