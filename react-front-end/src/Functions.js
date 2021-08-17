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
const PublicPriceWei = 10;
const PrivatePriceWei = 20;
const CertificatePriceWei = 5;
const ProviderPriceWei = 25;



export const privatePoolKey = 'privatePool';
export const providerKey = 'provider';

export var publicPoolAddress = ""
export var privatePoolFactoryAddress = ""
export var privatePoolImplAddress = "";
export var privatePoolAddresses = []
export var privatePoolAddress = sessionStorage.getItem(privatePoolKey);
export var providerFactoryAddress = ""
export var providerImplAddress = "";
export var providerAddresses = []
export var providerAddress = sessionStorage.getItem(providerKey);
export var TreasuryAddress = ""
export var CertisTokenAddress = ""

export var chairPerson = ""
export var balance = ""
export var publicTotalProviders = ""
export var publicProviders = []
export var publicMinOwners = ""
export var publicTotalOwners = ""
export var publicOwners = []
export var privateTotalProviders = ""
export var privateProviders = []
export var privateMinOwners = ""
export var privateTotalOwners = ""
export var privateOwners = []
export var account = ""

export var certificatesByHolder = []
export var currentHolder = "";
export var certificateProvider = ""

export var pendingPublicOwnersAdd = []
export var pendingPublicOwnersRemove = []
export var pendingPrivateOwnersAdd = [] 
export var pendingPrivateOwnersRemove = []
export var pendingPublicProvidersAdd = [] 
export var pendingPublicProvidersRemove = []
export var pendingPrivateProvidersAdd = [] 
export var pendingPrivateProvidersRemove = []

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

  certificatePoolManager = new web3.eth.Contract(CERTIFICATE_POOL_MANAGER_ABI, CERTIFICATE_POOL_MANAGER_ADDRESS)
  publicPoolAddress = await certificatePoolManager.methods.retrievePublicCertificatePool().call();
  privatePoolFactoryAddress = await certificatePoolManager.methods.retrievePrivatePoolFactory().call();
  privatePoolImplAddress = await certificatePoolManager.methods.retrievePrivatePool().call();
  providerFactoryAddress = await certificatePoolManager.methods.retrieveProviderFactory().call();
  providerImplAddress = await certificatePoolManager.methods.retrieveProvider().call();
  TreasuryAddress = await certificatePoolManager.methods.retrieveTreasury().call();
  CertisTokenAddress = await certificatePoolManager.methods.retrieveCertisToken().call();

  publicPool = new web3.eth.Contract(PUBLIC_ABI, publicPoolAddress)
  privatePoolFactory = new web3.eth.Contract(PRIVATEFACTORY_ABI, privatePoolFactoryAddress)
  providerFactory = new web3.eth.Contract(PROVIDERFACTORY_ABI, providerFactoryAddress)
  Treasury = new web3.eth.Contract(TREASURY_ABI, TreasuryAddress)
  CertisToken = new web3.eth.Contract(CERTIS_ABI, CertisTokenAddress)



  let publicProvidersAddresses = await publicPool.methods.retrieveAllProviders().call()
  publicTotalProviders = publicProvidersAddresses.length
  publicProviders = []

  for (let i = 0; i < publicTotalProviders; i++) {
    let {0:publicProviderInfo,1:isProvider} = await publicPool.methods.retrieveProvider(publicProvidersAddresses[i]).call()
    publicProviders[i] = [publicProvidersAddresses[i], publicProviderInfo]
  }

  publicMinOwners = await publicPool.methods.retrieveMinOwners().call()
  publicOwners = await publicPool.methods.retrieveAllOwners().call()
  publicTotalOwners = publicOwners.length

  let privateTotalPool = await privatePoolFactoryAddress.methods.retrieveTotal().call()
  privatePoolAddresses = []

  for (let i = 0; i < privateTotalPool; i++) {
    let privatePoolAddress = await privatePoolFactoryAddress.methods.retrieve(i).call()
    privatePoolAddresses[i] = privatePoolAddress
  }

  pendingPublicOwnersAdd = await RetrievePendings(publicPool.methods.retrievePendingOwners(true).call());
  pendingPublicOwnersRemove = await RetrievePendings(publicPool.methods.retrievePendingOwners(false).call());
  pendingPublicProvidersAdd = await RetrievePendings(publicPool.methods.retrievePendingProviders(true).call());
  pendingPublicProvidersRemove = await RetrievePendings(publicPool.methods.retrievePendingProviders(false).call());
  
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

 export async function SendnewProposal(address, info){
   await CallBackFrame(publicPool.methods.addProvider(address, info).send({from: account, value: PublicPriceWei}));
  }
  
  export async function CreatenewPrivatePool(min, list, name){
    await CallBackFrame(privatePoolFactoryAddress.methods.create(list, min, name).send({from: account, value: PrivatePriceWei}));
  }

  export async function CreatenewProvider(min, list, name){
    await CallBackFrame(providerFactoryAddress.methods.create(list, min, name).send({from: account, value: PrivatePriceWei}));
  }
  
  export async function ValidateProposal(address){
    await CallBackFrame(publicPool.methods.validateProvider(address).send({from: account}));
  }
  
  export async function AddProviderPool(address, Info, contractType){
    if(2 == contractType)await CallBackFrame(privatePool.methods.addProvider(address, Info).send({from: account}));
    else await CallBackFrame(provider.methods.addPool(address, Info).send({from: account}));
  }
  
  export async function RemoveProviderPool(address, contractType){
    if(1 == contractType) await CallBackFrame(publicPool.methods.removeProvider(address).send({from: account}));
    else if(2 == contractType) await CallBackFrame(privatePool.methods.removeProvider(address).send({from: account}));
    else await CallBackFrame(provider.methods.removePool(address).send({from: account}));
  }
  
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

  export async function AddCertificate(hash, address, isPrivate){
    if(true == isPrivate) await CallBackFrame(privatePool.methods.addCertificate(hash, address).send({from: account}));
    else await CallBackFrame(publicPool.methods.addCertificate(hash, address).send({from: account}));
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

  export async function SelectPrivatePool(address){
    try{
      privatePoolAddress = address
      privatePool = new web3.eth.Contract(PRIVATE_ABI, address)
      let privateProvidersAddresses = await privatePool.methods.retrieveAllProviders().call()
      privateTotalProviders = privateProvidersAddresses.length
      privateProviders = []
    
      for (let i = 0; i < privateTotalProviders; i++) {
        let {0:privateProviderInfo,1:isProvider} = await privatePool.methods.retrieveProvider(privateProvidersAddresses[i]).call()
        privateProviders[i] = [privateProvidersAddresses[i], privateProviderInfo]
      }
    
      privateMinOwners = await privatePool.methods.retrieveMinOwners().call()
      privateOwners = await privatePool.methods.retrieveAllOwners().call()
      privateTotalOwners = privateOwners.length

      pendingPrivateOwnersAdd = await RetrievePendings(privatePool.methods.retrievePendingOwners(true).call());
      pendingPrivateOwnersRemove = await RetrievePendings(privatePool.methods.retrievePendingOwners(false).call());
      pendingPrivateProvidersAdd = await RetrievePendings(privatePool.methods.retrievePendingProviders(true).call());
      pendingPrivateProvidersRemove = await RetrievePendings(privatePool.methods.retrievePendingProviders(false).call());

    }
    catch(e) { window.alert(e); }
  }