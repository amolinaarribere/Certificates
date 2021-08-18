import React from 'react';
const func = require("../../../Functions.js");

class SelectPoolIssuerComponent extends React.Component{
      state = {
        ProviderPool : ""
      };
    
      handleSelectProviderPool = async (event) => {
        event.preventDefault();
        sessionStorage.setItem(this.props.Key, this.state.ProviderPool, { path: '/' });
        await func.SelectProvider(this.state.ProviderPool);
        this.setState({ ProviderPool: "" })
      };
      
      render(){
        var text = "Provider";
        if (this.props.contractType == 3)text = "Pool";
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
                </div>
            );
        }
        
    }
}

export default ListPoolsIssuers;