const { expect } = require("@playwright/test")
const test = require("../../api/fixtures")
const faker = require("faker")

test.describe.parallel("Produtos endpoint @produtos", () => {
    let produto
    let authorization

    test.beforeEach(async ({ login, cadastrarProduto, cadastrarUsuario }) => {
        const { email, password } = await cadastrarUsuario({ administrador: true })
        const admin = await login(email, password)
        authorization = admin.authorization
        produto = await cadastrarProduto(authorization)
    })

    test("Listar produtos cadastrados", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("quantidade")
        expect(responseData).toHaveProperty("produtos", expect.arrayContaining([produto]))
    })

    test("Listar produtos filtrados por ID", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}?_id=${produto._id}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("quantidade", 1)
        expect(responseData).toHaveProperty("produtos", expect.arrayContaining([produto]))
    })

    test("Listar produtos filtrados por Nome", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}?nome=${produto.nome}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("quantidade", 1)
        expect(responseData).toHaveProperty("produtos", expect.arrayContaining([produto]))
    })

    test("Listar produtos filtrados por Preço", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}?preco=${produto.preco}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toBeGreaterThanOrEqual(1)
        expect(responseData).toHaveProperty("produtos", expect.arrayContaining([produto]))
    })

    test("Listar produtos filtrados por Descrição", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}?descricao=${produto.descricao}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toBeGreaterThanOrEqual(1)
        expect(responseData).toHaveProperty("produtos", expect.arrayContaining([produto]))
    })

    test("Listar produtos filtrados por Quantidade", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}?quantidade=${produto.quantidade}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toBeGreaterThanOrEqual(1)
        expect(responseData).toHaveProperty("produtos", expect.arrayContaining([produto]))
    })

    test("Listar produtos inexistentes", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}?_id=inexistente`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toEqual(0)
        expect(responseData).toHaveProperty("produtos", [])
    })

    test("Listar produtos por campo invalido", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}?invalido=invalido`)
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("invalido", "invalido não é permitido")
    })

    test("Listar produtos por preco e quantidade como texto", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}?preco=a&quantidade=b`)
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("preco", "preco deve ser um número")
        expect(responseData).toHaveProperty("quantidade", "quantidade deve ser um número")
    })

    test("Listar produtos por preco e quantidade decimais", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}?preco=0.1&quantidade=0.2`)
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("preco", "preco deve ser um inteiro")
        expect(responseData).toHaveProperty("quantidade", "quantidade deve ser um inteiro")
    })

    test("Listar produtos por preco e quantidade negativos", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}?preco=-1&quantidade=-2`)
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("preco", "preco deve ser um número positivo")
        expect(responseData).toHaveProperty("quantidade", "quantidade deve ser maior ou igual a 0")
    })

    test("Cadastrar produto com sucesso", async ({ baseURL, productsPath, request }) => {
        const response = await request.post(`${baseURL}${productsPath}`, {
            data: {
                nome: faker.commerce.productName(),
                preco: Number(faker.commerce.price(undefined, undefined, 0)),
                descricao: faker.commerce.productDescription(),
                quantidade: faker.datatype.number(1000),
            },
            headers: { Authorization: authorization },
        })

        expect(response.status()).toBe(201)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Cadastro realizado com sucesso")
        expect(responseData).toHaveProperty("_id", responseData._id)
    })

    test("Cadastrar produto com nome já existente", async ({ baseURL, productsPath, request }) => {
        const response = await request.post(`${baseURL}${productsPath}`, {
            data: {
                nome: produto.nome,
                preco: Number(faker.commerce.price(undefined, undefined, 0)),
                descricao: faker.commerce.productDescription(),
                quantidade: faker.datatype.number(1000),
            },
            headers: { Authorization: authorization },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Já existe produto com esse nome")
    })

    test("Cadastrar produto com Token ausente", async ({ baseURL, productsPath, request }) => {
        const response = await request.post(`${baseURL}${productsPath}`, {
            data: {
                nome: faker.commerce.productName(),
                preco: Number(faker.commerce.price(undefined, undefined, 0)),
                descricao: faker.commerce.productDescription(),
                quantidade: faker.datatype.number(1000),
            },
        })

        expect(response.status()).toBe(401)

        const responseData = await response.json()
        expect(responseData).toHaveProperty(
            "message",
            "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
        )
    })

    test("Cadastrar produto com usuário não administrador", async ({
        baseURL,
        productsPath,
        request,
        login,
        cadastrarUsuario,
    }) => {
        const { email, password } = await cadastrarUsuario({ administrador: false })
        const { authorization } = await login(email, password)
        const response = await request.post(`${baseURL}${productsPath}`, {
            data: {
                nome: faker.commerce.productName(),
                preco: Number(faker.commerce.price(undefined, undefined, 0)),
                descricao: faker.commerce.productDescription(),
                quantidade: faker.datatype.number(1000),
            },
            headers: { Authorization: authorization },
        })

        expect(response.status()).toBe(403)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Rota exclusiva para administradores")
    })

    test("Cadastrar produto sem campos obrigatórios", async ({ baseURL, productsPath, request }) => {
        const response = await request.post(`${baseURL}${productsPath}`, {
            data: {},
            headers: { Authorization: authorization },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("nome", "nome é obrigatório")
        expect(responseData).toHaveProperty("preco", "preco é obrigatório")
        expect(responseData).toHaveProperty("descricao", "descricao é obrigatório")
        expect(responseData).toHaveProperty("quantidade", "quantidade é obrigatório")
    })

    test("Cadastrar produto com campo inexistente", async ({ baseURL, productsPath, request }) => {
        const response = await request.post(`${baseURL}${productsPath}`, {
            data: {
                nome: faker.commerce.productName(),
                preco: Number(faker.commerce.price(undefined, undefined, 0)),
                descricao: faker.commerce.productDescription(),
                quantidade: faker.datatype.number(1000),
                inexistente: "inexistente",
            },
            headers: { Authorization: authorization },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("inexistente", "inexistente não é permitido")
    })

    test("Cadastrar produto com preco e quantidade negativos", async ({ baseURL, productsPath, request }) => {
        const response = await request.post(`${baseURL}${productsPath}`, {
            data: {
                nome: faker.commerce.productName() + faker.random.alphaNumeric(),
                preco: -100,
                descricao: faker.commerce.productAdjective(),
                quantidade: -100,
            },
            headers: { Authorization: authorization },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("preco", "preco deve ser um número positivo")
        expect(responseData).toHaveProperty("quantidade", "quantidade deve ser maior ou igual a 0")
    })

    test("Buscar produto por ID", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}/${produto._id}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toEqual(produto)
    })

    test("Buscar produto por ID não existente", async ({ baseURL, productsPath, request }) => {
        const response = await request.get(`${baseURL}${productsPath}/1`)
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Produto não encontrado")
    })

    test("Excluir produto", async ({ baseURL, productsPath, request }) => {
        const response = await request.delete(`${baseURL}${productsPath}/${produto._id}`, {
            headers: { Authorization: authorization },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Registro excluído com sucesso")
    })

    test("Excluir produto inexistente", async ({ baseURL, productsPath, request }) => {
        const response = await request.delete(`${baseURL}${productsPath}/1`, {
            headers: { Authorization: authorization },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Nenhum registro excluído")
    })

    test("Excluir produto que faz parte de um carrinho", async ({
        baseURL,
        productsPath,
        request,
        cadastrarCarrinho,
    }) => {
        const carrinho = await cadastrarCarrinho(authorization, produto)
        const response = await request.delete(`${baseURL}${productsPath}/${produto._id}`, {
            headers: { Authorization: authorization },
        })
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Não é permitido excluir produto que faz parte de carrinho")
        expect(responseData).toHaveProperty("idCarrinhos", expect.arrayContaining([carrinho._id]))
    })

    test("Excluir produto com Token inválido", async ({ baseURL, productsPath, request }) => {
        const response = await request.delete(`${baseURL}${productsPath}/${produto._id}`, {
            headers: { Authorization: "Bearer abc" },
        })
        expect(response.status()).toBe(401)

        const responseData = await response.json()
        expect(responseData).toHaveProperty(
            "message",
            "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
        )
    })

    test("Excluir produto com usuário não administrador", async ({
        baseURL,
        productsPath,
        request,
        login,
        cadastrarUsuario,
    }) => {
        const { email, password } = await cadastrarUsuario({ administrador: false })
        const { authorization } = await login(email, password)
        const response = await request.delete(`${baseURL}${productsPath}/${produto._id}`, {
            headers: { Authorization: authorization },
        })
        expect(response.status()).toBe(403)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Rota exclusiva para administradores")
    })

    test("Editar produto", async ({ baseURL, productsPath, request }) => {
        const response = await request.put(`${baseURL}${productsPath}/${produto._id}`, {
            data: {
                nome: produto.nome,
                preco: Number(faker.commerce.price(undefined, undefined, 0)),
                descricao: produto.descricao,
                quantidade: produto.quantidade,
            },
            headers: { Authorization: authorization },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Registro alterado com sucesso")
    })

    test("Editar produto inexistente", async ({ baseURL, productsPath, request }) => {
        const response = await request.put(`${baseURL}${productsPath}/1`, {
            data: {
                nome: faker.commerce.productName(),
                preco: Number(faker.commerce.price(undefined, undefined, 0)),
                descricao: faker.commerce.productDescription(),
                quantidade: faker.datatype.number(1000),
            },
            headers: { Authorization: authorization },
        })
        expect(response.status()).toBe(201)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Cadastro realizado com sucesso")
        expect(responseData).toHaveProperty("_id", responseData._id)
    })

    test("Editar produto com nome já existente", async ({
        baseURL,
        productsPath,
        request,
        login,
        cadastrarUsuario,
    }) => {
        const { email, password } = await cadastrarUsuario({ administrador: true })
        const { authorization } = await login(email, password)
        const response = await request.put(`${baseURL}${productsPath}/1`, {
            data: {
                nome: produto.nome,
                preco: Number(faker.commerce.price(undefined, undefined, 0)),
                descricao: faker.commerce.productDescription(),
                quantidade: faker.datatype.number(1000),
            },
            headers: { Authorization: authorization },
        })
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Já existe produto com esse nome")
    })

    test("Editar produto com Token inválido", async ({ baseURL, productsPath, request }) => {
        const response = await request.put(`${baseURL}${productsPath}/${produto._id}`, {
            data: {
                nome: produto.nome,
                preco: produto.preco,
                descricao: produto.descricao,
                quantidade: produto.quantidade,
            },
            headers: { Authorization: "Bearear abc" },
        })
        expect(response.status()).toBe(401)

        const responseData = await response.json()
        expect(responseData).toHaveProperty(
            "message",
            "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
        )
    })

    test("Editar produto com usuário não administrador", async ({
        baseURL,
        productsPath,
        request,
        login,
        cadastrarUsuario,
    }) => {
        const { email, password } = await cadastrarUsuario({ administrador: false })
        const { authorization } = await login(email, password)
        const response = await request.put(`${baseURL}${productsPath}/${produto._id}`, {
            data: {
                nome: faker.commerce.productName(),
                preco: Number(faker.commerce.price(undefined, undefined, 0)),
                descricao: faker.commerce.productDescription(),
                quantidade: faker.datatype.number(1000),
            },
            headers: { Authorization: authorization },
        })
        expect(response.status()).toBe(403)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Rota exclusiva para administradores")
    })

    test("Editar produto sem campos obrigatórios", async ({ baseURL, productsPath, request }) => {
        const response = await request.put(`${baseURL}${productsPath}/${produto._id}`, {
            data: {
                nome: faker.commerce.productName(),
                inexistente: "inexistente",
            },
            headers: { Authorization: authorization },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("preco", "preco é obrigatório")
        expect(responseData).toHaveProperty("descricao", "descricao é obrigatório")
        expect(responseData).toHaveProperty("quantidade", "quantidade é obrigatório")
        expect(responseData).toHaveProperty("inexistente", "inexistente não é permitido")
    })
})
