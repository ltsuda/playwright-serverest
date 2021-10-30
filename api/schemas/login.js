const Joi = require("joi")

const get = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
})

module.exports = {
    get,
}
