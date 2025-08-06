import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '~/context/userContext'

export const useUserAuth = () => {
  const { user, loading, clearUser } = useContext(UserContext)
  const navigate = useNavigate()

  useEffect(() => {
    // Nếu đang loading user info thì chưa xử lý gì
    if (loading) return

    // Nếu đã có user thì không cần redirect
    if (user) return

    // Nếu không có user thì clear context và chuyển hướng về /login
    clearUser()
    navigate('/login')
  }, [user, loading, clearUser, navigate])
}
