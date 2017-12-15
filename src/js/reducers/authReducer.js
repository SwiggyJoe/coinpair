
import Cookies from 'universal-cookie'
const cookies = new Cookies();

const USER_DEFAULT = {
  details: {
    invite: "",
    lastLogged: null,
    mail: "",
    mailVerify: true,
    picture: null,
    plan: "",
    rank: "USER"
  },
  id: "",
  password: "",
  portfolios: [],
  settings: {
    currency: "USD",
    tableSize: 50,
    theme: "LIGHT"
  },
  token: "",
  userID: 0,
  username: ""
}


  const INITIAL_STATE = {
    token: "",
    authenticated: false,
    user: USER_DEFAULT,
  }

  export default function (state = INITIAL_STATE, action) {
    switch(action.type) {
      case 'AUTH_USER':
        return {...state, token: action.payload.token, authenticated: true }

      case 'UNAUTH_USER':
        let token = cookies.get('token')
        if(typeof token !== "undefined"){
          cookies.remove('token')
        }
        return { ...state,token: "", authenticated: false }

      case 'ADD_USER_DETAILS':
        return { ...state, user: action.payload }
    }

    return state
  }
