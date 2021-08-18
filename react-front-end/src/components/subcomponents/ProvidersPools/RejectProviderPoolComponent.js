import React from 'react';
const func = require("../../../Functions.js");

class RejectProviderPoolComponent extends React.Component{
    state = {
      rejectProviderPool : ""
    };
    handleRejectProviderPool = async (event) => {
        event.preventDefault();
      await func.RejectProviderPool(this.state.rejectProviderPool, this.props.contractType)
      this.setState({ rejectProviderPool: "" })
    };
  
    render(){
      var text = "Provider";
      if(this.props.contractType == 3) text = "Pool";
      return(
        <div>
          <form onSubmit={this.handleRejectProviderPool}>
              <input type="text" name="RejectProviderPool" placeholder="address" 
                  value={this.state.rejectProviderPool}
                  onChange={event => this.setState({ rejectProviderPool: event.target.value })}/>
              <button>Reject {text}</button>
          </form>
        </div>
      );
    }
  }

  export default RejectProviderPoolComponent;