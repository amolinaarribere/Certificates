import React from 'react';
import CertificateComponent from './subcomponents/Certificates/CertificateComponent.js';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
import OwnerComponent from './subcomponents/Owners/OwnerComponent.js';
import ProviderPoolComponent from './subcomponents/ProvidersPools/ProviderPoolComponent.js';
import ListPoolsIssuers from './subcomponents/Factory/ListPoolsIssuers.js';
import CreatePoolIssuer from './subcomponents/Factory/CreatePoolIssuer.js';
const func = require("../Functions.js");

  class IssuerComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      func.SwitchContext()
      if(func.providerAddress != null && func.providerAddress !== "" && func.providerAddress !== "undefined"){
        func.SelectProvider(func.providerAddress);
      }
   }
    state = {
      contractType : 3
    };
  
    handleNewProvider = async (event) => {
        event.preventDefault();
      await func.CreatenewProvider(this.state.minOwners, this.state.listOfOwners)
      this.setState({ minOwners: 0 })
      this.setState({ listOfOwners: [] })
    };
    
    render(){
      return (
        <div>
          <CurrentAddressComponent />
          <br />
          <CreatePoolIssuer contractType={this.state.contractType}/>
          <br />
          <br />
          <ListPoolsIssuers contractType={this.state.contractType} Key={func.providerKey}/>
          <br />
          <CertificateComponent contractType={this.state.contractType}/>
          <br />
          <OwnerComponent contractType={this.state.contractType}/>
          <br/>
          <ProviderPoolComponent contractType={this.state.contractType}/>
        </div>
      );
    }
  }
  

export default IssuerComponent;