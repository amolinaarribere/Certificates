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
    const State_NOT_SUBMITTED = 0;
    const State_PENDING = 1;
    const State_APPROVED = 2;
    const State_REJECTED = 3;

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
        }
    });

    it("Send Proposal Correctly Funded",async function(){
        // act
        await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
        let sentProposal = await proposals.retrieveProposal(provider_1, {from: user_1});
        const {0: state, 1: info} = sentProposal;
        // assert
        expect(state.toNumber()).to.equal(State_PENDING);
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
        try{
            var credentialsAddress = await proposals.retrieveCredentialsContractAddress({from: user_1});
            var credentials = new web3.eth.Contract(CredentialsAbi, credentialsAddress);
            var info = await credentials.methods.retrieveProvider(provider_1).call({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(ProviderDoesNotExist);
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
    var credentials;
    // used addresses
    const owner_1 = accounts[0]; // owner and chair person
    const owner_2 = accounts[1];
    const provider_1 = accounts[2];  
    const user_1 = accounts[2];
    // providers info
    const provider_1_Info = "Account 1 Info";
    // test constants
    const NotAllowedToAddOwners = new RegExp(/(Not allowed to add owners)/g);
    const OwnerAlreadyActivated = new RegExp(/(Owner already activated)/g);
    const NotAllowedToRemoveOwners = new RegExp(/(Not allowed to remove owners)/g);
    const OwnerAlreadyDeactivated = new RegExp(/(Owner already de-activated)/g);
    const addressesLength = 42;
    const Gas = 600000;

    beforeEach(async function(){
        proposals = await Proposals.new({from: owner_1});
        var credentialsAddress = await proposals.retrieveCredentialsContractAddress({from: user_1});
        credentials = new web3.eth.Contract(CredentialsAbi,credentialsAddress);
    });

    it("Retrieve Creator",async function(){
       // act
       let creator = await credentials.methods.retrieveCreator().call({from: user_1}, function(error, result){});
       // assert
       expect(creator).to.equal(proposals.address);
    });

    it("Add Owners WRONG",async function(){
        try{
            await credentials.methods.addOwner(owner_2).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToAddOwners);
        } 
        try{
            await credentials.methods.addOwner(owner_1).send({from: owner_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(OwnerAlreadyActivated);
        }
     });

    it("Add Owners CORRECT",async function(){
        // act
        await credentials.methods.addOwner(owner_2).send({from: owner_1}, function(error, result){});
        const TotalOwners = await credentials.methods.retrieveTotalOwners().call({from: user_1}, function(error, result){});
        let ISOwner1 = await credentials.methods.isOwner(owner_1).call({from: user_1}, function(error, result){});
        let ISOwner2 = await credentials.methods.isOwner(owner_2).call({from: user_1}, function(error, result){});
        let ISCreatorOwner = await credentials.methods.isOwner(proposals.address).call({from: user_1}, function(error, result){});
        // assert
        expect(parseInt(TotalOwners)).to.equal(3);
        expect(ISCreatorOwner).to.be.true;
        expect(ISOwner1).to.be.true;
        expect(ISOwner2).to.be.true;
     });

     it("Remove Owners WRONG",async function(){
        try{
            await credentials.methods.removeOwner(owner_1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToRemoveOwners);
        } 
        try{
            await credentials.methods.removeOwner(owner_2).send({from: owner_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(OwnerAlreadyDeactivated);
        }
     });

    it("Remove Owners CORRECT",async function(){
        // act
        await credentials.methods.removeOwner(owner_1).send({from: owner_1}, function(error, result){});
        const TotalOwners = await credentials.methods.retrieveTotalOwners().call({from: user_1}, function(error, result){});
        let ISOwner1 = await credentials.methods.isOwner(owner_1).call({from: user_1}, function(error, result){});
        let ISCreatorOwner = await credentials.methods.isOwner(proposals.address).call({from: user_1}, function(error, result){});
        // assert
        expect(parseInt(TotalOwners)).to.equal(1);
        expect(ISCreatorOwner).to.be.true;
        expect(ISOwner1).to.be.false;
     });

    
    
});