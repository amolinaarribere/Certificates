const BigNumber = require('bignumber.js');

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

const CertificatesPoolManagerAbi = CertificatesPoolManager.abi;

// only for testing
let MockChainLinkFeedRegistry = artifacts.require("./DeployedContracts/Mock/MockChainLinkFeedRegistry");
let MockENSRegistry = artifacts.require("./DeployedContracts/Mock/MockENSRegistry");
let MockENSResolver = artifacts.require("./DeployedContracts/Mock/MockENSResolver");
let MockENSReverseRegistry = artifacts.require("./DeployedContracts/Mock/MockENSReverseRegistry");

const obj = require("../test_libraries/objects.js");

let Library = artifacts.require("./Libraries/Library");
let UintLibrary = artifacts.require("./Libraries/UintLibrary");
let AddressLibrary = artifacts.require("./Libraries/AddressLibrary");
let ItemsLibrary = artifacts.require("./Libraries/ItemsLibrary");
let SignatureLibrary = artifacts.require("./Libraries/SignatureLibrary");
let Denominations = artifacts.require("@chainlink/contracts/src/v0.8/Denominations.sol");

const Gas = 6721975;
const PropositionLifeTime = 604800;
const PropositionThresholdPercentage = 50;
const minWeightToProposePercentage = 5;
const TokenName = "CertisToken";
const TokenSymbol = "CERT";
const TokenSupply = 100000000;
const TokenDecimals = 0;
const PublicPriceUSD = 100;
const PrivatePriceUSD = 50;
const ProviderPriceUSD = 40;
const CertificatePriceUSD = 1;
const OwnerRefundFeeUSD = 30;
const rate = new BigNumber("10000");
const MockDecimals = 0;
const initNodes = ["0xf48fea3be10b651407ef19aa331df17a59251f41cbd949d07560de8f3636b9d4", "0xfb2b320dd4db2d98782dcf0e70619f558862e1d313050e2408ea439c20a10799"]
// privatepool.blockcerts.aljomoar.eth, provider.blockcerts.aljomoar.eth
const PublicMinOwners = 1;
const PublicPoolContractName = "Public Certificate Pool";
const PublicPoolContractVersion = "1.0";
const PrivatePoolContractName = "Private Certificate Pool";
const PrivatePoolContractVersion = "1.0";
const CertificateManagerContractName = "Certificate Manager";
const CertificateManagerContractVersion = "1.0";
const TreasuryContractName = "Treasury";
const TreasuryContractVersion = "1.0";
const PriceConverterContractName = "Price Converter";
const PriceConverterContractVersion = "1.0";
const PropositionSettingsContractName = "Proposition Settings";
const PropositionSettingsContractVersion = "1.0";
const ENSContractName = "ENS";
const ENSContractVersion = "1.0";
const AdminContractName = "Admin";
const AdminContractVersion = "1.0";


module.exports = async function(deployer, network, accounts){
  // Libraries -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.deploy(Library);
  LibraryInstance = await Library.deployed();
  console.log("Library deployed");

  await deployer.link(Library, UintLibrary);
  console.log("Library linked to Uint Library");

  await deployer.deploy(UintLibrary);
  UintLibraryInstance = await UintLibrary.deployed();
  console.log("UintLibrary deployed");

  await deployer.link(Library, AddressLibrary);
  console.log("Library linked to Address Library");

  await deployer.deploy(AddressLibrary);
  AddressLibraryInstance = await AddressLibrary.deployed();
  console.log("AddressLibrary deployed");

  await deployer.link(Library, ItemsLibrary);
  console.log("Library linked to Items Library");

  await deployer.link(AddressLibrary, ItemsLibrary);
  console.log("Address Library linked to Items Library");

  await deployer.deploy(ItemsLibrary);
  ItemsLibraryInstance = await ItemsLibrary.deployed();
  console.log("ItemsLibrary deployed");

  await deployer.deploy(SignatureLibrary);
  SignatureLibraryInstance = await SignatureLibrary.deployed();
  console.log("SignatureLibrary deployed");

  await deployer.deploy(Denominations);
  DenominationsInstance = await Denominations.deployed();
  console.log("Denominations deployed");

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

  await deployer.deploy(Admin, AdminContractName, AdminContractVersion, CertificatesPoolManagerInstance.address, CertificatesPoolManagerProxyData);
  AdminInstance = await Admin.deployed();
  console.log("Admin deployed : " + AdminInstance.address);

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

  // Certis Token -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, CertisToken);
  console.log("Library linked to CertisToken");

  await deployer.link(AddressLibrary, CertisToken);
  console.log("AddressLibrary linked to CertisToken");

  await deployer.deploy(CertisToken);
  CertisTokenInstance = await CertisToken.deployed();
  console.log("CertisToken deployed : " + CertisTokenInstance.address);

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

  console.log("Library Address : " + LibraryInstance.address);
  console.log("UintLibrary Address : " + UintLibraryInstance.address);
  console.log("AddressLibrary Address : " + AddressLibraryInstance.address);
  console.log("ItemsLibrary Address : " + ItemsLibraryInstance.address);
  console.log("SignatureLibrary Address : " + SignatureLibraryInstance.address);
  console.log("Denominations Address : " + DenominationsInstance.address);


  console.log("Admin Address : " + AdminInstance.address);

  console.log("Manager Address : " + CertManagerAddress);

  console.log("Public Pool Address : " + PublicCertificatesPoolInstance.address);

  console.log("Treasury Address : " + TreasuryInstance.address);

  console.log("Certis Address : " + CertisTokenInstance.address);

  console.log("Private Pool Factory Address : " + PrivatePoolFactoryInstance.address);

  console.log("Provider Factory Address : " + ProviderFactoryInstance.address);

  console.log("Price Converter Address : " + PriceConverterInstance.address);

  console.log("Proposition Settings Address : " + PropositionSettingsInstance.address);

  console.log("ENS Address : " + ENSInstance.address);

  console.log("Private Pool Implementation Address : " + PrivateCertificatesPoolInstance.address);

  console.log("Provider Implementation Address : " + ProviderInstance.address);


}