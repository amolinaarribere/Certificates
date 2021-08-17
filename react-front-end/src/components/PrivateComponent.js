import React from 'react';
import CertificateComponent from './subcomponents/CertificateComponent.js';
import CurrentAddressComponent from './subcomponents/CurrentAddressComponent.js';
import OwnerComponent from './subcomponents/Owners/OwnerComponent.js';
import ProviderComponent from './subcomponents/Providers/ProviderComponent.js';
const func = require("../Functions.js");

class PrivateComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      func.SwitchContext()
      if(func.privatePoolAddress != null && func.privatePoolAddress !== "" && func.privatePoolAddress !== "undefined"){
        func.SelectPrivatePool(func.privatePoolAddress);
      }
   }
    state = {
      minOwners : 0,
      listOfOwners : [],
      privatePool : "",
      privateEnv : true
    };
  
    handleNewPrivatePool = async (event) => {
        event.preventDefault();
      await func.CreatenewPrivatePool(this.state.minOwners, this.state.listOfOwners)
      this.setState({ minOwners: 0 })
      this.setState({ listOfOwners: [] })
    };
  
    handleSelectPool = async (event) => {
        event.preventDefault();
      sessionStorage.setItem(func.privatePoolKey, this.state.privatePool, { path: '/' });
      await func.SelectPrivatePool(this.state.privatePool);
      this.setState({ privatePool: "" })
    };
    
    render(){
      return (
        <div>
          <CurrentAddressComponent />
          <br />
          <form onSubmit={this.handleNewPrivatePool}>
              <input type="integer" name="minOwners" placeholder="min Owners" 
                  value={this.state.minOwners}
                  onChange={event => this.setState({ minOwners: event.target.value })}/>
                <input type="text" name="listOfOwners" placeholder="list Of Owners" 
                  value={this.state.listOfOwners}
                  onChange={event => this.setState({ listOfOwners: event.target.value.split(",") })}/>
              <button>Request New Private Pool</button>
          </form>
          <br />
          <br />
          <p><b>Private Pool Addresses :</b>
            <ol>
              {func.privatePoolAddresses.map(privatePoolAddress => (
              <li key={privatePoolAddress[1]}><i>creator</i> {privatePoolAddress[0]} :  
                                              <i> address</i> {privatePoolAddress[1]}</li>
              ))}
            </ol>
          </p>
          <br />
          <form onSubmit={this.handleSelectPool}>
              <input type="text" name="SelectPool" placeholder="address" 
                  value={this.state.privatePool}
                  onChange={event => this.setState({ privatePool: event.target.value })}/>
              <button>Select Pool</button>
          </form>
          <br />
          <h4> Selected Private Pool : {func.privatePoolAddress}</h4>
          <br />
          <CertificateComponent privateEnv={this.state.privateEnv}/>
          <br />
          <OwnerComponent privateEnv={this.state.privateEnv}/>
          <br/>
          <ProviderComponent privateEnv={this.state.privateEnv}/>
        </div>
      );
    }
  }

  
  export default PrivateComponent;