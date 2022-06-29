import axios from 'axios';
import { getAuthConfig } from './config';

export const getMe = async (token) => {
  return await axios.get('/api/users/me', getAuthConfig(token));
};
