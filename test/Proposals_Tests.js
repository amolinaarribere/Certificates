var Proposals = artifacts.require("./Proposals.sol");

contract("Test-Group-1",function(accounts){
    var proposals;
    var credentialsAddress;
    var chairPerson = accounts[0];
    var provider_1 = accounts[1];
    var provider_2 = accounts[2];
    var user_1 = accounts[3];
    var user_2 = accounts[4];
    var addressesLength = 42;

    beforeEach(async function(){
        proposals = await Proposals.new({from: chairPerson});
    });

    it("Retrieve Chair Person",async function(){
        
        let _chairPerson = await proposals.retrieveChairPerson.call({from: accounts[1]});
        expect(_chairPerson).to.equal(chairPerson);
    });

    it("Retrieve Credential Contract Address",async function(){
        credentialsAddress = await proposals.retrieveCredentialsContractAddress({from: accounts[1]});
        expect(credentialsAddress).to.be.a("string");
        expect(credentialsAddress).to.have.lengthOf(addressesLength);
    });
/*
    it("Send Proposal",async function(){
        let receipt = await proposals.sendProposal(accounts[1], "Account 1 Info", {from: accounts[1], gas: 600000});
    });

    it("Approve Proposal WRONG",async function(){
        try{
            await proposals.approveProposal(accounts[1], {from: accounts[1], gas: 600000});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.equal("Not allowed to approve proposals");
        }
    });

    it("Approve Proposal CORRECT",async function(){
        let receipt = await proposals.approveProposal(accounts[1], {from: accounts[0], gas: 600000});
    });
    */
});