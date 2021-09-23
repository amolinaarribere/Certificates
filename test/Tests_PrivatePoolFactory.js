// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const factory_common = require("../test_libraries/Factories.js");
const init = require("../test_libraries/InitializeContracts.js");
const constants = require("../test_libraries/constants.js");

const PrivatePoolFactory = artifacts.require("PrivatePoolFactory");
const PrivatePoolFactoryAbi = PrivatePoolFactory.abi;

const FactorUSDtoETH = Math.pow(10, 18 + constants.decimals - 2) / constants.rate;
const PrivatePriceWei = constants.PrivatePriceUSD * FactorUSDtoETH;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Private Pool Factory",function(accounts){
    var certPoolManager;
    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const user_1 = accounts[7];
    const user_2 = accounts[8];
    const user_3 = accounts[9];
    const PrivateOwners = [accounts[0], accounts[5], accounts[9]];

    beforeEach(async function(){
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certPoolManager = contracts[0];
        privatePoolFactoryProxy = new web3.eth.Contract(PrivatePoolFactoryAbi, contracts[1][3]);
    });

    // ****** Creating Private Pools ***************************************************************** //

    it("Create Private Pool WRONG",async function(){
        await factory_common.createElementWrong(privatePoolFactoryProxy, PrivateOwners, minOwners, "", PrivatePriceWei, user_1);
    });

    it("Create Private Pool CORRECT",async function(){
        await factory_common.createElementCorrect(privatePoolFactoryProxy, PrivateOwners, minOwners, "", PrivatePriceWei, user_1, user_2, user_3);
    });

    // ****** Retrieve ***************************************************************** //

    it("Retrieving WRONG",async function(){
        await factory_common.retrieveWrong(privatePoolFactoryProxy, user_1);
    });

    
});
