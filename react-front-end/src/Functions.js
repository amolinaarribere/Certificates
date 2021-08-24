import { CERTIFICATE_POOL_MANAGER_ABI, CERTIFICATE_POOL_MANAGER_ADDRESS, PUBLIC_ABI, PRIVATEFACTORY_ABI, PROVIDERFACTORY_ABI, TREASURY_ABI, CERTIS_ABI, PRIVATE_ABI, PROVIDER_ABI } from './config'
import Web3 from 'web3';

export var web3 = "";
var certificatePoolManager = "";
var publicPool = "";
var privatePoolFactory = "";
var providerFactory = "";
var Treasury = "";
var CertisToken = "";
var privatePool = "";
var provider = "";
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

export const privatePoolKey = 'privatePool';
export const providerKey = 'provider';

export var publicPoolAddress = ""
export var publicPoolAddressProxy = ""
export var privatePoolFactoryAddress = ""
export var privatePoolFactoryAddressProxy = ""
export var privatePoolImplAddress = "";
export var privatePoolAddresses = []
export var privatePoolAddress = sessionStorage.getItem(privatePoolKey);
export var providerFactoryAddress = ""
export var providerFactoryAddressProxy = ""
export var providerImplAddress = "";
export var providerAddresses = []
export var providerAddress = sessionStorage.getItem(providerKey);
export var TreasuryAddress = ""
export var TreasuryAddressProxy = ""
export var CertisTokenAddress = ""
export var CertisTokenAddressProxy = ""

export var PendingPublicPoolAddress = ""
export var PendingPrivatePoolFactoryAddress = ""
export var PendingPrivatePoolImplAddress = "";
export var PendingProviderFactoryAddress = ""
export var PendingProviderImplAddress = "";
export var PendingTreasuryAddress = ""
export var PendingCertisTokenAddress = ""

export var chairPerson = ""
export var balance = ""
export var publicTotalProviders = ""
export var publicProviders = []
export var publicMinOwners = ""
export var publicPendingMinOwners = ""
export var publicTotalOwners = ""
export var publicOwners = []
export var privateTotalProviders = ""
export var privateProviders = []
export var privateMinOwners = ""
export var privatePendingMinOwners = ""
export var privateTotalOwners = ""
export var privateOwners = []
export var providerTotalPools = ""
export var providerPools = []
export var providerMinOwners = ""
export var providerPendingMinOwners = ""
export var providerTotalOwners = ""
export var providerOwners = []
export var account = ""

export var certificatesByHolder = []
export var currentHolder = "";
export var certificateProvider = ""

export var pendingPublicOwnersAdd = []
export var pendingPublicOwnersRemove = []
export var pendingPrivateOwnersAdd = [] 
export var pendingPrivateOwnersRemove = []
export var pendingProviderOwnersAdd = []
export var pendingProviderOwnersRemove = []
export var pendingPublicProvidersAdd = [] 
export var pendingPublicProvidersRemove = []
export var pendingPrivateProvidersAdd = [] 
export var pendingPrivateProvidersRemove = []
export var pendingProviderPoolsAdd = [] 
export var pendingProviderPoolsRemove = []
export var pendingCertificates = []

export var AccountBalance = "";
export var TreasuryBalance = "";
export var TreasuryAggregatedBalance = "";

export var TokensTotalSupply = "";
export var TokensBalance = "";

async function RetrievePendings(callback){
  let{0:addr,1:info} = await callback;
  var output = [];

  for (let i = 0; i < addr.length; i++) {
    output[i] = [addr[i], info[i]]
  }

  return output;
}

export async function LoadBlockchain() {
  if(window.ethereum) {
    await window.ethereum.enable();
  }
  web3 = new Web3(window.ethereum)
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  account = accounts[0];

  certificatePoolManager = await new web3.eth.Contract(CERTIFICATE_POOL_MANAGER_ABI, CERTIFICATE_POOL_MANAGER_ADDRESS)
  await RetrieveContractsAddresses();
  await RetrievePendingContractsAddresses();
  
  publicPool = await new web3.eth.Contract(PUBLIC_ABI, publicPoolAddressProxy)
  privatePoolFactory = await new web3.eth.Contract(PRIVATEFACTORY_ABI, privatePoolFactoryAddressProxy)
  providerFactory = await new web3.eth.Contract(PROVIDERFACTORY_ABI, providerFactoryAddressProxy)
  Treasury = await new web3.eth.Contract(TREASURY_ABI, TreasuryAddressProxy)
  CertisToken = await new web3.eth.Contract(CERTIS_ABI, CertisTokenAddressProxy)

  await RetrieveProviderPool(1);
  await RetrieveOwners(1);
  await RetrieveFactories();
  await RetrievePricesTreasury();
  await RetrievePendingPricesTreasury();
  await RetrieveProposition(1);
  await RetrieveProposition(2);
  await RetrievePendingProposition(1);
  await RetrievePendingProposition(2);
  await totalSupply();
  await balanceOf(account);
  await RetrieveBalance(account);
  await RetrieveTreasuryBalance();
}

export function SwitchContext(){
  currentHolder = "";
  certificatesByHolder = []
  certificateProvider = ""
}
/*
export async function DisconnectBlockchain() {
  web3 = ""
  certificatePoolManager = ""
  account = "";
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
async function CallBackFrame(callback){
  try{
    await callback;
   }
   catch(e) { window.alert(e); }
}
// Manager
export async function RetrieveContractsAddresses(){
  publicPoolAddressProxy = await certificatePoolManager.methods.retrievePublicCertificatePoolProxy().call();
  privatePoolFactoryAddressProxy = await certificatePoolManager.methods.retrievePrivatePoolFactoryProxy().call();
  providerFactoryAddressProxy = await certificatePoolManager.methods.retrieveProviderFactoryProxy().call();
  TreasuryAddressProxy = await certificatePoolManager.methods.retrieveTreasuryProxy().call();
  CertisTokenAddressProxy = await certificatePoolManager.methods.retrieveCertisTokenProxy().call();

  publicPoolAddress = await certificatePoolManager.methods.retrievePublicCertificatePool().call();
  privatePoolFactoryAddress = await certificatePoolManager.methods.retrievePrivatePoolFactory().call();
  privatePoolImplAddress = await certificatePoolManager.methods.retrievePrivatePool().call();
  providerFactoryAddress = await certificatePoolManager.methods.retrieveProviderFactory().call();
  providerImplAddress = await certificatePoolManager.methods.retrieveProvider().call();
  TreasuryAddress = await certificatePoolManager.methods.retrieveTreasury().call();
  CertisTokenAddress = await certificatePoolManager.methods.retrieveCertisToken().call();
}

export async function UpgradeContracts(NewPublicPoolAddress, NewTreasuryAddress, NewCertisTokenAddress, NewPrivatePoolFactoryAddress, NewPrivatePoolAddress, NewProviderFactoryAddress, NewProviderAddress){
  await CallBackFrame(certificatePoolManager.methods.upgradeContracts({
              "NewPublicPoolAddress": NewPublicPoolAddress,
              "NewTreasuryAddress": NewTreasuryAddress,
              "NewCertisTokenAddress": NewCertisTokenAddress,
              "NewPrivatePoolFactoryAddress": NewPrivatePoolFactoryAddress,
              "NewPrivatePoolAddress": NewPrivatePoolAddress,
              "NewProviderFactoryAddress": NewProviderFactoryAddress,
              "NewProviderAddress": NewProviderAddress,
              "NewPublicPoolData": "0x",
              "NewTreasuryData":  "0x",
              "NewCertisTokenData": "0x",
              "NewPrivatePoolFactoryData": "0x",
              "NewProviderFactoryData":  "0x"
          }).send({from: account}));

}

export async function RetrievePendingContractsAddresses(){
  [PendingPublicPoolAddress,
    PendingTreasuryAddress,
    PendingCertisTokenAddress,
    PendingPrivatePoolFactoryAddress,
    PendingPrivatePoolImplAddress,
    PendingProviderFactoryAddress,
    PendingProviderImplAddress] = await certificatePoolManager.methods.retrieveProposition().call({from: account});
}

// Proposition
export async function UpgradeProposition(NewPropositionLifeTime, NewPropositionThresholdPercentage, NewMinWeightToProposePercentage, contractType){
  if(contractType == 1){
    await CallBackFrame(certificatePoolManager.methods.updateProp({NewPropositionLifeTime, NewPropositionThresholdPercentage, NewMinWeightToProposePercentage}).send({from: account}));
  }
  else{
    await CallBackFrame(Treasury.methods.updateProp({NewPropositionLifeTime, NewPropositionThresholdPercentage, NewMinWeightToProposePercentage}).send({from: account}));
  }
}

export async function VoteProposition(Vote, contractType){
  if(contractType == 1){
    await CallBackFrame(certificatePoolManager.methods.voteProposition(Vote).send({from: account}));
  }
  else{
    await CallBackFrame(Treasury.methods.voteProposition(Vote).send({from: account}));
  }
}

export async function RetrievePendingProposition(contractType){
  if(contractType == 1){
    let response = await certificatePoolManager.methods.retrievePendingPropConfig().call();
    PendingManagerPropositionLifeTime = response[0];
    PendingManagerPropositionThresholdPercentage = response[1];
    PendingManagerMinWeightToProposePercentage = response[2];
    PendingManagerProp = response[3];
  }
  else{
    let response = await Treasury.methods.retrievePendingPropConfig().call();
    PendingTreasuryPropositionLifeTime = response[0];
    PendingTreasuryPropositionThresholdPercentage = response[1];
    PendingTreasuryMinWeightToProposePercentage = response[2];
    PendingTreasuryProp = response[3];
  }
}

export async function RetrieveProposition(contractType){
  if(contractType == 1){
    let response = await certificatePoolManager.methods.retrievePropConfig().call();
    ManagerPropositionLifeTime = response[0];
    ManagerPropositionThresholdPercentage = response[1];
    ManagerMinWeightToProposePercentage = response[2];
  }
  else{
    let response = await Treasury.methods.retrievePropConfig().call();
    TreasuryPropositionLifeTime = response[0];
    TreasuryPropositionThresholdPercentage = response[1];
    TreasuryMinWeightToProposePercentage = response[2];
  }
}

// Provider - Pool
  export async function CreatenewPoolProvider(min, list, name, contractType){
    if(2 == contractType) await CallBackFrame(privatePoolFactory.methods.create(list, min, name).send({from: account, value: PrivatePriceWei}));
    else await CallBackFrame(providerFactory.methods.create(list, min, name).send({from: account, value: ProviderPriceWei}));
  }

  export async function AddProviderPool(address, Info, subsprice, certprice, contractType){
    if(1 == contractType)await CallBackFrame(publicPool.methods.addProvider(address, Info).send({from: account, value: PublicPriceWei}));
    else if(2 == contractType)await CallBackFrame(privatePool.methods.addProvider(address, Info).send({from: account}));
    else await CallBackFrame(provider.methods.addPool(address, Info, certprice, subsprice).send({from: account}));
  }
  
  export async function RemoveProviderPool(address, contractType){
    if(1 == contractType) await CallBackFrame(publicPool.methods.removeProvider(address).send({from: account}));
    else if(2 == contractType) await CallBackFrame(privatePool.methods.removeProvider(address).send({from: account}));
    else await CallBackFrame(provider.methods.removePool(address).send({from: account}));
  }

  export async function ValidateProviderPool(address, contractType){
    if(1 == contractType)await CallBackFrame(publicPool.methods.validateProvider(address).send({from: account}));
    else if(2 == contractType)await CallBackFrame(privatePool.methods.validateProvider(address).send({from: account}));
    else await CallBackFrame(provider.methods.validatePool(address).send({from: account}));
  }
  
  export async function RejectProviderPool(address, contractType){
    if(1 == contractType)await CallBackFrame(publicPool.methods.rejectProvider(address).send({from: account}));
    else if(2 == contractType)await CallBackFrame(privatePool.methods.rejectProvider(address).send({from: account}));
    else await CallBackFrame(provider.methods.rejectPool(address).send({from: account}));
  }

  export async function RetrieveProviderPool(contractType){
    if(1 == contractType){
      let publicProvidersAddresses = await publicPool.methods.retrieveAllProviders().call()
      publicTotalProviders = publicProvidersAddresses.length
      publicProviders = []

      for (let i = 0; i < publicTotalProviders; i++) {
        let {0:publicProviderInfo,1:isProvider} = await publicPool.methods.retrieveProvider(Bytes32ToAddress(publicProvidersAddresses[i])).call()
        publicProviders[i] = [publicProvidersAddresses[i], publicProviderInfo]
      }

      pendingPublicProvidersAdd = await RetrievePendings(publicPool.methods.retrievePendingProviders(true).call());
      pendingPublicProvidersRemove = await RetrievePendings(publicPool.methods.retrievePendingProviders(false).call());
    }
    else if(2 == contractType){
      let privateProvidersAddresses = await privatePool.methods.retrieveAllProviders().call()
      privateTotalProviders = privateProvidersAddresses.length
      privateProviders = []
    
      for (let i = 0; i < privateTotalProviders; i++) {
        let {0:privateProviderInfo,1:isProvider} = await privatePool.methods.retrieveProvider(Bytes32ToAddress(privateProvidersAddresses[i])).call()
        privateProviders[i] = [privateProvidersAddresses[i], privateProviderInfo]
      }

      pendingPrivateProvidersAdd = await RetrievePendings(privatePool.methods.retrievePendingProviders(true).call());
      pendingPrivateProvidersRemove = await RetrievePendings(privatePool.methods.retrievePendingProviders(false).call());
    }
    else{
      let providerPoolsAddresses = await provider.methods.retrieveAllPools().call()
      providerTotalPools = providerPoolsAddresses.length
      providerPools = []
    
      for (let i = 0; i < providerTotalPools; i++) {
        let {0:providerPoolInfo,1:isPool} = await provider.methods.retrievePools(Bytes32ToAddress(providerPoolsAddresses[i])).call()
        providerPools[i] = [providerPoolsAddresses[i], providerPoolInfo]
      }
    
      pendingProviderPoolsAdd = await RetrievePendings(provider.methods.retrievePendingPools(true).call());
      pendingProviderPoolsRemove = await RetrievePendings(provider.methods.retrievePendingPools(false).call());
    }
  }

  export async function SelectProviderPool(address, contractType){
    try{
      if(2 == contractType){
        privatePoolAddress = address
        privatePool = new web3.eth.Contract(PRIVATE_ABI, address)

        RetrieveProviderPool(2);
        RetrieveOwners(2);
      }
      else{
        providerAddress = address
        provider = new web3.eth.Contract(PROVIDER_ABI, address)
        
        RetrieveProviderPool(3);
        RetrieveOwners(3);
        RetrievePendingCertificates();
      }
      

    }
    catch(e) { window.alert(e); }
  }
  
// Owner
  export async function AddOwner(address, info, contractType){
    if(1 == contractType) await CallBackFrame(publicPool.methods.addOwner(address, info).send({from: account}));
    else if(2 == contractType) await CallBackFrame(privatePool.methods.addOwner(address, info).send({from: account}));
    else await CallBackFrame(provider.methods.addOwner(address, info).send({from: account}));
  }
  
  export async function RemoveOwner(address, contractType){
    if(1 == contractType) await CallBackFrame(publicPool.methods.removeOwner(address).send({from: account}));
    else if(2 == contractType) await CallBackFrame(privatePool.methods.removeOwner(address).send({from: account}));
    else await CallBackFrame(provider.methods.removeOwner(address).send({from: account}));

  }

  export async function ValidateOwner(address, contractType){
    if(1 == contractType)await CallBackFrame(publicPool.methods.validateOwner(address).send({from: account}));
    else if(2 == contractType)await CallBackFrame(privatePool.methods.validateOwner(address).send({from: account}));
    else await CallBackFrame(provider.methods.validateOwner(address).send({from: account}));
  }

  export async function RejectOwner(address, contractType){
    if(1 == contractType)await CallBackFrame(publicPool.methods.rejectOwner(address).send({from: account}));
    else if(2 == contractType)await CallBackFrame(privatePool.methods.rejectOwner(address).send({from: account}));
    else await CallBackFrame(provider.methods.rejectOwner(address).send({from: account}));
  }

  export async function RetrieveOwners(contractType){
    if(1 == contractType){
      publicMinOwners = await publicPool.methods.retrieveMinOwners().call()
      publicOwners = await publicPool.methods.retrieveAllOwners().call()
      publicTotalOwners = privateOwners.length

      pendingPublicOwnersAdd = await RetrievePendings(publicPool.methods.retrievePendingOwners(true).call());
      pendingPublicOwnersRemove = await RetrievePendings(publicPool.methods.retrievePendingOwners(false).call());
      publicPendingMinOwners = await publicPool.methods.retrievePendingMinOwners().call();
    }
    else if(2 == contractType){
      privateMinOwners = await privatePool.methods.retrieveMinOwners().call()
      privateOwners = await privatePool.methods.retrieveAllOwners().call()
      privateTotalOwners = privateOwners.length

      pendingPrivateOwnersAdd = await RetrievePendings(privatePool.methods.retrievePendingOwners(true).call());
      pendingPrivateOwnersRemove = await RetrievePendings(privatePool.methods.retrievePendingOwners(false).call());
      privatePendingMinOwners = await privatePool.methods.retrievePendingMinOwners().call();
    }
    else{
      providerMinOwners = await provider.methods.retrieveMinOwners().call()
      providerOwners = await provider.methods.retrieveAllOwners().call()
      providerTotalOwners = providerOwners.length

      pendingProviderOwnersAdd = await RetrievePendings(provider.methods.retrievePendingOwners(true).call());
      pendingProviderOwnersRemove = await RetrievePendings(provider.methods.retrievePendingOwners(false).call());
      providerPendingMinOwners = await provider.methods.retrievePendingMinOwners().call();
    }
  }

  export async function UpdateMinOwner(minOwner, contractType){
    if(1 == contractType) await CallBackFrame(publicPool.methods.changeMinOwners(minOwner).send({from: account}));
    else if(2 == contractType) await CallBackFrame(privatePool.methods.changeMinOwners(minOwner).send({from: account}));
    else await CallBackFrame(provider.methods.changeMinOwners(minOwner).send({from: account}));
  }

  export async function ValidateMinOwner(contractType){
    if(1 == contractType)await CallBackFrame(publicPool.methods.validateMinOwners().send({from: account}));
    else if(2 == contractType)await CallBackFrame(privatePool.methods.validateMinOwners().send({from: account}));
    else await CallBackFrame(provider.methods.validateMinOwners().send({from: account}));
  }

  export async function RejectMinOwner(contractType){
    if(1 == contractType)await CallBackFrame(publicPool.methods.rejectMinOwners().send({from: account}));
    else if(2 == contractType)await CallBackFrame(privatePool.methods.rejectMinOwners().send({from: account}));
    else await CallBackFrame(provider.methods.rejectMinOwners().send({from: account}));
  }


// Certificate

  export async function AddCertificate(hash, holder, isPrivate, contractType, pool){
    if(3 != contractType){
      if(true == isPrivate) await CallBackFrame(privatePool.methods.addCertificate(hash, holder).send({from: account}));
      else await CallBackFrame(publicPool.methods.addCertificate(hash, holder).send({from: account, value: CertificatePriceWei}));
    }
    else{
      await CallBackFrame(provider.methods.addCertificate(pool, hash, holder).send({from: account}));
    }
    
  }

  export async function ValidateCertificate(pool, hash, holder){
    await CallBackFrame(provider.methods.validateCertificate(pool, hash, holder).send({from: account}));
  }

  export async function RejectCertificate(pool, hash, holder){
    await CallBackFrame(provider.methods.rejectCertificate(pool, hash, holder).send({from: account}));
  }

  export async function RetrievePendingCertificates(){
    let pendingCerts = await provider.methods.retrievePendingCertificates().call({from: account});

    for (let i = 0; i < pendingCerts; i++) {
      pendingCertificates[i] = [pendingCerts[i][0], pendingCerts[i][1], pendingCerts[i][3]]
    }
  }

  export async function CheckCertificate(hash, address, isPrivate){
    try{
      if(true == isPrivate) certificateProvider = await privatePool.methods.retrieveCertificateProvider(hash, address).call({from: account});
      else certificateProvider = await publicPool.methods.retrieveCertificateProvider(hash, address).call({from: account});
      if (certificateProvider == "0x0000000000000000000000000000000000000000")certificateProvider = "Certificate Does not Belong to Holder " + address
      else certificateProvider = "Certificate Provided by " + certificateProvider + " to " + address
    }
    catch(e) { window.alert(e); }
  }

  export async function retrieveCertificatesByHolder(address, init, max, isPrivate){
    try{
      certificatesByHolder = []
      currentHolder = address;
      if(true == isPrivate) {
        certificatesByHolder = await privatePool.methods.retrieveCertificatesByHolder(address, init, max).call({from: account});
      }
      else{
        certificatesByHolder = await publicPool.methods.retrieveCertificatesByHolder(address, init, max).call({from: account});
      }
    }
    catch(e) { window.alert("here " + e); }
    
  }

  // Treasury

  export async function RetrievePricesTreasury(){
    let response = await Treasury.methods.retrievePrices().call();

    PublicPriceWei = response[0];
    PrivatePriceWei = response[1];
    ProviderPriceWei = response[2];
    CertificatePriceWei = response[3];
    OwnerRefundFeeWei = response[4];
  }

  export async function RetrievePendingPricesTreasury(){
    let response = await Treasury.methods.retrieveProposition().call();
    PendingPublicPriceWei = Number(response[0]);
    PendingPrivatePriceWei = Number(response[1]);
    PendingProviderPriceWei = Number(response[2]);
    PendingCertificatePriceWei = Number(response[3]);
    PendingOwnerRefundFeeWei = Number(response[4]);
  }
    

  export async function UpgradePricesTreasury(NewPublicPriceWei, NewPrivatePriceWei, NewProviderPriceWei, NewCertificatePriceWei, NewOwnerRefundFeeWei){
    await CallBackFrame(Treasury.methods.updatePrices(NewPublicPriceWei, NewPrivatePriceWei, NewProviderPriceWei, NewCertificatePriceWei, NewOwnerRefundFeeWei).send({from: account}));
  }

  export async function RetrieveBalance(address){
    AccountBalance = await Treasury.methods.retrieveBalance(address).call();
  }

  export async function RetrieveTreasuryBalance(){
    TreasuryBalance = await web3.eth.getBalance(TreasuryAddressProxy);
    TreasuryAggregatedBalance = await Treasury.methods.retrieveAggregatedAmount().call();
  }

  export async function AssignDividends(){
    await CallBackFrame(Treasury.methods.AssignDividends().send({from: account}));
  }

  export async function WithdrawAmount(amount){
    await CallBackFrame(Treasury.methods.withdraw(amount).send({from: account}));
  }

  // Certis Tokens

  export async function totalSupply(){
    TokensTotalSupply = await CertisToken.methods.totalSupply().call({from: account});
  }

  export async function balanceOf(address){
    TokensBalance = await CertisToken.methods.balanceOf(address).call({from: account});
  }

  export async function transfer(address, amount){
    await CallBackFrame(CertisToken.methods.transfer(address, amount).send({from: account}));
  }

  // Factories

  export async function RetrieveFactories(){
    let privateTotalPool = await privatePoolFactory.methods.retrieveTotal().call()
    privatePoolAddresses = []

    for (let i = 0; i < privateTotalPool; i++) {
      let privatePoolAddress = await privatePoolFactory.methods.retrieve(i).call()
      privatePoolAddresses[i] = privatePoolAddress
    }

    let providerTotalPool = await providerFactory.methods.retrieveTotal().call()
    providerAddresses = []

    for (let i = 0; i < providerTotalPool; i++) {
      let providerAddress = await providerFactory.methods.retrieve(i).call()
      providerAddresses[i] = providerAddress
    }
  }

  // auxiliary

  export function Bytes32ToAddress(bytes){
    return ("0x" + (bytes.toString()).substring(26));
}

  