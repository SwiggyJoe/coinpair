
  const defaultState = {
    currency: "USD",
    currency_symbol: "$",
    coinTableSize: 50,
    layout: "FULL",
    theme: "LIGHT",
  }

  export default function reducer(state=defaultState, action) {

      switch (action.type) {

        case "CHANGE_VIEW_CURRENCY": {
          return {
            ...state,
            currency: action.currency,
            currency_symbol: action.symbol
          }
        }

        case "CHANGE_VIEW_LAYOUT": {
          return {
            ...state,
            layout: action.layout
          }
        }

        case "CHANGE_THEME": {
          return {
            ...state,
            theme: action.theme
          }
        }

      }

      return state
  }
