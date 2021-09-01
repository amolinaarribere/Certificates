import React from 'react';
const func = require("../../../functions/PropositionFunctions.js");

class ListPendingPropositionConfigComponent extends React.Component{
    render(){
      if (this.props.contractType == 1){
        return(
          <div>
            <p class="text-warning"><b>Pending Proposition Life Time :</b> {func.PendingManagerPropositionLifeTime}</p>
            <p class="text-warning"><b>Pending Proposition Threshold Percentage :</b> {func.PendingManagerPropositionThresholdPercentage}</p>
            <p class="text-warning"><b>Pending Min Weight To Propose Percentage :</b> {func.PendingManagerMinWeightToProposePercentage}</p>
          </div>
        );
      }
      else {
        return(
          <div>
          <p class="text-warning"><b>Pending Proposition Life Time :</b> {func.PendingTreasuryPropositionLifeTime}</p>
          <p class="text-warning"><b>Pending Proposition Threshold Percentage :</b> {func.PendingTreasuryPropositionThresholdPercentage}</p>
          <p class="text-warning"><b>Pending Min Weight To Propose Percentage :</b> {func.PendingTreasuryMinWeightToProposePercentage}</p>
        </div>
        );
      }
    }
    
  }

  export default ListPendingPropositionConfigComponent;