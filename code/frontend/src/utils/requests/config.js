export const getAuthConfig = (token) => {
  return { headers: { Authorization: `Bearer ${token}` } };
};
