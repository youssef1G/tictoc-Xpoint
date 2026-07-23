import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
export default function AdminRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/admin-access" replace />
}