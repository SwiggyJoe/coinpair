export function auth_user(payload) {
  return {
    type: 'AUTH_USER',
    payload: val
  }
}

export function unauth_user(payload) {
  return {
    type: 'UNAUTH_USER',
    payload: val
  }
}

export function auth_error(payload) {
  return {
    type: 'AUTH_ERROR',
    payload: val
  }
}

export function forgot_password_request(payload) {
  return {
    type: 'FORGOT_PASSWORD_REQUEST',
    payload: val
  }
}

export function protected_test(payload) {
  return {
    type: 'PROTECTED_TEST',
    payload: val
  }
}
