import React from 'react';
import { CERTIFICATE_POOL_MANAGER_ADDRESS} from '../../../config';
const func = require("../../../functions/ManagerFunctions.js");
const Aux = require("../../../functions/AuxiliaryFunctions.js");
const address_0 = "0x0000000000000000000000000000000000000000";

class AddressPropositionComponent extends React.Component {
    state = {
      NewPublicPoolAddress : "",
      NewTreasuryAddress : "",
      NewCertisTokenAddress : "",
      NewPrivatePoolFactoryAddress : "",
      NewPrivatePoolAddress : "",
      NewProviderFactoryAddress : "",
      NewProviderAddress : "",
      NewPriceConverterAddress : ""
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
      var NPCA = address_0;

      if(this.state.NewPublicPoolAddress != "") NPPA = this.state.NewPublicPoolAddress;
      if(this.state.NewTreasuryAddress != "") NTA = this.state.NewTreasuryAddress;
      if(this.state.NewCertisTokenAddress != "") NCTA = this.state.NewCertisTokenAddress;
      if(this.state.NewPrivatePoolFactoryAddress != "") NPPFA = this.state.NewPrivatePoolFactoryAddress;
      if(this.state.NewPrivatePoolAddress != "") NPPA2 = this.state.NewPrivatePoolAddress;
      if(this.state.NewProviderFactoryAddress != "") NPFA = this.state.NewProviderFactoryAddress;
      if(this.state.NewProviderAddress != "") NPA = this.state.NewProviderAddress;
      if(this.state.NewPriceConverterAddress != "") NPCA = this.state.NewPriceConverterAddress;

      await func.UpgradeContracts(NPPA, NTA, NCTA, NPPFA, NPPA2, NPFA, NPA, NPCA);

      this.setState({ NewPublicPoolAddress: "",
      NewTreasuryAddress: "",
      NewCertisTokenAddress: "",
      NewPrivatePoolFactoryAddress: "",
      NewPrivatePoolAddress: "",
      NewProviderFactoryAddress: "",
      NewProviderAddress: "",
      NewPriceConverterAddress: ""})
    };
    
    render(){
      return (
        <div>
          <p><b>Manager Address :</b> {CERTIFICATE_POOL_MANAGER_ADDRESS}</p>
          <p><b>Public Address Proxy :</b> {func.publicPoolAddressProxy}</p>
          <p><b>Private Factory Address Proxy :</b> {func.privatePoolFactoryAddressProxy}</p>
          <p><b>Provider Factory Address Proxy :</b> {func.providerFactoryAddressProxy}</p>
          <p><b>Treasury Address Proxy :</b> {func.TreasuryAddressProxy}</p>
          <p><b>Certis Token Address Proxy :</b> {func.CertisTokenAddressProxy}</p>
          <p><b>Price Converter Address Proxy :</b> {func.PriceConverterAddressProxy}</p>
          <br />
          <p><b>Public Address :</b> {func.publicPoolAddress}</p>
          <p><b>Private Factory Address :</b> {func.privatePoolFactoryAddress}</p>
          <p><b>Private Implementation Address :</b> {func.privatePoolImplAddress}</p>
          <p><b>Provider Factory Address :</b> {func.providerFactoryAddress}</p>
          <p><b>Provider Implementation Address :</b> {func.providerImplAddress}</p>
          <p><b>Treasury Address :</b> {func.TreasuryAddress}</p>
          <p><b>Certis Token Address :</b> {func.CertisTokenAddress}</p>
          <p><b>Price Converter Address :</b> {func.PriceConverterAddress}</p>
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
            <p>
              <input type="text" name="NewPriceConverterAddress" placeholder="NewPriceConverterAddress" 
                  value={this.state.NewPriceConverterAddress}
                  onChange={event => this.setState({ NewPriceConverterAddress: event.target.value })}/>
            </p>
              <button>Upgrade Contracts</button>
          </form>
          <br />
          <p class="text-warning"><b>Pending Public Pool Address :</b> {Aux.Bytes32ToAddress(func.PendingPublicPoolAddress)}</p>
          <p class="text-warning"><b>Pending Treasury Address :</b> {Aux.Bytes32ToAddress(func.PendingTreasuryAddress)}</p>
          <p class="text-warning"><b>Pending Certis Token Address :</b> {Aux.Bytes32ToAddress(func.PendingCertisTokenAddress)}</p>
          <p class="text-warning"><b>Pending Private Factory Address :</b> {Aux.Bytes32ToAddress(func.PendingPrivatePoolFactoryAddress)}</p>
          <p class="text-warning"><b>Pending Private Pool Impl Address :</b> {Aux.Bytes32ToAddress(func.PendingPrivatePoolImplAddress)}</p>
          <p class="text-warning"><b>Pending Provider Factory Address :</b> {Aux.Bytes32ToAddress(func.PendingProviderFactoryAddress)}</p>
          <p class="text-warning"><b>Pending Provider Impl Address :</b> {Aux.Bytes32ToAddress(func.PendingProviderImplAddress)}</p>
          <p class="text-warning"><b>Pending Price Converter Address :</b> {Aux.Bytes32ToAddress(func.PendingPriceConverterAddress)}</p>
        </div>
      );
    }
  }
  
export default AddressPropositionComponent;