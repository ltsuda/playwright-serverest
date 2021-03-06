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
        const response = await request.get(`${baseURL}${cartPath}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("quantidade")
        expect(responseData).toHaveProperty("carrinhos", expect.arrayContaining([carrinho]))
    })

    test("Listar carrinhos filtrados por ID", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?_id=${carrinho._id}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("quantidade", 1)
        expect(responseData).toHaveProperty("carrinhos", expect.arrayContaining([carrinho]))
    })

    test("Listar carrinhos filtrados por Preco Total", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?precoTotal=${carrinho.precoTotal}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toBeGreaterThanOrEqual(1)
        expect(responseData).toHaveProperty("carrinhos", expect.arrayContaining([carrinho]))
    })

    test("Listar carrinhos filtrados por Quantidade Total", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?quantidadeTotal=${carrinho.quantidadeTotal}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toBeGreaterThanOrEqual(1)
        expect(responseData).toHaveProperty("carrinhos", expect.arrayContaining([carrinho]))
    })

    test("Listar carrinhos filtrados por ID do usu??rio", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?idUsuario=${carrinho.idUsuario}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toEqual(1)
        expect(responseData).toHaveProperty("carrinhos", expect.arrayContaining([carrinho]))
    })

    test("Listar carrinho inexistente", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?idUsuario=abc`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData.quantidade).toEqual(0)
        expect(responseData).toHaveProperty("carrinhos", [])
    })

    test("Listar carrinho com preco e quantidade como texto", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?precoTotal=a&quantidadeTotal=b`)
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("precoTotal", "precoTotal deve ser um n??mero")
        expect(responseData).toHaveProperty("quantidadeTotal", "quantidadeTotal deve ser um n??mero")
    })

    test("Listar carrinho com preco e quantidade negativos", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?precoTotal=-1&quantidadeTotal=-2`)
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("precoTotal", "precoTotal deve ser um n??mero positivo")
        expect(responseData).toHaveProperty("quantidadeTotal", "quantidadeTotal deve ser um n??mero positivo")
    })

    test("Listar carrinho com preco e quantidade decimais", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}?precoTotal=0.1&quantidadeTotal=0.2`)
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
            headers: { Authorization: authorization },
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
            headers: { Authorization: authorization },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "N??o ?? permitido possuir produto duplicado")
    })

    test("Cadastrar mais de um carrinho por usu??rio", async ({ baseURL, cartPath, request }) => {
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
            headers: { Authorization: authorization },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "N??o ?? permitido ter mais de 1 carrinho")
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
            headers: { Authorization: authorization },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Produto n??o encontrado")
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
            headers: { Authorization: authorization },
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
            headers: { Authorization: authorization },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Produto n??o possui quantidade suficiente")
    })

    test("Cadastrar carrinho com Token ausente", async ({ baseURL, cartPath, request }) => {
        const response = await request.post(`${baseURL}${cartPath}`, {
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
            "Token de acesso ausente, inv??lido, expirado ou usu??rio do token n??o existe mais"
        )
    })

    test("Cadastrar carrinho com valor inexistente", async ({ baseURL, cartPath, request }) => {
        const response = await request.post(`${baseURL}${cartPath}`, {
            data: {
                inexistente: "inexistente",
            },
            headers: { Authorization: authorization },
        })

        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("inexistente", "inexistente n??o ?? permitido")
    })

    test("Buscar carrinho por ID", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}/${carrinho._id}`)
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toEqual(carrinho)
    })

    test("Buscar produto por ID n??o existente", async ({ baseURL, cartPath, request }) => {
        const response = await request.get(`${baseURL}${cartPath}/1`)
        expect(response.status()).toBe(400)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Carrinho n??o encontrado")
    })

    test("Excluir carrinho (concluir compra)", async ({ baseURL, cartPath, request }) => {
        const response = await request.delete(`${baseURL}${cartPath}/concluir-compra`, {
            headers: { Authorization: authorization },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "Registro exclu??do com sucesso")
    })

    test("Excluir carrinho (concluir compra) com usu??rio sem carrinho", async ({
        baseURL,
        cartPath,
        request,
        login,
        cadastrarUsuario,
    }) => {
        const { email, password } = await cadastrarUsuario({ administrador: false })
        const { authorization } = await login(email, password)
        const response = await request.delete(`${baseURL}${cartPath}/concluir-compra`, {
            headers: { Authorization: authorization },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "N??o foi encontrado carrinho para esse usu??rio")
    })

    test("Excluir carrinho (concluir compra) com Token inv??lido", async ({ baseURL, cartPath, request }) => {
        const response = await request.delete(`${baseURL}${cartPath}/concluir-compra`, {
            headers: { Authorization: "Bearer abc" },
        })
        expect(response.status()).toBe(401)

        const responseData = await response.json()
        expect(responseData).toHaveProperty(
            "message",
            "Token de acesso ausente, inv??lido, expirado ou usu??rio do token n??o existe mais"
        )
    })

    test("Excluir carrinho (cancelar compra)", async ({ baseURL, cartPath, request }) => {
        const response = await request.delete(`${baseURL}${cartPath}/cancelar-compra`, {
            headers: { Authorization: authorization },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty(
            "message",
            "Registro exclu??do com sucesso. Estoque dos produtos reabastecido"
        )
    })

    test("Excluir carrinho (cancelar compra) com usu??rio sem carrinho", async ({
        baseURL,
        cartPath,
        request,
        login,
        cadastrarUsuario,
    }) => {
        const { email, password } = await cadastrarUsuario({ administrador: false })
        const { authorization } = await login(email, password)
        const response = await request.delete(`${baseURL}${cartPath}/cancelar-compra`, {
            headers: { Authorization: authorization },
        })
        expect(response.status()).toBe(200)

        const responseData = await response.json()
        expect(responseData).toHaveProperty("message", "N??o foi encontrado carrinho para esse usu??rio")
    })

    test("Excluir carrinho (cancelar compra) com Token inv??lido", async ({ baseURL, cartPath, request }) => {
        const response = await request.delete(`${baseURL}${cartPath}/cancelar-compra`, {
            headers: { Authorization: "Bearer abc" },
        })
        expect(response.status()).toBe(401)

        const responseData = await response.json()
        expect(responseData).toHaveProperty(
            "message",
            "Token de acesso ausente, inv??lido, expirado ou usu??rio do token n??o existe mais"
        )
    })
})
