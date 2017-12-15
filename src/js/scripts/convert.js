
  function exchangeCurrency(val,currency){
    let result = Number(val)

    if (currency=="EUR") result = result * 0.84

    return result;
  }

  export function getPriceInPersonalCurrency(val, currency) {
    if(typeof val != "undefined"){

      let result = exchangeCurrency(val, currency)

      if(result > 1 && result < 10000){
          result = result.toLocaleString(undefined, {'minimumFractionDigits':2,'maximumFractionDigits':2})

        }else if (result > 10000) {
          result = result.toLocaleString(undefined, {'minimumFractionDigits':0,'maximumFractionDigits':0})
        }
        else if (result < 1){
          result = result.toLocaleString(undefined, {'minimumFractionDigits':2,'maximumFractionDigits':5})
        }

        return result
    }

  }

  export function getPriceInPersonalCurrencyExact(val, currency) {
    if(typeof val != "undefined"){

      let result = exchangeCurrency(val, currency)

        if (result < 1){
          result = result.toLocaleString(undefined, {'minimumFractionDigits':2,'maximumFractionDigits':5})
        }
        else{
          result = result.toLocaleString(undefined, {'minimumFractionDigits':2,'maximumFractionDigits':2})
        }

        return result
    }

  }
