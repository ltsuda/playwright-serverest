const Joi = require("joi")

const get = Joi.object({
    quantidade: Joi.number().integer().required(),
    produtos: Joi.array().items(
        Joi.object({
            nome: Joi.string().required(),
            preco: Joi.number().integer().required(),
            descricao: Joi.string().required(),
            quantidade: Joi.number().integer().required(),
            _id: Joi.string().required(),
        })
    ),
})

const post = Joi.object({
    nome: Joi.string().required(),
    preco: Joi.string().required(),
    descricao: Joi.string().required(),
    quantidade: Joi.string().required(),
})

module.exports = {
    get,
    post,
    put: post,
}
