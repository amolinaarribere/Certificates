import React from 'react';
const func = require("../../../Functions.js");

class AddProviderPoolComponent extends React.Component{
    state = {
      addProviderPool : "",
      addProviderPoolInfo : ""
    };

    handleAddProvider = async (event) => {
        event.preventDefault();
      await func.AddProviderPool(this.state.addProviderPool, this.state.addProviderPoolInfo, this.props.contractType)
      this.setState({ addProviderPoolInfo: "" })
      this.setState({ addProviderPool: "" })
    };
  
    render(){
      if(this.props.contractType != 1){
        var text = "Add Provider";
        if (this.props.contractType == 3)text = "Add Pool";
        return(
          <div>
            <form onSubmit={this.handleAddProvider}>
              <input type="text" name="addProvider" placeholder="address" 
                  value={this.state.addProviderPool}
                  onChange={event => this.setState({ addProviderPool: event.target.value })}/>
              <input type="text" name="addProviderInfo" placeholder="Info" 
                  value={this.state.addProviderPoolInfo}
                  onChange={event => this.setState({ addProviderPoolInfo: event.target.value })}/>
              <button>{text}</button>
          </form>
          </div>
        );
      }
      else{
        return(
          <div></div>
        );
      }
    }
  }

export default AddProviderPoolComponent;