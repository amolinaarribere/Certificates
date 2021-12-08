// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertisToken = artifacts.require("CertisToken");
const CertisTokenAbi = CertisToken.abi;
const Admin = artifacts.require("Admin");
const AdminAbi = Admin.abi;

const init = require("../test_libraries/InitializeContracts.js");
const proposition = require("../test_libraries/Propositions.js");
const aux = require("../test_libraries/auxiliaries.js");

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Admin",function(accounts){
    var certisTokenProxy;
    var admin;

    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const user_1 = accounts[4];
    const tokenOwner = [accounts[5], accounts[6], accounts[7], accounts[8], accounts[9]];
    const address_0 = "0x0000000000000000000000000000000000000000";
    const address_1 = "0x0000000000000000000000000000000000000001";
    const address_2 = "0x0000000000000000000000000000000000000002";
    const emptyBytes = "0x";

    beforeEach(async function(){
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certisTokenProxy = new web3.eth.Contract(CertisTokenAbi, contracts[1][2]);
        admin = new web3.eth.Contract(AdminAbi, contracts[3]);
    });


    // ****** Testing Settings Configuration ***************************************************************** //
    it("Retrieve Proposals Details",async function(){
        // act
        var PropositionValues = [aux.AddressToBytes32(address_1), emptyBytes, aux.AddressToBytes32(address_2)];
        await proposition.Check_Proposition_Details(admin, certisTokenProxy, chairPerson, tokenOwner, user_1, PropositionValues);
    });

    it("Vote/Propose/Cancel Admin Config WRONG",async function(){
        var PropositionValues = [aux.AddressToBytes32(address_1), emptyBytes, aux.AddressToBytes32(address_2)];
        await proposition.Config_Admin_Wrong(admin, certisTokenProxy, tokenOwner, user_1, chairPerson, PropositionValues);
    });

    it("Vote/Propose/Cancel Admin Config CORRECT",async function(){
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        var certContractAddress = contracts[4];

        var PropositionValues = [aux.AddressToBytes32(certContractAddress), emptyBytes, aux.AddressToBytes32(address_0)];
        await proposition.Config_Admin_Correct(admin, certisTokenProxy, tokenOwner, user_1, chairPerson, PropositionValues);
    });

    it("Votes Reassignment Admin",async function(){
        var PropositionValues = [aux.AddressToBytes32(address_1), emptyBytes, aux.AddressToBytes32(address_2)];
        await proposition.Check_Votes_Reassignment(admin, certisTokenProxy, chairPerson, tokenOwner, user_1, PropositionValues);
    });

});