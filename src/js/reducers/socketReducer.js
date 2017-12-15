
  const defaultState = {
    connected: false,
    socket: undefined
  }

  export default function reducer(state={connected: false}, action) {

      switch (action.type) {

        case "SOCKET_CONNECTED": {
          return {...state, connected: true, socket: action.payload}
        }

        case "SOCKET_DISCONNECTED": {
          return {...state, connected: false, socket: undefined}
        }
      }

      return state
  }
