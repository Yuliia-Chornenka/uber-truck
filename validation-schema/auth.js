const Joi = require('@hapi/joi');

module.exports = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).regex(/[a-zA-Z0-9]{6,30}/).required(),
    username: Joi.string().min(3).max(20).required(),
    position: Joi.string().valid('Shipper', 'Driver').required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).regex(/[a-zA-Z0-9]{6,30}/).required(),
  }),
};
