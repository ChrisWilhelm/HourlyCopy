import ReactDOM from 'react-dom';
import App from './App';
import { CssBaseline } from '@mui/material';
import axios from 'axios';
axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;

ReactDOM.render(
  <>
    <CssBaseline />
    <App />
  </>,
  document.getElementById('root'),
);
