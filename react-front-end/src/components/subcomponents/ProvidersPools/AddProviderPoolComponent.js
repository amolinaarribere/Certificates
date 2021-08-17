import React from 'react';
const func = require("../../../Functions.js");

class AddProviderPoolComponent extends React.Component{
    state = {
      validateProvider : "",
      addProvider : "",
      addProviderInfo : ""
    };
  
    handleValidateProvider = async (event) => {
        event.preventDefault();
      await func.ValidateProposal(this.state.validateProvider)
      this.setState({ validateProvider: "" })
    };
    handleAddProvider = async (event) => {
        event.preventDefault();
      await func.AddProviderPool(this.state.addProvider, this.state.addProviderInfo)
      this.setState({ addProviderInfo: "" })
      this.setState({ addProvider: "" })
    };
  
    render(){
      if(this.props.privateEnv){
        return(
          <div>
            <form onSubmit={this.handleAddProvider}>
              <input type="text" name="addProvider" placeholder="address" 
                  value={this.state.addProvider}
                  onChange={event => this.setState({ addProvider: event.target.value })}/>
              <input type="text" name="addProviderInfo" placeholder="Info" 
                  value={this.state.addProviderInfo}
                  onChange={event => this.setState({ addProviderInfo: event.target.value })}/>
              <button>Add Provider</button>
          </form>
          </div>
        );
      }
      else{
        return(
          <div>
            <form onSubmit={this.handleValidateProvider}>
              <input type="text" name="validateProvider" placeholder="address" 
                  value={this.state.validateProvider}
                  onChange={event => this.setState({ validateProvider: event.target.value })}/>
              <button>Validate Provider</button>
          </form>
          </div>
        );
      }
    }
  }

export default AddProviderPoolComponent;