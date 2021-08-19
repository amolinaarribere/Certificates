import React from 'react';
import PropositionConfigComponent from './subcomponents/Proposition/PropositionConfigComponent.js';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
import PricePropositionComponent from './subcomponents/Treasury/PricePropositionComponent.js';
import AssignWithdrawComponent from './subcomponents/Treasury/AssignWithdrawComponent.js';
const func = require("../Functions.js");

class TreasuryComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      func.SwitchContext()
   }
    state = {
      contractType : 2
    };
    
    render(){
      return (
        <div>
          <CurrentAddressComponent />
          <br />
          <AssignWithdrawComponent />
          <br />
          <PricePropositionComponent />
          <br />
          <PropositionConfigComponent contractType={this.state.contractType}/>
        </div>
      );
    }
  }
  
export default TreasuryComponent;