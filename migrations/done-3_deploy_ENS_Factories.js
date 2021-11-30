let PrivatePoolFactory = artifacts.require("./DeployedContracts/PrivatePoolFactory");
let ProviderFactory = artifacts.require("./DeployedContracts/ProviderFactory");
let ENS = artifacts.require("./DeployedContracts/ENS");

let Library = artifacts.require("./Libraries/Library");
let AddressLibrary = artifacts.require("./Libraries/AddressLibrary");
let SignatureLibrary = artifacts.require("./Libraries/SignatureLibrary");


module.exports = async function(deployer, network, accounts){
   // Libraries -----------------------------------------------------------------------------------------------------------------------------------------------------------------
 await deployer.deploy(Library);
 console.log("Library deployed");

 await deployer.link(Library, AddressLibrary);
 console.log("Library linked to Address Library");

 await deployer.deploy(AddressLibrary);
 console.log("AddressLibrary deployed");

 await deployer.deploy(SignatureLibrary);
console.log("SignatureLibrary deployed");
  
  // ENS -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, ENS);
  console.log("Library linked to ENS");

  await deployer.link(AddressLibrary, ENS);
  console.log("AddressLibrary linked to ENS");

  await deployer.link(SignatureLibrary, ENS);
  console.log("SignatureLibrary linked to ENS");

  await deployer.deploy(ENS);
  ENSInstance = await ENS.deployed();
  console.log("ENS deployed : " + ENSInstance.address);
  

  // Private Pool Factory -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, PrivatePoolFactory);
  console.log("Library linked to PrivatePoolFactory");

  await deployer.deploy(PrivatePoolFactory);
  PrivatePoolFactoryInstance = await PrivatePoolFactory.deployed();
  console.log("PrivatePoolFactory deployed : " + PrivatePoolFactoryInstance.address);
  

  // Provider Factory -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, ProviderFactory);
  console.log("Library linked to ProviderFactory");

  await deployer.deploy(ProviderFactory);
  ProviderFactoryInstance = await ProviderFactory.deployed();
  console.log("ProviderFactory deployed : " + ProviderFactoryInstance.address);
  

  console.log("Deployment Summary ----------------------------------------------- ");

  console.log("Private Pool Factory Address : " + PrivatePoolFactoryInstance.address);
  console.log("Provider Factory Address : " + ProviderFactoryInstance.address);
  console.log("ENS Address : " + ENSInstance.address);

}