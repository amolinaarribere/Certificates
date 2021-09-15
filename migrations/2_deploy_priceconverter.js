
let PriceConverter = artifacts.require("./DeployedContracts/PriceConverter");



const obj = require("../test_libraries/objects.js");
let Library = artifacts.require("./Libraries/Library");
let AddressLibrary = artifacts.require("./Libraries/AddressLibrary");
let Denominations = artifacts.require("@chainlink/contracts/src/v0.8/Denominations.sol");



module.exports = async function(deployer, network, accounts){
 // Libraries -----------------------------------------------------------------------------------------------------------------------------------------------------------------
 await deployer.deploy(Library);
 console.log("Library deployed");

 await deployer.link(Library, AddressLibrary);
 console.log("Library linked to Address Library");

 await deployer.deploy(AddressLibrary);
 console.log("AddressLibrary deployed");

 await deployer.deploy(Denominations);
 console.log("Denominations deployed");

   // Price Converter -----------------------------------------------------------------------------------------------------------------------------------------------------------------

  
  await deployer.link(Library, PriceConverter);
  console.log("Library linked to Price Converter");

  await deployer.link(AddressLibrary, PriceConverter);
  console.log("AddressLibrary linked to Price Converter");

  await deployer.link(Denominations, PriceConverter);
  console.log("Denominations linked to Price Converter");

  await deployer.deploy(PriceConverter);
  PriceConverterInstance = await PriceConverter.deployed();
  console.log("PriceConverter deployed : " + PriceConverterInstance.address);
    
}
