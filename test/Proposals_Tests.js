// Chai library for testing

var Proposals = artifacts.require("./Proposals.sol");

contract("Test-Group-1",function(accounts){
    var proposals;
    var credentialsAddress;
    // used addresses
    const chairPerson = accounts[0];
    const provider_1 = accounts[1];  
    const user_1 = accounts[3];
    // providers info
    const provider_1_Info = "Account 1 Info";
    const provider_2_Info = "Account 2 Info";
    // test constants
    const addressesLength = 42;
    const PriceWei = 10;
    const NotEnoughFunds = new RegExp(/(Not enough funds)/g);
    const NotAllowedToApproveProposals = new RegExp(/(Not allowed to approve proposals)/g);
    const Gas = 600000;

    beforeEach(async function(){
        proposals = await Proposals.new({from: chairPerson});
    });

    it("Retrieve Chair Person",async function(){
        // act
        let _chairPerson = await proposals.retrieveChairPerson({from: user_1});
        // assert
        expect(_chairPerson).to.equal(chairPerson);
    });

    it("Retrieve Credential Contract Address",async function(){
        // act
        credentialsAddress = await proposals.retrieveCredentialsContractAddress({from: user_1});
        // assert
        expect(credentialsAddress).to.be.a("string");
        expect(credentialsAddress).to.have.lengthOf(addressesLength);
    });

    it("Send Proposal Underfunded",async function(){
        try{
            let PriceUnderFunded = PriceWei - 1;
            await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceUnderFunded});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }
    });

    it("Send Proposal Correctly Funded",async function(){
        // act
        await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
        let sentProposal = await proposals.retrieveProposal(provider_1, {from: user_1});
        const {0: activated, 1: info} = sentProposal;
        // assert
        expect(activated).to.be.true;
        expect(info).to.be.equal(provider_1_Info);
    });

    it("Approve Proposal WRONG Chair Person",async function(){
        try{
            await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
            await proposals.approveProposal(provider_1, {from: provider_1, gas: Gas});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToApproveProposals);
        }
    });

    it("Approve Proposal CORRECT Chair Person",async function(){
        await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
        await proposals.approveProposal(provider_1, {from: chairPerson, gas: Gas});
    });
    
});