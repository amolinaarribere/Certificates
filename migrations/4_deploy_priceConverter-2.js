let PriceConverter = artifacts.require("./DeployedContracts/PriceConverter");
let Library = artifacts.require("./Libraries/Library");
let Denominations = artifacts.require("@chainlink/contracts/src/v0.8/Denominations.sol");
let AddressLibrary = artifacts.require("./Libraries/AddressLibrary");

module.exports = async function(deployer, network, accounts){
 
  if("kovan" == network)
  {
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
  
}