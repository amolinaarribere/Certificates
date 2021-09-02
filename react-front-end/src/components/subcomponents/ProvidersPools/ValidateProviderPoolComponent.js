import React from 'react';
const func = require("../../../functions/ProviderPoolFunctions.js");

class ValidateProviderPoolComponent extends React.Component{
    state = {
      validateProviderPool : ""
    };
    handleValidateProviderPool = async (event) => {
        event.preventDefault();
      await func.ValidateProviderPool(this.state.validateProviderPool, this.props.contractType)
      this.setState({ validateProviderPool: "" })
    };
  
    render(){
      var text = "Provider";
      if(this.props.contractType == 3) text = "Pool";
      return(
        <div>
          <form onSubmit={this.handleValidateProviderPool}>
              <input type="text" name="ValidateProviderPool" placeholder="address" 
                  value={this.state.validateProviderPool}
                  onChange={event => this.setState({ validateProviderPool: event.target.value })}/>
              <button>Validate {text}</button>
          </form>
        </div>
      );
    }
  }

  export default ValidateProviderPoolComponent;