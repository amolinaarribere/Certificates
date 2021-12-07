let CertificatesPoolManager = artifacts.require("./DeployedContracts/CertificatesPoolManager");
let Provider = artifacts.require("./DeployedContracts/Provider");
let Treasury = artifacts.require("./DeployedContracts/Treasury");
let PublicCertificatesPool = artifacts.require("./DeployedContracts/PublicCertificatesPool");
let PrivateCertificatesPool = artifacts.require("./DeployedContracts/PrivateCertificatesPool");
let CertisToken = artifacts.require("./DeployedContracts/CertisToken");
let PrivatePoolFactory = artifacts.require("./DeployedContracts/PrivatePoolFactory");
let ProviderFactory = artifacts.require("./DeployedContracts/ProviderFactory");
let PriceConverter = artifacts.require("./DeployedContracts/PriceConverter");
let PropositionSettings = artifacts.require("./DeployedContracts/PropositionSettings");
let ENS = artifacts.require("./DeployedContracts/ENS");

let Library = artifacts.require("./Libraries/Library");
let UintLibrary = artifacts.require("./Libraries/UintLibrary");
let AddressLibrary = artifacts.require("./Libraries/AddressLibrary");
let ItemsLibrary = artifacts.require("./Libraries/ItemsLibrary");
let SignatureLibrary = artifacts.require("./Libraries/SignatureLibrary");
let Denominations = artifacts.require("@chainlink/contracts/src/v0.8/Denominations.sol");



module.exports = async function(deployer, network, accounts){
  // Libraries -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  /*const LibraryInstance = await Library.at("0xC06F2Ba0a4AC9555AAB0F3F06Dfb808854abdBD0");

  const UintLibraryInstance = await UintLibrary.at("0x68b7fafD3f1d45301981cdf72999Df2BC4a0C888");

  const AddressLibraryInstance = await AddressLibrary.at("0xa1EE21282Bb65CD13a161490e78DcB98B73F036b");

  const ItemsLibraryInstance = await ItemsLibrary.at("0xBE2358F428a7e48De5F10198c091448D76FCcA51");

  const SignatureLibraryInstance = await SignatureLibrary.at("0x476eB80ABC54F5166553cb871fE7B1a26f216E39");

  const DenominationsInstance = await Denominations.at("0x0aBfc8BF274C7787afFAf5eC3850d6e565B81F3A");*/

  await deployer.deploy(Library);
  console.log("Library deployed");

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

  
  // Public Pool -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, PublicCertificatesPool);
  console.log("Library linked to PublicCertificatesPool");

  await deployer.link(AddressLibrary, PublicCertificatesPool);
  console.log("Address Library linked to PublicCertificatesPool");

  await deployer.link(ItemsLibrary, PublicCertificatesPool);
  console.log("Items Library linked to PublicCertificatesPool");

  await deployer.link(SignatureLibrary, PublicCertificatesPool);
  console.log("SignatureLibrary linked to PublicCertificatesPool");

  await deployer.deploy(PublicCertificatesPool);
  PublicCertificatesPoolInstance = await PublicCertificatesPool.deployed();
  console.log("PublicCertificatesPool deployed : " + PublicCertificatesPoolInstance.address);


  console.log("Deployment Summary ----------------------------------------------- ");

  console.log("Public Pool Address : " + PublicCertificatesPoolInstance.address);


}