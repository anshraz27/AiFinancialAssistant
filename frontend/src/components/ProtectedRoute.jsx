import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children }) => {
  // In a real app, you'd check authentication status from context/state
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
