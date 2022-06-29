import axios from 'axios';
import { errorToast } from '../toast';
import { getAuthConfig } from './config';

// Function to get res.data[param] from api route
// and sets the rows to the parsed version of data
export const fetchAndSetRows = async (token, route, param, parser, setRows) => {
  await axios
    .get(route, getAuthConfig(token))
    .then((response) => {
      setRows(parser(response.data[param]));
    })
    .catch((err) => {
      errorToast(err);
    });
};
