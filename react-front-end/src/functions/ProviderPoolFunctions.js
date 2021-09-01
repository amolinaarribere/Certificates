// Provider - Pool
import {PRIVATE_ABI, PROVIDER_ABI } from '../config'

const Contracts = require("./Contracts.js");
const Aux = require("./AuxiliaryFunctions.js");
const OwnersFunc = require("./OwnerFunctions.js");
const CertificateFunc = require("./CertificateFunctions.js");
const Treasury = require("./TreasuryFunctions.js");

export const privatePoolKey = 'privatePool';
export const providerKey = 'provider';

export var privatePool = "";
export var provider = "";
export var pendingPublicProvidersAdd = [] 
export var pendingPublicProvidersRemove = []
export var pendingPrivateProvidersAdd = [] 
export var pendingPrivateProvidersRemove = []
export var pendingProviderPoolsAdd = [] 
export var pendingProviderPoolsRemove = []
export var providerBalance = "";

export var privatePoolAddress = "";
export var providerAddress = "";

export var publicTotalProviders = ""
export var publicProviders = []

export var privateTotalProviders = ""
export var privateProviders = []

export var providerTotalPools = ""
export var providerPools = []

export async function AddProviderPool(address, Info, subsprice, certprice, subscribe, contractType){
    if(1 == contractType)await Aux.CallBackFrame(Contracts.publicPool.methods.addProvider(address, Info).send({from: Aux.account , value: Treasury.PublicPriceWei}));
    else if(2 == contractType)await Aux.CallBackFrame(privatePool.methods.addProvider(address, Info).send({from: Aux.account }));
    else await Aux.CallBackFrame(provider.methods.addPool(address, Info, certprice, subsprice, subscribe).send({from: Aux.account }));
  }
  
  export async function RemoveProviderPool(address, contractType){
    if(1 == contractType) await Aux.CallBackFrame(Contracts.publicPool.methods.removeProvider(address).send({from: Aux.account }));
    else if(2 == contractType) await Aux.CallBackFrame(privatePool.methods.removeProvider(address).send({from: Aux.account }));
    else await Aux.CallBackFrame(provider.methods.removePool(address).send({from: Aux.account }));
  }

  export async function ValidateProviderPool(address, contractType){
    if(1 == contractType)await Aux.CallBackFrame(Contracts.publicPool.methods.validateProvider(address).send({from: Aux.account }));
    else if(2 == contractType)await Aux.CallBackFrame(privatePool.methods.validateProvider(address).send({from: Aux.account }));
    else await Aux.CallBackFrame(provider.methods.validatePool(address).send({from: Aux.account }));
  }
  
  export async function RejectProviderPool(address, contractType){
    if(1 == contractType)await Aux.CallBackFrame(Contracts.publicPool.methods.rejectProvider(address).send({from: Aux.account }));
    else if(2 == contractType)await Aux.CallBackFrame(privatePool.methods.rejectProvider(address).send({from: Aux.account }));
    else await Aux.CallBackFrame(provider.methods.rejectPool(address).send({from: Aux.account }));
  }

  export async function RetrieveProviderPool(contractType){
    if(1 == contractType){
      let publicProvidersAddresses = await Contracts.publicPool.methods.retrieveAllProviders().call()
      publicTotalProviders = publicProvidersAddresses.length
      publicProviders = []

      for (let i = 0; i < publicTotalProviders; i++) {
        let {0:publicProviderInfo,1:isProvider} = await Contracts.publicPool.methods.retrieveProvider(Aux.Bytes32ToAddress(publicProvidersAddresses[i])).call()
        publicProviders[i] = [publicProvidersAddresses[i], publicProviderInfo]
      }

      pendingPublicProvidersAdd = await Aux.RetrievePendings(Contracts.publicPool.methods.retrievePendingProviders(true).call());
      pendingPublicProvidersRemove = await Aux.RetrievePendings(Contracts.publicPool.methods.retrievePendingProviders(false).call());
    }
    else if(2 == contractType){
      let privateProvidersAddresses = await privatePool.methods.retrieveAllProviders().call()
      privateTotalProviders = privateProvidersAddresses.length
      privateProviders = []
    
      for (let i = 0; i < privateTotalProviders; i++) {
        let {0:privateProviderInfo,1:isProvider} = await privatePool.methods.retrieveProvider(Aux.Bytes32ToAddress(privateProvidersAddresses[i])).call()
        privateProviders[i] = [privateProvidersAddresses[i], privateProviderInfo]
      }

      pendingPrivateProvidersAdd = await Aux.RetrievePendings(privatePool.methods.retrievePendingProviders(true).call());
      pendingPrivateProvidersRemove = await Aux.RetrievePendings(privatePool.methods.retrievePendingProviders(false).call());
    }
    else{
      let providerPoolsAddresses = await provider.methods.retrieveAllPools().call()
      providerTotalPools = providerPoolsAddresses.length
      providerPools = []
    
      for (let i = 0; i < providerTotalPools; i++) {
        let {0:providerPoolInfo,1:isPool} = await provider.methods.retrievePool(Aux.Bytes32ToAddress(providerPoolsAddresses[i])).call()
        providerPools[i] = [providerPoolsAddresses[i], providerPoolInfo]
      }
    
      pendingProviderPoolsAdd = await Aux.RetrievePendings(provider.methods.retrievePendingPools(true).call());
      pendingProviderPoolsRemove = await Aux.RetrievePendings(provider.methods.retrievePendingPools(false).call());
    }
  }

  export async function SelectProviderPool(address, contractType){
    
    try{
      if(2 == contractType){
        privatePoolAddress = address
        privatePool = new Aux.web3.eth.Contract(PRIVATE_ABI, address)
        RetrieveProviderPool(2);
        OwnersFunc.RetrieveOwners(2);
      }
      else{
        providerAddress = address
        provider = new Aux.web3.eth.Contract(PROVIDER_ABI, address)
        providerBalance = await Aux.web3.eth.getBalance(providerAddress);
        RetrieveProviderPool(3);
        OwnersFunc.RetrieveOwners(3);
        CertificateFunc.RetrievePendingCertificates();
      }
      

    }
    catch(e) { window.alert(e); }
  }

  export async function FundProvider(amount){
    await Aux.web3.eth.sendTransaction({from:Aux.account , to:provider._address, value:amount});
  }

  export function ReadKeys(){
    privatePoolAddress = sessionStorage.getItem(privatePoolKey);
    providerAddress = sessionStorage.getItem(providerKey);
  }