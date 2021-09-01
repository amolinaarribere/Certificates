// Manager
const Contracts = require("./Contracts.js");
const Aux = require("./AuxiliaryFunctions.js");

export var publicPoolAddress = ""
export var publicPoolAddressProxy = ""
export var privatePoolFactoryAddress = ""
export var privatePoolFactoryAddressProxy = ""
export var privatePoolImplAddress = "";

export var providerFactoryAddress = ""
export var providerFactoryAddressProxy = ""
export var providerImplAddress = "";

export var TreasuryAddress = ""
export var TreasuryAddressProxy = ""
export var CertisTokenAddress = ""
export var CertisTokenAddressProxy = ""
export var PendingPublicPoolAddress = ""
export var PendingPrivatePoolFactoryAddress = ""
export var PendingPrivatePoolImplAddress = "";
export var PendingProviderFactoryAddress = ""
export var PendingProviderImplAddress = "";
export var PendingTreasuryAddress = ""
export var PendingCertisTokenAddress = ""
export var PriceConverterAddress = ""
export var PriceConverterAddressProxy = ""

export async function RetrieveContractsAddresses(){
    publicPoolAddressProxy = await Contracts.certificatePoolManager.methods.retrievePublicCertificatePoolProxy().call();
    privatePoolFactoryAddressProxy = await Contracts.certificatePoolManager.methods.retrievePrivatePoolFactoryProxy().call();
    providerFactoryAddressProxy = await Contracts.certificatePoolManager.methods.retrieveProviderFactoryProxy().call();
    TreasuryAddressProxy = await Contracts.certificatePoolManager.methods.retrieveTreasuryProxy().call();
    CertisTokenAddressProxy = await Contracts.certificatePoolManager.methods.retrieveCertisTokenProxy().call();
    PriceConverterAddressProxy = await Contracts.certificatePoolManager.methods.retrievePriceConverterProxy().call();
  
    publicPoolAddress = await Contracts.certificatePoolManager.methods.retrievePublicCertificatePool().call();
    privatePoolFactoryAddress = await Contracts.certificatePoolManager.methods.retrievePrivatePoolFactory().call();
    privatePoolImplAddress = await Contracts.certificatePoolManager.methods.retrievePrivatePool().call();
    providerFactoryAddress = await Contracts.certificatePoolManager.methods.retrieveProviderFactory().call();
    providerImplAddress = await Contracts.certificatePoolManager.methods.retrieveProvider().call();
    TreasuryAddress = await Contracts.certificatePoolManager.methods.retrieveTreasury().call();
    CertisTokenAddress = await Contracts.certificatePoolManager.methods.retrieveCertisToken().call();
    PriceConverterAddress = await Contracts.certificatePoolManager.methods.retrievePriceConverter().call();
  }
  
  export async function UpgradeContracts(NewPublicPoolAddress, NewTreasuryAddress, NewCertisTokenAddress, NewPrivatePoolFactoryAddress, NewPrivatePoolAddress, NewProviderFactoryAddress, NewProviderAddress, NewPriceConverterAddress){
    await Aux.CallBackFrame(Contracts.certificatePoolManager.methods.upgradeContracts({
                "NewPublicPoolAddress": NewPublicPoolAddress,
                "NewTreasuryAddress": NewTreasuryAddress,
                "NewCertisTokenAddress": NewCertisTokenAddress,
                "NewPrivatePoolFactoryAddress": NewPrivatePoolFactoryAddress,
                "NewPrivatePoolAddress": NewPrivatePoolAddress,
                "NewProviderFactoryAddress": NewProviderFactoryAddress,
                "NewProviderAddress": NewProviderAddress,
                "NewPriceConverterAddress": NewPriceConverterAddress,
                "NewPublicPoolData": "0x",
                "NewTreasuryData":  "0x",
                "NewCertisTokenData": "0x",
                "NewPrivatePoolFactoryData": "0x",
                "NewProviderFactoryData":  "0x",
                "NewPriceConverterData":  "0x"
            }).send({from: Aux.account }));
  
  }
  
  export async function RetrievePendingContractsAddresses(){
    [PendingPublicPoolAddress,
      PendingTreasuryAddress,
      PendingCertisTokenAddress,
      PendingPrivatePoolFactoryAddress,
      PendingPrivatePoolImplAddress,
      PendingProviderFactoryAddress,
      PendingProviderImplAddress] = await Contracts.certificatePoolManager.methods.retrieveProposition().call({from: Aux.account });
  }