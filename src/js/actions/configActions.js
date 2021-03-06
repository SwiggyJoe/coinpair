export function changeViewCurrency(currency, symbol) {
  return {
    type: 'CHANGE_VIEW_CURRENCY',
    currency,
    symbol
  }
}

export function changeTheme(theme) {
  return {
    type: 'CHANGE_THEME',
    theme
  }
}

export function changeViewLayout(layout) {
  return {
    type: 'CHANGE_VIEW_LAYOUT',
    layout
  }
}
