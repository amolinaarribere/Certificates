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
const PropositionThreshold = 50000000;
const minToPropose = 5000000;
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
const initSuffixes = [".privatepool.blockcerts.aljomoar.eth", ".provider.blockcerts.aljomoar.eth"]
// Mock
const reverseHashName = "0xa097f6721ce401e757d1223a763fef49b8b5f90bb18567ddb86fd205dff71d34"
const ethHashName = "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae"
const aljomoarEthHashName = "0xb1fe26b45b845782dfed1cc603f1684b2fbd9d9cdc7e9f309f9260a624ea79ce"
const blockcertsAljomoarEthHashName = "0xe30ca74a70585a5ccb0c21f7acb47c69a54d3cdcb4176662aa7c12a9441ac2a5"
// Mock
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
  let ChainLinkRegistryAddress = await ExternalRegistries.GetChainLinkAddress(network, deployer, MockChainLinkFeedRegistry, rate, MockDecimals);

  let ENSresult = await ExternalRegistries.GetENSAddresses(network, deployer, MockENSRegistry, MockENSResolver, MockENSReverseRegistry, initNodes, web3, accounts[0]);
  let ENSRegistryAddress = ENSresult[0];
  let ENSResolverAddress = ENSresult[1];
  let ENSReverseRegistryAddress = ENSresult[2];

  const PublicOwners = [accounts[0]];

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

  var CertificatesPoolManagerProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "address",
        "name": "chairPerson",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "contractName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contractVersion",
        "type": "string"
      }
    ],
    "name": "CertificatesPoolManager_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };

  var CertificatesPoolManagerProxyInitializerParameters = [accounts[0], CertificateManagerContractName, CertificateManagerContractVersion];
  var CertificatesPoolManagerProxyData = web3.eth.abi.encodeFunctionCall(CertificatesPoolManagerProxyInitializerMethod, CertificatesPoolManagerProxyInitializerParameters);
  

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

  await AdminInstance.Admin_init(AdminContractName, AdminContractVersion, CertificatesPoolManagerInstance.address, CertificatesPoolManagerProxyData, {from: accounts[0], gas: Gas});
  console.log("Admin initialized");

  var ManagerAddress = await AdminInstance.retrieveManagerProxy();

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

  var ENSProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "address",
        "name": "ENSRegistry",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "ENSReverseRegistry",
        "type": "address"
      },
      {
        "internalType": "bytes32[]",
        "name": "nodes",
        "type": "bytes32[]"
      },
      {
        "internalType": "string[]",
        "name": "suffixes",
        "type": "string[]"
      },
      {
        "internalType": "address",
        "name": "managerContractAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "chairPerson",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "contractName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contractVersion",
        "type": "string"
      }
    ],
    "name": "ENS_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };

  var ENSProxyInitializerParameters = [ENSRegistryAddress, ENSReverseRegistryAddress, initNodes, initSuffixes, ManagerAddress, accounts[0], ENSContractName, ENSContractVersion];
  var ENSProxyData = web3.eth.abi.encodeFunctionCall(ENSProxyInitializerMethod, ENSProxyInitializerParameters);

  
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

  var PropositionSettingsProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "address",
        "name": "managerContractAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "chairPerson",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "PropositionLifeTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "PropositionThreshold",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minToPropose",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "contractName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contractVersion",
        "type": "string"
      }
    ],
    "name": "PropositionSettings_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };

  var PropositionSettingsProxyInitializerParameters = [ManagerAddress, accounts[0], PropositionLifeTime, PropositionThreshold, minToPropose, PropositionSettingsContractName, PropositionSettingsContractVersion];
  var PropositionSettingsProxyData = web3.eth.abi.encodeFunctionCall(PropositionSettingsProxyInitializerMethod, PropositionSettingsProxyInitializerParameters);

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

  var PriceConverterProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "address",
        "name": "registry",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "managerContractAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "chairPerson",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "contractName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contractVersion",
        "type": "string"
      }
    ],
    "name": "PriceConverter_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };
  var PriceConverterProxyInitializerParameters = [ChainLinkRegistryAddress, ManagerAddress, accounts[0], PriceConverterContractName, PriceConverterContractVersion];
  var PriceConverterProxyData = web3.eth.abi.encodeFunctionCall(PriceConverterProxyInitializerMethod, PriceConverterProxyInitializerParameters);

  // Certis Token -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await deployer.link(Library, CertisToken);
  console.log("Library linked to CertisToken");

  await deployer.link(AddressLibrary, CertisToken);
  console.log("AddressLibrary linked to CertisToken");

  await deployer.deploy(CertisToken);
  CertisTokenInstance = await CertisToken.deployed();
  console.log("CertisToken deployed : " + CertisTokenInstance.address);

  var CertisTokenProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "MaxSupply",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "managerContractAddress",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "decimalsValue",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      }
    ],
    "name": "CertisToken_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };
  var CertisTokenProxyInitializerParameters = [TokenName, TokenSymbol, TokenSupply, ManagerAddress, TokenDecimals, accounts[0]];
  var CertisProxyData = web3.eth.abi.encodeFunctionCall(CertisTokenProxyInitializerMethod, CertisTokenProxyInitializerParameters);

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

  var TreasuryProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "PublicPriceUSD",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "PrivatePriceUSD",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "ProviderPriceUSD",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "CertificatePriceUSD",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "OwnerRefundFeeUSD",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "managerContractAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "chairPerson",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "contractName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contractVersion",
        "type": "string"
      }
    ],
    "name": "Treasury_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };

  var TreasuryProxyInitializerParameters = [PublicPriceUSD, PrivatePriceUSD, ProviderPriceUSD, CertificatePriceUSD, OwnerRefundFeeUSD, ManagerAddress, accounts[0], TreasuryContractName, TreasuryContractVersion];
  var TreasuryProxyData = web3.eth.abi.encodeFunctionCall(TreasuryProxyInitializerMethod, TreasuryProxyInitializerParameters);

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
  
  var PrivatePoolFactoryProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "address",
        "name": "managerContractAddress",
        "type": "address"
      }
    ],
    "name": "PrivatePoolFactory_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };
  var PrivatePoolFactoryProxyInitializerParameters = [ManagerAddress];
  var PrivatePoolFactoryProxyData = web3.eth.abi.encodeFunctionCall(PrivatePoolFactoryProxyInitializerMethod, PrivatePoolFactoryProxyInitializerParameters);

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

  var PublicCertificatesPoolProxyInitializerMethod = {
     "inputs": [
       {
         "internalType": "address[]",
         "name": "owners",
         "type": "address[]"
       },
       {
         "internalType": "uint256",
         "name": "minOwners",
         "type": "uint256"
       },
       {
         "internalType": "address",
         "name": "managerContractAddress",
         "type": "address"
       },
       {
         "internalType": "string",
         "name": "contractName",
         "type": "string"
       },
       {
         "internalType": "string",
         "name": "contractVersion",
         "type": "string"
       }
     ],
     "name": "PublicCertPool_init",
     "outputs": [],
     "stateMutability": "nonpayable",
     "type": "function"
  };
  var PublicCertificatesPoolProxyInitializerParameters = [PublicOwners, PublicMinOwners, ManagerAddress, PublicPoolContractName, PublicPoolContractVersion];
  var PublicCertificatesPoolProxyData = web3.eth.abi.encodeFunctionCall(PublicCertificatesPoolProxyInitializerMethod, PublicCertificatesPoolProxyInitializerParameters);

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
  
  var ProviderFactoryProxyInitializerMethod = {
    "inputs": [
      {
        "internalType": "address",
        "name": "managerContractAddress",
        "type": "address"
      }
    ],
    "name": "ProviderFactory_init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };
  var ProviderFactoryProxyInitializerParameters = [ManagerAddress];
  var ProviderFactoryProxyData = web3.eth.abi.encodeFunctionCall(ProviderFactoryProxyInitializerMethod, ProviderFactoryProxyInitializerParameters);

// Initialize Contract Manager
 var CertificatesPoolManagerProxyInstance = new web3.eth.Contract(CertificatesPoolManagerAbi, ManagerAddress);
  
 await CertificatesPoolManagerProxyInstance.methods.InitializeContracts(
  obj.returnUpgradeObject(PublicCertificatesPoolInstance.address,
     TreasuryInstance.address,
      CertisTokenInstance.address, 
      PrivatePoolFactoryInstance.address, 
      PrivateCertificatesPoolInstance.address, 
      ProviderFactoryInstance.address, 
      ProviderInstance.address, 
      PriceConverterInstance.address,
      PropositionSettingsInstance.address,
      ENSInstance.address,
      PublicCertificatesPoolProxyData, 
      TreasuryProxyData, 
      CertisProxyData, 
      PrivatePoolFactoryProxyData, 
      ProviderFactoryProxyData, 
      PriceConverterProxyData,
      PropositionSettingsProxyData,
      ENSProxyData,
      PrivatePoolContractName,
      PrivatePoolContractVersion)).send({from: accounts[0], gas: Gas});

  console.log("CertificatesPoolManager initialized");

  let CertManagerAddress = await AdminInstance.retrieveManager();
  let TransparentProxies = await CertificatesPoolManagerProxyInstance.methods.retrieveTransparentProxies().call();
  let TransparentImpl = await CertificatesPoolManagerProxyInstance.methods.retrieveTransparentProxiesImpl().call();
  let Beacons = await CertificatesPoolManagerProxyInstance.methods.retrieveBeacons().call();
  let BeaconsImpl = await CertificatesPoolManagerProxyInstance.methods.retrieveBeaconsImpl().call();
  let ManagerAdmin = await CertificatesPoolManagerProxyInstance.methods.retrieveManagerAdmin().call();
  let init = await CertificatesPoolManagerProxyInstance.methods.isInitialized().call();

 // Initialize ENS Domains if required (mocking)
 await ExternalRegistries.initializeENS(network, MockENSRegistry, ENSRegistryAddress, web3, accounts[0], TransparentProxies[7], ENSResolverAddress, ENSReverseRegistryAddress, reverseHashName, ethHashName, aljomoarEthHashName, blockcertsAljomoarEthHashName, Gas)


  console.log("Deployment Summary ----------------------------------------------- ");

  console.log("Libraries ******* ");

  console.log("Library Address : " + LibraryInstance.address);
  console.log("UintLibrary Address : " + UintLibraryInstance.address);
  console.log("AddressLibrary Address : " + AddressLibraryInstance.address);
  console.log("ItemsLibrary Address : " + ItemsLibraryInstance.address);
  console.log("SignatureLibrary Address : " + SignatureLibraryInstance.address);
  console.log("Denominations Address : " + DenominationsInstance.address);

  console.log("Contracts ******* ");

  console.log("Admin Address : " + AdminInstance.address + " // " + ManagerAdmin);

  console.log("Manager Proxy Address : " + CertificatesPoolManagerProxyInstance._address);
  console.log("Manager Address : " + CertManagerAddress + " is iniitalized : " + init);

  console.log("Public Pool Proxy Address : " + TransparentProxies[0]);
  console.log("Public Pool Address : " + TransparentImpl[0]);

  console.log("Treasury Proxy Address : " + TransparentProxies[1]);
  console.log("Treasury Address : " + TransparentImpl[1]);

  console.log("Certis Proxy Address : " + TransparentProxies[2]);
  console.log("Certis Address : " + TransparentImpl[2]);

  console.log("Private Pool Factory Proxy Address : " + TransparentProxies[3]);
  console.log("Private Pool Factory Address : " + TransparentImpl[3]);

  console.log("Provider Factory Proxy Address : " + TransparentProxies[4]);
  console.log("Provider Factory Address : " + TransparentImpl[4]);

  console.log("Price Converter Proxy Address : " + TransparentProxies[5]);
  console.log("Price Converter Address : " + TransparentImpl[5]);

  console.log("Proposition Settings Proxy Address : " + TransparentProxies[6]);
  console.log("Proposition Settings Address : " + TransparentImpl[6]);

  console.log("ENS Proxy Address : " + TransparentProxies[7]);
  console.log("ENS Address : " + TransparentImpl[7]);

  console.log("Private Pool Beacon Address : " + Beacons[0]);
  console.log("Private Pool Implementation Address : " + BeaconsImpl[0]);

  console.log("Provider Beacon Address : " + Beacons[1]);
  console.log("Provider Implementation Address : " + BeaconsImpl[1]);


}