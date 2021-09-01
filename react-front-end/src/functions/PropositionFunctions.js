// Proposition
/*import Contracts from './Contracts.js';
import Aux from './AuxiliaryFunctions.js';*/
const Contracts = require("./Contracts.js");
const Aux = require("./AuxiliaryFunctions.js");


export var ManagerPropositionLifeTime = "";
export var ManagerPropositionThresholdPercentage = "";
export var ManagerMinWeightToProposePercentage = "";
export var TreasuryPropositionLifeTime = "";
export var TreasuryPropositionThresholdPercentage = "";
export var TreasuryMinWeightToProposePercentage = "";

export var PendingManagerPropositionLifeTime = "";
export var PendingManagerPropositionThresholdPercentage = "";
export var PendingManagerMinWeightToProposePercentage = "";
export var PendingTreasuryPropositionLifeTime = "";
export var PendingTreasuryPropositionThresholdPercentage = "";
export var PendingTreasuryMinWeightToProposePercentage = "";
export var PendingManagerProp = "";
export var PendingTreasuryProp = "";

export async function UpgradeProposition(NewPropositionLifeTime, NewPropositionThresholdPercentage, NewMinWeightToProposePercentage, contractType){
    if(contractType == 1){
      await Aux.CallBackFrame(Contracts.certificatePoolManager.methods.updateProp({NewPropositionLifeTime, NewPropositionThresholdPercentage, NewMinWeightToProposePercentage}).send({from: Aux.account }));
    }
    else{
      await Aux.CallBackFrame(Contracts.Treasury.methods.updateProp({NewPropositionLifeTime, NewPropositionThresholdPercentage, NewMinWeightToProposePercentage}).send({from: Aux.account }));
    }
  }
  
  export async function VoteProposition(Vote, contractType){
    if(contractType == 1){
      await Aux.CallBackFrame(Contracts.certificatePoolManager.methods.voteProposition(Vote).send({from: Aux.account }));
    }
    else{
      await Aux.CallBackFrame(Contracts.Treasury.methods.voteProposition(Vote).send({from: Aux.account }));
    }
  }
  
  export async function RetrievePendingProposition(contractType){
    if(contractType == 1){
      let response = await Contracts.certificatePoolManager.methods.retrievePendingPropConfig().call();
      PendingManagerPropositionLifeTime = response[0];
      PendingManagerPropositionThresholdPercentage = response[1];
      PendingManagerMinWeightToProposePercentage = response[2];
      PendingManagerProp = response[3];
    }
    else{
      let response = await Contracts.Treasury.methods.retrievePendingPropConfig().call();
      PendingTreasuryPropositionLifeTime = response[0];
      PendingTreasuryPropositionThresholdPercentage = response[1];
      PendingTreasuryMinWeightToProposePercentage = response[2];
      PendingTreasuryProp = response[3];
    }
  }
  
  export async function RetrieveProposition(contractType){
    if(contractType == 1){
      let response = await Contracts.certificatePoolManager.methods.retrievePropConfig().call();
      ManagerPropositionLifeTime = response[0];
      ManagerPropositionThresholdPercentage = response[1];
      ManagerMinWeightToProposePercentage = response[2];
    }
    else{
      let response = await Contracts.Treasury.methods.retrievePropConfig().call();
      TreasuryPropositionLifeTime = response[0];
      TreasuryPropositionThresholdPercentage = response[1];
      TreasuryMinWeightToProposePercentage = response[2];
    }
  }