import React from 'react';
const func = require("../../../Functions.js");

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
         else{
          return (
            <div>
               <p><b>Proposition Life Time :</b> {func.TreasuryPropositionLifeTime}</p>
               <p><b>Proposition Threshold Percentage :</b> {func.TreasuryPropositionThresholdPercentage}</p>
               <p><b>Min Weight To Propose Percentage :</b> {func.TreasuryMinWeightToProposePercentage}</p>
            </div>
          );
         }
         
       }
  }

export default ListPropositionConfigComponent;