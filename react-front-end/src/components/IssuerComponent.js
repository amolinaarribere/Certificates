import React from 'react';
import CertificateComponent from './subcomponents/Certificates/CertificateComponent.js';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
import OwnerComponent from './subcomponents/Owners/OwnerComponent.js';
import ProviderPoolComponent from './subcomponents/ProvidersPools/ProviderPoolComponent.js';
import ListPoolsIssuers from './subcomponents/Factory/ListPoolsIssuers.js';
import CreatePoolIssuer from './subcomponents/Factory/CreatePoolIssuer.js';
const func = require("../functions/LoadFunctions.js");
const ProviderPoolFunc = require("../functions/ProviderPoolFunctions.js");

  class IssuerComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      //func.SwitchContext()
      if(ProviderPoolFunc.providerAddress != null && ProviderPoolFunc.providerAddress !== "" && ProviderPoolFunc.providerAddress !== "undefined"){
        ProviderPoolFunc.SelectProviderPool(ProviderPoolFunc.providerAddress, this.state.contractType);
      }
   }
    state = {
      contractType : 3
    };
    
    render(){
      return (
        <div>
          <CurrentAddressComponent />
          <br />
          <CreatePoolIssuer contractType={this.state.contractType}/>
          <br />
          <br />
          <ListPoolsIssuers contractType={this.state.contractType} Key={ProviderPoolFunc.providerKey}/>
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