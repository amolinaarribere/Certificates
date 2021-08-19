import React from 'react';
const func = require("../../../Functions.js");

class PricePropositionComponent extends React.Component {
    state = {
      NewPublicPriceWei : "",
      NewPrivatePriceWei : "",
      NewProviderPriceWei : "",
      NewCertificatePriceWei : "",
      NewOwnerRefundFeeWei : ""
    };
    handleUpgradePrices = async (event) => {
      event.preventDefault();

      await func.UpgradePricesTreasury(this.state.NewPublicPriceWei, this.state.NewPrivatePriceWei, this.state.NewProviderPriceWei, this.state.NewCertificatePriceWei, this.state.NewOwnerRefundFeeWei);

      this.setState({ NewPublicPriceWei: "",
      NewPrivatePriceWei: "",
      NewProviderPriceWei: "",
      NewCertificatePriceWei: "",
      NewOwnerRefundFeeWei: ""})
    };
    
    render(){
      return (
        <div>
          <p><b>Submit New Provider to Public Pool Price :</b> {func.PublicPriceWei}</p>
          <p><b>Create New Private Pool Price :</b> {func.PrivatePriceWei}</p>
          <p><b>Create New Provider Price :</b> {func.ProviderPriceWei}</p>
          <p><b>Send Certificate to Public Pool Price :</b> {func.CertificatePriceWei}</p>
          <p><b>Refund Fee :</b> {func.OwnerRefundFeeWei}</p>
          <br />
          <form onSubmit={this.handleUpgradePrices}>
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
              <input type="integer" name="NewOwnerRefundFeeWei" placeholder="NewOwnerRefundFeeWei" 
                  value={this.state.NewOwnerRefundFeeWei}
                  onChange={event => this.setState({ NewOwnerRefundFeeWei: event.target.value })}/>
            </p>
              <button>Upgrade Prices</button>
          </form>
          <br />
          <p class="text-warning"><b>Pending Public Price :</b> {func.PendingPublicPriceWei}</p>
          <p class="text-warning"><b>Pending Private Price :</b> {func.PendingPrivatePriceWei}</p>
          <p class="text-warning"><b>Pending Provider Price :</b> {func.PendingProviderPriceWei}</p>
          <p class="text-warning"><b>Pending Certificate Price :</b> {func.PendingCertificatePriceWei}</p>
          <p class="text-warning"><b>Pending Refund Fee :</b> {func.PendingOwnerRefundFeeWei}</p>
        </div>
      );
    }
  }
  
export default PricePropositionComponent;