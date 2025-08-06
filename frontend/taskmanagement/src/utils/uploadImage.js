import { toast } from "sonner"
import { API_PATHS } from "~/utils/apiPaths"
import axiosInstance from "~/utils/axiosInstance"


const uploadImage = async (imageFile) => {
  const formData = new FormData

  formData.append('image', imageFile)

  try {
    const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })

    toast.success(response.data.message)
    return response.data.data

  } catch (error) {
    toast.error(error)
    console.error('Error uploading the image: ', error)
    throw error
    
  }
}

export default uploadImage

