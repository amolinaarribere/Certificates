import React from 'react';
const func = require("../../../Functions.js");

class ValidateOwnerComponent extends React.Component{
    state = {
      validateOwner : ""
    };
    handleValidateOwner = async (event) => {
        event.preventDefault();
      await func.ValidateOwner(this.state.validateOwner, this.props.contractType)
      this.setState({ validateOwner: "" })
    };
  
    render(){
      return(
        <div>
          <form onSubmit={this.handleValidateOwner}>
              <input type="text" name="ValidateOwner" placeholder="address" 
                  value={this.state.validateOwner}
                  onChange={event => this.setState({ validateOwner: event.target.value })}/>
              <button>Validate Owner</button>
          </form>
        </div>
      );
    }
  }

  export default ValidateOwnerComponent;