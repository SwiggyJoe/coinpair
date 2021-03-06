export function auth_user(token) {
  return {
    type: 'AUTH_USER',
    payload: token
  }
}

export function unauth_user() {
  return {
    type: 'UNAUTH_USER',
  }
}

export function add_user_details(details){
  return {
    type: 'ADD_USER_DETAILS',
    payload: details,
  }
}

export function addWatchlist(coinID){
  return {
    type: 'ADD_WATCHLIST',
    payload: coinID,
  }
}

export function deleteFromWatchlist(coinID){
  return {
    type: 'DELETE_FROM_WATCHLIST',
    payload: coinID,
  }
}
