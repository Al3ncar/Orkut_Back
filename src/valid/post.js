const Joi = require("joi");

const postSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    "string.empty": "O titulo é Obrigatório",
    "string.min": "O titulo deve ter pelo menos 3 caracteres",
    "string.max": "O titulo deve ter no maximo 255 caracteres",
    "string.required": "O titulo é obrigatório",
  }),
  content: Joi.string().min(10).max(1000).required().messages({
    "string.empty": "A descrição é Obrigatório",
    "string.min": "A descrição deve ter pelo menos 10 caracteres",
    "string.max": "A descrição deve ter no maximo 1000 caracteres",
    "string.required": "A descrição é obrigatório",
  }),
//   user_id: Joi.number().integer().required().messages({
//     "number.base": "O user_id deve ser um numero",
//     "number.interge": "O user_id deve ser um numero inteiro",
//     "any.required": "O user_id é obrigatório",
//   }),
});

const validPost = (req, res, next) => {
  const { error } = postSchema.validate(req.body, { abortEarly: false });
  if (error) {
    console.log(error);
    return res.status(400).json({
      erro: error.details.map((e) => e.message),
    });
  } else next();
};

module.exports = validPost;
