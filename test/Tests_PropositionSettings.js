// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const CertificatesPoolManagerAbi = CertificatesPoolManager.abi;
const Treasury = artifacts.require("Treasury");
const TreasuryAbi = Treasury.abi;
const PublicCertificatesPool = artifacts.require("PublicCertificatesPool");
const PublicCertificatesPoolAbi = PublicCertificatesPool.abi;
const CertisToken = artifacts.require("CertisToken");
const CertisTokenAbi = CertisToken.abi;
const PrivatePoolFactory = artifacts.require("PrivatePoolFactory");
const PrivatePoolFactoryAbi = PrivatePoolFactory.abi;
const ProviderFactory = artifacts.require("ProviderFactory");
const ProviderFactoryAbi = ProviderFactory.abi;
const PriceConverter = artifacts.require("PriceConverter");
const PriceConverterAbi = PriceConverter.abi;

const init = require("../test_libraries/InitializeContracts.js");
const proposition = require("../test_libraries/Propositions.js");


// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Price Converter",function(accounts){
    var certPoolManager;
    var certisTokenProxy;
    var propositionSettingsProxy;

    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const user_1 = accounts[4];
    const tokenOwner = [accounts[5], accounts[6], accounts[7], accounts[8], accounts[9]];

    beforeEach(async function(){
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certPoolManager = contracts[0];
        certisTokenProxy = new web3.eth.Contract(CertisTokenAbi, contracts[1][2]);
        propositionSettingsProxy = new web3.eth.Contract(PriceConverterAbi, contracts[1][5]);
    });


    // ****** Testing Settings Configuration ***************************************************************** //
   
    it("Vote/Propose/Cancel Settings WRONG",async function(){
        await proposition.Config_Proposition_Wrong(propositionSettingsProxy, certisTokenProxy, tokenOwner, user_1, chairPerson);
    });

    it("Vote/Propose/Cancel Settings CORRECT",async function(){
        await proposition.Config_Proposition_Correct(propositionSettingsProxy, certisTokenProxy, tokenOwner, user_1, chairPerson);
    });

});