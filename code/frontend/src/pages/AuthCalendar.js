import { Navigate } from 'react-router';

// Checks if user is authorized
export function AuthCalendar({ auth, children }) {
  return auth ? children : <Navigate to="/login" />;
}
