import Joi from 'joi'
import ApiError from '../utils/ApiError.js'

const register = async (req, res, next) => {
  const validCondition = Joi.object({
    name: Joi.string().min(4).max(49).required().trim().strict().messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least {#limit} characters',
      'string.max': 'Name must not exceed {#limit} characters',
      'string.trim': 'Name must not have leading or trailing whitespace',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().trim().strict().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email address',
      'string.empty': 'Email cannot be empty',
      'string.trim': 'Email must not have leading or trailing whitespace',
      'any.required': 'Email is required'
    }),
    password: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$')) // ít nhất 1 chữ và 1 số
      .required()
      .messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least {#limit} characters',
        'string.max': 'Password must not exceed {#limit} characters',
        'string.pattern.base': 'Password must contain at least one letter and one number',
        'any.required': 'Password is required'
      }),
    profileImageUrl: Joi.string().uri().optional().allow('', null), // ✅ cho phép bỏ trống hoặc null
    adminInviteToken: Joi.string().optional().allow('', null) // ✅ cho phép bỏ trống hoặc null
  })

  try {
    await validCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const messages = error.details.map(err => err.message).join('. ')
    const customError = new ApiError(400, messages)
    next(customError)
  }
}

const login = async (req, res, next) => {
  const validCondition = Joi.object({
    email: Joi.string().email().required().trim().strict().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email address',
      'string.empty': 'Email cannot be empty',
      'string.trim': 'Email must not have leading or trailing whitespace',
      'any.required': 'Email is required'
    }),
    password: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$')) // ít nhất 1 chữ và 1 số
      .required()
      .messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least {#limit} characters',
        'string.max': 'Password must not exceed {#limit} characters',
        'string.pattern.base': 'Password must contain at least one letter and one number',
        'any.required': 'Password is required'
      })
  })

  try {
    await validCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const messages = error.details.map(err => err.message).join('. ')
    const customError = new ApiError(400, messages)
    next(customError)
  }
}

const updateUserProfile = async (req, res, next) => {
  const validCondition = Joi.object({
    name: Joi.string().min(4).max(49).required().trim().strict().messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least {#limit} characters',
      'string.max': 'Name must not exceed {#limit} characters',
      'string.trim': 'Name must not have leading or trailing whitespace',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().trim().strict().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email address',
      'string.empty': 'Email cannot be empty',
      'string.trim': 'Email must not have leading or trailing whitespace',
      'any.required': 'Email is required'
    }),
    password: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$')) // ít nhất 1 chữ và 1 số
      .empty('')
      .optional()
      .messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least {#limit} characters',
        'string.max': 'Password must not exceed {#limit} characters',
        'string.pattern.base': 'Password must contain at least one letter and one number'
      })
  })

  try {
    await validCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const messages = error.details.map(err => err.message).join('. ')
    const customError = new ApiError(400, messages)
    next(customError)
  }
}

export const authValidation = {
  register, login, updateUserProfile
}
