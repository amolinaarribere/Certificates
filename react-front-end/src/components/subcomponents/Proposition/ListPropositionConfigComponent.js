import React from 'react';
const func = require("../../../functions/PropositionFunctions.js");

class ListPropositionConfigComponent extends React.Component{
       render(){
         if(this.props.contractType == 1){
          return (
            <div>
               <p><b>Proposition Life Time :</b> {func.ManagerPropositionLifeTime}</p>
               <p><b>Proposition Threshold Percentage :</b> {func.ManagerPropositionThresholdPercentage}</p>
               <p><b>Min Weight To Propose Percentage :</b> {func.ManagerMinWeightToProposePercentage}</p>
            </div>
          );
         }
         else if (this.props.contractType == 2){
          return (
            <div>
               <p><b>Proposition Life Time :</b> {func.TreasuryPropositionLifeTime}</p>
               <p><b>Proposition Threshold Percentage :</b> {func.TreasuryPropositionThresholdPercentage}</p>
               <p><b>Min Weight To Propose Percentage :</b> {func.TreasuryMinWeightToProposePercentage}</p>
            </div>
          );
         }
         else if (this.props.contractType == 3){
          return (
            <div>
               <p><b>Proposition Life Time :</b> {func.PCPropositionLifeTime}</p>
               <p><b>Proposition Threshold Percentage :</b> {func.PCPropositionThresholdPercentage}</p>
               <p><b>Min Weight To Propose Percentage :</b> {func.PCMinWeightToProposePercentage}</p>
            </div>
          );
         }
       }
  }

export default ListPropositionConfigComponent;