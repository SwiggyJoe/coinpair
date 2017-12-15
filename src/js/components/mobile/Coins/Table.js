
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"
  import { push } from 'react-router-redux'

  import ReactTable from 'react-table'

  import { mapStateToProps } from '../../../reducers';
  import { getPriceInPersonalCurrency } from '../../../scripts/convert.js'

  import { store } from '../../../store'

  var longpress = false;
var presstimer = null;
var longtarget = null;

/*var node = document.getElementsByClassName('rt-tr')

node.addEventListener("mousedown", start);
node.addEventListener("touchstart", start);
node.addEventListener("click", click);
node.addEventListener("mouseout", cancel);
node.addEventListener("touchend", cancel);
node.addEventListener("touchleave", cancel);
node.addEventListener("touchcancel", cancel);*/
/*
var cancel = function(e) {
    if (presstimer !== null) {
        clearTimeout(presstimer);
        presstimer = null;
    }

    this.classList.remove("longpress");
};

var click = function(e) {
    if (presstimer !== null) {
        clearTimeout(presstimer);
        presstimer = null;
    }
    this.classList.remove("longpress");

    if (longpress) {
        return false;
    }

    alert("press");
};

var start = function(e) {
    console.log(e);

    if (e.type === "click" && e.button !== 0) {
        return;
    }

    longpress = false;

    this.classList.add("longpress");

    presstimer = setTimeout(function() {
        alert("long click");
        longpress = true;
    }, 1000);

    return false;
};
*/

  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })



  export default class Table extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        columns:  [
          {
            Header: "#",
            id: "rank",
            maxWidth: 49,
            accessor: d => Number(d.rank),
          },
          {
            Header: "",
            id: "img",
            maxWidth: 29,
            style: {padding: '10px 0px'},
            Cell: row => (
                  <center><span>
                  <img width="24px" src={"https://files.coinmarketcap.com/static/img/coins/32x32/" + row.original.id.toLowerCase() + ".png"} />

                  </span></center>
                ),
          },
          {
            Header: "Symbol",
            id: "name",
            accessor: d => d.name,
            minWidth: 74,
            Cell: row => (
                  <span>
                  <b><font style={{fontSize: '12px'}}>
                    [{row.original.symbol}]
                  </font></b>
                  </span>
                ),
          },
          {
            Header: "ONLY SORT",
            id: "symbol",
            show: true,
            accessor: d => d.symbol,
            maxWidth: 0,
            filterable: true,
            headerStyle: {'display': 'none'},
            style: {'display': 'none'},
          },
          {
            Header: "Price",
            id: "price_usd",
            minWidth: 99,
            accessor: d => Number(d.price_usd),
            Cell: row => (
                  <span>
                  <b><font style={{fontSize: '14px'}}>
                    {this.props.config.currency_symbol + getPriceInPersonalCurrency(row.value, this.props.config.currency)}
                  </font></b>
                  </span>
                ),
          },
          {
            Header: "Gain 24h",
            id: "percent_change_24h",
            minWidth: 75,
            accessor: d => Number(d['percent_change_24h']),
            Cell: row => (
                  <span style={row.value > 0 ? {color: 'green'} : {color: 'red'}}>

                  <b><font style={{fontSize: '12px'}}>
                    {row.value > 0 ? '+' + row.value.toLocaleString() : row.value.toLocaleString()}%
                  </font></b>


                  </span>
                ),

          },

        ]

      }
    }

    render() {
      const { socket, coin, coinTable, router, config } = this.props

      return (
        <div class="table uk-container">

          <ReactTable
            data={coin}
            columns={this.state.columns}
            defaultPageSize={config.coinTableSize}
            filtered={coinTable.filtered}
            defaultFilterMethod= {(filter, row, column) => {
              return row['symbol'].toLowerCase().startsWith(filter.value.toLowerCase()) || row['name'].toLowerCase().startsWith(filter.value.toLowerCase())
            }}


            pageSize={ typeof router.location.state === "undefined" ? config.coinTableSize : router.location.state.tableSize }
            page={ typeof router.location.state === "undefined" ? 0 : router.location.state.tablePage }

            onPageChange={(index) => {
              let state = router.location.state
              store.dispatch(push({ pathname: '/',  state: {...state, tablePage: index} }))
            }}

            onPageSizeChange={(size) => {
              let state = router.location.state
              store.dispatch(push({ pathname: '/',  state: {...state, tableSize: size} }))
            }}

            onSortedChange={() => {
              let state = router.location.state
              store.dispatch(push({pathname:'/', state: {...state, tablePage: 0}}))
            }}

            getTdProps={(state, rowInfo, column, instance) => {
            return {
              onClick: (e, handleOriginal) => {
                navigator.vibrate(30);
                store.dispatch(push('/coin/'+ rowInfo.original.id.toLowerCase()))
                //alert(rowInfo.original.id)
                console.log('A Td Element was clicked!')
                console.log('it produced this event:', e)
                console.log('It was in this column:', column)
                console.log('It was in this row:', rowInfo)
                console.log('It was in this table instance:', instance)
                if (handleOriginal) {
                  handleOriginal()
                }
              }
            }
            }}
          />

          <br/><br/><br/>

        </div>
      )
    }
  }
