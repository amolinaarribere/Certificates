// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const Library = artifacts.require("./Libraries/Library");

const PublicPriceWei = 10;
const PrivatePriceWei = 20;
const OwnerRefundPriceWei = 2;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Certificate Pool Manager",function(accounts){
    var certPoolManager;
    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const PrivateOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const provider_1 = accounts[4];  
    const user_1 = accounts[5];
    // providers info
    const provider_1_Info = "Account 1 Info";
    // test constants
    const NotEnoughFunds = new RegExp("EC2");
    const ProposalAlreadySubmitted = new RegExp("EC3");
    const ProvidedIdIsWrong = new RegExp("EC1");

    beforeEach(async function(){
        certPoolManager = await CertificatesPoolManager.new(PublicOwners, minOwners, PublicPriceWei, PrivatePriceWei, OwnerRefundPriceWei, {from: chairPerson});
    });

    // ****** TESTING Sending Proposals ***************************************************************** //

    it("Send Proposal WRONG",async function(){
        // act
        try{
            let PriceUnderFunded = PublicPriceWei - 1;
            await certPoolManager.sendProposal(provider_1, provider_1_Info, {from: user_1, value: PriceUnderFunded});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }

        // act
        await certPoolManager.sendProposal(provider_1, provider_1_Info, {from: user_1, value: PublicPriceWei});

        try{
            await certPoolManager.sendProposal(provider_1, provider_1_Info, {from: user_1, value: PublicPriceWei});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(ProposalAlreadySubmitted);
        }
    });

    it("Send Proposal CORRECT",async function(){
        // act
        await certPoolManager.sendProposal(provider_1, provider_1_Info, {from: user_1, value: PublicPriceWei});
    });

    // ****** TESTING Creating Private Pools ***************************************************************** //

    it("Create Private Pool WRONG",async function(){
        // act
        try{
            let PriceUnderFunded = PrivatePriceWei - 1;
            let response = await certPoolManager.createPrivateCertificatesPool(PrivateOwners, minOwners, {from: user_1, value: PriceUnderFunded});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotEnoughFunds);
        }
    });

    it("Create Private Pool CORRECT",async function(){
        // act
        await certPoolManager.createPrivateCertificatesPool(PrivateOwners, minOwners, {from: user_1, value: PrivatePriceWei});
        // assert
        let result = await certPoolManager.retrievePrivateCertificatesPool(0, {from: user_1});
        let Total = await certPoolManager.retrieveTotalPrivateCertificatesPool({from: user_1});
        const {0: creator, 1: pool} = result;
        expect(creator).to.equal(user_1);
        expect(Total.toNumber()).to.equal(1);
    });

    // ****** TESTING Retrieves ***************************************************************** //

    it("Retrieve Configuration",async function(){
        // act
        let result = await certPoolManager.retrieveConfiguration({from: user_1});
        const {0: _publicPool, 1: _chairPerson, 2: _balance} = result;
        // assert
        expect(_chairPerson).to.equal(chairPerson);
        expect(_balance.toNumber()).to.equal(0);
    });


});
