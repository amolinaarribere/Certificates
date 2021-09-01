import React from 'react';
const func = require("../../../functions/OwnerFunctions.js");

class RejectOwnerComponent extends React.Component{
    state = {
      rejectOwner : ""
    };
    handleRejectOwner = async (event) => {
        event.preventDefault();
      await func.RejectOwner(this.state.rejectOwner, this.props.contractType)
      this.setState({ rejectOwner: "" })
    };
  
    render(){
      return(
        <div>
          <form onSubmit={this.handleRejectOwner}>
              <input type="text" name="RejectOwner" placeholder="address" 
                  value={this.state.rejectOwner}
                  onChange={event => this.setState({ rejectOwner: event.target.value })}/>
              <button>Reject Owner</button>
          </form>
        </div>
      );
    }
  }

  export default RejectOwnerComponent;