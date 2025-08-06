/* eslint-disable no-unused-vars */
import { env } from '../config/environment.js'


// Middleware xử lý lỗi tập trung trong ứng dụng Back-end NodeJS (ExpressJS)
export const errorHandlingMiddleware = (err, req, res, next) => {

  // Nếu dev không cẩn thận thiếu statusCode thì mặc định sẽ để code 500
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  // Tạo ra một biến responseError để kiểm soát những gì muốn trả về
  const responseError = {
    statusCode: statusCode,
    message: message, // Nếu lỗi mà không có message thì lấy ReasonPhrases chuẩn theo mã Status Code
    stack: err.stack //Log ra vị trí lỗi
  }
  // console.error(responseError)

  // Chỉ khi môi trường là DEV thì mới trả về Stack Trace để debug dễ dàng hơn, còn không thì xóa đi. (Muốn hiểu rõ hơn hãy xem video 55 trong bộ MERN Stack trên kênh Youtube: https://www.youtube.com/@trungquandev)
  if (env.BUILD_MODE !== 'dev') delete responseError.stack

  // Đoạn này có thể mở rộng nhiều về sau như ghi Error Log vào file, bắn thông báo lỗi vào group Slack, Telegram, Email...vv Hoặc có thể viết riêng Code ra một file Middleware khác tùy dự án.
  // ...
  // console.error(responseError)

  // Trả responseError về phía FrontEnd
  res.status(responseError.statusCode).json(responseError)
}

