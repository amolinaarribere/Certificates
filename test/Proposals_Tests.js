// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

var Proposals = artifacts.require("./Proposals.sol");
var Certificates = artifacts.require("./Certificates.sol");
var certificatesAbi = Certificates.abi;
//const ProviderDoesNotExist = new RegExp(/(Provider does not exist)/g);
const addressesLength = 42;
const PriceWei = 10;

// Proposals TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

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
    const ProposalAlreadySubmitted = new RegExp(/(Proposal already submitted)/g);
    const NotAllowedToApproveProposals = new RegExp(/(Not allowed to approve proposals)/g);
    const NotAllowedToRejectProposals = new RegExp(/(Not allowed to reject proposals)/g);
    const ProposalDoesNotExist = new RegExp(/(This proposal does not exist)/g);
    const ProposalCannotBeModified = new RegExp(/(This proposal cannot be modified)/g);
    const ProviderDoesNotExist = new RegExp(/(Provider does not exist)/g);
    const Gas = 600000;
    const State_NOT_SUBMITTED = 0;
    const State_PENDING = 1;
    const State_APPROVED = 2;
    const State_REJECTED = 3;

    beforeEach(async function(){
        proposals = await Proposals.new({from: chairPerson});
    });

    // ****** TESTING Retrieves ***************************************************************** //

    it("Retrieve Chair Person",async function(){
        // act
        let _chairPerson = await proposals.retrieveChairPerson({from: user_1});
        // assert
        expect(_chairPerson).to.equal(chairPerson);
    });

    it("Retrieve certificates Contract Address",async function(){
        // act
        let _certificatesAddress = await proposals.retrieveCertificatesContractAddress({from: user_1});
        // assert
        expect(_certificatesAddress).to.be.a("string");
        expect(_certificatesAddress).to.have.lengthOf(addressesLength);
    });

    it("Retrieve proposal WRONG",async function(){
        try{
            await proposals.retrieveProposal(provider_1, {from: user_1});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(ProposalDoesNotExist);
        }
    });

    // ****** TESTING Sending Proposals ***************************************************************** //

    it("Send Proposal WRONG",async function(){
        try{
            let PriceUnderFunded = PriceWei - 1;
            await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceUnderFunded});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }

        await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});

        try{
            await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(ProposalAlreadySubmitted);
        }
    });

    it("Send Proposal CORRECT",async function(){
        // act
        await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
        let sentProposal = await proposals.retrieveProposal(provider_1, {from: user_1});
        const {0: state, 1: info} = sentProposal;
        // assert
        expect(state.toNumber()).to.equal(State_PENDING);
        expect(info).to.be.equal(provider_1_Info);
    });

    // ****** TESTING Approving Proposals ***************************************************************** //

    it("Approve Proposal WRONG",async function(){
        await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});

        try{ 
            await proposals.approveProposal(provider_1, {from: provider_1, gas: Gas});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToApproveProposals);
        }

        await proposals.approveProposal(provider_1, {from: chairPerson, gas: Gas});

        try{
            await proposals.approveProposal(provider_1, {from: chairPerson, gas: Gas});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(ProposalCannotBeModified);
        }
 
    });

    it("Approve Proposal CORRECT",async function(){
        // act
        await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
        await proposals.approveProposal(provider_1, {from: chairPerson, gas: Gas});
        let approvedProposal = await proposals.retrieveProposal(provider_1, {from: user_1});
        const {0: state, 1: info} = approvedProposal;
        var certificatesAddress = await proposals.retrieveCertificatesContractAddress({from: user_1});
        var certificates = new web3.eth.Contract(certificatesAbi, certificatesAddress);
        var ProviderInfo = await certificates.methods.retrieveProvider(provider_1).call({from: user_1}, function(error, result){});
        // assert
        expect(ProviderInfo).to.be.equal(provider_1_Info);
        expect(info).to.be.equal(provider_1_Info);
        expect(state.toNumber()).to.equal(State_APPROVED);
    });

    // ****** TESTING Rejecting Proposals ***************************************************************** //

    it("Reject Proposal WRONG",async function(){
        try{
            await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
            await proposals.rejectProposal(provider_1, {from: provider_1, gas: Gas});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToRejectProposals);
        }

        await proposals.rejectProposal(provider_1, {from: chairPerson, gas: Gas});

        try{
            await proposals.rejectProposal(provider_1, {from: chairPerson, gas: Gas});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(ProposalCannotBeModified);
        }
    });

    it("Reject Proposal CORRECT",async function(){
        await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
        await proposals.rejectProposal(provider_1, {from: chairPerson, gas: Gas});
        let rejectedProposal = await proposals.retrieveProposal(provider_1, {from: user_1});
        const {0: state, 1: info} = rejectedProposal;
        try{
            var certificatesAddress = await proposals.retrieveCertificatesContractAddress({from: user_1});
            var certificates = new web3.eth.Contract(certificatesAbi, certificatesAddress);
            var infoProvider = await certificates.methods.retrieveProvider(provider_1).call({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(ProviderDoesNotExist);
        } 
        expect(info).to.be.equal(provider_1_Info);
        expect(state.toNumber()).to.equal(State_REJECTED);
    });
    
});

// Certificates TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing certificates", function(accounts){
    var proposals;
    var certificates;
    // used addresses
    const owner_1 = accounts[0]; // owner and chair person
    const owner_2 = accounts[1];
    const provider_1 = accounts[2];  
    const user_1 = accounts[3];
    // providers info
    const provider_1_Info = "Account 1 Info";
    // test constants
    const NotAllowedToAddProviders = new RegExp(/(Not allowed to add providers)/g);
    const ProviderAlreadyActivated = new RegExp(/(Provider already activated)/g);
    const NotAllowedToRemoveProviders = new RegExp(/(Not allowed to remove providers)/g);
    const ProviderNotActivated = new RegExp(/(Provider not activated)/g);
    const ProviderDoesNotExist = new RegExp(/(Provider does not exist)/g);
    const NotAllowedToUpdateProviders = new RegExp(/(Not allowed to update providers)/g);
    const NotAllowedToAddCertificates = new RegExp(/(Not allowed to add Certificates)/g);
    const CertificateEmpty = new RegExp(/(Certificate is empty)/g);
    const NotAllowedToRemoveCertificate = new RegExp(/(Not allowed to remove this particular Certificate)/g);
    const CertificateDoesNotExist = new RegExp(/(Certificate does not exist)/g);
    const NotAllowedToUpdateCertificate = new RegExp(/(Not allowed to update this particular Certificate)/g);
    const NotAllowedToAddOwners = new RegExp(/(Not allowed to add owners)/g);
    const OwnerAlreadyActivated = new RegExp(/(Owner already activated)/g);
    const NotAllowedToRemoveOwners = new RegExp(/(Not allowed to remove owners)/g);
    const OwnerAlreadyDeactivated = new RegExp(/(Owner already de-activated)/g);
    const addressesLength = 42;
    const Gas = 600000;

    beforeEach(async function(){
        proposals = await Proposals.new({from: owner_1});
        var certificatesAddress = await proposals.retrieveCertificatesContractAddress({from: user_1});
        certificates = new web3.eth.Contract(certificatesAbi,certificatesAddress);
    });

    // ****** TESTING Retrieves ***************************************************************** //

    it("Retrieve Creator",async function(){
       // act
       let creator = await certificates.methods.retrieveCreator().call({from: user_1}, function(error, result){});
       // assert
       expect(creator).to.equal(proposals.address);
    });

    // ****** TESTING Adding Owners ***************************************************************** //

    it("Add Owners WRONG",async function(){
        try{
            await certificates.methods.addOwner(owner_2).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToAddOwners);
        } 
        try{
            await certificates.methods.addOwner(owner_1).send({from: owner_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(OwnerAlreadyActivated);
        }
     });

    it("Add Owners CORRECT",async function(){
        // act
        await certificates.methods.addOwner(owner_2).send({from: owner_1}, function(error, result){});
        const TotalOwners = await certificates.methods.retrieveTotalOwners().call({from: user_1}, function(error, result){});
        let ISOwner1 = await certificates.methods.isOwner(owner_1).call({from: user_1}, function(error, result){});
        let ISOwner2 = await certificates.methods.isOwner(owner_2).call({from: user_1}, function(error, result){});
        let ISCreatorOwner = await certificates.methods.isOwner(proposals.address).call({from: user_1}, function(error, result){});
        // assert
        expect(parseInt(TotalOwners)).to.equal(3);
        expect(ISCreatorOwner).to.be.true;
        expect(ISOwner1).to.be.true;
        expect(ISOwner2).to.be.true;
     });

    // ****** TESTING Removing Owners ***************************************************************** //

     it("Remove Owners WRONG",async function(){
        try{
            await certificates.methods.removeOwner(owner_1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToRemoveOwners);
        } 
        try{
            await certificates.methods.removeOwner(owner_2).send({from: owner_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(OwnerAlreadyDeactivated);
        }
     });

    it("Remove Owners CORRECT",async function(){
        // act
        await certificates.methods.removeOwner(owner_1).send({from: owner_1}, function(error, result){});
        const TotalOwners = await certificates.methods.retrieveTotalOwners().call({from: user_1}, function(error, result){});
        let ISOwner1 = await certificates.methods.isOwner(owner_1).call({from: user_1}, function(error, result){});
        let ISCreatorOwner = await certificates.methods.isOwner(proposals.address).call({from: user_1}, function(error, result){});
        // assert
        expect(parseInt(TotalOwners)).to.equal(1);
        expect(ISCreatorOwner).to.be.true;
        expect(ISOwner1).to.be.false;
    });

    // ****** TESTING Adding Providers ***************************************************************** //

    it("Add Providers WRONG",async function(){
        try{
            await certificates.methods.addProvider(provider_1, provider_1_Info).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToAddProviders);
        }
    });

     // ****** TESTING Removing Providers ***************************************************************** //

    it("Remove Providers WRONG",async function(){
        let _chairPerson = await proposals.retrieveChairPerson({from: user_1});
        await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
        await proposals.approveProposal(provider_1, {from: _chairPerson, gas: Gas});

        try{
            await certificates.methods.removeProvider(provider_1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToRemoveProviders);
        }

        try{
            await certificates.methods.removeProvider(user_1).send({from: _chairPerson}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(ProviderNotActivated);
        }
    });

    it("Remove Providers CORRECT",async function(){
        // act
        let _chairPerson = await proposals.retrieveChairPerson({from: user_1});
        await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
        await proposals.approveProposal(provider_1, {from: _chairPerson, gas: Gas});
        await certificates.methods.removeProvider(provider_1).send({from: _chairPerson}, function(error, result){});
        // assert
        try{
            var infoProvider = await certificates.methods.retrieveProvider(provider_1).call({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(ProviderDoesNotExist);
        } 
    });

    
    
});