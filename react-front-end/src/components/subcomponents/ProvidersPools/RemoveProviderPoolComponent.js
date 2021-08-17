import React from 'react';
const func = require("../../../Functions.js");

class RemoveProviderPoolComponent extends React.Component{
    state = {
      removeProvider : "",
      removePool : ""
    };
    handleRemoveProvider = async (event) => {
        event.preventDefault();
      await func.RemoveProviderPool(this.state.removeProvider, this.props.privateEnv)
      this.setState({ removeProvider: "" })
    };

    handleRemovePool = async (event) => {
      event.preventDefault();
    await func.RemovePool(this.state.removePool, this.props.privateEnv)
    this.setState({ removePool: "" })
  };
  
    render(){
      if (this.props.contractType != 3){
        return(
          <div>
            <form onSubmit={this.handleRemoveProvider}>
              <input type="text" name="RemoveProvider" placeholder="address" 
                  value={this.state.removeProvider}
                  onChange={event => this.setState({ removeProvider: event.target.value })}/>
              <button>Remove Provider</button>
            </form> 
          </div>
        );
      }
      else{
        return(
          <div>
            <form onSubmit={this.handleRemovePool}>
              <input type="text" name="RemovePool" placeholder="address" 
                  value={this.state.removePool}
                  onChange={event => this.setState({ removePool: event.target.value })}/>
              <button>Remove Pool</button>
            </form> 
          </div>
        );
      }
    }
  }

export default RemoveProviderPoolComponent;