import React from 'react';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
import OwnerComponent from './subcomponents/Owners/OwnerComponent.js';
import ProviderPoolComponent from './subcomponents/ProvidersPools/ProviderPoolComponent.js';
const func = require("../Functions.js");

  class IssuerComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      func.SwitchContext()
      if(func.providerAddress != null && func.providerAddress !== "" && func.providerAddress !== "undefined"){
        func.SelectProvider(func.providerAddress);
      }
   }
    state = {
      minOwners : 0,
      listOfOwners : [],
      provider : "",
      contractType : 3
    };
  
    handleNewProvider = async (event) => {
        event.preventDefault();
      await func.CreatenewProvider(this.state.minOwners, this.state.listOfOwners)
      this.setState({ minOwners: 0 })
      this.setState({ listOfOwners: [] })
    };
  
    handleSelectProvider = async (event) => {
        event.preventDefault();
      sessionStorage.setItem(func.providerKey, this.state.provider, { path: '/' });
      await func.SelectProvider(this.state.provider);
      this.setState({ provider: "" })
    };
    
    render(){
      return (
        <div>
          <CurrentAddressComponent />
          <br />
          <form onSubmit={this.handleNewProvider}>
              <input type="integer" name="minOwners" placeholder="min Owners" 
                  value={this.state.minOwners}
                  onChange={event => this.setState({ minOwners: event.target.value })}/>
                <input type="text" name="listOfOwners" placeholder="list Of Owners" 
                  value={this.state.listOfOwners}
                  onChange={event => this.setState({ listOfOwners: event.target.value.split(",") })}/>
              <button>Request New Provider</button>
          </form>
          <br />
          <br />
          <p><b>Provider Addresses :</b>
            <ol>
              {func.providerAddresses.map(providerAddress => (
              <li key={providerAddress[1]}><i>creator</i> {providerAddress[0]} :  
                                           <i> address</i> {providerAddress[1]}</li>
              ))}
            </ol>
          </p>
          <br />
          <form onSubmit={this.handleSelectProvider}>
              <input type="text" name="SelectProvider" placeholder="address" 
                  value={this.state.provider}
                  onChange={event => this.setState({ provider: event.target.value })}/>
              <button>Select Provider</button>
          </form>
          <br />
          <h4> Selected Provider : {func.providerAddress}</h4>
          <br />
          <OwnerComponent privateEnv={this.state.privateEnv}/>
          <br/>
          <ProviderPoolComponent contractType={this.state.contractType}/>
        </div>
      );
    }
  }
  

export default IssuerComponent;