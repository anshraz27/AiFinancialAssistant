import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children }) => {
  // Check both authentication state and token
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
  const token = localStorage.getItem("token")
  
  // User is authenticated if both isAuthenticated is true and token exists
  const isUserAuthenticated = isAuthenticated && token

  return isUserAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
