const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const Treasury = artifacts.require("Treasury");
const PublicCertificatesPool = artifacts.require("PublicCertificatesPool");
const PrivateCertificatesPool = artifacts.require("PrivateCertificatesPool");
const Provider = artifacts.require("Provider");
const CertisToken = artifacts.require("CertisToken");
const PriceConverter = artifacts.require("PriceConverter");
const ENS = artifacts.require("ENS");
const PropositionSettings = artifacts.require("PropositionSettings");
const PrivatePoolFactory = artifacts.require("PrivatePoolFactory");
const ProviderFactory = artifacts.require("ProviderFactory");

const MockChainLinkFeedRegistry = artifacts.require("MockChainLinkFeedRegistry"); // Mock
const MockENSRegistry = artifacts.require("MockENSRegistry"); // Mock
const MockENSResolver = artifacts.require("MockENSResolver"); // Mock
const MockENSReverseRegistry = artifacts.require("MockENSReverseRegistry"); // Mock


const constants = require("../test_libraries/constants.js");
const obj = require("../test_libraries/objects.js");

const PublicPriceUSD = constants.PublicPriceUSD;
const PrivatePriceUSD = constants.PrivatePriceUSD;
const ProviderPriceUSD = constants.ProviderPriceUSD;
const CertificatePriceUSD = constants.CertificatePriceUSD;
const OwnerRefundPriceUSD = constants.OwnerRefundPriceUSD;
const rate = constants.rate; // mock
const decimals = constants.decimals; // mock
const initNodes = constants.initNodes; // mock
var ENSRegistryAddress; // mock
const PropositionLifeTime = constants.PropositionLifeTime;
const PropositionThresholdPercentage = constants.PropositionThresholdPercentage;
const minPercentageToPropose = constants.minPercentageToPropose;
const TotalTokenSupply = constants.TotalTokenSupply;
const Gas = constants.Gas;
const PublicPoolContractName = constants.PublicPoolContractName;
const PublicPoolContractVersion = constants.PublicPoolContractVersion;
const PrivatePoolContractName = constants.PrivatePoolContractName;
const PrivatePoolContractVersion = constants.PrivatePoolContractVersion;
const CertificateManagerContractName = constants.CertificateManagerContractName;
const CertificateManagerContractVersion = constants.CertificateManagerContractVersion;
const TreasuryContractName = constants.TreasuryContractName;
const TreasuryContractVersion = constants.TreasuryContractVersion;
const PriceConverterContractName = constants.PriceConverterContractName;
const PriceConverterContractVersion = constants.PriceConverterContractVersion;
const PropositionSettingsContractName = constants.PropositionSettingsContractName;
const PropositionSettingsContractVersion = constants.PropositionSettingsContractVersion;
const ENSContractName = constants.ENSContractName;
const ENSContractVersion = constants.ENSContractVersion;

const ENSProxyInitializerMethod = {
  "inputs": [
    {
      "internalType": "address",
      "name": "ENSRegistry",
      "type": "address"
    },
    {
      "internalType": "bytes32[]",
      "name": "nodes",
      "type": "bytes32[]"
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
const PropositionSettingsProxyInitializerMethod = {
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
      "internalType": "uint8",
      "name": "PropositionThresholdPercentage",
      "type": "uint8"
    },
    {
      "internalType": "uint8",
      "name": "minWeightToProposePercentage",
      "type": "uint8"
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
const PriceConverterProxyInitializerMethod = {
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
const CertisTokenProxyInitializerMethod = {
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
const TreasuryProxyInitializerMethod = {
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
const PrivatePoolFactoryProxyInitializerMethod = {
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
const ProviderFactoryProxyInitializerMethod = {
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
const PublicCertificatesPoolProxyInitializerMethod = {
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

async function InitializeContracts(chairPerson, PublicOwners, minOwners, user_1){
  let certPoolManager = await CertificatesPoolManager.new(CertificateManagerContractName, CertificateManagerContractVersion, {from: chairPerson});
  let implementations = await deployImplementations(user_1);
  let ProxyData = returnProxyInitData(PublicOwners, minOwners, certPoolManager.address, chairPerson, implementations[8]);

  await certPoolManager.InitializeContracts(obj.returnUpgradeObject(implementations[0], implementations[1], implementations[2], implementations[3], implementations[4], implementations[5], implementations[6], implementations[7], implementations[9], implementations[10],
    ProxyData[0], ProxyData[1], ProxyData[2], ProxyData[3], ProxyData[4], ProxyData[5], ProxyData[6], ProxyData[7], PrivatePoolContractName, PrivatePoolContractVersion), {from: chairPerson});

  let proxies = await retrieveProxies(certPoolManager, user_1);

  return [certPoolManager, proxies, implementations];
}

async function deployImplementations(user_1){
    let publicPool = await PublicCertificatesPool.new({from: user_1});
    let treasury = await Treasury.new({from: user_1});
    let certisToken = await CertisToken.new({from: user_1});
    let privatePoolFactory = await PrivatePoolFactory.new({from: user_1});
    let privatePool = await PrivateCertificatesPool.new({from: user_1});
    let providerFactory = await ProviderFactory.new({from: user_1});
    let provider = await Provider.new({from: user_1});
    let priceConverter = await PriceConverter.new({from: user_1});
    let propositionSettings = await PropositionSettings.new({from: user_1});
    let ens = await ENS.new({from: user_1});

    let mockChainLinkFeedRegistry = await MockChainLinkFeedRegistry.new(rate, decimals, {from: user_1}); // Mock
    let mockENSResolver = await MockENSResolver.new({from: user_1}); // Mock
    let mockENSRegistry = await MockENSRegistry.new(initNodes, mockENSResolver.address, {from: user_1}); // Mock
    ENSRegistryAddress = mockENSRegistry.address;
    let mockENSReverseRegistry = await MockENSReverseRegistry.new({from: user_1}); // Mock

    return [publicPool.address, treasury.address, certisToken.address, privatePoolFactory.address, privatePool.address, providerFactory.address, provider.address, priceConverter.address, mockChainLinkFeedRegistry.address, propositionSettings.address, ens.address, mockENSRegistry.address, mockENSReverseRegistry.address];
}

async function retrieveProxies(certPoolManager, user_1){
  let publicPoolProxy = await certPoolManager.retrievePublicCertificatePoolProxy({from: user_1});
  let treasuryProxy = await certPoolManager.retrieveTreasuryProxy({from: user_1});
  let certisTokenProxy = await certPoolManager.retrieveCertisTokenProxy({from: user_1});
  let privatePoolFactoryProxy = await certPoolManager.retrievePrivatePoolFactoryProxy({from: user_1});
  let providerFactoryProxy = await certPoolManager.retrieveProviderFactoryProxy({from: user_1});
  let priceConverterProxy = await certPoolManager.retrievePriceConverterProxy({from: user_1});
  let propositionSettingsProxy = await certPoolManager.retrievePropositionSettingsProxy({from: user_1});
  let ensProxy = await certPoolManager.retrieveENSProxy({from: user_1});

  return [publicPoolProxy, treasuryProxy, certisTokenProxy, privatePoolFactoryProxy, providerFactoryProxy, priceConverterProxy, propositionSettingsProxy, ensProxy];
}

function getProxyData(method, parameters){
  return web3.eth.abi.encodeFunctionCall(method, parameters);
}

function returnProxyInitData(PublicOwners, minOwners, certPoolManager, chairPerson, mockChainLinkFeedRegistry){
  let CertisProxyData = getProxyData(CertisTokenProxyInitializerMethod, ["Certis Token for Test", "CERT", TotalTokenSupply, certPoolManager, 0, chairPerson]);
  let PublicCertificatesPoolProxyData = getProxyData(PublicCertificatesPoolProxyInitializerMethod, [PublicOwners, minOwners, certPoolManager, PublicPoolContractName, PublicPoolContractVersion]);
  let TreasuryProxyData = getProxyData(TreasuryProxyInitializerMethod, [PublicPriceUSD, PrivatePriceUSD, ProviderPriceUSD, CertificatePriceUSD, OwnerRefundPriceUSD, certPoolManager, chairPerson, TreasuryContractName, TreasuryContractVersion]);
  let PrivatePoolFactoryProxyData = getProxyData(PrivatePoolFactoryProxyInitializerMethod, [certPoolManager]);
  let ProviderFactoryProxyData = getProxyData(ProviderFactoryProxyInitializerMethod, [certPoolManager]);
  let PriceConverterProxyData = getProxyData(PriceConverterProxyInitializerMethod, [mockChainLinkFeedRegistry, certPoolManager, chairPerson, PriceConverterContractName, PriceConverterContractVersion]);
  let PropositionSettingsProxyData = getProxyData(PropositionSettingsProxyInitializerMethod, [certPoolManager, chairPerson, PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, PropositionSettingsContractName, PropositionSettingsContractVersion]);
  let ENSProxyData = getProxyData(ENSProxyInitializerMethod, [ENSRegistryAddress, initNodes, certPoolManager, chairPerson, ENSContractName, ENSContractVersion]);

  return [PublicCertificatesPoolProxyData, TreasuryProxyData, CertisProxyData, PrivatePoolFactoryProxyData, ProviderFactoryProxyData, PriceConverterProxyData, PropositionSettingsProxyData, ENSProxyData];
}

exports.InitializeContracts = InitializeContracts;
exports.deployImplementations = deployImplementations;
exports.returnProxyInitData = returnProxyInitData;