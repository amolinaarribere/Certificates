import React from 'react';
const func = require("../../../Functions.js");

class ValidateMinOwnerComponent extends React.Component{

    handleValidateMinOwner = async (event) => {
      event.preventDefault();
      await func.ValidateMinOwner(this.props.contractType)
    };
  
    render(){
      return(
        <div>
          <form onSubmit={this.handleValidateMinOwner}>
              <button>Validate Min Owner</button>
          </form>
        </div>
      );
    }
  }

  export default ValidateMinOwnerComponent;