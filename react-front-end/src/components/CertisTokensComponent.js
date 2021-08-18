import React from 'react';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
const func = require("../Functions.js");

class CertisTokensComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      func.SwitchContext()
   }
    state = {
      
    };
    
    render(){
      return (
        <div>
          <CurrentAddressComponent />
          <br />
        </div>
      );
    }
  }

export default CertisTokensComponent;