// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertisToken = artifacts.require("CertisToken");
const CertisTokenAbi = CertisToken.abi;
const ENS = artifacts.require("ENS");
const ENSAbi = ENS.abi;

const init = require("../test_libraries/InitializeContracts.js");
const proposition = require("../test_libraries/Propositions.js");
const aux = require("../test_libraries/auxiliaries.js");

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
    const address_2 = "0x0000000000000000000000000000000000000002";
    const initNodes = ["0xf48fea3be10b651407ef19aa331df17a59251f41cbd949d07560de8f36000000", "0xfb2b320dd4db2d98782dcf0e70619f558862e1d313050e2408ea439c20000000"];
    const label = "0xf48fea3be10b651407ef19aa331df17a59251f41cbd949d07560de8f36000000";
    var PropositionValues = [aux.AddressToBytes32(address_1), aux.AddressToBytes32(address_2), initNodes[0], initNodes[1]];

    const Unauthorized = new RegExp("EC8-");


    beforeEach(async function(){
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certPoolManager = contracts[0];
        certisTokenProxy = new web3.eth.Contract(CertisTokenAbi, contracts[1][2]);
        ensProxy = new web3.eth.Contract(ENSAbi, contracts[1][7]);
    });

    // ****** TESTING Functionality ***************************************************************** //
    it("Create Subdomain WRONG",async function(){
        try{
            await ensProxy.methods.createSubdomain(label, address_1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(Unauthorized);
        }    
    });

    // ****** Testing Settings Configuration ***************************************************************** //
    it("Retrieve Proposals Details",async function(){
        // act
        await proposition.Check_Proposition_Details(ensProxy, certisTokenProxy, chairPerson, tokenOwner, user_1, PropositionValues);
    });

    it("Vote/Propose/Cancel ENS Config WRONG",async function(){
        await proposition.Config_ENS_Wrong(ensProxy, certisTokenProxy, tokenOwner, user_1, chairPerson, PropositionValues);
    });

    it("Vote/Propose/Cancel ENS Config CORRECT",async function(){
        await proposition.Config_ENS_Correct(ensProxy, certisTokenProxy, tokenOwner, user_1, chairPerson, PropositionValues);
    });

    it("Votes Reassignment ENS",async function(){
        await proposition.Check_Votes_Reassignment(ensProxy, certisTokenProxy, chairPerson, tokenOwner, user_1, PropositionValues);
    });

});