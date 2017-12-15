
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'

  export default class Information extends React.Component {
    render() {
      return (
          <div class="information uk-card uk-card-secondary uk-card-body">
            <div class="uk-card-badge uk-label">ALPHA</div>
            <h3 class="uk-card-title">Coinpair.it</h3>
            <p>Thank you for using the Alpha Version, even though we
                are still under heavy development.
            </p>
          </div>
      )
    }
  }
