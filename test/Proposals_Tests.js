// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

var Proposals = artifacts.require("./Proposals.sol");
var Certificates = artifacts.require("./Certificates.sol");
var certificatesAbi = Certificates.abi;
const ProviderDoesNotExist = new RegExp("Provider does not exist");
const addressesLength = 42;
const PriceWei = 10;

// Proposals TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Proposals",function(accounts){
    var proposals;
    // used addresses
    const chairPerson = accounts[0];
    const provider_1 = accounts[1];  
    const user_1 = accounts[3];
    // providers info
    const provider_1_Info = "Account 1 Info";
    // test constants
    const NotEnoughFunds = new RegExp("Not enough funds");
    const ProposalAlreadySubmitted = new RegExp("Proposal already submitted");
    const NotAllowedToApproveProposals = new RegExp("Not allowed to approve proposals");
    const NotAllowedToRejectProposals = new RegExp("Not allowed to reject proposals");
    const ProposalDoesNotExist = new RegExp("This proposal does not exist");
    const ProposalCannotBeModified = new RegExp("This proposal cannot be modified");
    //const ProviderDoesNotExist = new RegExp("Provider does not exist");
    const Gas = 6000000;
    const State_NOT_SUBMITTED = 0;
    const State_PENDING = 1;
    const State_APPROVED = 2;
    const State_REJECTED = 3;

    beforeEach(async function(){
        proposals = await Proposals.new({from: chairPerson});
    });

    // *********** TESTING Gas Consumption ***************************************************************** //

    it("Send, Approve and Reject LOGS & GAS",async function(){
        // Transactions
        let trxResult_Send_1 = await proposals.sendProposal(accounts[1], "Test Provider 1", {from: user_1, gas: Gas, value: PriceWei});
        let trxResult_Send_2 = await proposals.sendProposal(accounts[2], "Test Provider 2", {from: user_1, gas: Gas, value: PriceWei});
        let trxResult_Send_3 = await proposals.sendProposal(accounts[3], "Test Provider 3 with more Info", {from: user_1, gas: Gas, value: PriceWei});
        let trxResult_Send_4 = await proposals.sendProposal(accounts[4], "Test Provider 4 with more Info", {from: user_1, gas: Gas, value: PriceWei});
        let trxResult_Approve_1 = await proposals.approveProposal(accounts[1], {from: chairPerson, gas: Gas});;
        let trxResult_Reject_2 = await proposals.rejectProposal(accounts[2], {from: chairPerson, gas: Gas});
        let trxResult_Approve_3 = await proposals.approveProposal(accounts[3], {from: chairPerson, gas: Gas});;
        let trxResult_Reject_4 = await proposals.rejectProposal(accounts[4], {from: chairPerson, gas: Gas});
        // Result Info
        trxResult_Send_1.logs.forEach(log => console.log("Logs Send 1 : \n" + JSON.stringify(log) + "\n"));
        console.log("Gas Send 1 : " + trxResult_Send_1.receipt.gasUsed + "\n");

        trxResult_Send_2.logs.forEach(log => console.log("Logs Send 2 : \n" + JSON.stringify(log) + "\n"));
        console.log("Gas Send 2 : " + trxResult_Send_2.receipt.gasUsed + "\n");

        trxResult_Send_3.logs.forEach(log => console.log("Logs Send 3 : \n" + JSON.stringify(log) + "\n"));
        console.log("Gas Send 3 : " + trxResult_Send_3.receipt.gasUsed + "\n");

        trxResult_Send_4.logs.forEach(log => console.log("Logs Send 4 : \n" + JSON.stringify(log) + "\n"));
        console.log("Gas Send 4 : " + trxResult_Send_4.receipt.gasUsed + "\n");

        trxResult_Approve_1.logs.forEach(log => console.log("Logs Approve 1 : \n" + JSON.stringify(log) + "\n"));
        console.log("Gas Approve 1 : " + trxResult_Approve_1.receipt.gasUsed + "\n");

        trxResult_Reject_2.logs.forEach(log => console.log("Logs Reject 2 : \n" + JSON.stringify(log) + "\n"));
        console.log("Gas Reject 2 : " + trxResult_Reject_2.receipt.gasUsed + "\n");

        trxResult_Approve_3.logs.forEach(log => console.log("Logs Approve 3 : \n" + JSON.stringify(log) + "\n"));
        console.log("Gas Approve 3 : " + trxResult_Approve_3.receipt.gasUsed + "\n");

        trxResult_Reject_4.logs.forEach(log => console.log("Logs Reject 4 : \n" + JSON.stringify(log) + "\n"));
        console.log("Gas Reject 4 : " + trxResult_Reject_4.receipt.gasUsed + "\n");
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
    var _chairPerson;
    // used addresses
    const owner_1 = accounts[0]; // owner and chair person
    const owner_2 = accounts[1];
    const provider_1 = accounts[2];  
    const holder_1 = accounts[3];
    const user_1 = accounts[4];
    const provider_2 = accounts[5];  
    const holder_2 = accounts[6];
    // providers info
    const provider_1_Info = "Account 1 Info";
    const provider_2_Info = "Account 2 Info";
    // Certificates info
    const certificate_content_1 = "Certificate content 1";
    const certificate_location_1 = "https://certificate.location.1.com";
    const certificate_hash_1 = "0x3fd54831f488a22b28398de0c567a3b064b937f54f81739ae9bd545967f3abab";
    const certificate_content_2 = "Certificate content 2";
    const certificate_location_2 = "https://certificate.location.2.com";
    const certificate_hash_2 = "0x3fd54832f488a22b28398de0c567a3b064b937f54f81739ae9bd545967f3abab";
    // test constants
    const NotAllowedToAddProviders = new RegExp("Not allowed to add providers");
    const ProviderAlreadyActivated = new RegExp("Provider already activated");
    const NotAllowedToRemoveProviders = new RegExp("Not allowed to remove providers");
    const ProviderNotActivated = new RegExp("Provider not activated");
    const NotAllowedToUpdateProviders = new RegExp("Not allowed to update providers");
    const NotAllowedToAddCertificates = new RegExp("Not allowed to add Certificates");
    const CertificateEmpty = new RegExp("Certificate is empty");
    const NotAllowedToRemoveCertificate = new RegExp("Not allowed to remove this particular Certificate");
    const CertificateDoesNotExist = new RegExp("Certificate does not exist");
    const NotAllowedToUpdateCertificate = new RegExp("Not allowed to update this particular Certificate");
    const NotAllowedToAddOwners = new RegExp("Not allowed to add owners");
    const OwnerAlreadyActivated = new RegExp("Owner already activated");
    const NotAllowedToRemoveOwners = new RegExp("Not allowed to remove owners");
    const OwnerAlreadyDeactivated = new RegExp("Owner already de-activated");
    const addressesLength = 42;
    const Gas = 600000;

    beforeEach(async function(){
        proposals = await Proposals.new({from: owner_1});
        var certificatesAddress = await proposals.retrieveCertificatesContractAddress({from: user_1});
        certificates = new web3.eth.Contract(certificatesAbi,certificatesAddress);
    });

    async function AddingProvider(providerAddress, providerInfo, AddedBy){
        _chairPerson = await proposals.retrieveChairPerson({from: AddedBy});
        await proposals.sendProposal(providerAddress, providerInfo, {from: AddedBy, gas: Gas, value: PriceWei});
        await proposals.approveProposal(providerAddress, {from: _chairPerson, gas: Gas});
    }

    // *********** TESTING Gas Consumption ***************************************************************** //

    it("Add Update and Remove Owner Providers and Certificates LOGS & GAS",async function(){
        // Transactions
        let trxResult_Add_Owner = await certificates.methods.addOwner(accounts[1]).send({from: owner_1, gas: Gas}, function(error, result){});
        await AddingProvider(accounts[2], "Test Provider 1", user_1);
        let trxResult_Update_Provider = await certificates.methods.updateProvider(accounts[2], "Test Provider 1 Updated").send({from: owner_1}, function(error, result){});
        let trxResult_Add_Certificate_1 = await certificates.methods.addCertificate("Certificate Content 1", "Certificate Location 1", certificate_hash_1, accounts[3]).send({from: accounts[2], gas: Gas}, function(error, result){});
        let trxResult_Add_Certificate_2 = await certificates.methods.addCertificate("Certificate Content 2", "Certificate Location 2", certificate_hash_1, accounts[3]).send({from: accounts[2], gas: Gas}, function(error, result){});
        let trxResult_Add_Certificate_3 = await certificates.methods.addCertificate("Certificate Content 3 longer string", "Certificate Location 3 longer string", certificate_hash_1, accounts[3]).send({from: accounts[2], gas: Gas}, function(error, result){});
        let trxResult_Add_Certificate_4 = await certificates.methods.addCertificate("Certificate Content 4 longer string", "Certificate Location 4 longer string", certificate_hash_1, accounts[3]).send({from: accounts[2], gas: Gas}, function(error, result){});
        let trxResult_Update_Certificate_1 = await certificates.methods.updateCertificate(0, "", "", certificate_hash_2).send({from: accounts[2]}, function(error, result){});
        let trxResult_Update_Certificate_4 = await certificates.methods.updateCertificate(3, "Certificate Content 4 longer string", "Certificate Location 4 longer string", certificate_hash_2).send({from: accounts[2]}, function(error, result){});

        let trxResult_Remove_Certificate_2 = await certificates.methods.removeCertificate(1).send({from: accounts[2]}, function(error, result){});
        let trxResult_Remove_Certificate_3 = await certificates.methods.removeCertificate(2).send({from: accounts[2]}, function(error, result){});
        let trxResult_Remove_Provider = await certificates.methods.removeProvider(accounts[2]).send({from: _chairPerson}, function(error, result){});
        let trxResult_Remove_Owner = await certificates.methods.removeOwner(accounts[1]).send({from: owner_1}, function(error, result){});

        // Result Info
        console.log("logs Bloom Add Owner : " + trxResult_Add_Owner.logsBloom + "\n");
        console.log("Gas Add Owner : " + trxResult_Add_Owner.gasUsed + "\n");

        console.log("logs Bloom Update Provider : " + trxResult_Update_Provider.logsBloom + "\n");
        console.log("Gas Update Provider : " + trxResult_Update_Provider.gasUsed + "\n");

        console.log("logs Bloom Add Certificate 1 : " + trxResult_Add_Certificate_1.logsBloom + "\n");
        console.log("Gas Add Certificate 1 : " + trxResult_Add_Certificate_1.gasUsed + "\n");

        console.log("logs Bloom Add Certificate 2 : " + trxResult_Add_Certificate_2.logsBloom + "\n");
        console.log("Gas Add Certificate 2 : " + trxResult_Add_Certificate_2.gasUsed + "\n");

        console.log("logs Bloom Add Certificate 3 : " + trxResult_Add_Certificate_3.logsBloom + "\n");
        console.log("Gas Add Certificate 3 : " + trxResult_Add_Certificate_3.gasUsed + "\n");

        console.log("logs Bloom Add Certificate 4 : " + trxResult_Add_Certificate_4.logsBloom + "\n");
        console.log("Gas Add Certificate 4 : " + trxResult_Add_Certificate_4.gasUsed + "\n");

        console.log("logs Bloom Update Certificate 1 : " + trxResult_Update_Certificate_1.logsBloom + "\n");
        console.log("Gas Update Certificate 1 : " + trxResult_Update_Certificate_1.gasUsed + "\n");

        console.log("logs Bloom Update Certificate 4 : " + trxResult_Update_Certificate_4.logsBloom + "\n");
        console.log("Gas Update Certificate 4 : " + trxResult_Update_Certificate_4.gasUsed + "\n");

        console.log("logs Bloom Remove Certificate 2 : " + trxResult_Remove_Certificate_2.logsBloom + "\n");
        console.log("Gas Remove Certificate 2 : " + trxResult_Remove_Certificate_2.gasUsed + "\n");

        console.log("logs Bloom Remove Certificate 3 : " + trxResult_Remove_Certificate_3.logsBloom + "\n");
        console.log("Gas Remove Certificate 3 : " + trxResult_Remove_Certificate_3.gasUsed + "\n");

        console.log("logs Bloom Remove Provider : " + trxResult_Remove_Provider.logsBloom + "\n");
        console.log("Gas Remove Provider : " + trxResult_Remove_Provider.gasUsed + "\n");

        console.log("logs Bloom Remove Owner : " + trxResult_Remove_Owner.logsBloom + "\n");
        console.log("Gas Remove Owner : " + trxResult_Remove_Owner.gasUsed + "\n");

        
    });

    // ****** TESTING Retrieves ***************************************************************** //

    it("Retrieve Creator",async function(){
       // act
       let creator = await certificates.methods.retrieveCreator().call({from: user_1}, function(error, result){});
       // assert
       expect(creator).to.equal(proposals.address);
    });

    it("Retrieve Provider WRONG",async function(){
        try{
            let provider_Info = await certificates.methods.retrieveProvider(provider_1).call({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(ProviderDoesNotExist);
        }
        
     });

    it("Retrieve Total Provider",async function(){
        // act
        await AddingProvider(provider_1, provider_1_Info, user_1);
        let TotalProviders = await certificates.methods.retrieveTotalProviders().call({from: user_1}, function(error, result){});
        // assert
        expect(parseInt(TotalProviders)).to.equal(1); 
    });
/*
    it("Retrieve Certificate by Holder WRONG",async function(){
        try{
            var certificate = await certificates.methods.retrieveCertificateByHolder().call({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(CertificateDoesNotExist);
        }
        
     });*/
/*
    it("Hello World",async function(){
        let helloworld = await certificates.methods.helloWorld().call();
        console.log(" " + helloworld);
        expect(helloworld).to.be.equal("hello world");     
     });*/

    // ****** TESTING Adding Owners ***************************************************************** //

    it("Add Owners WRONG",async function(){
        try{
            await certificates.methods.addOwner(owner_2).send({from: user_1, gas: Gas}, function(error, result){});
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
        await AddingProvider(provider_1, provider_1_Info, user_1);

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
        await AddingProvider(provider_1, provider_1_Info, user_1);
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

    // ****** TESTING Updating Providers ***************************************************************** //

    it("Update Providers WRONG",async function(){
        await AddingProvider(provider_1, provider_1_Info, user_1);
        let provider_1_Info_Updated = "Updated Info 1";

        try{
            await certificates.methods.updateProvider(provider_1, provider_1_Info_Updated).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToUpdateProviders);
        }

        try{
            await certificates.methods.updateProvider(user_1, provider_1_Info_Updated).send({from: owner_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(ProviderNotActivated);
        }
    });

    it("Update Providers CORRECT",async function(){
        // act
        await AddingProvider(provider_1, provider_1_Info, user_1);
        let provider_1_Info_Updated = "Updated Info 1";
        await certificates.methods.updateProvider(provider_1, provider_1_Info_Updated).send({from: provider_1}, function(error, result){});
        var infoProvider = await certificates.methods.retrieveProvider(provider_1).call({from: user_1}, function(error, result){});
        // assert
        expect(infoProvider).to.be.equal(provider_1_Info_Updated);
    });

    // ****** TESTING Adding Certificates ***************************************************************** //

    it("Add Certificates WRONG",async function(){
        await AddingProvider(provider_1, provider_1_Info, user_1);

        try{
            await certificates.methods.addCertificate(certificate_content_1, certificate_location_1, certificate_hash_1, holder_1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToAddCertificates);
        }

        try{
            await certificates.methods.addCertificate("", "", certificate_hash_1, holder_1).send({from: provider_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(CertificateEmpty);
        }
    });

    it("Add Certificates CORRECT",async function(){
        // act
        await AddingProvider(provider_1, provider_1_Info, user_1);
        await certificates.methods.addCertificate(certificate_content_1, certificate_location_1, certificate_hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
        var certificate = await certificates.methods.retrieveCertificate(0).call({from: user_1}, function(error, result){});
        const {0: providerAddress, 1: certificate_content, 2: certificate_location, 3: certificate_hash, 4: holderAddress} = certificate;
        // assert
        expect(providerAddress).to.be.equal(provider_1);
        expect(certificate_content).to.be.equal(certificate_content_1);
        expect(certificate_location).to.be.equal(certificate_location_1);
        expect(certificate_hash).to.be.equal(certificate_hash_1);
        expect(holderAddress).to.be.equal(holder_1);
    });

    // ****** TESTING Removing Certificates ***************************************************************** //

    it("Remove Certificates WRONG",async function(){
        await AddingProvider(provider_1, provider_1_Info, user_1);
        await certificates.methods.addCertificate(certificate_content_1, certificate_location_1, certificate_hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
        
        try{
            await certificates.methods.removeCertificate(0).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToRemoveCertificate);
        }
/*
        try{
            await certificates.methods.removeCertificate(0 + 1).send({from: holder_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(CertificateDoesNotExist);
        }  */
        
    });

    it("Remove Certificates CORRECT",async function(){
        // act
        await AddingProvider(provider_1, provider_1_Info, user_1);
        await certificates.methods.addCertificate(certificate_content_1, certificate_location_1, certificate_hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
        await certificates.methods.removeCertificate(0).send({from: provider_1}, function(error, result){});
        var certificate = await certificates.methods.retrieveCertificate(0).call({from: user_1}, function(error, result){});
        const {0: providerAddress, 1: certificate_content, 2: certificate_location, 3: certificate_hash, 4: holderAddress} = certificate;
        // assert
        expect(providerAddress).to.be.equal("0x0000000000000000000000000000000000000000");
        expect(certificate_content).to.be.equal("");
        expect(certificate_location).to.be.equal("");
        expect(certificate_hash).to.be.equal(null);
        expect(holderAddress).to.be.equal("0x0000000000000000000000000000000000000000");   
    });

    // ****** TESTING Updating Certificates ***************************************************************** //

    it("Update Certificates WRONG",async function(){
        await AddingProvider(provider_1, provider_1_Info, user_1);
        await certificates.methods.addCertificate(certificate_content_1, certificate_location_1, certificate_hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});

        try{
            await certificates.methods.updateCertificate(0, certificate_content_2, certificate_location_2, certificate_hash_2).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotAllowedToUpdateCertificate);
        }
/*
        try{
            await certificates.methods.updateCertificate(1, certificate_content_2, certificate_location_2, certificate_hash_2).send({from: provider_1}, function(error, result){});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(CertificateDoesNotExist);
        }*/
        
    });

    it("Update Certificates CORRECT",async function(){
        // act
        await AddingProvider(provider_1, provider_1_Info, user_1);
        await certificates.methods.addCertificate(certificate_content_1, certificate_location_1, certificate_hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
        await certificates.methods.updateCertificate(0, certificate_content_2, certificate_location_2, certificate_hash_2).send({from: provider_1}, function(error, result){});
        var certificate = await certificates.methods.retrieveCertificate(0).call({from: user_1}, function(error, result){});
        const {0: providerAddress, 1: certificate_content, 2: certificate_location, 3: certificate_hash, 4: holderAddress} = certificate;
        // assert
        expect(providerAddress).to.be.equal(provider_1);
        expect(certificate_content).to.be.equal(certificate_content_2);
        expect(certificate_location).to.be.equal(certificate_location_2);
        expect(certificate_hash).to.be.equal(certificate_hash_2);
        expect(holderAddress).to.be.equal(holder_1);
    });

    // ****** TESTING Retrieving Certificates ***************************************************************** //

    async function AddingMultipleCertificates(){
        await AddingProvider(provider_1, provider_1_Info, user_1);
        await AddingProvider(provider_2, provider_2_Info, user_1);
        await certificates.methods.addCertificate(certificate_content_1, certificate_location_1, certificate_hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
        await certificates.methods.addCertificate(certificate_content_1, certificate_location_1, certificate_hash_1, holder_2).send({from: provider_1, gas: Gas}, function(error, result){});
        await certificates.methods.addCertificate(certificate_content_2, certificate_location_2, certificate_hash_2, holder_1).send({from: provider_2, gas: Gas}, function(error, result){});
        await certificates.methods.addCertificate(certificate_content_2, certificate_location_2, certificate_hash_2, holder_2).send({from: provider_2, gas: Gas}, function(error, result){});
    };
/*
    it("Retreive Certificates Per Holder",async function(){
        // act
        await AddingMultipleCertificates();

        let TotalHolder1 = await certificates.methods.retrieveTotalCertificatePerHolder(holder_1).call({from: user_1}, function(error, result){});
        let Holder1 = await certificates.methods.retrieveCertificatesPerHolder(holder_1).call({from: user_1}, function(error, result){});
        var Holder1Certificate1 = await certificates.methods.retrieveCertificate(Holder1[0]).call({from: user_1}, function(error, result){});
        var Holder1Certificate2 = await certificates.methods.retrieveCertificate(Holder1[0]).call({from: user_1}, function(error, result){});
        const {0: providerAddress11, 1: certificate_content11, 2: certificate_location11, 3: certificate_hash11, 4: holderAddress11} = Holder1Certificate1;
        const {0: providerAddress12, 1: certificate_content12, 2: certificate_location12, 3: certificate_hash12, 4: holderAddress12} = Holder1Certificate2;

        let TotalHolder2 = await certificates.methods.retrieveTotalCertificatePerHolder(holder_2).call({from: user_1}, function(error, result){});
        let Holder2 = await certificates.methods.retrieveCertificatesPerHolder(holder_2).call({from: user_1}, function(error, result){});
        var Holder2Certificate1 = await certificates.methods.retrieveCertificate(Holder2[0]).call({from: user_1}, function(error, result){});
        var Holder2Certificate2 = await certificates.methods.retrieveCertificate(Holder2[0]).call({from: user_1}, function(error, result){});
        const {0: providerAddress21, 1: certificate_content21, 2: certificate_location21, 3: certificate_hash21, 4: holderAddress21} = Holder2Certificate1;
        const {0: providerAddress22, 1: certificate_content22, 2: certificate_location22, 3: certificate_hash22, 4: holderAddress22} = Holder2Certificate2;

        // assert
        expect(parseInt(TotalHolder1)).to.equal(2);
        expect(parseInt(TotalHolder2)).to.equal(2);

        expect(providerAddress11).to.be.equal(provider_1);
        expect(certificate_content11).to.be.equal(certificate_content_1);
        expect(certificate_location11).to.be.equal(certificate_location_1);
        expect(certificate_hash11).to.be.equal(certificate_hash_1);
        expect(holderAddress11).to.be.equal(holder_1);

        expect(providerAddress12).to.be.equal(provider_1);
        expect(certificate_content12).to.be.equal(certificate_content_1);
        expect(certificate_location12).to.be.equal(certificate_location_1);
        expect(certificate_hash12).to.be.equal(certificate_hash_1);
        expect(holderAddress12).to.be.equal(holder_2);

        expect(providerAddress21).to.be.equal(provider_2);
        expect(certificate_content21).to.be.equal(certificate_content_2);
        expect(certificate_location21).to.be.equal(certificate_location_2);
        expect(certificate_hash21).to.be.equal(certificate_hash_2);
        expect(holderAddress21).to.be.equal(holder_1);

        expect(providerAddress22).to.be.equal(provider_2);
        expect(certificate_content22).to.be.equal(certificate_content_2);
        expect(certificate_location22).to.be.equal(certificate_location_2);
        expect(certificate_hash22).to.be.equal(certificate_hash_2);
        expect(holderAddress22).to.be.equal(holder_2);

    });*/

    
});

