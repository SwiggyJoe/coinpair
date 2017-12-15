
  import React from 'react'

  const defaultState = {
    filtered: [{
      id: 'symbol',
      value: ""
    },
    {
      id: 'name',
      value: ""
    }]
  }

  export default function reducer(state=defaultState, action) {

      switch (action.type) {

        case "CHANGE_FILTER_TABLE": {
          return {
            ...state,
            filtered: [
              {
                id: 'symbol',
                value: action.filter
              },
              {
                id: 'name',
                value: action.filter
              }
            ]
          }
        }

      }

      return state
  }
