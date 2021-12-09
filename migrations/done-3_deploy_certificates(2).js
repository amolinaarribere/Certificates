let ExternalRegistries = require("./ExternalRegistries.js");
let Admin = artifacts.require("./DeployedContracts/Admin");
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

const AdminContractName = "Admin";
const AdminContractVersion = "1.0";
const CertificatesPoolManagerProxyAddress = "0x49aCE77a02b93a97c71952F23Fa768Fd92EE23B8";
const AdminProxyAddress = "0xad105A9D84CD632EC1acd4a26Ec21A648aE8B99E";



module.exports = async function(deployer, network, accounts){
  // Libraries -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  const LibraryInstance = await Library.at("0xC06F2Ba0a4AC9555AAB0F3F06Dfb808854abdBD0");
  await deployer.deploy(Library);

  const UintLibraryInstance = await UintLibrary.at("0x68b7fafD3f1d45301981cdf72999Df2BC4a0C888");

  const AddressLibraryInstance = await AddressLibrary.at("0xa1EE21282Bb65CD13a161490e78DcB98B73F036b");

  const ItemsLibraryInstance = await ItemsLibrary.at("0xBE2358F428a7e48De5F10198c091448D76FCcA51");

  const SignatureLibraryInstance = await SignatureLibrary.at("0x476eB80ABC54F5166553cb871fE7B1a26f216E39");

  const DenominationsInstance = await Denominations.at("0x0aBfc8BF274C7787afFAf5eC3850d6e565B81F3A");
/*
  // Certificate Pool Manager -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(LibraryInstance, CertificatesPoolManager);
  console.log("Library linked to Certificate Pool Manager");

  await deployer.link(AddressLibraryInstance, CertificatesPoolManager);
  console.log("AddressLibrary linked to Certificate Pool Manager");

  await deployer.link(UintLibraryInstance, CertificatesPoolManager);
  console.log("UintLibrary linked to CertificatesPoolManager");

  await deployer.link(SignatureLibraryInstance, CertificatesPoolManager);
  console.log("SignatureLibrary linked to Certificate Pool Manager");

  await deployer.deploy(CertificatesPoolManager);
  CertificatesPoolManagerInstance = await CertificatesPoolManager.deployed();
  console.log("certPoolManager deployed : " + CertificatesPoolManagerInstance.address);
*/
  // Admin -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  console.log(deployer);
  //console.log("old library : " + LibraryInstance.contract_name);
  //console.log("new library : " + Library.contract_name);

 /* await deployer.link(Library, Admin);
  console.log("Library linked to Admin");

  await deployer.link(AddressLibrary, Admin);
  console.log("AddressLibrary linked to Admin");

  await deployer.link(SignatureLibrary, Admin);
  console.log("SignatureLibrary linked to Admin");

  await deployer.deploy(Admin);
  AdminInstance = await Admin.deployed();
  console.log("Admin deployed : " + AdminInstance.address);

  await AdminInstance.Admin_init_redeploy(AdminContractName, AdminContractVersion, CertificatesPoolManagerProxyAddress, AdminProxyAddress, {from: accounts[0], gas: Gas});
  console.log("Admin initialized");*/
/*
  // ENS -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(LibraryInstance, ENS);
  console.log("Library linked to ENS");

  await deployer.link(AddressLibraryInstance, ENS);
  console.log("AddressLibrary linked to ENS");

  await deployer.link(SignatureLibraryInstance, ENS);
  console.log("SignatureLibrary linked to ENS");

  await deployer.deploy(ENS);
  ENSInstance = await ENS.deployed();
  console.log("ENS deployed : " + ENSInstance.address);

  // Proposition Settings -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(LibraryInstance, PropositionSettings);
  console.log("Library linked to Proposition Settings");

  await deployer.link(UintLibraryInstance, PropositionSettings);
  console.log("UintLibrary linked to Proposition Settings");

  await deployer.link(SignatureLibraryInstance, PropositionSettings);
  console.log("SignatureLibrary linked to Proposition Settings");

  await deployer.deploy(PropositionSettings);
  PropositionSettingsInstance = await PropositionSettings.deployed();
  console.log("PropositionSettings deployed : " + PropositionSettingsInstance.address);

  // Price Converter -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(LibraryInstance, PriceConverter);
  console.log("Library linked to Price Converter");

  await deployer.link(AddressLibraryInstance, PriceConverter);
  console.log("AddressLibrary linked to Price Converter");

  await deployer.link(DenominationsInstance, PriceConverter);
  console.log("Denominations linked to Price Converter");

  await deployer.link(SignatureLibraryInstance, PriceConverter);
  console.log("SignatureLibrary linked to Price Converter");

  await deployer.deploy(PriceConverter);
  PriceConverterInstance = await PriceConverter.deployed();
  console.log("PriceConverter deployed : " + PriceConverterInstance.address);

  // Certis Token -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(LibraryInstance, CertisToken);
  console.log("Library linked to CertisToken");

  await deployer.link(AddressLibraryInstance, CertisToken);
  console.log("AddressLibrary linked to CertisToken");

  await deployer.deploy(CertisToken);
  CertisTokenInstance = await CertisToken.deployed();
  console.log("CertisToken deployed : " + CertisTokenInstance.address);

  // Treasury -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(LibraryInstance, Treasury);
  console.log("Library linked to Treasury");

  await deployer.link(UintLibraryInstance, Treasury);
  console.log("UintLibrary linked to Treasury");

  await deployer.link(AddressLibraryInstance, Treasury);
  console.log("AddressLibrary linked to Treasury");

  await deployer.link(SignatureLibraryInstance, Treasury);
  console.log("SignatureLibrary linked to Treasury");

  await deployer.deploy(Treasury);
  TreasuryInstance = await Treasury.deployed();
  console.log("Treasury deployed : " + TreasuryInstance.address);

  // Private Pool -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(LibraryInstance, PrivateCertificatesPool);
  console.log("Library linked to PrivateCertificatesPool");

  await deployer.link(AddressLibraryInstance, PrivateCertificatesPool);
  console.log("Address Library linked to PrivateCertificatesPool");

  await deployer.link(ItemsLibraryInstance, PrivateCertificatesPool);
  console.log("Items Library linked to PrivateCertificatesPool");

  await deployer.link(SignatureLibraryInstance, PrivateCertificatesPool);
  console.log("SignatureLibrary linked to PrivateCertificatesPool");

  await deployer.deploy(PrivateCertificatesPool);
  PrivateCertificatesPoolInstance = await PrivateCertificatesPool.deployed();
  console.log("PrivateCertificatesPool deployed : " + PrivateCertificatesPoolInstance.address);

  // Private Pool Factory -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(LibraryInstance, PrivatePoolFactory);
  console.log("Library linked to PrivatePoolFactory");

  await deployer.deploy(PrivatePoolFactory);
  PrivatePoolFactoryInstance = await PrivatePoolFactory.deployed();
  console.log("PrivatePoolFactory deployed : " + PrivatePoolFactoryInstance.address);
  
  // Public Pool -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(LibraryInstance, PublicCertificatesPool);
  console.log("Library linked to PublicCertificatesPool");

  await deployer.link(AddressLibraryInstance, PublicCertificatesPool);
  console.log("Address Library linked to PublicCertificatesPool");

  await deployer.link(ItemsLibraryInstance, PublicCertificatesPool);
  console.log("Items Library linked to PublicCertificatesPool");

  await deployer.link(SignatureLibraryInstance, PublicCertificatesPool);
  console.log("SignatureLibrary linked to PublicCertificatesPool");

  await deployer.deploy(PublicCertificatesPool);
  PublicCertificatesPoolInstance = await PublicCertificatesPool.deployed();
  console.log("PublicCertificatesPool deployed : " + PublicCertificatesPoolInstance.address);

  // Provider -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(LibraryInstance, Provider);
  console.log("Library linked to Provider");

  await deployer.link(AddressLibraryInstance, Provider);
  console.log("Address Library linked to Provider");

  await deployer.link(ItemsLibraryInstance, Provider);
  console.log("Items Library linked to Provider");

  await deployer.deploy(Provider);
  ProviderInstance = await Provider.deployed();
  console.log("Provider deployed : " + ProviderInstance.address);

  // Provider Factory -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(LibraryInstance, ProviderFactory);
  console.log("Library linked to ProviderFactory");

  await deployer.deploy(ProviderFactory);
  ProviderFactoryInstance = await ProviderFactory.deployed();
  console.log("ProviderFactory deployed : " + ProviderFactoryInstance.address);
*/

  console.log("Deployment Summary ----------------------------------------------- ");

  //console.log("Admin Address : " + AdminInstance.address);

 /* console.log("Manager Address : " + CertificatesPoolManagerInstance.address);

  console.log("Public Pool Address : " + PublicCertificatesPoolInstance.address);

  console.log("Treasury Address : " + TreasuryInstance.address);

  console.log("Certis Address : " + CertisTokenInstance.address);

  console.log("Private Pool Factory Address : " + PrivatePoolFactoryInstance.address);

  console.log("Provider Factory Address : " + ProviderFactoryInstance.address);

  console.log("Price Converter Address : " + PriceConverterInstance.address);

  console.log("Proposition Settings Address : " + PropositionSettingsInstance.address);

  console.log("ENS Address : " + ENSInstance.address);

  console.log("Private Pool Implementation Address : " + PrivateCertificatesPoolInstance.address);

  console.log("Provider Implementation Address : " + ProviderInstance.address);*/


}