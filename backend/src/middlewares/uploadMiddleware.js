import multer from 'multer'
import ApiError from '../utils/ApiError.js'

// Setup lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads') // không có dấu /
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

// Lọc loại file hợp lệ
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ApiError(400, 'Only .jpeg, .jpg and .png formats are allowed'), false)
  }
}

// Tạo middleware upload
export const upload = multer({
  storage,
  fileFilter
})
