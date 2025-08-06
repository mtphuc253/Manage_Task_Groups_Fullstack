export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    statusCode,
    message,
    data
  })
}
