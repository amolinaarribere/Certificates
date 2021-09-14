// Chai library for testing
// ERROR tests = First we test the error message then we test the action was not carried out

const CertificatesPoolManager = artifacts.require("CertificatesPoolManager");
const CertificatesPoolManagerAbi = CertificatesPoolManager.abi;
const Treasury = artifacts.require("Treasury");
const TreasuryAbi = Treasury.abi;
const PublicCertificatesPool = artifacts.require("PublicCertificatesPool");
const PublicCertificatesPoolAbi = PublicCertificatesPool.abi;
const CertisToken = artifacts.require("CertisToken");
const CertisTokenAbi = CertisToken.abi;
const PrivatePoolFactory = artifacts.require("PrivatePoolFactory");
const PrivatePoolFactoryAbi = PrivatePoolFactory.abi;
const ProviderFactory = artifacts.require("ProviderFactory");
const ProviderFactoryAbi = ProviderFactory.abi;
const PriceConverter = artifacts.require("PriceConverter");
const PriceConverterAbi = PriceConverter.abi;

const init = require("../test_libraries/InitializeContracts.js");
const constants = require("../test_libraries/constants.js");
const obj = require("../test_libraries/objects.js");
const proposition = require("../test_libraries/Propositions.js");

const Gas = constants.Gas;

const FactorUSDtoETH = Math.pow(10, 18 + constants.decimals) / constants.factor;

// TEST -------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------

contract("Testing Price Converter",function(accounts){
    var certPoolManager;
    var certisTokenProxy;
    var priceConverterProxy;
    var priceConverter;
    var registryAddress;

    // used addresses
    const chairPerson = accounts[0];
    const PublicOwners = [accounts[1], accounts[2], accounts[3]];
    const minOwners = 2;
    const user_1 = accounts[4];
    const tokenOwner = [accounts[5], accounts[6], accounts[7], accounts[8], accounts[9]];
    const address_1 = "0x0000000000000000000000000000000000000001";
    // test constants
    const Unauthorized = new RegExp("EC22-");
    const WrongConfig = new RegExp("EC21-");
    const NoPropositionActivated = new RegExp("EC25-");
    const PropositionAlreadyInProgress = new RegExp("EC24-");
    const CanNotVote = new RegExp("EC23-");

    beforeEach(async function(){
        let contracts = await init.InitializeContracts(chairPerson, PublicOwners, minOwners, user_1);
        certPoolManager = contracts[0];
        certisTokenProxy = new web3.eth.Contract(CertisTokenAbi, contracts[1][2]);
        priceConverterProxy = new web3.eth.Contract(PriceConverterAbi, contracts[1][5]);
        priceConverter = contracts[2][7];
        registryAddress = await priceConverterProxy.methods.retrieveRegistryAddress().call({from: user_1}, function(error, result){});
    });

    async function checkAddress(_address){
        let _registryAddress =  await priceConverterProxy.methods.retrieveRegistryAddress().call({from: user_1}, function(error, result){});
        expect(_address).to.equal(_registryAddress);
    }

    async function checkProposition(_address){
        var propositionResult = await priceConverterProxy.methods.retrieveProposition().call({from: user_1}, function(error, result){});
        let _registryAddressProposed = propositionResult[0];

        expect(proposition.AddressToBytes32(_address)).to.equal(_registryAddressProposed);
    }

    // ****** TESTING Retrieves ***************************************************************** //

    it("Retrieve Exchange Rate ETH - USD",async function(){
        // act
        let amount = 12;
        let result = await priceConverterProxy.methods.fromUSDToETH(amount).call({from: user_1, gas: Gas}, function(error, result){});
        // assert
        expect(parseInt(result)).to.equal(amount * FactorUSDtoETH);
        
    });

    it("Retrieve Proposals Details",async function(){
        // act
        await proposition.SplitTokenSupply(certisTokenProxy, tokenOwner, chairPerson);
        await priceConverterProxy.methods.updateRegistryAddress(address_1).send({from: chairPerson, gas: Gas}, function(error, result){});
        // assert
        await checkProposition(address_1);
        
    });

    // ****** Testing Registry Configuration ***************************************************************** //
   
    it("Vote/Propose/Cancel Registry Address WRONG",async function(){
         // act
         await proposition.SplitTokenSupply(certisTokenProxy, tokenOwner, chairPerson);
         // act
        try{
            await priceConverterProxy.methods.updateRegistryAddress(address_1).send({from: user_1, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(Unauthorized);
        }
        // act
        try{
            await priceConverterProxy.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
        // act
        try{
            await priceConverterProxy.methods.cancelProposition().send({from: chairPerson, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
        // act
        try{
            await priceConverterProxy.methods.updateRegistryAddress(address_1).send({from: chairPerson, gas: Gas}, function(error, result){});
            await priceConverterProxy.methods.voteProposition(false).send({from: chairPerson, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(CanNotVote);
        }
        // act
        try{
            await priceConverterProxy.methods.cancelProposition().send({from: tokenOwner[0], gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(Unauthorized);
        }
        // act
        try{
            await priceConverterProxy.methods.updateRegistryAddress(address_1).send({from: chairPerson, gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(PropositionAlreadyInProgress);
        }
        // act
        try{
            await priceConverterProxy.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
            await priceConverterProxy.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(CanNotVote);
        }
        // act
        try{
            await priceConverterProxy.methods.voteProposition(false).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
            await priceConverterProxy.methods.voteProposition(false).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
            await priceConverterProxy.methods.voteProposition(false).send({from: tokenOwner[3], gas: Gas}, function(error, result){});
            expect.fail();
        }
        // assert
        catch(error){
            expect(error.message).to.match(NoPropositionActivated);
        }
        
    });

    it("Vote/Propose/Cancel Registry Address CORRECT",async function(){
        // act
        await proposition.SplitTokenSupply(certisTokenProxy, tokenOwner, chairPerson);

        // Rejected 
        await priceConverterProxy.methods.updateRegistryAddress(address_1).send({from: chairPerson, gas: Gas}, function(error, result){});
        await checkAddress(registryAddress);
        await priceConverterProxy.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
        await checkAddress(registryAddress);
        await priceConverterProxy.methods.voteProposition(false).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
        await checkAddress(registryAddress);
        await priceConverterProxy.methods.voteProposition(false).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
        await checkAddress(registryAddress);

        // Cancelled
        await priceConverterProxy.methods.updateRegistryAddress(address_1).send({from: chairPerson, gas: Gas}, function(error, result){});
        await checkAddress(registryAddress);
        await priceConverterProxy.methods.voteProposition(true).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
        await checkAddress(registryAddress);
        await priceConverterProxy.methods.voteProposition(true).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
        await checkAddress(registryAddress);
        await priceConverterProxy.methods.cancelProposition().send({from: chairPerson, gas: Gas}, function(error, result){});
        await checkAddress(registryAddress);

        // Validated
        await priceConverterProxy.methods.updateRegistryAddress(address_1).send({from: chairPerson, gas: Gas}, function(error, result){});
        await checkAddress(registryAddress);
        await priceConverterProxy.methods.voteProposition(true).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
        await checkAddress(registryAddress);
        await priceConverterProxy.methods.voteProposition(true).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
        await checkAddress(registryAddress);
        await priceConverterProxy.methods.voteProposition(true).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
        await checkAddress(address_1);

        // Validated again
        await priceConverterProxy.methods.updateRegistryAddress(registryAddress).send({from: chairPerson, gas: Gas}, function(error, result){});
        await checkAddress(address_1);
        await priceConverterProxy.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
        await checkAddress(address_1);
        await priceConverterProxy.methods.voteProposition(true).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
        await checkAddress(address_1);
        await priceConverterProxy.methods.voteProposition(false).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
        await checkAddress(address_1);
        await priceConverterProxy.methods.voteProposition(true).send({from: tokenOwner[3], gas: Gas}, function(error, result){});
        await checkAddress(address_1);
        await priceConverterProxy.methods.voteProposition(true).send({from: tokenOwner[4], gas: Gas}, function(error, result){});
        await checkAddress(registryAddress);
        
    });

    // ****** Testing Propostion Configuration ***************************************************************** // 

    it("Vote/Propose/Cancel Prop Configuration WRONG",async function(){
        await proposition.Config_Proposition_Wrong(priceConverterProxy, certisTokenProxy, tokenOwner, user_1, chairPerson);
    });

    it("Vote/Propose/Cancel Prop Configuration CORRECT",async function(){
        await proposition.Config_Proposition_Correct(priceConverterProxy, certisTokenProxy, tokenOwner, user_1, chairPerson);
    });

});
