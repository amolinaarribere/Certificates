import React from 'react';
const func = require("../../../Functions.js");

class PropositionConfigComponent extends React.Component{
    state = {
        NewPropositionLifeTime: "",
        NewPropositionThresholdPercentage: "",
        NewMinWeightToProposePercentage: ""
       };
       handleUpgradeProp = async (event) => {
         event.preventDefault();
         var NPLT = 0;
         var NPTP = 0;
         var NMWP = 0;
   
         if(this.state.NewPropositionLifeTime != "") NPLT = this.state.NewPropositionLifeTime;
         if(this.state.NewPropositionThresholdPercentage != "") NPTP = this.state.NewPropositionThresholdPercentage;
         if(this.state.NewMinWeightToProposePercentage != "") NMWP = this.state.NewMinWeightToProposePercentage;
   
         await func.UpgradeProposition(NPLT, NPTP, NMWP, this.props.contractType);
   
         this.setState({ NewPropositionLifeTime: "",
         NewPropositionThresholdPercentage: "",
         NewMinWeightToProposePercentage: ""})
       };
     
       render(){
         return (
           <div>
             <form onSubmit={this.handleUpgradeProp}>
               <p>
                 <input type="integer" name="NewPropositionLifeTime" placeholder="NewPropositionLifeTime" 
                     value={this.state.NewPropositionLifeTime}
                     onChange={event => this.setState({ NewPropositionLifeTime: event.target.value })}/>
               </p>
               <p>
                 <input type="integer" name="NewPropositionThresholdPercentage" placeholder="NewPropositionThresholdPercentage" 
                     value={this.state.NewPropositionThresholdPercentage}
                     onChange={event => this.setState({ NewPropositionThresholdPercentage: event.target.value })}/>
               </p>
               <p>
                 <input type="integer" name="NewMinWeightToProposePercentage" placeholder="NewMinWeightToProposePercentage" 
                     value={this.state.NewMinWeightToProposePercentage}
                     onChange={event => this.setState({ NewMinWeightToProposePercentage: event.target.value })}/>
               </p>
                 <button>Upgrade Proposition Configuration</button>
             </form>
             <br/>
           </div>
         );
       }
  }

export default PropositionConfigComponent;