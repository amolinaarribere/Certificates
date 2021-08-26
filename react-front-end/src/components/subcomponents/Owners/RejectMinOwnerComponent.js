import React from 'react';
const func = require("../../../Functions.js");

class RejectMinOwnerComponent extends React.Component{

    handleRejectMinOwner = async (event) => {
      event.preventDefault();
      await func.RejectMinOwner(this.props.contractType)
    };
  
    render(){
      return(
        <div>
          <form onSubmit={this.handleRejectMinOwner}>
              <button>Reject Min Owner</button>
          </form>
        </div>
      );
    }
  }

  export default RejectMinOwnerComponent;