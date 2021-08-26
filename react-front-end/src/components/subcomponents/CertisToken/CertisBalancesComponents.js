import React from 'react';
const func = require("../../../Functions.js");

class CertisBalancesComponents extends React.Component {
    render(){
      return (
        <div>
          <p><b>Total Token Supply :</b> {func.TokensTotalSupply}</p>
          <p><b>Your current Balance :</b> {func.TokensBalance}</p>
        </div>
      );
    }
  }

export default CertisBalancesComponents;