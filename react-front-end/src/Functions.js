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
export var publicOwners = []
export var privateTotalProviders = ""
export var privateProviders = []
export var privateMinOwners = ""
export var privateOwners = []
export var account = ""
export var privatePoolAddresses = []
export var privatePoolAddress = sessionStorage.getItem(privatePoolKey);
export var certificatesByHolder = []
export var currentHolder = ""
export var certificateProvider = ""

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
    let publicProviderInfo = await publicPool.methods.retrieveProvider(publicProvidersAddresses[i]).call()
    publicProviders[i] = [publicProvidersAddresses[i], publicProviderInfo]
  }

  publicMinOwners = await publicPool.methods.retrieveMinOwners().call()
  publicOwners = await publicPool.methods.retrieveAllOwners().call()

  let privateTotalPool = await certificatePoolManager.methods.retrieveTotalPrivateCertificatesPool().call()
  privatePoolAddresses = []

  for (let i = 0; i < privateTotalPool; i++) {
    let privatePoolAddress = await certificatePoolManager.methods.retrievePrivateCertificatesPool(i).call()
    privatePoolAddresses[i] = privatePoolAddress
  }

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
  publicMinOwners = ""
  publicOwners = []

  privatePoolAddresses = []
  privatePoolAddress = ""
  privatePool = ""
  privateTotalProviders = ""
  privateProviders = []
  privateMinOwners = ""
  privateOwners = ""
  sessionStorage.removeItem(privatePoolKey);

  certificatesByHolder = []
  currentHolder = ""
  certificateProvider = ""
}

 export async function SendnewProposal(address, info){
    await certificatePoolManager.methods.sendProposal(address, info).send({from: account, value: PublicPriceWei});
  }
  
  export async function CreatenewPrivatePool(min, list){
    await certificatePoolManager.methods.createPrivateCertificatesPool(list, min).send({from: account, value: PrivatePriceWei});
  }
  
  export async function ValidateProposal(address){
    await publicPool.methods.validateProvider(address).send({from: account});
  }
  
  export async function AddPrivateProvider(address, Info){
    await privatePool.methods.addProvider(address, Info).send({from: account});
  }
  
  export async function RemoveProvider(address, isPrivate){
    if(isPrivate === true) await await privatePool.methods.removeProvider(address).send({from: account});
    else await await publicPool.methods.removeProvider(address).send({from: account});
  }
  
  export async function AddOwner(address, info, isPrivate){
    if(isPrivate === true) await privatePool.methods.addOwner(address, info).send({from: account});
    else await publicPool.methods.addOwner(address, info).send({from: account});
  }
  
  export async function RemoveOwner(address, isPrivate){
    if(isPrivate === true) await privatePool.methods.removeOwner(address).send({from: account});
    else await publicPool.methods.removeOwner(address).send({from: account});
  }

  export async function AddCertificate(hash, address, isPrivate){
    if(isPrivate === true) await privatePool.methods.addCertificate(hash, address).send({from: account});
    else await publicPool.methods.addCertificate(hash, address).send({from: account});
  }

  export async function CheckCertificate(hash, address, isPrivate){
    if(isPrivate === true) certificateProvider = await privatePool.methods.retrieveCertificateProvider(hash, address).call({from: account});
    else certificateProvider = await publicPool.methods.retrieveCertificateProvider(hash, address).call({from: account});
  }

  export async function retrieveCertificatesByHolder(address, init, max, isPrivate){
    if(isPrivate === true) {
      currentHolder = address
      certificatesByHolder = await privatePool.methods.retrieveCertificatesByHolder(address, init, max).call({from: account});
    }
    else{
      currentHolder = address
      certificatesByHolder = await publicPool.methods.retrieveCertificatesByHolder(address, init, max).call({from: account});
    }
  }

  export async function SelectPrivatePool(address){
    privatePoolAddress = address
    privatePool = new web3.eth.Contract(PRIVATE_ABI, address)
    privateTotalProviders = await privatePool.methods.retrieveTotalProviders().call()
    let privateProvidersAddresses = await privatePool.methods.retrieveAllProviders().call()
    privateProviders = []
  
    for (let i = 0; i < privateTotalProviders; i++) {
      let privateProviderInfo = await privatePool.methods.retrieveProvider(privateProvidersAddresses[i]).call()
      privateProviders[i] = [privateProvidersAddresses[i], privateProviderInfo]
    }
  
    privateMinOwners = await privatePool.methods.retrieveMinOwners().call()
    privateOwners = await privatePool.methods.retrieveAllOwners().call()
  
  }