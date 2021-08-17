import React from 'react';
const func = require("../../../Functions.js");

class RemoveOwnerComponent extends React.Component{
    state = {
      removeOwner : ""
    };
    handleRemoveOwner = async (event) => {
        event.preventDefault();
      await func.RemoveOwner(this.state.removeOwner, this.props.contractType)
      this.setState({ removeOwner: "" })
    };
  
    render(){
        return(
          <div>
            <form onSubmit={this.handleRemoveOwner}>
                <input type="text" name="RemoveOwner" placeholder="address" 
                    value={this.state.removeOwner}
                    onChange={event => this.setState({ removeOwner: event.target.value })}/>
                <button>Remove Owner</button>
            </form>
          </div>
        );
    }
  }

export default RemoveOwnerComponent;