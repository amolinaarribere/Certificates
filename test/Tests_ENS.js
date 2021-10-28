// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertisToken = artifacts.require("CertisToken");
const CertisTokenAbi = CertisToken.abi;
const ENS = artifacts.require("ENS");
const ENSAbi = ENS.abi;

const init = require("../test_libraries/InitializeContracts.js");
const proposition = require("../test_libraries/Propositions.js");


// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing ENS",function(accounts){
    var certPoolManager;
    var certisTokenProxy;
    var ensProxy;

    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const user_1 = accounts[4];
    const tokenOwner = [accounts[5], accounts[6], accounts[7], accounts[8], accounts[9]];
    const address_1 = "0x0000000000000000000000000000000000000001";
    const OthersEmpty = []

    beforeEach(async function(){
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certPoolManager = contracts[0];
        certisTokenProxy = new web3.eth.Contract(CertisTokenAbi, contracts[1][2]);
        ensProxy = new web3.eth.Contract(ENSAbi, contracts[1][7]);
        registryAddress = await ensProxy.methods.retrieveRegistryAddress().call({from: user_1}, function(error, result){});
    });


    // ****** Testing Settings Configuration ***************************************************************** //
    it("Vote/Propose/Cancel Registry Address WRONG",async function(){
        await proposition.Config_RegistryOnly_Wrong(ensProxy, certisTokenProxy, tokenOwner, user_1, chairPerson, address_1, OthersEmpty);
    });

    it("Vote/Propose/Cancel Registry Address CORRECT",async function(){
        await proposition.Config_RegistryOnly_Correct(ensProxy, certisTokenProxy, tokenOwner, user_1, chairPerson, address_1, OthersEmpty);
    });

});