import React from 'react';
const func = require("../../../functions/ProviderPoolFunctions.js");

class RemoveProviderPoolComponent extends React.Component{
    state = {
      removeProviderPool : ""
    };
    handleRemoveProviderPool = async (event) => {
        event.preventDefault();
      await func.RemoveProviderPool(this.state.removeProviderPool, this.props.contractType)
      this.setState({ removeProviderPool: "" })
    };
  
    render(){
      var text = "Provider";
      if (this.props.contractType == 3)text = "Pool";
      return(
        <div>
          <form onSubmit={this.handleRemoveProviderPool}>
            <input type="text" name="RemoveProvider" placeholder="address" 
                value={this.state.removeProvider}
                onChange={event => this.setState({ removeProviderPool: event.target.value })}/>
            <button>Remove {text}</button>
          </form> 
        </div>
      );
     
    }
  }

export default RemoveProviderPoolComponent;