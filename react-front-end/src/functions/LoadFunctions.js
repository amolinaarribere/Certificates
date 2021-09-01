import { CERTIFICATE_POOL_MANAGER_ABI, CERTIFICATE_POOL_MANAGER_ADDRESS, PUBLIC_ABI, PRIVATEFACTORY_ABI, PROVIDERFACTORY_ABI, TREASURY_ABI, CERTIS_ABI, PRICECONVERTER_ABI } from '../config'

const ProviderPoolFunc = require("./ProviderPoolFunctions.js");
const OwnersFunc = require("./OwnerFunctions.js");
const FactoriesFunc = require("./FactoriesFunctions.js");
const TreasuryFunc = require("./TreasuryFunctions.js");
const PropositionFunc = require("./PropositionFunctions.js");
const CertisFunc = require("./CertisFunctions.js");
const Contracts = require("./Contracts.js");
const ManagerFunc = require("./ManagerFunctions.js");
const Aux = require("./AuxiliaryFunctions.js");

export var chairPerson = ""
export var balance = ""


export async function LoadBlockchain() {
  Aux.LoadWeb3();
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  Aux.setAccount(accounts[0]);

  ProviderPoolFunc.ReadKeys();

  Contracts.setCertificatePoolManager(await new Aux.web3.eth.Contract(CERTIFICATE_POOL_MANAGER_ABI, CERTIFICATE_POOL_MANAGER_ADDRESS))
  await ManagerFunc.RetrieveContractsAddresses();
  await ManagerFunc.RetrievePendingContractsAddresses();
  
  Contracts.setPublicPool(await new Aux.web3.eth.Contract(PUBLIC_ABI, ManagerFunc.publicPoolAddressProxy))
  Contracts.setPrivatePoolFactory(await new Aux.web3.eth.Contract(PRIVATEFACTORY_ABI, ManagerFunc.privatePoolFactoryAddressProxy))
  Contracts.setProviderFactory(await new Aux.web3.eth.Contract(PROVIDERFACTORY_ABI, ManagerFunc.providerFactoryAddressProxy))
  Contracts.setTreasury(await new Aux.web3.eth.Contract(TREASURY_ABI, ManagerFunc.TreasuryAddressProxy))
  Contracts.setCertisToken(await new Aux.web3.eth.Contract(CERTIS_ABI, ManagerFunc.CertisTokenAddressProxy))
  Contracts.setPriceConverter(await new Aux.web3.eth.Contract(PRICECONVERTER_ABI, ManagerFunc.PriceConverterAddressProxy))

  await ProviderPoolFunc.RetrieveProviderPool(1);
  await OwnersFunc.RetrieveOwners(1);
  await FactoriesFunc.RetrieveFactories();
  await TreasuryFunc.RetrievePricesTreasury();
  await TreasuryFunc.RetrievePendingPricesTreasury();
  await PropositionFunc.RetrieveProposition(1);
  await PropositionFunc.RetrieveProposition(2);
  await PropositionFunc.RetrievePendingProposition(1);
  await PropositionFunc.RetrievePendingProposition(2);
  await CertisFunc.totalSupply();
  await CertisFunc.balanceOf(Aux.account);
  await TreasuryFunc.RetrieveBalance(Aux.account);
  await TreasuryFunc.RetrieveTreasuryBalance();
}



/*
export async function DisconnectBlockchain() {
  web3 = ""
  certificatePoolManager = ""
  Aux.account = "";
  publicPoolAddress = ""
  chairPerson = ""
  balance = ""

  publicPool = ""
  publicTotalProviders = ""
  publicProviders = []
  publicTotalOwners = ""
  publicMinOwners = ""
  publicOwners = []

  privatePoolAddresses = []
  privatePoolAddress = ""
  privatePool = ""
  privateTotalProviders = ""
  privateProviders = []
  privateMinOwners = ""
  privateTotalOwners = ""
  privateOwners = ""
  sessionStorage.removeItem(privatePoolKey);

  certificatesByHolder = []
  currentHolder = ""
  certificateProvider = ""

  pendingPublicOwnersAdd = []
  pendingPublicOwnersRemove = []
  pendingPrivateOwnersAdd = [] 
  pendingPrivateOwnersRemove = []
  pendingPublicProvidersAdd = [] 
  pendingPublicProvidersRemove = []
  pendingPrivateProvidersAdd = [] 
  pendingPrivateProvidersRemove = []
}
*/


  