import React from 'react';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
import { CERTIFICATE_POOL_MANAGER_ADDRESS} from '../config';
const func = require("../Functions.js");

class ManagerComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
   }
  
    render(){
      return (
        <div>
          <CurrentAddressComponent />
          <br />
          <p><b>Manager Address :</b> {CERTIFICATE_POOL_MANAGER_ADDRESS}</p>
          <p><b>Public Address :</b> {func.publicPoolAddress}</p>
          <p><b>Private Factory Address :</b> {func.privatePoolFactoryAddress}</p>
          <p><b>Private Implementation Address :</b> {func.privatePoolImplAddress}</p>
          <p><b>Provider Factory Address :</b> {func.providerFactoryAddress}</p>
          <p><b>Provider Implementation Address :</b> {func.providerImplAddress}</p>
          <p><b>Treasury Address :</b> {func.TreasuryAddress}</p>
          <p><b>Certis Token Address :</b> {func.CertisTokenAddress}</p>
          <br/>
        </div>
      );
    }
  }

  export default ManagerComponent;

