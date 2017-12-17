
  const defaultState = []


  export default function reducer(state=defaultState, action) {

      switch (action.type) {

        case "NEW_PORTFOLIO_DATA": {
          return action.payload
        }

      }

      return state
  }
