import React from 'react';
import CertificateComponent from './subcomponents/Certificates/CertificateComponent.js';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
import OwnerComponent from './subcomponents/Owners/OwnerComponent.js';
import ProviderPoolComponent from './subcomponents/ProvidersPools/ProviderPoolComponent.js';
import ListPoolsIssuers from './subcomponents/Factory/ListPoolsIssuers.js';
import CreatePoolIssuer from './subcomponents/Factory/CreatePoolIssuer.js';
const func = require("../functions/LoadFunctions.js");
const ProviderPoolFunc = require("../functions/ProviderPoolFunctions.js");
const Certificatefunc = require("../functions/CertificateFunctions.js");

class PrivateComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      Certificatefunc.SwitchContext()
      if(ProviderPoolFunc.privatePoolAddress != null && ProviderPoolFunc.privatePoolAddress !== "" && ProviderPoolFunc.privatePoolAddress !== "undefined"){
        ProviderPoolFunc.SelectProviderPool(ProviderPoolFunc.privatePoolAddress, this.state.contractType);
      }
   }
    state = {
      privateEnv : true,
      contractType : 2
    };
  
    
    render(){
      return (
        <div>
          <CurrentAddressComponent />
          <br />
          <CreatePoolIssuer contractType={this.state.contractType}/>
          <br />
          <br />
          <ListPoolsIssuers contractType={this.state.contractType} Key={ProviderPoolFunc.privatePoolKey}/>
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

  
  export default PrivateComponent;