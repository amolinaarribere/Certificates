let PriceConverter = artifacts.require("./DeployedContracts/PriceConverter");
let Library = artifacts.require("./Libraries/Library");
let AddressLibrary = artifacts.require("./Libraries/AddressLibrary");

module.exports = async function(deployer, network, accounts){
 
  if("kovan" == network)
  {
    // Price Converter -----------------------------------------------------------------------------------------------------------------------------------------------------------------
    await deployer.link(Library, PriceConverter);
    console.log("Library linked to Price Converter");

    await deployer.link(AddressLibrary, PriceConverter);
    console.log("AddressLibrary linked to Price Converter");

    await deployer.deploy(PriceConverter);
    PriceConverterInstance = await PriceConverter.deployed();
    console.log("PriceConverter deployed : " + PriceConverterInstance.address);
  }
  
}