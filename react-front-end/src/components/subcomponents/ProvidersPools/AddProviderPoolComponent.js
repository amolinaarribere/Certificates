import React from 'react';
const func = require("../../../Functions.js");

class AddProviderPoolComponent extends React.Component{
    state = {
      addProviderPool : "",
      addProviderPoolInfo : "",
      subscriptionPrice : 0,
      certificatePrice : 0
    };

    handleAddProvider = async (event) => {
        event.preventDefault();
      await func.AddProviderPool(this.state.addProviderPool, this.state.addProviderPoolInfo, this.state.subscriptionPrice, this.state.certificatePrice, this.props.contractType)
      this.setState({ addProviderPoolInfo: "", addProviderPool: "",  subscriptionPrice : 0, certificatePrice : 0})
    };
  
    render(){
      if(this.props.contractType == 2){
        return(
          <div>
            <form onSubmit={this.handleAddProvider}>
              <input type="text" name="addProvider" placeholder="address" 
                  value={this.state.addProviderPool}
                  onChange={event => this.setState({ addProviderPool: event.target.value })}/>
              <input type="text" name="addProviderInfo" placeholder="Info" 
                  value={this.state.addProviderPoolInfo}
                  onChange={event => this.setState({ addProviderPoolInfo: event.target.value })}/>
              <button>Add Provider</button>
          </form>
          </div>
        );
      }
      else if (this.props.contractType == 3){
          return(
            <div>
              <form onSubmit={this.handleAddProvider}>
                <input type="text" name="addProvider" placeholder="address" 
                    value={this.state.addProviderPool}
                    onChange={event => this.setState({ addProviderPool: event.target.value })}/>
                <input type="text" name="addProviderInfo" placeholder="Info" 
                    value={this.state.addProviderPoolInfo}
                    onChange={event => this.setState({ addProviderPoolInfo: event.target.value })}/>
                <input type="integer" name="subscriptionPrice" placeholder="subscriptionPrice" 
                  value={this.state.subscriptionPrice}
                  onChange={event => this.setState({ subscriptionPrice: event.target.value })}/>
                <input type="integer" name="certificatePrice" placeholder="certificatePrice" 
                  value={this.state.certificatePrice}
                  onChange={event => this.setState({ certificatePrice: event.target.value })}/>
                <button>Add Pool</button>
            </form>
            </div>
          );
      }
      else{
        return(
          <div></div>
        );
      }
    }
  }

export default AddProviderPoolComponent;