import React from 'react';
const func = require("../../../functions/PropositionFunctions.js");

class RejectPropositionConfigComponent extends React.Component{

    handleRejectPropConfig = async (event) => {
      event.preventDefault();
      await func.VoteProposition(false, this.props.contractType);
    };
  
    render(){
      return(
        <div>
          <form onSubmit={this.handleRejectPropConfig}>
              <button>Reject Proposition Configuration</button>
          </form>
        </div>
      );
    }
  }

  export default RejectPropositionConfigComponent;