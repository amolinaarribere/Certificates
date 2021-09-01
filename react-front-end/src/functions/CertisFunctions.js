 // Certis Tokens
/*import Contracts from './Contracts.js';
import Aux from './AuxiliaryFunctions.js';*/
const Contracts = require("./Contracts.js");
const Aux = require("./AuxiliaryFunctions.js");

export var TokensTotalSupply = "";
export var TokensBalance = "";

 export async function totalSupply(){
    TokensTotalSupply = await Contracts.CertisToken.methods.totalSupply().call({from: Aux.account });
  }

  export async function balanceOf(address){
    TokensBalance = await Contracts.CertisToken.methods.balanceOf(address).call({from: Aux.account });
  }

  export async function transfer(address, amount){
    await Aux.CallBackFrame(Contracts.CertisToken.methods.transfer(address, amount).send({from: Aux.account }));
  }