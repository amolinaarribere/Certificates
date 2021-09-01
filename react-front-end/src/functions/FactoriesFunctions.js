 // Factories
 const Contracts = require("./Contracts.js");

 export var privatePoolAddresses = []
 export var providerAddresses = []

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