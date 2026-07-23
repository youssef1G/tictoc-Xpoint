import { createContext, useContext, useState } from 'react'
import { loginAdmin } from '../api.js'
const AuthContext = createContext()
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ttx-token'))
  const login = async (username, password) => {
    const res = await loginAdmin(username, password)
    setToken(res.token)
    localStorage.setItem('ttx-token', res.token)
  }
  const logout = () => { setToken(null); localStorage.removeItem('ttx-token') }
  return <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)