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
      else if (this.props.contractType == 2){
        return(
          <div>
          <p class="text-warning"><b>Pending Proposition Life Time :</b> {func.PendingTreasuryPropositionLifeTime}</p>
          <p class="text-warning"><b>Pending Proposition Threshold Percentage :</b> {func.PendingTreasuryPropositionThresholdPercentage}</p>
          <p class="text-warning"><b>Pending Min Weight To Propose Percentage :</b> {func.PendingTreasuryMinWeightToProposePercentage}</p>
        </div>
        );
      }
      else if (this.props.contractType == 3){
        return(
          <div>
          <p class="text-warning"><b>Pending Proposition Life Time :</b> {func.PendingPCPropositionLifeTime}</p>
          <p class="text-warning"><b>Pending Proposition Threshold Percentage :</b> {func.PendingPCPropositionThresholdPercentage}</p>
          <p class="text-warning"><b>Pending Min Weight To Propose Percentage :</b> {func.PendingPCMinWeightToProposePercentage}</p>
        </div>
        );
      }
    }
    
  }

  export default ListPendingPropositionConfigComponent;