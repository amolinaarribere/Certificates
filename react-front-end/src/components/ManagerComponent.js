import React from 'react';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
import PropositionConfigComponent from './subcomponents/Proposition/PropositionConfigComponent.js';
import { CERTIFICATE_POOL_MANAGER_ADDRESS} from '../config';
const func = require("../Functions.js");
const address_0 = "0x0000000000000000000000000000000000000000"

class ManagerComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
   }
   state = {
     contractType : 1,
     NewPublicPoolAddress: "",
     NewTreasuryAddress: "",
     NewCertisTokenAddress: "", 
     NewPrivatePoolFactoryAddress: "", 
     NewPrivatePoolAddress: "", 
     NewProviderFactoryAddress: "", 
     NewProviderAddress: ""
    };
    handleUpgradeContracts = async (event) => {
      event.preventDefault();
      var NPPA = address_0;
      var NTA = address_0;
      var NCTA = address_0;
      var NPPFA = address_0;
      var NPPA2 = address_0;
      var NPFA = address_0;
      var NPA = address_0;

      if(this.state.NewPublicPoolAddress != "") NPPA = this.state.NewPublicPoolAddress;
      if(this.state.NewTreasuryAddress != "") NTA = this.state.NewTreasuryAddress;
      if(this.state.NewCertisTokenAddress != "") NCTA = this.state.NewCertisTokenAddress;
      if(this.state.NewPrivatePoolFactoryAddress != "") NPPFA = this.state.NewPrivatePoolFactoryAddress;
      if(this.state.NewPrivatePoolAddress != "") NPPA2 = this.state.NewPrivatePoolAddress;
      if(this.state.NewProviderFactoryAddress != "") NPFA = this.state.NewProviderFactoryAddress;
      if(this.state.NewProviderAddress != "") NPPA = this.state.NewProviderAddress;

      await func.UpgradeContracts(NPPA, NTA, NCTA, NPPFA, NPPA2, NPFA, NPA);

      this.setState({ NewPublicPoolAddress: "",
      NewTreasuryAddress: "",
      NewCertisTokenAddress: "",
      NewPrivatePoolFactoryAddress: "",
      NewPrivatePoolAddress: "",
      NewProviderFactoryAddress: "",
      NewProviderAddress: ""})
    };
  
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
          <br />
          <form onSubmit={this.handleUpgradeContracts}>
            <p>
              <input type="text" name="NewPublicPoolAddress" placeholder="NewPublicPoolAddress" 
                  value={this.state.NewPublicPoolAddress}
                  onChange={event => this.setState({ NewPublicPoolAddress: event.target.value })}/>
            </p>
            <p>
              <input type="text" name="NewTreasuryAddress" placeholder="NewTreasuryAddress" 
                  value={this.state.NewTreasuryAddress}
                  onChange={event => this.setState({ NewTreasuryAddress: event.target.value })}/>
            </p>
            <p>
              <input type="text" name="NewCertisTokenAddress" placeholder="NewCertisTokenAddress" 
                  value={this.state.NewCertisTokenAddress}
                  onChange={event => this.setState({ NewCertisTokenAddress: event.target.value })}/>
            </p>
            <p>
              <input type="text" name="NewPrivatePoolFactoryAddress" placeholder="NewPrivatePoolFactoryAddress" 
                  value={this.state.NewPrivatePoolFactoryAddress}
                  onChange={event => this.setState({ NewPrivatePoolFactoryAddress: event.target.value })}/>
            </p>
            <p>
              <input type="text" name="NewPrivatePoolAddress" placeholder="NewPrivatePoolAddress" 
                  value={this.state.NewPrivatePoolAddress}
                  onChange={event => this.setState({ NewPrivatePoolAddress: event.target.value })}/>
            </p>
            <p>
              <input type="text" name="NewProviderFactoryAddress" placeholder="NewProviderFactoryAddress" 
                  value={this.state.NewProviderFactoryAddress}
                  onChange={event => this.setState({ NewProviderFactoryAddress: event.target.value })}/>
            </p>
            <p>
              <input type="text" name="NewProviderAddress" placeholder="NewProviderAddress" 
                  value={this.state.NewProviderAddress}
                  onChange={event => this.setState({ NewProviderAddress: event.target.value })}/>
            </p>
              <button>Upgrade Contracts</button>
          </form>
          <br />
          <p class="text-warning"><b>Pending Public Pool Address :</b> {func.PendingPublicPoolAddress}</p>
          <p class="text-warning"><b>Pending Treasury Address :</b> {func.PendingTreasuryAddress}</p>
          <p class="text-warning"><b>Pending Certis Token Address :</b> {func.PendingCertisTokenAddress}</p>
          <p class="text-warning"><b>Pending Private Factory Address :</b> {func.PendingPrivatePoolFactoryAddress}</p>
          <p class="text-warning"><b>Pending Private Pool Impl Address :</b> {func.PendingPrivatePoolImplAddress}</p>
          <p class="text-warning"><b>Pending Provider Factory Address :</b> {func.PendingProviderFactoryAddress}</p>
          <p class="text-warning"><b>Pending Provider Impl Address :</b> {func.PendingProviderImplAddress}</p>
          <br />
          <PropositionConfigComponent contractType={this.state.contractType}/>
          <br/>
        </div>
      );
    }
  }

  export default ManagerComponent;

