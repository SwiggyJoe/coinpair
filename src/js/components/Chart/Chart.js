"use strict";

import React from "react";
import Chart from 'chart.js';
import UIkit from 'uikit';
import { connect } from "react-redux"

import { mapStateToProps } from '../../reducers';

var moment = require('moment');

let priceArray = [];
let labelArray = [];
let volumeArray = [];

var myChart, canvas, ctx, socket;

// Tooltip position at Mouse + Plugin for the line
Chart.Tooltip.positioners.cursor = function(chartElements, coordinates) {
  return coordinates;
};
Chart.plugins.register({
  id: 'customLine',
  afterEvent: function(chart, e) {

    var chartArea = chart.chartArea;

    if (e.type === 'mousemove' &&  e.x < chartArea.right && e.x > chartArea.left) {
      chart.options.customLine.x = e.x;
    }

    if(e.type === 'mouseout'){
      chart.options.customLine.x = -100;
    }

  },
  afterDraw: function(chart, easing) {
  var ctx = chart.chart.ctx;
  var chartArea = chart.chartArea;
  var x = chart.options.customLine.x;

    if (!isNaN(x)) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = chart.options.customLine.color;
      ctx.lineWidth = 2;
      ctx.moveTo(chart.options.customLine.x, chartArea.bottom);
      ctx.lineTo(chart.options.customLine.x, chartArea.top);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
  }
});

// NEEDS TO BE DONT KNOW WHY
const data = {
  labels: labelArray,
  datasets: [{
      label: 'Bitcoin',
      type:'line',
      data: priceArray,
      fill: false,
      borderColor: '#EC932F',
      backgroundColor: '#EC932F',
      pointBorderColor: '#EC932F',
      pointBackgroundColor: '#EC932F',
      pointHoverBackgroundColor: '#EC932F',
      pointHoverBorderColor: '#EC932F',
      yAxisID: 'y-axis-2',
      pointRadius: 0,
    },{
      type: 'line',
      label: 'Volume',
      data: volumeArray,
      fill: true,
      backgroundColor: '#71B37C',
      borderColor: '#71B37C',
      hoverBackgroundColor: '#71B37C',
      hoverBorderColor: '#71B37C',
      yAxisID: 'y-axis-1'
    }]
};
const options = {
  responsive: true,
  tooltips: {
    mode: 'index',
    intersect: false
  },
  elements: {
    line: {
      fill: false
    }
  },
  scales: {
    xAxes: [
      {
        display: true,
        gridLines: {
          display: false
        },
        labels: {
          show: true
        }
      }
    ],
    yAxes: [
      {
        type: 'linear',
        display: false,
        position: 'left',
        id: 'y-axis-1',
        gridLines: {
          display: false
        },
        labels: {
          show: false
        }
      },
      {
        type: 'linear',
        display: true,
        position: 'none',
        id: 'y-axis-2',
        gridLines: {
          display: true
        },
        labels: {
          show: true
        }
      }
    ]
  }
};

function drawChart(chartData){

  canvas = document.getElementById("myChart");
  ctx = canvas.getContext("2d");

  var data = chartData;
  var config = {
    type: 'bar',
    data: data,
    options: {
      plugins: {
        customLine: true,
      },
      customLine: {
        color: '#5a566c'
      },
      legend: {
            display: false
        },
      responsive: true,
      maintainAspectRatio: true,
      tooltips: {
              enabled: true,
              mode: 'index',
              intersect: false,
              position: 'cursor',
              callbacks: {
              label: function(tooltipItem, data) {
                  return data.datasets[tooltipItem.datasetIndex].label + ": $" + Number(tooltipItem.yLabel).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                  }
              },
      },
      scales: {
          xAxes: [{
            gridLines: {
              display: false
            },
            ticks: {
                autoSkip: true,
                maxTicksLimit: 5
            },
          }],
          yAxes: [
            {
              ticks: {
                callback: function(label, index, labels) {
                    label = "$ "+ label.toLocaleString(
                      undefined, // override browser locale
                      { minimumFractionDigits: 2 }
                    );
                    return label;
                }
              },
              gridLines: {
                display: false
              },
              id: 'y-axis-1',
              position: 'right',
              display: false,
            },
            {
              ticks: {
                callback: function(label, index, labels) {
                    label = "$ "+ label.toLocaleString(
                      undefined, // override browser locale
                      { minimumFractionDigits: 2 }
                    );
                    return label;
                }
              },
              gridLines: {
                display: true
              },
              id: 'y-axis-2',
              position: 'left',
            }]
      },
    },
  };

  myChart = new Chart(ctx, config);
}

// Redux Store setup
@connect((store) => {
  return mapStateToProps(store)
})

export default class ChartLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: data,
      options: options,
      chartLoaded: false,
      activeChart: props.activeCoin,
      activeCoin: props.activeCoin,
      activeTimeframe: "DAY",
    };

    socket = this.props.socketProp;
    socket.on('callbackChart', (dataSocket) => {
      console.log(dataSocket)
    this.setState({
      chartLoaded: true,
      data: dataSocket.data,
      },function(){
        if(typeof(myChart) != "undefined") myChart.destroy();
        drawChart(dataSocket.data);
      });
    });

  }

  componentWillUpdate(){


  }

  /*componentWillReceiveProps(nextProps) {

    if (nextProps.chartInformation != this.state.activeChart) {
      this.setState({
        activeChart: nextProps.chartInformation,
        chartLoaded: false,
      }, function () {
        if(this.state.acitveChart != -1){
          socket.emit('getChartData',
            {
              coinID: this.props.activeCoin,
              timeframe: this.state.activeTimeframe,
            }
          );
        }

      });
    }

    this.changeTime = this.changeTime.bind(this);
}*/

  componentDidMount() {
    document.getElementsByTagName('html')[0].scrollTop = 0;
  }

  changeTime(time){
    socket.emit('getCoinDetails',
      {
        coinID: this.props.activeCoin,
        timeframe: time,
      }
    );
    this.setState({
      activeTimeframe: time,
    });
  }

  render() {
    return (
      <div>
        <div class="roomx">
        <center>
          <h1 style={this.state.chartLoaded ? {display: 'none'} : {}}>Loading Chart..</h1>
        <div class="uk-margin-small" style={this.state.chartLoaded ? {} : {display: 'none'}}>
          <div class="uk-button-group">

              <button
                  className={this.state.activeTimeframe == 'DAY' ? 'uk-button uk-button-small uk-button-primary' : 'uk-button uk-button-small uk-button-secondary'}
                  onClick={() => this.changeTime("DAY")}>
                  Last Day
                  </button>

              <button
                  className={this.state.activeTimeframe == 'WEEK' ? 'uk-button uk-button-small uk-button-primary' : 'uk-button uk-button-small uk-button-secondary'}
                  onClick={() => this.changeTime("WEEK")}>
                  Last Week
                  </button>

              <button
                  className={this.state.activeTimeframe == 'MONTH' ? 'uk-button uk-button-small uk-button-primary' : 'uk-button uk-button-small uk-button-secondary'}
                  onClick={() => this.changeTime("MONTH")}>
                  Last Month
                  </button>

              <button
                  className={this.state.activeTimeframe == 'YEAR' ? 'uk-button uk-button-small uk-button-primary' : 'uk-button uk-button-small uk-button-secondary'}
                  onClick={() => this.changeTime("YEAR")}>
                  Last Year
                  </button>
          </div>
        </div>
        </center>
          <div class="chart-wrapper">
            <canvas style={this.state.chartLoaded ? {} : {display: 'none'}} id="myChart"></canvas>
          </div>
        </div>
      </div>
    );
  }
}
