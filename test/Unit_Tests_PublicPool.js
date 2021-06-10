// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const PublicCertificates = artifacts.require("PublicCertificatesPool");
var PublicCertificatesAbi = PublicCertificates.abi;
const Library = artifacts.require("./Libraries/Library");

const PublicPriceWei = 10;
const PrivatePriceWei = 20;
const Gas = 6721975;

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
    const provider_3 = accounts[6]; 
    const user_1 = accounts[7];
    const holder_1 = accounts[8];
    const holder_2 = accounts[9];
    // providers info
    const provider_1_Info = "Provider 1 Info";
    const provider_2_Info = "Provider 2 Info";
    // certificates
    const hash_1 = "0x3fd54831f488a22b28398de0c567a3b064b937f54f81739ae9bd545967f3abab";
    const hash_2 = "0x3fd54832f488a22b28398de0c567a3b064b937f54f81739ae9bd545967f3abab";
    // test constants
    const WrongSender = new RegExp("EC8");
    const NotAnOwner = new RegExp("EC9");
    const OwnerAlreadyvoted = new RegExp("EC5");
    const NotSubmittedByCreator = new RegExp("EC4");
    const NotAllowedRemoveEntity = new RegExp("EC10");
    const MustBeActivated = new RegExp("EC7");
    const NotAProvider = new RegExp("EC12");
    const NotEmpty = new RegExp("EC11");
    const CertificateAlreadyExists = new RegExp("EC15");
    const NotAllowedToRemoveCertificate = new RegExp("EC14");

    beforeEach(async function(){
        certPoolManager = await CertificatesPoolManager.new(PublicOwners, minOwners, PublicPriceWei, PrivatePriceWei, {from: chairPerson});
        await certPoolManager.sendProposal(provider_1, provider_1_Info, {from: user_1, value: PublicPriceWei});
        await certPoolManager.sendProposal(provider_2, provider_2_Info, {from: user_1, value: PublicPriceWei});
        let result = await certPoolManager.retrieveConfiguration({from: user_1});
        const {0: publicCertPoolAddress, 1: _chairPerson, 2: _balance} = result;
        publicCertPool = new web3.eth.Contract(PublicCertificatesAbi, publicCertPoolAddress);      
    });

    async function ValidatingProviders(){
        await publicCertPool.methods.validateProvider(provider_1).send({from: PublicOwners[0], gas: Gas}, function(error, result){});
        await publicCertPool.methods.validateProvider(provider_1).send({from: PublicOwners[1], gas: Gas}, function(error, result){});
        await publicCertPool.methods.validateProvider(provider_2).send({from: PublicOwners[1], gas: Gas}, function(error, result){});
        await publicCertPool.methods.validateProvider(provider_2).send({from: PublicOwners[2], gas: Gas}, function(error, result){});
    }

    async function AddingCertificate(){
        await publicCertPool.methods.addCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
        await publicCertPool.methods.addCertificate(hash_1, holder_2).send({from: provider_1, gas: Gas}, function(error, result){});
        await publicCertPool.methods.addCertificate(hash_2, holder_1).send({from: provider_2, gas: Gas}, function(error, result){});
        await publicCertPool.methods.addCertificate(hash_2, holder_2).send({from: provider_2, gas: Gas}, function(error, result){});
    }

    // ****** TESTING Adding Provider ***************************************************************** //

    it("Add Provider WRONG",async function(){
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

    // ****** TESTING Validating Provider ***************************************************************** //

    it("Validating Provider WRONG",async function(){
        // act
        try{
            await publicCertPool.methods.validateProvider(provider_1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAnOwner);
        }
       // act
        try{
            await publicCertPool.methods.validateProvider(provider_1).send({from: PublicOwners[0], gas: Gas}, function(error, result){});
            await publicCertPool.methods.validateProvider(provider_1).send({from: PublicOwners[0], gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
        // act
        try{
            await publicCertPool.methods.validateProvider(provider_3).send({from: PublicOwners[0]}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotSubmittedByCreator);
        }
    });

    it("Validating Provider CORRECT",async function(){
        // act
        await ValidatingProviders();
        // assert
        let Provider_1 = await publicCertPool.methods.retrieveProvider(provider_1).call({from: user_1}, function(error, result){});
        let Provider_2 = await publicCertPool.methods.retrieveProvider(provider_2).call({from: user_1}, function(error, result){});
        let Total = await publicCertPool.methods.retrieveTotalProviders().call({from: user_1}, function(error, result){});
        let AllProviders = await publicCertPool.methods.retrieveAllProviders().call({from: user_1}, function(error, result){});
        expect(Provider_1).to.equal(provider_1_Info);
        expect(Provider_2).to.equal(provider_2_Info);
        expect(Total).to.equal("2");
        expect(AllProviders[0]).to.equal(provider_1);
        expect(AllProviders[1]).to.equal(provider_2);
    });

    // ****** TESTING Removing Provider ***************************************************************** //

    it("Removing Provider WRONG",async function(){
        // act
        await ValidatingProviders();

        try{
            await publicCertPool.methods.removeProvider(provider_1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAllowedRemoveEntity);
        }
        // act
        try{
            await publicCertPool.methods.removeProvider(provider_3).send({from: PublicOwners[0]}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(MustBeActivated);
        }
        // act
        try{
            await publicCertPool.methods.removeProvider(provider_1).send({from: PublicOwners[0], gas: Gas}, function(error, result){});
            await publicCertPool.methods.removeProvider(provider_1).send({from: PublicOwners[0], gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(OwnerAlreadyvoted);
        }
    });

    it("Removing Provider CORRECT",async function(){
        // act
        await ValidatingProviders();
        await publicCertPool.methods.removeProvider(provider_1).send({from: PublicOwners[2], gas: Gas}, function(error, result){});
        await publicCertPool.methods.removeProvider(provider_1).send({from: PublicOwners[0], gas: Gas}, function(error, result){});
        // assert
        let Total = await publicCertPool.methods.retrieveTotalProviders().call({from: user_1}, function(error, result){});
        expect(Total).to.equal("1");
    });

    // ****** TESTING Adding Certificate ***************************************************************** //

    it("Adding Certificate WRONG",async function(){
        // act
        await ValidatingProviders();

        try{
            await publicCertPool.methods.addCertificate(hash_1, holder_1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAProvider);
        }
        // act
        try{
            await publicCertPool.methods.addCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
            await publicCertPool.methods.addCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(CertificateAlreadyExists);
        }
        
    });

    it("Adding Certificate CORRECT",async function(){
        // act
        await ValidatingProviders();
        await AddingCertificate();
        // assert
        let Provider_1 = await publicCertPool.methods.retrieveCertificateProvider(hash_1, holder_1).call({from: user_1}, function(error, result){});
        let Provider_1b = await publicCertPool.methods.retrieveCertificateProvider(hash_1, holder_2).call({from: user_1}, function(error, result){});
        let Provider_2 = await publicCertPool.methods.retrieveCertificateProvider(hash_2, holder_1).call({from: user_1}, function(error, result){});
        let Provider_2b = await publicCertPool.methods.retrieveCertificateProvider(hash_2, holder_2).call({from: user_1}, function(error, result){});
        let TotalHolder_1 = await publicCertPool.methods.retrieveTotalCertificatesByHolder(holder_1).call({from: user_1}, function(error, result){});
        let TotalHolder_2 = await publicCertPool.methods.retrieveTotalCertificatesByHolder(holder_2).call({from: user_1}, function(error, result){});
        let CertificatesHolder1 = await publicCertPool.methods.retrieveCertificatesByHolder(holder_1, 0, 2).call({from: user_1}, function(error, result){});
        let CertificatesHolder1b = await publicCertPool.methods.retrieveCertificatesByHolder(holder_1, 1, 20).call({from: user_1}, function(error, result){});
        let CertificatesHolder2 = await publicCertPool.methods.retrieveCertificatesByHolder(holder_2, 0, 2).call({from: user_1}, function(error, result){});
        let CertificatesHolder2b = await publicCertPool.methods.retrieveCertificatesByHolder(holder_2, 0, 1).call({from: user_1}, function(error, result){});
        
        expect(Provider_1).to.equal(provider_1);
        expect(Provider_1b).to.equal(provider_1);
        expect(Provider_2).to.equal(provider_2);
        expect(Provider_2b).to.equal(provider_2);
        expect(TotalHolder_1).to.equal("2");
        expect(TotalHolder_2).to.equal("2");
        expect(CertificatesHolder1[0]).to.equal(hash_1);
        expect(CertificatesHolder1[1]).to.equal(hash_2);
        expect(CertificatesHolder2[0]).to.equal(hash_1);
        expect(CertificatesHolder2[1]).to.equal(hash_2);
        expect(CertificatesHolder1b[0]).to.equal(hash_2);
        expect(CertificatesHolder2b[0]).to.equal(hash_1);
    });

    // ****** TESTING Removing Certificate ***************************************************************** //

    it("Removing Certificate WRONG",async function(){
        // act
        await ValidatingProviders();
        await AddingCertificate();

        try{
            await publicCertPool.methods.removeCertificate(hash_1, holder_1).send({from: user_1}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAProvider);
        }
        // act
        try{
            await publicCertPool.methods.removeCertificate(hash_1, holder_1).send({from: provider_2}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NotAllowedToRemoveCertificate);
        }
        
    });

    it("Removing Certificate CORRECT",async function(){
        // act
        await ValidatingProviders();
        await AddingCertificate();
        await publicCertPool.methods.removeCertificate(hash_1, holder_1).send({from: provider_1, gas: Gas}, function(error, result){});
        // assert
        let Total = await publicCertPool.methods.retrieveTotalCertificatesByHolder(holder_1).call({from: user_1}, function(error, result){});
        expect(Total).to.equal("1");
    });
 

});
