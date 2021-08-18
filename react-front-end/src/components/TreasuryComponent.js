import React from 'react';
import PropositionConfigComponent from './subcomponents/Proposition/PropositionConfigComponent.js';
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
          <br/>
          <PropositionConfigComponent contractType={this.state.contractType}/>
          <br />
        </div>
      );
    }
  }
  
export default TreasuryComponent;