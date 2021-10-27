const base = require("@playwright/test")
const { expect } = require("@playwright/test")
const faker = require("faker")

module.exports = base.test.extend({
    loginPath: "/login",
    cartPath: "/carrinhos",
    userPath: "/usuarios",
    productsPath: "/produtos",

    login: async ({ baseURL, request, loginPath }, use) => {
        await use(async (email, password) => {
            const response = await request.post(`${baseURL}${loginPath}`, {
                data: {
                    email: email,
                    password: password,
                },
            })
            expect(response.status()).toBe(200)
            return await response.json()
        })
    },
    cadastrarUsuario: async ({ baseURL, request, userPath }, use) => {
        await use(async ({ administrador = false } = {}) => {
            let data = {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                password: faker.random.alphaNumeric(16),
                administrador: administrador ? String(administrador) : String(faker.datatype.boolean()),
            }
            const response = await request.post(`${baseURL}${userPath}`, {
                data: data,
            })
            expect(response.status()).toBe(201)
            responseData = await response.json()
            data["_id"] = responseData["_id"]
            return data
        })
    },
    cadastrarProduto: async ({ baseURL, request, productsPath }, use) => {
        await use(async (authorization) => {
            let data = {
                nome: faker.commerce.productName(),
                preco: faker.commerce.price(undefined, undefined, 0),
                descricao: faker.commerce.productDescription(),
                quantidade: faker.datatype.number(1000),
            }
            const response = await request.post(`${baseURL}${productsPath}`, {
                data: data,
                headers: { Authorization: authorization },
            })
            expect(response.status()).toBe(201)
            responseData = await response.json()
            data["_id"] = responseData["_id"]
            return data
        })
    },
    cadastrarCarrinho: async ({ baseURL, request, cartPath }, use) => {
        await use(async (authorization, produtos) => {
            let data = { produtos: [] }
            for (produto of produtos) {
                data.produtos.push({
                    idProduto: produto.id,
                    quantidade: produto.quantidade,
                })
            }
            const response = await request.post(`${baseURL}${cartPath}`, {
                data: data,
                headers: { Authorization: authorization },
            })
            expect(response.status()).toBe(201)
            responseData = await response.json()
            data["_id"] = responseData["_id"]
            return data
        })
    },
})
