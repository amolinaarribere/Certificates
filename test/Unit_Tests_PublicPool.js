// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PublicCertificates = artifacts.require("PublicCertificatesPool");
var PublicCertificatesAbi = PublicCertificates.abi;
const Library = artifacts.require("./Libraries/Library");

const PublicPriceWei = 10;
const PrivatePriceWei = 20;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Public Pool",function(accounts){
    var certPoolManager;
    var publicCertPool;
    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const provider_1 = accounts[4]; 
    const provider_2 = accounts[5]; 
    const user_1 = accounts[6];
    // providers info
    const provider_1_Info = "Provider 1 Info";
    const provider_2_Info = "Provider 2 Info";
    // test constants
    const WrongSender = new RegExp("EC8");

    beforeEach(async function(){
        certPoolManager = await CertificatesPoolManager.new(PublicOwners, minOwners, PublicPriceWei, PrivatePriceWei, {from: chairPerson});
        let result = await certPoolManager.retrieveConfiguration({from: user_1});
        const {0: publicCertPoolAddress, 1: _chairPerson, 2: _balance} = result;
        publicCertPool = new web3.eth.Contract(PublicCertificatesAbi, publicCertPoolAddress);      
    });

    // ****** TESTING Adding Provider ***************************************************************** //

    it("Add Provider Proposal WRONG",async function(){
        // act
        try{
            await publicCertPool.methods.addProvider(provider_1, provider_1_Info).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(WrongSender);
        }
    });

 

});
