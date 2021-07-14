import { CERTIFICATE_POOL_MANAGER_ABI, CERTIFICATE_POOL_MANAGER_ADDRESS, PUBLIC_ABI, PRIVATE_ABI } from './config'
import Web3 from 'web3';

export var web3 = ""
var certificatePoolManager = ""
var publicPool = ""
var privatePool = ""
const PublicPriceWei = 10
const PrivatePriceWei = 20
export const privatePoolKey = 'privatePool';

export var publicPoolAddress = ""
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
export var privatePoolAddresses = []
export var privatePoolAddress = sessionStorage.getItem(privatePoolKey);
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
  const config = await certificatePoolManager.methods.retrieveConfiguration().call()
  publicPoolAddress = config[0]
  chairPerson = config[1]
  balance = config[2]

  publicPool = new web3.eth.Contract(PUBLIC_ABI, publicPoolAddress)
  publicTotalProviders = await publicPool.methods.retrieveTotalProviders().call()
  let publicProvidersAddresses = await publicPool.methods.retrieveAllProviders().call()
  publicProviders = []

  for (let i = 0; i < publicTotalProviders; i++) {
    let {0:publicProviderInfo,1:isProvider} = await publicPool.methods.retrieveProvider(publicProvidersAddresses[i]).call()
    publicProviders[i] = [publicProvidersAddresses[i], publicProviderInfo]
  }

  publicTotalOwners = await publicPool.methods.retrieveTotalOwners().call()
  publicMinOwners = await publicPool.methods.retrieveMinOwners().call()
  publicOwners = await publicPool.methods.retrieveAllOwners().call()

  let privateTotalPool = await certificatePoolManager.methods.retrieveTotalPrivateCertificatesPool().call()
  privatePoolAddresses = []

  for (let i = 0; i < privateTotalPool; i++) {
    let privatePoolAddress = await certificatePoolManager.methods.retrievePrivateCertificatesPool(i).call()
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

async function CallBackFrame(callback){
  try{
    await callback;
   }
   catch(e) { window.alert(e); }
}

 export async function SendnewProposal(address, info){
   await CallBackFrame(certificatePoolManager.methods.sendProposal(address, info).send({from: account, value: PublicPriceWei}));
  }
  
  export async function CreatenewPrivatePool(min, list){
    await CallBackFrame(certificatePoolManager.methods.createPrivateCertificatesPool(list, min).send({from: account, value: PrivatePriceWei}));
  }
  
  export async function ValidateProposal(address){
    var nonce = await web3.eth.getTransactionCount(account);
    await CallBackFrame(publicPool.methods.validateProvider(address, nonce).send({from: account}));
  }
  
  export async function AddPrivateProvider(address, Info){
    var nonce = await web3.eth.getTransactionCount(account);
    await CallBackFrame(privatePool.methods.addProvider(address, Info, nonce).send({from: account}));
  }
  
  export async function RemoveProvider(address, isPrivate){
    var nonce = await web3.eth.getTransactionCount(account);
    if(true == isPrivate) await CallBackFrame(privatePool.methods.removeProvider(address, nonce).send({from: account}));
    else await CallBackFrame(publicPool.methods.removeProvider(address, nonce).send({from: account}));
  }
  
  export async function AddOwner(address, info, isPrivate){
    var nonce = await web3.eth.getTransactionCount(account);
    if(true == isPrivate) await CallBackFrame(privatePool.methods.addOwner(address, info, nonce).send({from: account}));
    else await CallBackFrame(publicPool.methods.addOwner(address, info, nonce).send({from: account}));
  }
  
  export async function RemoveOwner(address, isPrivate){
    var nonce = await web3.eth.getTransactionCount(account);
    if(true == isPrivate) await CallBackFrame(privatePool.methods.removeOwner(address, nonce).send({from: account}));
    else await CallBackFrame(publicPool.methods.removeOwner(address, nonce).send({from: account}));
  }

  export async function AddCertificate(hash, address, isPrivate){
    var nonce = await web3.eth.getTransactionCount(account);
    if(true == isPrivate) await CallBackFrame(privatePool.methods.addCertificate(hash, address, nonce).send({from: account}));
    else await CallBackFrame(publicPool.methods.addCertificate(hash, address, nonce).send({from: account}));
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
      privateTotalProviders = await privatePool.methods.retrieveTotalProviders().call()
      let privateProvidersAddresses = await privatePool.methods.retrieveAllProviders().call()
      privateProviders = []
    
      for (let i = 0; i < privateTotalProviders; i++) {
        let {0:privateProviderInfo,1:isProvider} = await privatePool.methods.retrieveProvider(privateProvidersAddresses[i]).call()
        privateProviders[i] = [privateProvidersAddresses[i], privateProviderInfo]
      }
    
      privateTotalOwners = await privatePool.methods.retrieveTotalOwners().call()
      privateMinOwners = await privatePool.methods.retrieveMinOwners().call()
      privateOwners = await privatePool.methods.retrieveAllOwners().call()

      pendingPrivateOwnersAdd = await RetrievePendings(privatePool.methods.retrievePendingOwners(true).call());
      pendingPrivateOwnersRemove = await RetrievePendings(privatePool.methods.retrievePendingOwners(false).call());
      pendingPrivateProvidersAdd = await RetrievePendings(privatePool.methods.retrievePendingProviders(true).call());
      pendingPrivateProvidersRemove = await RetrievePendings(privatePool.methods.retrievePendingProviders(false).call());

    }
    catch(e) { window.alert(e); }
  }