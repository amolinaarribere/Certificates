import React from 'react';
const func = require("../../../functions/FactoriesFunctions.js");

class CreatePoolIssuer extends React.Component {
    state = {
        minOwners : 0,
        listOfOwners : [],
        name : ""
      };
    
      handleNewPrivatePoolProvider = async (event) => {
          event.preventDefault();
        await func.CreatenewPoolProvider(this.state.minOwners, this.state.listOfOwners, this.state.name, this.props.contractType)
        this.setState({ minOwners: 0, listOfOwners: [], name : "" })
      };

    render(){
        var text = "Private Pool";
        if(this.props.contractType == 3)text = "Provider";
        return(
            <div>
                <form onSubmit={this.handleNewPrivatePoolProvider}>
                <input type="integer" name="minOwners" placeholder="min Owners" 
                    value={this.state.minOwners}
                    onChange={event => this.setState({ minOwners: event.target.value })}/>
                <input type="text" name="listOfOwners" placeholder="list Of Owners" 
                    value={this.state.listOfOwners}
                    onChange={event => this.setState({ listOfOwners: event.target.value.split(",") })}/>
                <input type="text" name="name" placeholder="Name" 
                    value={this.state.name}
                    onChange={event => this.setState({ name: event.target.value })}/>
                <button>Request New {text}</button>
                </form>
            </div>
        );
        
    }
}

export default CreatePoolIssuer;