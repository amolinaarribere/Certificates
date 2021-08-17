import React from 'react';
const func = require("../../../Functions.js");

class RemoveProviderComponent extends React.Component{
    state = {
      removeProvider : ""
    };
    handleRemoveProvider = async (event) => {
        event.preventDefault();
      await func.RemoveProvider(this.state.removeProvider, this.props.privateEnv)
      this.setState({ removeProvider: "" })
    };
  
    render(){
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
  }

export default RemoveProviderComponent;