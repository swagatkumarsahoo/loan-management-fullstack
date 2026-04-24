import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then(res => setUser(res.data.data))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (credentials) => {
    const res = await authAPI.login(credentials)
    const { token: t, ...userData } = res.data.data
    localStorage.setItem('token', t)
    setToken(t)
    setUser(userData)
    return userData
  }

  const register = async (data) => {
    const res = await authAPI.register(data)
    const { token: t, ...userData } = res.data.data
    localStorage.setItem('token', t)
    setToken(t)
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
