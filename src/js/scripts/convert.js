

Number.prototype.formatMoney = function(c, d, t){
var n = this,
  c = isNaN(c = Math.abs(c)) ? 2 : c,
  d = d == undefined ? "." : d,
  t = t == undefined ? "," : t,
  s = n < 0 ? "-" : "",
  i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
  j = (j = i.length) > 3 ? j % 3 : 0;
 return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};


  function exchangeCurrency(val,currency){
    let result = Number(val)

    if (currency=="EUR") result = result * 0.84

    return result;
  }

  export function getPriceInPersonalCurrency(val, currency) {
    if(typeof val != "undefined"){

      let result = exchangeCurrency(val, currency)

      if(result > 1 && result < 10000){
          result = result.formatMoney(2,',','.')

        }else if (result > 10000) {
          result = result.formatMoney(0,',','.')
        }
        else if (result < 1){
          result = result.formatMoney(5,',','.')
        }
        else if (result < -1) {
          result = result.formatMoney(2,',','.')
        }
        else if (result < -10000) {
          result = result.formatMoney(0,',','.')
        }

        return result
    }

  }

  export function getPriceInPersonalCurrencyExact(val, currency) {
    if(typeof val != "undefined"){

      let result = exchangeCurrency(val, currency)

        if(result < -1){
          result = result.formatMoney(2,',','.')
        }
        else if (result < 1){
          result = result.formatMoney(5,',','.')
        }
        else if(result >= 1){
          result = result.formatMoney(2,',','.')
        }



        return result
    }

  }
