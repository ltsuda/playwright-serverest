const Joi = require("joi")

const get = Joi.object({
    quantidade: Joi.number().integer().required(),
    carrinhos: Joi.array().items(
        Joi.object({
            produtos: Joi.array().items(
                Joi.object({
                    idProduto: Joi.string().required(),
                    quantidade: Joi.number().integer().required(),
                    precoUnitario: Joi.number().integer().required(),
                })
            ),
            precoTotal: Joi.number().integer().required(),
            quantidadeTotal: Joi.number().integer().required(),
            idUsuario: Joi.string().required(),
            _id: Joi.string().required(),
        })
    ),
})

const post = Joi.object({
    produtos: Joi.string().required(),
})

const postSemProduto = Joi.object({
    produtos: Joi.string().required(),
    "produtos[0].idProduto": Joi.string().required(),
    "produtos[0].quantidade": Joi.string().required(),
})

module.exports = {
    get,
    post,
    postSemProduto,
}
