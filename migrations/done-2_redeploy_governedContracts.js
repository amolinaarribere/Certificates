let Admin = artifacts.require("./DeployedContracts/Admin");
let CertificatesPoolManager = artifacts.require("./DeployedContracts/CertificatesPoolManager");
let Treasury = artifacts.require("./DeployedContracts/Treasury");
let PriceConverter = artifacts.require("./DeployedContracts/PriceConverter");
let PropositionSettings = artifacts.require("./DeployedContracts/PropositionSettings");
let ENS = artifacts.require("./DeployedContracts/ENS");

let Library = artifacts.require("./Libraries/Library");
let UintLibrary = artifacts.require("./Libraries/UintLibrary");
let AddressLibrary = artifacts.require("./Libraries/AddressLibrary");
let ItemsLibrary = artifacts.require("./Libraries/ItemsLibrary");
let SignatureLibrary = artifacts.require("./Libraries/SignatureLibrary");
let Denominations = artifacts.require("@chainlink/contracts/src/v0.8/Denominations.sol");

const Gas = 6721975;
const AdminContractName = "Admin";
const AdminContractVersion = "1.0";


module.exports = async function(deployer, network, accounts){
  // Libraries -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  var deployedLibraries = require('./Deployed_Libraries_Addresses.json');

  await Library.at(deployedLibraries[network]["LibraryAddress"]);

  await UintLibrary.at(deployedLibraries[network]["UintLibraryAddress"]);

  await AddressLibrary.at(deployedLibraries[network]["AddressLibraryAddress"]);

  await ItemsLibrary.at(deployedLibraries[network]["ItemsLibraryAddress"]);

  await SignatureLibrary.at(deployedLibraries[network]["SignatureLibraryAddress"]);

  await Denominations.at(deployedLibraries[network]["DenominationsAddress"]);

  const CertificatesPoolManagerProxyAddress = deployedLibraries[network]["CertificatesPoolManagerProxyAddress"];
  const AdminProxyAddress = deployedLibraries[network]["AdminProxyAddress"];

  // Certificate Pool Manager -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, CertificatesPoolManager);
  console.log("Library linked to Certificate Pool Manager");

  await deployer.link(AddressLibrary, CertificatesPoolManager);
  console.log("AddressLibrary linked to Certificate Pool Manager");

  await deployer.link(UintLibrary, CertificatesPoolManager);
  console.log("UintLibrary linked to CertificatesPoolManager");

  await deployer.link(SignatureLibrary, CertificatesPoolManager);
  console.log("SignatureLibrary linked to Certificate Pool Manager");

  await deployer.deploy(CertificatesPoolManager);
  CertificatesPoolManagerInstance = await CertificatesPoolManager.deployed();
  console.log("certPoolManager deployed : " + CertificatesPoolManagerInstance.address);

  // Admin -----------------------------------------------------------------------------------------------------------------------------------------------------------------

  await deployer.link(Library, Admin);
  console.log("Library linked to Admin");

  await deployer.link(AddressLibrary, Admin);
  console.log("AddressLibrary linked to Admin");

  await deployer.link(SignatureLibrary, Admin);
  console.log("SignatureLibrary linked to Admin");

  await deployer.deploy(Admin);
  AdminInstance = await Admin.deployed();
  console.log("Admin deployed : " + AdminInstance.address);

  await AdminInstance.Admin_init_redeploy(AdminContractName, AdminContractVersion, CertificatesPoolManagerProxyAddress, AdminProxyAddress, {from: accounts[0], gas: Gas});
  console.log("Admin initialized");

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

  // Proposition Settings -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, PropositionSettings);
  console.log("Library linked to Proposition Settings");

  await deployer.link(UintLibrary, PropositionSettings);
  console.log("UintLibrary linked to Proposition Settings");

  await deployer.link(SignatureLibrary, PropositionSettings);
  console.log("SignatureLibrary linked to Proposition Settings");

  await deployer.deploy(PropositionSettings);
  PropositionSettingsInstance = await PropositionSettings.deployed();
  console.log("PropositionSettings deployed : " + PropositionSettingsInstance.address);

  // Price Converter -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, PriceConverter);
  console.log("Library linked to Price Converter");

  await deployer.link(AddressLibrary, PriceConverter);
  console.log("AddressLibrary linked to Price Converter");

  await deployer.link(Denominations, PriceConverter);
  console.log("Denominations linked to Price Converter");

  await deployer.link(SignatureLibrary, PriceConverter);
  console.log("SignatureLibrary linked to Price Converter");

  await deployer.deploy(PriceConverter);
  PriceConverterInstance = await PriceConverter.deployed();
  console.log("PriceConverter deployed : " + PriceConverterInstance.address);


  // Treasury -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, Treasury);
  console.log("Library linked to Treasury");

  await deployer.link(UintLibrary, Treasury);
  console.log("UintLibrary linked to Treasury");

  await deployer.link(AddressLibrary, Treasury);
  console.log("AddressLibrary linked to Treasury");

  await deployer.link(SignatureLibrary, Treasury);
  console.log("SignatureLibrary linked to Treasury");

  await deployer.deploy(Treasury);
  TreasuryInstance = await Treasury.deployed();
  console.log("Treasury deployed : " + TreasuryInstance.address);


  console.log("Deployment Summary ----------------------------------------------- ");

  console.log("Admin Address : " + AdminInstance.address);

  console.log("Manager Address : " + CertificatesPoolManagerInstance.address);

  console.log("Treasury Address : " + TreasuryInstance.address);

  console.log("Price Converter Address : " + PriceConverterInstance.address);

  console.log("Proposition Settings Address : " + PropositionSettingsInstance.address);

  console.log("ENS Address : " + ENSInstance.address);


}