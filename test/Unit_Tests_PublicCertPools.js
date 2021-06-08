// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PublicCertificates = artifacts.require("PublicCertificatesPool");
const PrivateCertificates = artifacts.require("PrivateCertificatesPool");
const Library = artifacts.require("./Libraries/Library");

var certificatesAbi = PublicCertificates.abi;
const ProviderDoesNotExist = new RegExp("Provider does not exist");
const addressesLength = 42;
const PublicPriceWei = 10;
const PrivatePriceWei = 20;

// Proposals TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Public Pool",function(accounts){
    var certPoolManager;
    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2]];
    const minOwners = 2;
    const provider_1 = accounts[3];  
    const user_1 = accounts[4];
    // providers info
    const provider_1_Info = "Account 1 Info";
    // test constants
    const NotEnoughFunds = new RegExp("EC2");
    const ProposalAlreadySubmitted = new RegExp("EC3");
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
        certPoolManager = await CertificatesPoolManager.new(PublicOwners, minOwners, PublicPriceWei, PrivatePriceWei, {from: chairPerson});
    });

    // *********** TESTING Gas Consumption ***************************************************************** //
/*
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
*/
    // ****** TESTING Retrieves ***************************************************************** //

    it("Retrieve Configuration",async function(){
        // act
        let result = await certPoolManager.retrieveConfiguration({from: user_1});
        const {0: _publicPool, 1: _chairPerson, 2: _balance} = result;
        // assert
        expect(_chairPerson).to.equal(chairPerson);
        expect(_balance.toNumber()).to.equal(0);
    });

    // ****** TESTING Sending Proposals ***************************************************************** //

    it("Send Proposal WRONG",async function(){
        try{
            let PriceUnderFunded = PublicPriceWei - 1;
            await certPoolManager.sendProposal(provider_1, provider_1_Info, {from: user_1, value: PriceUnderFunded});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }

        await certPoolManager.sendProposal(provider_1, provider_1_Info, {from: user_1, value: PublicPriceWei});

        try{
            await certPoolManager.sendProposal(provider_1, provider_1_Info, {from: user_1, value: PublicPriceWei});
            expect.fail();
        }
        catch(error){
            expect(error.message).to.match(ProposalAlreadySubmitted);
        }
    });

    it("Send Proposal CORRECT",async function(){
        // act
        await certPoolManager.sendProposal(provider_1, provider_1_Info, {from: user_1, value: PublicPriceWei});
    });

    /*
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
*/

});
