import React from 'react';
import ListPropositionConfigComponent from './ListPropositionConfigComponent.js';
import UpgradePropositionConfigComponent from './UpgradePropositionConfigComponent.js';
import ListPendingPropositionConfigComponent from './ListPendingPropositionConfigComponent.js';
import ValidatePropositionConfigComponent from './ValidatePropositionConfigComponent.js';
import RejectPropositionConfigComponent from './RejectPropositionConfigComponent.js';
const func = require("../../../Functions.js");

class PropositionConfigComponent extends React.Component{
       render(){
         return (
           <div>
            <ListPropositionConfigComponent contractType={this.props.contractType}/>
            <br/>
            <UpgradePropositionConfigComponent contractType={this.props.contractType}/>
            <br/>
            <ListPendingPropositionConfigComponent contractType={this.props.contractType}/>
            <br />
            <ValidatePropositionConfigComponent contractType={this.props.contractType}/>
            <RejectPropositionConfigComponent contractType={this.props.contractType}/>
            <br/>
           </div>
         );
       }
  }

export default PropositionConfigComponent;