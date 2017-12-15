"use strict";

import React from "react";
import UIkit from 'uikit';
import CryptowatchEmbed from 'cryptowatch-embed';


export default class ChartLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  componentDidMount() {
    var chart = new CryptowatchEmbed('bitfinex', 'btcusd', {
      width: 800,
      height: 500,
      presetColorScheme: 'ishihara',

    });
    chart.mount('#chart-container');
  }

  render() {
    return (
      <div>
      <div id="chart-container"></div>

      </div>
    );
  }
}
