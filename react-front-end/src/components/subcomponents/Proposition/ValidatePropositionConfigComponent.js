import React from 'react';
const func = require("../../../functions/PropositionFunctions.js");

class ValidatePropositionConfigComponent extends React.Component{

    handleValidatePropConfig = async (event) => {
      event.preventDefault();
      await func.VoteProposition(true, this.props.contractType);
    };
  
    render(){
      return(
        <div>
          <form onSubmit={this.handleValidatePropConfig}>
              <button>Validate Proposition Configuration</button>
          </form>
        </div>
      );
    }
  }

  export default ValidatePropositionConfigComponent;