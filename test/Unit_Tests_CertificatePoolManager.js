// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const Treasury = artifacts.require("Treasury");
const PublicCertificatesPool = artifacts.require("PublicCertificatesPool");
const Library = artifacts.require("./Libraries/Library");

const init = require("../test_libraries/InitializeContracts.js");

const PublicPriceWei = 10;
const PrivatePriceWei = 20;
const CertificatePriceWei = 5;
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
        certPoolManager = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1, PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei);
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
        const {0: _treasury, 1: _publicPool, 2: _chairPerson, 3: _balance} = result;
        // assert
        expect(_chairPerson).to.equal(chairPerson);
        expect(_balance.toNumber()).to.equal(0);
    });


});
