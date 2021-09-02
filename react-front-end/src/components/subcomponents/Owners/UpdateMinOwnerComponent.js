import React from 'react';
const func = require("../../../functions/OwnerFunctions.js");

class UpdateMinOwnerComponent extends React.Component{
    state = {
      minOwner : ""
    };
    handleMinOwner = async (event) => {
        event.preventDefault();
      await func.UpdateMinOwner(this.state.minOwner, this.props.contractType)
      this.setState({ minOwner: "" })
    };
  
    render(){
      return(
        <div>
          <form onSubmit={this.handleMinOwner}>
              <input type="interger" name="MinOwner" placeholder="min owner" 
                  value={this.state.minOwner}
                  onChange={event => this.setState({ minOwner: event.target.value })}/>
              <button>Update Min Owner</button>
          </form>
        </div>
      );
    }
  }

  export default UpdateMinOwnerComponent;