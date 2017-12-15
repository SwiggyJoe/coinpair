
  const defaultState = {
    "total_market_cap_usd": 0,
    "total_24h_volume_usd": 0,
    "bitcoin_percentage_of_market_cap": 0
  }

  export default function reducer(state=defaultState, action) {

      switch (action.type) {

        case "NEW_CONNECTION_GENERAL_MARKET_DATA": {
          return action.payload
        }

      }

      return state
  }
