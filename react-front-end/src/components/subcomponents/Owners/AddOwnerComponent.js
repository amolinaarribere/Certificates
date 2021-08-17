import React from 'react';
const func = require("../../../Functions.js");

class AddOwnerComponent extends React.Component{
    state = {
      addOwner : ""
    };
    handleAddOwner = async (event) => {
        event.preventDefault();
      await func.AddOwner(this.state.addOwner, "", this.props.privateEnv)
      this.setState({ addOwner: "" })
    };
  
    render(){
      return(
        <div>
          <form onSubmit={this.handleAddOwner}>
              <input type="text" name="AddOwner" placeholder="address" 
                  value={this.state.addOwner}
                  onChange={event => this.setState({ addOwner: event.target.value })}/>
              <button>Add Owner</button>
          </form>
        </div>
      );
  }
  }

  export default AddOwnerComponent;