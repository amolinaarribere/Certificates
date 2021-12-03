let PrivatePoolFactory = artifacts.require("./DeployedContracts/PrivatePoolFactory");
let ProviderFactory = artifacts.require("./DeployedContracts/ProviderFactory");
let PrivateCertificatesPool = artifacts.require("./DeployedContracts/PrivateCertificatesPool");
let Provider = artifacts.require("./DeployedContracts/Provider");


let Library = artifacts.require("./Libraries/Library");
let UintLibrary = artifacts.require("./Libraries/UintLibrary");
let AddressLibrary = artifacts.require("./Libraries/AddressLibrary");
let ItemsLibrary = artifacts.require("./Libraries/ItemsLibrary");
let SignatureLibrary = artifacts.require("./Libraries/SignatureLibrary");
let Denominations = artifacts.require("@chainlink/contracts/src/v0.8/Denominations.sol");


module.exports = async function(deployer, network, accounts){
  // Libraries -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //let LibraryInstance =  await new Library("0x7F0e846092941D58Ea4B6DeC4502c6f2D7A366c3");
  await deployer.deploy(Library);
  console.log("Library deployed");

  await deployer.link(Library, UintLibrary);
  console.log("Library linked to Uint Library");

  await deployer.deploy(UintLibrary);
  console.log("UintLibrary deployed");

  await deployer.link(Library, AddressLibrary);
  console.log("Library linked to Address Library");

  await deployer.deploy(AddressLibrary);
  console.log("AddressLibrary deployed");

  await deployer.link(Library, ItemsLibrary);
  console.log("Library linked to Items Library");

  await deployer.link(AddressLibrary, ItemsLibrary);
  console.log("Address Library linked to Items Library");

  await deployer.deploy(ItemsLibrary);
  console.log("ItemsLibrary deployed");

  await deployer.deploy(SignatureLibrary);
  console.log("SignatureLibrary deployed");

  await deployer.deploy(Denominations);
  console.log("Denominations deployed");
  
  // Private Pool -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, PrivateCertificatesPool);
  console.log("Library linked to PrivateCertificatesPool");

  await deployer.link(AddressLibrary, PrivateCertificatesPool);
  console.log("Address Library linked to PrivateCertificatesPool");

  await deployer.link(ItemsLibrary, PrivateCertificatesPool);
  console.log("Items Library linked to PrivateCertificatesPool");

  await deployer.link(SignatureLibrary, PrivateCertificatesPool);
  console.log("SignatureLibrary linked to PrivateCertificatesPool");

  await deployer.deploy(PrivateCertificatesPool);
  PrivateCertificatesPoolInstance = await PrivateCertificatesPool.deployed();
  console.log("PrivateCertificatesPool deployed : " + PrivateCertificatesPoolInstance.address);

  // Private Pool Factory -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, PrivatePoolFactory);
  console.log("Library linked to PrivatePoolFactory");

  await deployer.deploy(PrivatePoolFactory);
  PrivatePoolFactoryInstance = await PrivatePoolFactory.deployed();
  console.log("PrivatePoolFactory deployed : " + PrivatePoolFactoryInstance.address);
  
  // Provider -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, Provider);
  console.log("Library linked to Provider");
 
  await deployer.link(AddressLibrary, Provider);
  console.log("Address Library linked to Provider");
 
  await deployer.link(ItemsLibrary, Provider);
  console.log("Items Library linked to Provider");
 
  await deployer.deploy(Provider);
  ProviderInstance = await Provider.deployed();
  console.log("Provider deployed : " + ProviderInstance.address);

  // Provider Factory -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, ProviderFactory);
  console.log("Library linked to ProviderFactory");

  await deployer.deploy(ProviderFactory);
  ProviderFactoryInstance = await ProviderFactory.deployed();
  console.log("ProviderFactory deployed : " + ProviderFactoryInstance.address);
  

  console.log("Deployment Summary ----------------------------------------------- ");

  console.log("Private Pool Factory Address : " + PrivatePoolFactoryInstance.address);
  console.log("Provider Factory Address : " + ProviderFactoryInstance.address);
  console.log("Private Pool Implementation Address : " + PrivateCertificatesPoolInstance.address);
  console.log("Provider Implementation Address : " + ProviderInstance.address);

}