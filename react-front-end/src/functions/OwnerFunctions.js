// Owner
const Contracts = require("./Contracts.js");
const Aux = require("./AuxiliaryFunctions.js");

export var publicMinOwners = ""
export var publicPendingMinOwners = ""
export var publicTotalOwners = ""
export var publicOwners = []
export var privateMinOwners = ""
export var privatePendingMinOwners = ""
export var privateTotalOwners = ""
export var privateOwners = []
export var providerMinOwners = ""
export var providerPendingMinOwners = ""
export var providerTotalOwners = ""
export var providerOwners = []
export var pendingPublicOwnersAdd = []
export var pendingPublicOwnersRemove = []
export var pendingPrivateOwnersAdd = [] 
export var pendingPrivateOwnersRemove = []
export var pendingProviderOwnersAdd = []
export var pendingProviderOwnersRemove = []

export async function AddOwner(address, info, contractType){
    if(1 == contractType) await Aux.CallBackFrame(Contracts.publicPool.methods.addOwner(address, info).send({from: Aux.account }));
    else if(2 == contractType) await Aux.CallBackFrame(Contracts.privatePool.methods.addOwner(address, info).send({from: Aux.account }));
    else await Aux.CallBackFrame(Contracts.provider.methods.addOwner(address, info).send({from: Aux.account }));
  }
  
  export async function RemoveOwner(address, contractType){
    if(1 == contractType) await Aux.CallBackFrame(Contracts.publicPool.methods.removeOwner(address).send({from: Aux.account }));
    else if(2 == contractType) await Aux.CallBackFrame(Contracts.privatePool.methods.removeOwner(address).send({from: Aux.account }));
    else await Aux.CallBackFrame(Contracts.provider.methods.removeOwner(address).send({from: Aux.account }));

  }

  export async function ValidateOwner(address, contractType){
    if(1 == contractType)await Aux.CallBackFrame(Contracts.publicPool.methods.validateOwner(address).send({from: Aux.account }));
    else if(2 == contractType)await Aux.CallBackFrame(Contracts.privatePool.methods.validateOwner(address).send({from: Aux.account }));
    else await Aux.CallBackFrame(Contracts.provider.methods.validateOwner(address).send({from: Aux.account }));
  }

  export async function RejectOwner(address, contractType){
    if(1 == contractType)await Aux.CallBackFrame(Contracts.publicPool.methods.rejectOwner(address).send({from: Aux.account }));
    else if(2 == contractType)await Aux.CallBackFrame(Contracts.privatePool.methods.rejectOwner(address).send({from: Aux.account }));
    else await Aux.CallBackFrame(Contracts.provider.methods.rejectOwner(address).send({from: Aux.account }));
  }

  export async function RetrieveOwners(contractType){
    if(1 == contractType){
      publicMinOwners = await Contracts.publicPool.methods.retrieveMinOwners().call()
      publicOwners = await Contracts.publicPool.methods.retrieveAllOwners().call()
      publicTotalOwners = Contracts.privateOwners.length

      pendingPublicOwnersAdd = await Aux.RetrievePendings(Contracts.publicPool.methods.retrievePendingOwners(true).call());
      pendingPublicOwnersRemove = await Aux.RetrievePendings(Contracts.publicPool.methods.retrievePendingOwners(false).call());
      publicPendingMinOwners = await Contracts.publicPool.methods.retrievePendingMinOwners().call();
    }
    else if(2 == contractType){
      privateMinOwners = await Contracts.privatePool.methods.retrieveMinOwners().call()
      privateOwners = await Contracts.privatePool.methods.retrieveAllOwners().call()
      privateTotalOwners = privateOwners.length

      pendingPrivateOwnersAdd = await Aux.RetrievePendings(Contracts.privatePool.methods.retrievePendingOwners(true).call());
      pendingPrivateOwnersRemove = await Aux.RetrievePendings(Contracts.privatePool.methods.retrievePendingOwners(false).call());
      privatePendingMinOwners = await Contracts.privatePool.methods.retrievePendingMinOwners().call();
    }
    else{
      providerMinOwners = await Contracts.provider.methods.retrieveMinOwners().call()
      providerOwners = await Contracts.provider.methods.retrieveAllOwners().call()
      providerTotalOwners = providerOwners.length

      pendingProviderOwnersAdd = await Aux.RetrievePendings(Contracts.provider.methods.retrievePendingOwners(true).call());
      pendingProviderOwnersRemove = await Aux.RetrievePendings(Contracts.provider.methods.retrievePendingOwners(false).call());
      providerPendingMinOwners = await Contracts.provider.methods.retrievePendingMinOwners().call();
    }
  }

  export async function UpdateMinOwner(minOwner, contractType){
    if(1 == contractType) await Aux.CallBackFrame(Contracts.publicPool.methods.changeMinOwners(minOwner).send({from: Aux.account }));
    else if(2 == contractType) await Aux.CallBackFrame(Contracts.privatePool.methods.changeMinOwners(minOwner).send({from: Aux.account }));
    else await Aux.CallBackFrame(Contracts.provider.methods.changeMinOwners(minOwner).send({from: Aux.account }));
  }

  export async function ValidateMinOwner(contractType){
    if(1 == contractType)await Aux.CallBackFrame(Contracts.publicPool.methods.validateMinOwners().send({from: Aux.account }));
    else if(2 == contractType)await Aux.CallBackFrame(Contracts.privatePool.methods.validateMinOwners().send({from: Aux.account }));
    else await Aux.CallBackFrame(Contracts.provider.methods.validateMinOwners().send({from: Aux.account }));
  }

  export async function RejectMinOwner(contractType){
    if(1 == contractType)await Aux.CallBackFrame(Contracts.publicPool.methods.rejectMinOwners().send({from: Aux.account }));
    else if(2 == contractType)await Aux.CallBackFrame(Contracts.privatePool.methods.rejectMinOwners().send({from: Aux.account }));
    else await Aux.CallBackFrame(Contracts.provider.methods.rejectMinOwners().send({from: Aux.account }));
  }