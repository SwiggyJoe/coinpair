
  import React from "react";
  import UIkit from 'uikit';
  import { Link } from 'react-router-dom'
  import { connect } from "react-redux"

  import { mapStateToProps } from '../../reducers'

  import { getPriceInPersonalCurrency } from '../../scripts/convert.js'

  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })

  export default class Right extends React.Component {
    render() {
      const { config, generalMarket } = this.props
      return (
        <div class="right-side">
          <div class="market-overview">
            <div class="part">
              <h3>Market Cap</h3>
              <h2>
                <font>{config.currency_symbol}</font>
                {getPriceInPersonalCurrency(generalMarket["total_market_cap_usd"], config.currency).toLocaleString(undefined, {'minimumFractionDigits':0,'maximumFractionDigits':0}) }
              </h2>
            </div>

            |

            <div class="part">
              <h3>24h Volume</h3>
              <h2>
                <font>{config.currency_symbol}</font>
                {getPriceInPersonalCurrency(generalMarket["total_24h_volume_usd"], config.currency).toLocaleString(undefined, {'minimumFractionDigits':0,'maximumFractionDigits':0}) }
              </h2>
            </div>

            |

            <div class="part">
              <h3>BTC Dominance</h3>
              <h2>
                {generalMarket["bitcoin_percentage_of_market_cap"].toLocaleString(undefined, {'minimumFractionDigits':2,'maximumFractionDigits':2})}
                <font>%</font>
              </h2>
            </div>

            <br/>
          </div>
        </div>
      )
    }
  }
