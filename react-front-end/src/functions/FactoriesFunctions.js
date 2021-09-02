 // Factories
 const Contracts = require("./Contracts.js");
 const Aux = require("./AuxiliaryFunctions.js");
 const Treasury = require("./TreasuryFunctions.js");

 export var privatePoolAddresses = []
 export var providerAddresses = []

 export async function CreatenewPoolProvider(min, list, name, contractType){
  if(2 == contractType) await Aux.CallBackFrame(Contracts.privatePoolFactory.methods.create(list, min, name).send({from: Aux.account , value: Treasury.PrivatePriceWei}));
  else await Aux.CallBackFrame(Contracts.providerFactory.methods.create(list, min, name).send({from: Aux.account , value: Treasury.ProviderPriceWei}));
}

 export async function RetrieveFactories(){
    let privateTotalPool = await Contracts.privatePoolFactory.methods.retrieveTotal().call()
    privatePoolAddresses = []

    for (let i = 0; i < privateTotalPool; i++) {
      let privatePoolAddress = await Contracts.privatePoolFactory.methods.retrieve(i).call()
      privatePoolAddresses[i] = privatePoolAddress
    }

    let providerTotalPool = await Contracts.providerFactory.methods.retrieveTotal().call()
    providerAddresses = []

    for (let i = 0; i < providerTotalPool; i++) {
      let providerAddress = await Contracts.providerFactory.methods.retrieve(i).call()
      providerAddresses[i] = providerAddress
    }
  }