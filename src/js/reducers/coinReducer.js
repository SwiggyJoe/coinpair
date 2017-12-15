
  const defaultState = []


  export default function reducer(state=defaultState, action) {

      switch (action.type) {

        case "NEW_CONNECTION_COIN_DATA_SIMPLE": {
          return action.payload
        }

      }

      return state
  }
