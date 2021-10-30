const Joi = require("joi")

const get = Joi.object({
    quantidade: Joi.number().integer().required(),
    usuarios: Joi.array().items(
        Joi.object({
            nome: Joi.string().required(),
            email: Joi.string().required(),
            password: Joi.string().required(),
            administrador: Joi.string().required(),
            _id: Joi.string().required(),
        })
    ),
})

const post = Joi.object({
    nome: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    administrador: Joi.string().required(),
})

module.exports = {
    get,
    post,
    put: post,
}
