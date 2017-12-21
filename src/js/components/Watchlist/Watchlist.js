
  import React from "react";
  import UIkit from 'uikit';
  import { Link } from 'react-router-dom'
  import { connect } from "react-redux"

  import { push } from 'react-router-redux'

  import { mapStateToProps } from '../../reducers';
  import Table from './Table'

  import { getPriceInPersonalCurrencyExact } from '../../scripts/convert.js'

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


  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })

  export default class Watchlist extends React.Component {
    constructor(props){
      super(props)

    }



    render() {
      const { config, coin, portfolio} = this.props


      return (
        <div class="Watchlist">
          <div class="header">
            <h1>Watchlist</h1>
            <h2>Your personal curated coin list.</h2>
          </div>
          <Table />
        </div>
      )
    }
  }
