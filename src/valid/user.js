const Joi = require("joi");

const userSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    "string.empty": "O nome precisa ser preenchido",
    "string.min": "O nome deve ter mais de 3 caracteres",
    "string.max": "O nome deve ter menos que 250 caracteres",
  }),
  email: Joi.string().min(10).max(200).required().messages({
    "string.empty": "O email precisa ser preenchido",
    "string.min": "O email deve ter mais de 10 caracteres",
    "string.max": "O email deve ter menos que 200 caracteres",
  }),
  password: Joi.string().min(4).max(64).required().messages({
    "string.empty": "A senha precisa ser preenchido",
    "string.min": "A senha deve ter mais de 4 caracteres",
    "string.max": "A senha deve ter menos que 64 caracteres",
  }),
});

const validUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    console.log(error);
    res.status(400).json({
      erro: error.details.map((e) => e.message),
    });
  } else next()
};


module.exports = validUser