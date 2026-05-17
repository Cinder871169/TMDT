const Joi = require("joi");

// Generic validation middleware
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ message });
  }

  req.body = value;
  return next();
};

// Schemas
const registerSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-ZÀ-ỹ\s]+$/)
    .min(2).max(100).required()
    .messages({ "string.pattern.base": "Tên chỉ được chứa chữ cái và khoảng trắng" }),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/)
    .required()
    .messages({ "string.pattern.base": "Mật khẩu phải từ 8 ký tự, bao gồm chữ hoa, chữ thường và số" }),
});

const sendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  type: Joi.string().valid("login", "register").optional(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
  type: Joi.string().valid("login", "register").required(),
  name: Joi.when("type", {
    is: "register",
    then: Joi.string()
      .pattern(/^[a-zA-ZÀ-ỹ\s]+$/)
      .min(2).max(100).required()
      .messages({ "string.pattern.base": "Tên chỉ được chứa chữ cái và khoảng trắng" }),
    otherwise: Joi.forbidden(),
  }),
  password: Joi.when("type", {
    is: "register",
    then: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/)
      .required()
      .messages({ "string.pattern.base": "Mật khẩu phải từ 8 ký tự, bao gồm chữ hoa, chữ thường và số" }),
    otherwise: Joi.forbidden(),
  }),
});

const newsletterSchema = Joi.object({
  email: Joi.string().email().required(),
});

const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().min(3).max(200).required(),
  message: Joi.string().min(10).max(5000).required(),
});

const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string()
    .pattern(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    )
    .optional(),
  address: Joi.string().max(500).optional(),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/)
    .required()
    .messages({ "string.pattern.base": "Mật khẩu mới phải từ 8 ký tự, bao gồm chữ hoa, chữ thường và số" }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const contactGetSchema = Joi.object({
  // For query params in admin contacts route
});

module.exports = {
  validate,
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
  newsletterSchema,
  contactSchema,
  profileUpdateSchema,
  changePasswordSchema,
  loginSchema,
};
