import React from 'react';
import PropositionConfigComponent from './subcomponents/Proposition/PropositionConfigComponent.js';
import ListPropositionConfigComponent from './subcomponents/Proposition/ListPropositionConfigComponent.js';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
const func = require("../Functions.js");

class TreasuryComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      func.SwitchContext()
   }
    state = {
      contractType : 2,
      NewPublicPriceWei : "",
      NewPrivatePriceWei : "",
      NewProviderPriceWei : "",
      NewCertificatePriceWei : "",
      NewOwnerRefundPriceWei : ""
    };
    
    render(){
      return (
        <div>
          <CurrentAddressComponent />
          <br />
          <p><b>Submit New Provider to Public Pool Price :</b> {func.PublicPriceWei}</p>
          <p><b>Create New Private Pool Price :</b> {func.PrivatePriceWei}</p>
          <p><b>Create New Provider Price :</b> {func.ProviderPriceWei}</p>
          <p><b>Send Certificate to Public Pool Price :</b> {func.CertificatePriceWei}</p>
          <p><b>Refund Fee :</b> {func.OwnerRefundPriceWei}</p>
          <br />
          <form onSubmit={this.handleUpgradeContracts}>
            <p>
              <input type="integer" name="NewPublicPriceWei" placeholder="NewPublicPriceWei" 
                  value={this.state.NewPublicPriceWei}
                  onChange={event => this.setState({ NewPublicPriceWei: event.target.value })}/>
            </p>
            <p>
              <input type="integer" name="NewPrivatePriceWei" placeholder="NewPrivatePriceWei" 
                  value={this.state.NewPrivatePriceWei}
                  onChange={event => this.setState({ NewPrivatePriceWei: event.target.value })}/>
            </p>
            <p>
              <input type="integer" name="NewProviderPriceWei" placeholder="NewProviderPriceWei" 
                  value={this.state.NewProviderPriceWei}
                  onChange={event => this.setState({ NewProviderPriceWei: event.target.value })}/>
            </p>
            <p>
              <input type="integer" name="NewCertificatePriceWei" placeholder="NewCertificatePriceWei" 
                  value={this.state.NewCertificatePriceWei}
                  onChange={event => this.setState({ NewCertificatePriceWei: event.target.value })}/>
            </p>
            <p>
              <input type="integer" name="NewOwnerRefundPriceWei" placeholder="NewOwnerRefundPriceWei" 
                  value={this.state.NewOwnerRefundPriceWei}
                  onChange={event => this.setState({ NewOwnerRefundPriceWei: event.target.value })}/>
            </p>
              <button>Upgrade Prices</button>
          </form>
          <br />
          <ListPropositionConfigComponent contractType={this.state.contractType}/>
          <br/>
          <PropositionConfigComponent contractType={this.state.contractType}/>
        </div>
      );
    }
  }
  
export default TreasuryComponent;