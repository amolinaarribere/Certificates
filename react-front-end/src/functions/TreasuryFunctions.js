  // Treasury
const Contracts = require("./Contracts.js");
const Aux = require("./AuxiliaryFunctions.js");
const Manager = require("./ManagerFunctions.js");

export var accountBalance = "";
export var TreasuryBalance = "";
export var TreasuryAggregatedBalance = "";

export var PublicPriceWei = "";
export var PrivatePriceWei = "";
export var CertificatePriceWei = "";
export var ProviderPriceWei = "";
export var OwnerRefundFeeWei = "";

export var PendingPublicPriceWei = "";
export var PendingPrivatePriceWei = "";
export var PendingCertificatePriceWei = "";
export var PendingProviderPriceWei = "";
export var PendingOwnerRefundFeeWei = "";

  export async function RetrievePricesTreasury(){
    let response = await Contracts.Treasury.methods.retrievePrices().call();

    PublicPriceWei = response[0];
    PrivatePriceWei = response[1];
    ProviderPriceWei = response[2];
    CertificatePriceWei = response[3];
    OwnerRefundFeeWei = response[4];
  }

  export async function RetrievePendingPricesTreasury(){
    let response = await Contracts.Treasury.methods.retrieveProposition().call();
    PendingPublicPriceWei = Number(response[0]);
    PendingPrivatePriceWei = Number(response[1]);
    PendingProviderPriceWei = Number(response[2]);
    PendingCertificatePriceWei = Number(response[3]);
    PendingOwnerRefundFeeWei = Number(response[4]);
  }
    

  export async function UpgradePricesTreasury(NewPublicPriceWei, NewPrivatePriceWei, NewProviderPriceWei, NewCertificatePriceWei, NewOwnerRefundFeeWei){
    await Aux.CallBackFrame(Contracts.Treasury.methods.updatePrices(NewPublicPriceWei, NewPrivatePriceWei, NewProviderPriceWei, NewCertificatePriceWei, NewOwnerRefundFeeWei).send({from: Aux.account }));
  }

  export async function RetrieveBalance(address){
    accountBalance = await Contracts.Treasury.methods.retrieveBalance(address).call();
  }

  export async function RetrieveTreasuryBalance(){
    TreasuryBalance = await Aux.web3.eth.getBalance(Manager.TreasuryAddressProxy);
    TreasuryAggregatedBalance = await Contracts.Treasury.methods.retrieveAggregatedAmount().call();
  }

  export async function AssignDividends(){
    await Aux.CallBackFrame(Contracts.Treasury.methods.AssignDividends().send({from: Aux.account }));
  }

  export async function WithdrawAmount(amount){
    await Aux.CallBackFrame(Contracts.Treasury.methods.withdraw(amount).send({from: Aux.account }));
  }