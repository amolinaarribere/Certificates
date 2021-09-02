import React from 'react';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
import PropositionConfigComponent from './subcomponents/Proposition/PropositionConfigComponent.js';
import AddressPropositionComponent from './subcomponents/PriceConverter/AddressPropositionComponent.js';
import PriceConvertToWeiComponent from './subcomponents/PriceConverter/PriceConvertToWeiComponent.js';
const func = require("../functions/LoadFunctions.js");

class PriceConverterComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      //func.SwitchContext()
   }
    state = {
        contractType : 3
    };
    
    render(){
      return (
        <div>
         <CurrentAddressComponent />
          <br />
          <PriceConvertToWeiComponent />
          <br />
          <AddressPropositionComponent />
          <br />
          <PropositionConfigComponent contractType={this.state.contractType}/>
          <br/>
        </div>
      );
    }
  }

export default PriceConverterComponent;