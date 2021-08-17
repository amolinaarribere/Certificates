import React from 'react';
import CertificateComponent from './subcomponents/CertificateComponent.js';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
import OwnerComponent from './subcomponents/Owners/OwnerComponent.js';
import ProviderComponent from './subcomponents/Providers/ProviderComponent.js';
const func = require("../Functions.js");

class PublicComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      func.SwitchContext()
   }
    state = {
      newProvider : "",
      newProviderInfo : "",
      privateEnv : false
    };
  
    handleNewProposal = async (event) => {
        event.preventDefault();
      await func.SendnewProposal(this.state.newProvider, this.state.newProviderInfo)
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
          <CertificateComponent privateEnv={this.state.privateEnv}/>
          <br />
          <OwnerComponent privateEnv={this.state.privateEnv}/>
          <br/>
          <ProviderComponent privateEnv={this.state.privateEnv}/>
        </div>
      );
    }
  }

  export default PublicComponent;