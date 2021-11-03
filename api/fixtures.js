const base = require("@playwright/test")
const { expect } = require("@playwright/test")
const faker = require("faker")

/**
 * Test fixtures (https://playwright.dev/docs/test-fixtures)
 * This is extending the base/test import { base } from @playwright/test to include
 * new fixtures like the endpoints of the API and functions that setup new users,
 * produtos, carrinhos and performs login, retrieving the authorization token
 * for administrator actions
 */
module.exports = base.test.extend({
    loginPath: "/login",
    cartPath: "/carrinhos",
    userPath: "/usuarios",
    productsPath: "/produtos",

    /**
     * Fixture that performs API authentication and returns the authorization token
     * It uses the baseURL, request and loginPath from Playwright's environment
     * Then, the login fixture receives an email and a password as parameter
     */
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

    /**
     * Fixture that creates a new user on the ServeRest server
     * It uses the baseURL, request and userPath from Playwright's environment
     * Then, the cadastrarUsuario fixture receives an object with the administrator
     * parameter to select if the new user will have administrator permission
     */
    cadastrarUsuario: async ({ baseURL, request, userPath }, use) => {
        await use(async ({ administrador = false } = {}) => {
            let data = {
                nome: faker.name.findName(),
                email: faker.internet.email(faker.name.firstName(), faker.name.lastName()),
                password: faker.random.alphaNumeric(16),
                administrador: String(administrador),
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

    /**
     * Fixture that creates a new product on the ServeRest server
     * It uses the baseURL, request and productsPath from Playwright's environment
     * Then, the cadastrarProduto fixture receives a bearer authorization token as parameter
     */
    cadastrarProduto: async ({ baseURL, request, productsPath }, use) => {
        await use(async (authorization) => {
            let data = {
                // alphaNumeric to reduce the chances of existing name when running the test suite multiple times
                nome: faker.commerce.productName() + faker.random.alphaNumeric(100),
                preco: Number(faker.commerce.price(undefined, undefined, 0)),
                descricao: faker.commerce.productAdjective(),
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

    /**
     * Fixture that creates a new shopping cart on the ServeRest server
     * It uses the baseURL, request and cartPath from Playwright's environment
     * Then, the cadastrarCarrinho fixture receives a bearer authorization token and
     * a list of products as parameter
     */
    cadastrarCarrinho: async ({ baseURL, request, cartPath }, use) => {
        await use(async (authorization, produtos) => {
            let data = { produtos: [] }
            if (produtos instanceof Object) {
                produtos = [produtos]
            }
            for (produto of produtos) {
                data.produtos.push({
                    idProduto: produto._id,
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
