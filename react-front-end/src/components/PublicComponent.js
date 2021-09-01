import React from 'react';
import CertificateComponent from './subcomponents/Certificates/CertificateComponent.js';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
import OwnerComponent from './subcomponents/Owners/OwnerComponent.js';
import ProviderPoolComponent from './subcomponents/ProvidersPools/ProviderPoolComponent.js';
const func = require("../functions/LoadFunctions.js");
const ProviderPoolFunc = require("../functions/ProviderPoolFunctions.js");
const Certificatefunc = require("../functions/CertificateFunctions.js");

class PublicComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      Certificatefunc.SwitchContext()
   }
    state = {
      newProvider : "",
      newProviderInfo : "",
      privateEnv : false,
      contractType : 1
    };
  
    handleNewProposal = async (event) => {
        event.preventDefault();
      await ProviderPoolFunc.AddProviderPool(this.state.newProvider, this.state.newProviderInfo, 0, 0, false, this.state.contractType)
      this.setState({ newProvider: "" })
      this.setState({ newProviderInfo: "" })
    };
  
    render(){
      return (
        <div>
          <CurrentAddressComponent />
          <br />
            <form onSubmit={this.handleNewProposal}>
                <input type="text" name="newProvider" placeholder="address" 
                    value={this.state.newProvider}
                    onChange={event => this.setState({ newProvider: event.target.value })}/>
                  <input type="text" name="newProviderInfo" placeholder="Info" 
                    value={this.state.newProviderInfo}
                    onChange={event => this.setState({ newProviderInfo: event.target.value })}/>
                <button>Send Proposal for Public Provider</button>
            </form>
          <br />
          <CertificateComponent contractType={this.state.contractType} privateEnv={this.state.privateEnv}/>
          <br />
          <OwnerComponent contractType={this.state.contractType}/>
          <br/>
          <ProviderPoolComponent contractType={this.state.contractType}/>
        </div>
      );
    }
  }

  export default PublicComponent;