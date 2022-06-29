import * as React from 'react';
import {
  toast,
  ToastContainer as ReactToastifyToastContainer,
} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Creates an error toast.
 * @param {Error} err: an Error object
 */
export function errorToast(err) {
  if (err.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    toast.error(err.response.data.message || err.response.data.msg);
  } else if (err.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    toast.error('Sorry, we are having some trouble connecting to our server');
  } else {
    // Something happened in setting up the request that triggered an Error
    toast.error(`Error: ${err.message || err.msg}`);
  }
}

/**
 * Creates a success toast.
 * @param {string} text: the success text
 */
export function successToast(text) {
  return toast.success(text);
}

/**
 * Represents a reusable component that uses the react-toastify ToastContainer component.
 * @returns A ToastContainer component.
 */
export function ToastContainer() {
  return (
    <ReactToastifyToastContainer
      position="bottom-center"
      autoClose={3000}
      hideProgressBar
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable={false}
      pauseOnHover
      theme="colored"
    />
  );
}
