// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const factory_common = require("../test_libraries/Factories.js");
const init = require("../test_libraries/InitializeContracts.js");
const constants = require("../test_libraries/constants.js");

const ProviderFactory = artifacts.require("ProviderFactory");
const ProviderFactoryAbi = ProviderFactory.abi;

const FactorUSDtoETH = Math.pow(10, 18 + constants.decimals - 2) / constants.rate;
const ProviderPriceWei = constants.ProviderPriceUSD * FactorUSDtoETH;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Provider Factory",function(accounts){
    var certPoolManager;
    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const user_1 = accounts[7];
    const user_2 = accounts[8];
    const user_3 = accounts[9];
    const ProviderOwners = [accounts[0], accounts[5], accounts[9]];

    beforeEach(async function(){
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certPoolManager = contracts[0];
        providerFactoryProxy = new web3.eth.Contract(ProviderFactoryAbi, contracts[1][4]);
    });

    // ****** Creating Provider ***************************************************************** //

    it("Create Provider WRONG",async function(){
        await factory_common.createElementWrong(providerFactoryProxy, ProviderOwners, minOwners, "", ProviderPriceWei, user_1);
    });

    it("Create Provider CORRECT",async function(){
        await factory_common.createElementCorrect(providerFactoryProxy, ProviderOwners, minOwners, ["e1","e2","e3"], ProviderPriceWei, user_1, user_2, user_3);
    });

    // ****** Retrieve ***************************************************************** //

    it("Retrieving WRONG",async function(){
        await factory_common.retrieveWrong(providerFactoryProxy, user_1);
    });

    
});
