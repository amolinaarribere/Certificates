import React from 'react';
const func = require("../../../functions/TreasuryFunctions.js");

class PricePropositionComponent extends React.Component {
    state = {
      NewPublicPriceUSD : "",
      NewPrivatePriceUSD : "",
      NewProviderPriceUSD : "",
      NewCertificatePriceUSD : "",
      NewOwnerRefundFeeUSD : ""
    };
    handleUpgradePrices = async (event) => {
      event.preventDefault();

      var NPPUSD = 0;
      var NPPUSD2 = 0;
      var NPPUSD3 = 0;
      var NCPUSD = 0;
      var NORUSD = 0;

      if(this.state.NewPublicPriceUSD != "") NPPUSD = this.state.NewPublicPriceUSD;
      if(this.state.NewPrivatePriceUSD != "") NPPUSD2 = this.state.NewPrivatePriceUSD;
      if(this.state.NewProviderPriceUSD != "") NPPUSD3 = this.state.NewProviderPriceUSD;
      if(this.state.NewProviderPriceUSD != "") NCPUSD = this.state.NewProviderPriceUSD;
      if(this.state.NewProviderPriceUSD != "") NORUSD = this.state.NewProviderPriceUSD;

      await func.UpgradePricesTreasury(NPPUSD, NPPUSD2, NPPUSD3, NCPUSD, NORUSD);

      this.setState({ NewPublicPriceUSD: "",
      NewPrivatePriceUSD: "",
      NewProviderPriceUSD: "",
      NewCertificatePriceUSD: "",
      NewOwnerRefundFeeUSD: ""})
    };
    
    render(){
      return (
        <div>
          <p><b>Submit New Provider to Public Pool Price :</b> {func.PublicPriceUSD} USD ({func.PublicPriceWei} wei)</p>
          <p><b>Create New Private Pool Price :</b> {func.PrivatePriceUSD} USD ({func.PrivatePriceWei} wei)</p>
          <p><b>Create New Provider Price :</b> {func.ProviderPriceUSD} USD ({func.ProviderPriceWei} wei)</p>
          <p><b>Send Certificate to Public Pool Price :</b> {func.CertificatePriceUSD} USD ({func.CertificatePriceWei} wei)</p>
          <p><b>Refund Fee :</b> {func.OwnerRefundFeeUSD} USD ({func.OwnerRefundFeeWei} wei)</p>
          <br />
          <form onSubmit={this.handleUpgradePrices}>
            <p>
              <input type="integer" name="NewPublicPriceUSD" placeholder="NewPublicPriceUSD" 
                  value={this.state.NewPublicPriceUSD}
                  onChange={event => this.setState({ NewPublicPriceUSD: event.target.value })}/>
            </p>
            <p>
              <input type="integer" name="NewPrivatePriceUSD" placeholder="NewPrivatePriceUSD" 
                  value={this.state.NewPrivatePriceUSD}
                  onChange={event => this.setState({ NewPrivatePriceUSD: event.target.value })}/>
            </p>
            <p>
              <input type="integer" name="NewProviderPriceUSD" placeholder="NewProviderPriceUSD" 
                  value={this.state.NewProviderPriceUSD}
                  onChange={event => this.setState({ NewProviderPriceUSD: event.target.value })}/>
            </p>
            <p>
              <input type="integer" name="NewCertificatePriceUSD" placeholder="NewCertificatePriceUSD" 
                  value={this.state.NewCertificatePriceUSD}
                  onChange={event => this.setState({ NewCertificatePriceUSD: event.target.value })}/>
            </p>
            <p>
              <input type="integer" name="NewOwnerRefundFeeUSD" placeholder="NewOwnerRefundFeeUSD" 
                  value={this.state.NewOwnerRefundFeeUSD}
                  onChange={event => this.setState({ NewOwnerRefundFeeUSD: event.target.value })}/>
            </p>
              <button>Upgrade Prices</button>
          </form>
          <br />
          <p class="text-warning"><b>Pending Public Price :</b> {func.PendingPublicPriceUSD}</p>
          <p class="text-warning"><b>Pending Private Price :</b> {func.PendingPrivatePriceUSD}</p>
          <p class="text-warning"><b>Pending Provider Price :</b> {func.PendingProviderPriceUSD}</p>
          <p class="text-warning"><b>Pending Certificate Price :</b> {func.PendingCertificatePriceUSD}</p>
          <p class="text-warning"><b>Pending Refund Fee :</b> {func.PendingOwnerRefundFeeUSD}</p>
        </div>
      );
    }
  }
  
export default PricePropositionComponent;