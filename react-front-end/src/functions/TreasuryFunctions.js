  // Treasury
const Contracts = require("./Contracts.js");
const Aux = require("./AuxiliaryFunctions.js");
const Manager = require("./ManagerFunctions.js");
const PriceConverter = require("./PriceConverter.js");

export var accountBalance = "";
export var TreasuryBalance = "";
export var TreasuryAggregatedBalance = "";

export var PublicPriceUSD = "";
export var PrivatePriceUSD = "";
export var CertificatePriceUSD = "";
export var ProviderPriceUSD = "";
export var OwnerRefundFeeUSD = "";

export var PublicPriceWei = "";
export var PrivatePriceWei = "";
export var CertificatePriceWei = "";
export var ProviderPriceWei = "";
export var OwnerRefundFeeWei = "";

export var PendingPublicPriceUSD = "";
export var PendingPrivatePriceUSD = "";
export var PendingCertificatePriceUSD = "";
export var PendingProviderPriceUSD = "";
export var PendingOwnerRefundFeeUSD = "";

  export async function RetrievePricesTreasury(){
    let response = await Contracts.Treasury.methods.retrievePrices().call();
    PublicPriceUSD = response[0];
    PrivatePriceUSD = response[1];
    ProviderPriceUSD = response[2];
    CertificatePriceUSD = response[3];
    OwnerRefundFeeUSD = response[4];
    
    PublicPriceWei = await PriceConverter.USDToEther(PublicPriceUSD);
    PrivatePriceWei = await PriceConverter.USDToEther(PrivatePriceUSD);
    ProviderPriceWei = await PriceConverter.USDToEther(ProviderPriceUSD);
    CertificatePriceWei = await PriceConverter.USDToEther(CertificatePriceUSD);
    OwnerRefundFeeWei = await PriceConverter.USDToEther(OwnerRefundFeeUSD);
  }

  export async function RetrievePendingPricesTreasury(){
    let response = await Contracts.Treasury.methods.retrieveProposition().call();
    PendingPublicPriceUSD = Number(response[0]);
    PendingPrivatePriceUSD = Number(response[1]);
    PendingProviderPriceUSD = Number(response[2]);
    PendingCertificatePriceUSD = Number(response[3]);
    PendingOwnerRefundFeeUSD = Number(response[4]);
  }
    

  export async function UpgradePricesTreasury(NewPublicPriceUSD, NewPrivatePriceUSD, NewProviderPriceUSD, NewCertificatePriceUSD, NewOwnerRefundFeeUSD){
    await Aux.CallBackFrame(Contracts.Treasury.methods.updatePrices(NewPublicPriceUSD, NewPrivatePriceUSD, NewProviderPriceUSD, NewCertificatePriceUSD, NewOwnerRefundFeeUSD).send({from: Aux.account }));
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