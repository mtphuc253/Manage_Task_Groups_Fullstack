import multer from 'multer'
import ApiError from '../utils/ApiError.js'

// Lưu file vào bộ nhớ RAM thay vì ổ đĩa
const storage = multer.memoryStorage()

// Lọc loại file hợp lệ
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ApiError(400, 'Only .jpeg, .jpg, .png and .webp formats are allowed'), false)
  }
}

// Tạo middleware upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
})
