// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

var Proposals = artifacts.require("./Proposals.sol");
var Credentials = artifacts.require("./Credentials.sol");
var CredentialsAbi = Credentials.abi;
const ProviderDoesNotExist = new RegExp(/(Provider does not exist)/g);
const addressesLength = 42;
const PriceWei = 10;

contract("Testing Proposals",function(accounts){
    var proposals;
    // used addresses
    const chairPerson = accounts[0];
    const provider_1 = accounts[1];  
    const user_1 = accounts[2];
    // providers info
    const provider_1_Info = "Account 1 Info";
    // test constants
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

    it("Retrieve Credentials Contract Address",async function(){
        // act
        let _credentialsAddress = await proposals.retrieveCredentialsContractAddress({from: user_1});
        // assert
        expect(_credentialsAddress).to.be.a("string");
        expect(_credentialsAddress).to.have.lengthOf(addressesLength);
    });

    it("Send Proposal Underfunded",async function(){
        try{
            let PriceUnderFunded = PriceWei - 1;
            await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceUnderFunded});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
            let sentProposal = await proposals.retrieveProposal(provider_1, {from: user_1});
            const {0: activated, 1: info} = sentProposal;
            expect(activated).to.be.false;
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
            try{
                var credentialsAddress = await proposals.retrieveCredentialsContractAddress({from: user_1});
                var credentials = new web3.eth.Contract(CredentialsAbi, credentialsAddress);
                var info = await credentials.methods.retrieveProvider(provider_1).call({from: user_1}, function(error, result){});
                expect.fail();
            }
            catch(error){
                expect(error.message).to.match(ProviderDoesNotExist);
            } 
        }
    });

    it("Approve Proposal CORRECT Chair Person",async function(){
        
        await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
        await proposals.approveProposal(provider_1, {from: chairPerson, gas: Gas});
        var credentialsAddress = await proposals.retrieveCredentialsContractAddress({from: user_1});
        var credentials = new web3.eth.Contract(CredentialsAbi, credentialsAddress);
        var info = await credentials.methods.retrieveProvider(provider_1).call({from: user_1}, function(error, result){});
        expect(info).to.be.equal(provider_1_Info);
    });
    
});


contract("Testing Credentials", function(accounts){
    var proposals;
    // used addresses
    const chairPerson = accounts[0];
    const provider_1 = accounts[1];  
    const user_1 = accounts[2];
    // providers info
    const provider_1_Info = "Account 1 Info";
    // test constants
    const addressesLength = 42;
    const Gas = 600000;

    beforeEach(async function(){
        proposals = await Proposals.new({from: chairPerson});
    });

    it("Retrieve Chair Person",async function(){
       
    });

    
    
});