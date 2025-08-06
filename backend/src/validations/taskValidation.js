import Joi from 'joi'
import ApiError from '../utils/ApiError.js'

const createTaskSchema = Joi.object({
  title: Joi.string()
    .min(4)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least {#limit} characters',
      'string.max': 'Title must not exceed {#limit} characters',
      'any.required': 'Title is required'
    }),

  description: Joi.string()
    .allow('')
    .max(1000)
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description must not exceed {#limit} characters'
    }),

  priority: Joi.string()
    .valid('Low', 'Medium', 'High')
    .default('Medium')
    .messages({
      'any.only': 'Priority must be one of [Low, Medium, High]'
    }),

  dueDate: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Due date must be a valid date',
      'any.required': 'Due date is required'
    }),

  assignedTo: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .messages({
      'string.pattern.base': 'Each assigned user ID must be a valid ObjectId'
    }),

  attachments: Joi.array()
    .items(Joi.string().uri())
    .messages({
      'string.uri': 'Each attachment must be a valid URI'
    }),

  todoChecklist: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().required().messages({
          'string.base': 'Checklist text must be a string',
          'any.required': 'Checklist text is required'
        }),
        completed: Joi.boolean().default(false)
      })
    )
})

const validateCreateTask = async (req, res, next) => {
  try {
    await createTaskSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const messages = error.details.map(err => err.message).join('. ')
    next(new ApiError(400, messages))
  }
}

export const taskValidation = {
  validateCreateTask
}
