const base = require('@playwright/test');
const { expect } = require('@playwright/test');

module.exports = base.test.extend({
    login: async ({ baseURL, request }, use) => {
        await use(async (email, password) => {
            const response = await request.post(`${baseURL}/login`, {
                data: {
                    "email": email,
                    "password": password
                }
            })
            expect(response.ok()).toBeTruthy()
            return await response.json()
        })
    }
})
