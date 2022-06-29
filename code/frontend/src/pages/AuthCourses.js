import { Navigate } from 'react-router';

// Checks if user is authorizes
export function AuthCourses({ auth, children }) {
  return auth ? children : <Navigate to="/login" />;
}
