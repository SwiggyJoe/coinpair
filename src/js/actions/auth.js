
  import axios from 'axios';
  import cookie from 'react-cookie';
  import { auth_user,
         auth_error,
         unauth_user,
         protected_test } from './authActions.js';

  const API_URL = 'http://localhost:8081/api';

  export function errorHandler(dispatch, error, type) {
  let errorMessage = '';

  if(error.data.error) {
    errorMessage = error.data.error;
  } else if(error.data){
    errorMessage = error.data;
  } else {
    errorMessage = error;
  }

  if(error.status === 401) {
    dispatch({
      type: type,
      payload: 'You are not authorized to do this. Please login and try again.'
    })
    logoutUser()
  }
  else {
    dispatch({
      type: type,
      payload: errorMessage
      })
    }
  }

  export function loginUser({ email, password }) {
    return function(dispatch) {
      axios.post(`${API_URL}/auth/login`, { email, password })
      .then(response => {
        cookie.save('token', response.data.token, { path: '/' })
        dispatch({ type: 'AUTH_USER' })
        alert('logged in')
      })
      .catch((error) => {
        errorHandler(dispatch, error.response, 'AUTH_ERROR')
      })
    }
  }

  export function protectedTest() {
  return function(dispatch) {
    axios.get(`${API_URL}/protected`, {
      headers: { 'Authorization': cookie.load('token') }
    })
    .then(response => {
      dispatch({
        type: 'PROTECTED_TEST',
        payload: response.data.content
      });
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, 'AUTH_ERROR')
    });
  }
}
