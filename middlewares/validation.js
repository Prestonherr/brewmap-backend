const { Joi, celebrate } = require("celebrate");
const validator = require("validator");

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
};

const validateCreateUserBody = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required().messages({
      "string.email": 'The "email" field must be a valid email',
      "string.empty": 'The "email" field must be filled in',
    }),
    name: Joi.string().min(2).max(30).required().messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.empty": 'The "name" field must be filled in',
    }),
    password: Joi.string().required().min(8).messages({
      "string.empty": 'The "password" field must be filled in',
      "string.min": 'The minimum length of the "password" field is 8',
    }),
  }),
});

const validateLoginBody = celebrate({
  body: Joi.object()
    .keys({
      email: Joi.string().email().required().messages({
        "string.email": 'The "email" field must be a valid email',
        "string.empty": 'The "email" field must be filled in',
      }),
      password: Joi.string().required().messages({
        "string.empty": 'The "password" field must be filled in',
      }),
    })
    .unknown(false),
});

const validateUpdateUserBody = celebrate({
  body: Joi.object()
    .keys({
      email: Joi.string().email().messages({
        "string.email": 'The "email" field must be a valid email',
      }),
      name: Joi.string().min(2).max(30).messages({
        "string.min": 'The minimum length of the "name" field is 2',
        "string.max": 'The maximum length of the "name" field is 30',
      }),
      password: Joi.string().min(8).messages({
        "string.min": 'The minimum length of the "password" field is 8',
      }),
    })
    .unknown(false),
});

const validateCreateCoffeeShopBody = celebrate({
  body: Joi.object()
    .keys({
      name: Joi.string().required().messages({
        "string.empty": 'The "name" field must be filled in',
      }),
      address: Joi.string().allow(""),
      lat: Joi.number().required().messages({
        "number.base": 'The "lat" field must be a number',
      }),
      lon: Joi.number().required().messages({
        "number.base": 'The "lon" field must be a number',
      }),
      distance: Joi.number(),
      tags: Joi.object(),
      osmId: Joi.string(),
    })
    .unknown(false),
});

const validateHexIdParam = (paramName) =>
  celebrate({
    params: Joi.object()
      .keys({
        [paramName]: Joi.string()
          .hex()
          .length(24)
          .required()
          .messages({
            "string.hex": `The "${paramName}" field must be a valid hexadecimal string`,
            "string.length": `The "${paramName}" field must be exactly 24 characters`,
            "any.required": `The "${paramName}" field is required`,
          }),
      })
      .unknown(false),
  });

const validateCoffeeShopIdParam = validateHexIdParam("coffeeShopId");

module.exports = {
  validateCreateUserBody,
  validateLoginBody,
  validateUpdateUserBody,
  validateCreateCoffeeShopBody,
  validateCoffeeShopIdParam,
};
