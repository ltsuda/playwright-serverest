const { expect } = require("@playwright/test")
const test = require("../../api/fixtures")

test.describe.parallel("Carrinhos endpoint @carrinhos", () => {
    let authorization
    let carrinho
    let produto

    test.beforeEach(async ({ login, cadastrarProduto, cadastrarUsuario, cadastrarCarrinho }) => {
        const { _id, email, password } = await cadastrarUsuario({ administrador: true })
        const admin = await login(email, password)
        authorization = admin.authorization
        produto = await cadastrarProduto(authorization)
        produto.quantidade = 1
        carrinho = await cadastrarCarrinho(authorization, produto) // only add 1 produto to cart / somente 1 produto adicionado ao carrinho
        carrinho = {
            produtos: [
                {
                    idProduto: carrinho.produtos[0].idProduto,
                    quantidade: carrinho.produtos[0].quantidade,
                    precoUnitario: produto.preco,
                },
            ],
            precoTotal: carrinho.produtos[0].quantidade * produto.preco,
            quantidadeTotal: produto.quantidade,
            idUsuario: _id,
            _id: carrinho._id,
        }
    })

    test("Listar carrinhos cadastrados", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}`, { headers: { monitor: "false" } })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("quantidade")
        expect(responseData).toHaveProperty("carrinhos", expect.arrayContaining([carrinho]))
    })

    test("Listar carrinhos filtrados por ID", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?_id=${carrinho._id}`, {
            headers: { monitor: "false" },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("quantidade", 1)
        expect(responseData).toHaveProperty("carrinhos", expect.arrayContaining([carrinho]))
    })

    test("Listar carrinhos filtrados por Preco Total", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?precoTotal=${carrinho.precoTotal}`, {
            headers: { monitor: "false" },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toBeGreaterThanOrEqual(1)
        expect(responseData).toHaveProperty("carrinhos", expect.arrayContaining([carrinho]))
    })

    test("Listar carrinhos filtrados por Quantidade Total", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?quantidadeTotal=${carrinho.quantidadeTotal}`, {
            headers: { monitor: "false" },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toBeGreaterThanOrEqual(1)
        expect(responseData).toHaveProperty("carrinhos", expect.arrayContaining([carrinho]))
    })

    test("Listar carrinhos filtrados por ID do usuário", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?idUsuario=${carrinho.idUsuario}`, {
            headers: { monitor: "false" },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toEqual(1)
        expect(responseData).toHaveProperty("carrinhos", expect.arrayContaining([carrinho]))
    })

    test("Listar carrinho inexistente", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?idUsuario=abc`, { headers: { monitor: "false" } })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toEqual(0)
        expect(responseData).toHaveProperty("carrinhos", [])
    })

    test("Listar carrinho com preco e quantidade como texto", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?precoTotal=a&quantidadeTotal=b`, {
            headers: { monitor: "false" },
        })
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("precoTotal", "precoTotal deve ser um número")
        expect(responseData).toHaveProperty("quantidadeTotal", "quantidadeTotal deve ser um número")
    })

    test("Listar carrinho com preco e quantidade negativos", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?precoTotal=-1&quantidadeTotal=-2`, {
            headers: { monitor: "false" },
        })
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("precoTotal", "precoTotal deve ser um número positivo")
        expect(responseData).toHaveProperty("quantidadeTotal", "quantidadeTotal deve ser um número positivo")
    })

    test("Listar carrinho com preco e quantidade decimais", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?precoTotal=0.1&quantidadeTotal=0.2`, {
            headers: { monitor: "false" },
        })
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("precoTotal", "precoTotal deve ser um inteiro")
        expect(responseData).toHaveProperty("quantidadeTotal", "quantidadeTotal deve ser um inteiro")
    })

    test("Cadastrar carrinho com sucesso", async ({ baseURL, cartPath, request, login, cadastrarUsuario }) => {
        const { email, password } = await cadastrarUsuario({ administrador: false })
        const { authorization } = await login(email, password)
        const response = await request.post(`${baseURL}${cartPath}`, {
            data: {
                produtos: [
                    {
                        idProduto: produto._id,
                        quantidade: produto.quantidade,
                    },
                ],
            },
            headers: { Authorization: authorization, monitor: "false" },
        })
        expect(response.status()).toBe(201)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Cadastro realizado com sucesso")
        expect(responseData).toHaveProperty("_id", responseData._id)
    })

    test("Cadastrar carrinho com produto duplicado", async ({
        baseURL,
        cartPath,
        request,
        login,
        cadastrarUsuario,
    }) => {
        const { email, password } = await cadastrarUsuario({ administrador: false })
        const { authorization } = await login(email, password)
        const response = await request.post(`${baseURL}${cartPath}`, {
            data: {
                produtos: [
                    {
                        idProduto: produto._id,
                        quantidade: produto.quantidade,
                    },
                    {
                        idProduto: produto._id,
                        quantidade: produto.quantidade,
                    },
                ],
            },
            headers: { Authorization: authorization, monitor: "false" },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Não é permitido possuir produto duplicado")
    })

    test("Cadastrar mais de um carrinho por usuário", async ({ baseURL, cartPath, request }) => {
        const response = await request.post(`${baseURL}${cartPath}`, {
            data: {
                produtos: [
                    {
                        idProduto: produto._id,
                        quantidade: produto.quantidade,
                    },
                    {
                        idProduto: produto._id,
                        quantidade: produto.quantidade,
                    },
                ],
            },
            headers: { Authorization: authorization, monitor: "false" },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Não é permitido ter mais de 1 carrinho")
    })

    test("Cadastrar carrinho com produto inexistente", async ({
        baseURL,
        cartPath,
        request,
        login,
        cadastrarUsuario,
    }) => {
        const { email, password } = await cadastrarUsuario({ administrador: false })
        const { authorization } = await login(email, password)
        const response = await request.post(`${baseURL}${cartPath}`, {
            data: {
                produtos: [
                    {
                        idProduto: "Unnamed",
                        quantidade: produto.quantidade,
                    },
                ],
            },
            headers: { Authorization: authorization, monitor: "false" },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Produto não encontrado")
    })

    test("Cadastrar carrinho com produto em falta", async ({
        baseURL,
        cartPath,
        productsPath,
        request,
        login,
        cadastrarUsuario,
    }) => {
        const { email, password } = await cadastrarUsuario({ administrador: true })
        const { authorization } = await login(email, password)
        await request.put(`${baseURL}${productsPath}/${produto._id}`, {
            data: {
                nome: produto.nome,
                preco: produto.preco,
                descricao: produto.descricao,
                quantidade: 0,
            },
            headers: { Authorization: authorization, monitor: "false" },
        })
        const response = await request.post(`${baseURL}${cartPath}`, {
            data: {
                produtos: [
                    {
                        idProduto: produto._id,
                        quantidade: produto.quantidade,
                    },
                ],
            },
            headers: { Authorization: authorization, monitor: "false" },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Produto não possui quantidade suficiente")
    })

    test("Cadastrar carrinho com Token ausente", async ({ baseURL, cartPath, request }) => {
        const response = await request.post(`${baseURL}${cartPath}`, {
            headers: { monitor: "false" },
            data: {
                produtos: [
                    {
                        idProduto: produto._id,
                        quantidade: produto.quantidade,
                    },
                ],
            },
        })

        expect(response.status()).toBe(401)

        const responseData = await response.json()
        expect(responseData).toHaveProperty(
            "message",
            "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
        )
    })

    test("Cadastrar carrinho com valor inexistente", async ({ baseURL, cartPath, request }) => {
        const response = await request.post(`${baseURL}${cartPath}`, {
            data: {
                inexistente: "inexistente",
            },
            headers: { Authorization: authorization, monitor: "false" },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("inexistente", "inexistente não é permitido")
    })

    test("Buscar carrinho por ID", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}/${carrinho._id}`, { headers: { monitor: "false" } })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toEqual(carrinho)
    })

    test("Buscar produto por ID não existente", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}/1`, { headers: { monitor: "false" } })
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Carrinho não encontrado")
    })

    test("Excluir carrinho (concluir compra)", async ({ baseURL, cartPath, request }) => {
        const response = await request.delete(`${baseURL}${cartPath}/concluir-compra`, {
            headers: { Authorization: authorization, monitor: "false" },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Registro excluído com sucesso")
    })

    test("Excluir carrinho (concluir compra) com usuário sem carrinho", async ({
        baseURL,
        cartPath,
        request,
        login,
        cadastrarUsuario,
    }) => {
        const { email, password } = await cadastrarUsuario({ administrador: false })
        const { authorization } = await login(email, password)
        const response = await request.delete(`${baseURL}${cartPath}/concluir-compra`, {
            headers: { Authorization: authorization, monitor: "false" },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Não foi encontrado carrinho para esse usuário")
    })

    test("Excluir carrinho (concluir compra) com Token inválido", async ({ baseURL, cartPath, request }) => {
        const response = await request.delete(`${baseURL}${cartPath}/concluir-compra`, {
            headers: { Authorization: "Bearer abc", monitor: "false" },
        })
        expect(response.status()).toBe(401)

        const responseData = await response.json()
        expect(responseData).toHaveProperty(
            "message",
            "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
        )
    })

    test("Excluir carrinho (cancelar compra)", async ({ baseURL, cartPath, request }) => {
        const response = await request.delete(`${baseURL}${cartPath}/cancelar-compra`, {
            headers: { Authorization: authorization, monitor: "false" },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty(
            "message",
            "Registro excluído com sucesso. Estoque dos produtos reabastecido"
        )
    })

    test("Excluir carrinho (cancelar compra) com usuário sem carrinho", async ({
        baseURL,
        cartPath,
        request,
        login,
        cadastrarUsuario,
    }) => {
        const { email, password } = await cadastrarUsuario({ administrador: false })
        const { authorization } = await login(email, password)
        const response = await request.delete(`${baseURL}${cartPath}/cancelar-compra`, {
            headers: { Authorization: authorization, monitor: "false" },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Não foi encontrado carrinho para esse usuário")
    })

    test("Excluir carrinho (cancelar compra) com Token inválido", async ({ baseURL, cartPath, request }) => {
        const response = await request.delete(`${baseURL}${cartPath}/cancelar-compra`, {
            headers: { Authorization: "Bearer abc", monitor: "false" },
        })
        expect(response.status()).toBe(401)

        const responseData = await response.json()
        expect(responseData).toHaveProperty(
            "message",
            "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
        )
    })
})
