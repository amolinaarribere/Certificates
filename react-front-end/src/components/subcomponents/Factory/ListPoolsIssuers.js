import React from 'react';
const func = require("../../../functions/FactoriesFunctions.js");

class FundProviderComponent extends React.Component{
    state = {
      Amount : 0
    };
  
    handleFundProvider = async (event) => {
      event.preventDefault();
      await func.FundProvider(this.state.Amount);
      this.setState({ Amount: 0 })
    };
    
    render(){
      return (
          <div>
              <form onSubmit={this.handleFundProvider}>
                  <input type="interger" name="Amount" placeholder="amount" 
                      value={this.state.Amount}
                      onChange={event => this.setState({ Amount: event.target.value })}/>
                  <button>Fund Provider</button>
              </form>
          </div>
      );
    }
}

class SelectPoolIssuerComponent extends React.Component{
      state = {
        ProviderPool : ""
      };
    
      handleSelectProviderPool = async (event) => {
        event.preventDefault();
        sessionStorage.setItem(this.props.Key, this.state.ProviderPool, { path: '/' });
        await func.SelectProviderPool(this.state.ProviderPool, this.props.contractType);
        this.setState({ ProviderPool: "" })
      };
      
      render(){
        var text = "Pool";
        if (this.props.contractType == 3)text = "Provider";
        return (
            <div>
                <form onSubmit={this.handleSelectProviderPool}>
                    <input type="text" name="SelectProviderPool" placeholder="address" 
                        value={this.state.ProviderPool}
                        onChange={event => this.setState({ ProviderPool: event.target.value })}/>
                    <button>Select {text}</button>
                </form>
            </div>
        );
      }
}

class ListPoolsIssuers extends React.Component {
    render(){
        if(this.props.contractType == 2){
            return(
                <div>
                    <p><b>Private Pool Addresses :</b>
                        <ol>
                        {func.privatePoolAddresses.map(privatePoolAddress => (
                        <li key={privatePoolAddress[1]}><i>creator</i> {privatePoolAddress[0]} :  
                                                        <i> address</i> {privatePoolAddress[1]}</li>
                        ))}
                        </ol>
                    </p>
                    <br />
                    <SelectPoolIssuerComponent contractType={this.props.contractType} Key={this.props.Key}/>
                    <br />
                    <h4> Selected Private Pool : {func.privatePoolAddress}</h4>
                </div>
            );
        }
        else{
            return (
                <div>
                    <p><b>Provider Addresses :</b>
                        <ol>
                        {func.providerAddresses.map(providerAddress => (
                        <li key={providerAddress[1]}><i>creator</i> {providerAddress[0]} :  
                                                    <i> address</i> {providerAddress[1]}</li>
                        ))}
                        </ol>
                    </p>
                    <br />
                    <SelectPoolIssuerComponent contractType={this.props.contractType} Key={this.props.Key}/>
                    <br />
                    <h4> Selected Provider : {func.providerAddress}</h4>
                    <br />
                    <p><b>Contract Balance :</b> {func.providerBalance}</p>
                    <br />
                    <FundProviderComponent />
                </div>
            );
        }
        
    }
}

export default ListPoolsIssuers;