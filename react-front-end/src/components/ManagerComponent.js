import React from 'react';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
import AddressPropositionComponent from './subcomponents/Manager/AddressPropositionComponent.js';
import PropositionConfigComponent from './subcomponents/Proposition/PropositionConfigComponent.js';
const func = require("../functions/LoadFunctions.js");
//const Certificatefunc = require("../functions/CertificateFunctions.js");

class ManagerComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      //Certificatefunc.SwitchContext()
   }
   state = {
     contractType : 1
    };
    
  
    render(){
      return (
        <div>
          <CurrentAddressComponent />
          <br />
          <AddressPropositionComponent />
          <br />
          <PropositionConfigComponent contractType={this.state.contractType}/>
          <br/>
        </div>
      );
    }
  }

  export default ManagerComponent;

