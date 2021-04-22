// Chai library for testing

var Proposals = artifacts.require("./Proposals.sol");
//var CredentialsAbiStr = artifacts.require("./Credentials.json");
var fs = require("fs");
var CredentialsAbiStr = fs.readFileSync("C:/Users/d-aam/Truffle/build/contracts/Credentials.json", "utf8");
var CredentialsAbi = JSON.parse(CredentialsAbiStr).abi;

contract("Testing Proposals",function(accounts){
    var proposals;
    var credentialsAddress;
    var credentials;
    // used addresses
    const chairPerson = accounts[0];
    const provider_1 = accounts[1];  
    const user_1 = accounts[3];
    // providers info
    const provider_1_Info = "Account 1 Info";
    const provider_2_Info = "Account 2 Info";
    // test constants
    const addressesLength = 42;
    const PriceWei = 10;
    const NotEnoughFunds = new RegExp(/(Not enough funds)/g);
    const NotAllowedToApproveProposals = new RegExp(/(Not allowed to approve proposals)/g);
    const Gas = 600000;

    beforeEach(async function(){
        proposals = await Proposals.new({from: chairPerson});
        credentialsAddress = await proposals.retrieveCredentialsContractAddress({from: user_1});
        //console.log(CredentialsAbi.abi);
        credentials = new web3.eth.Contract(CredentialsAbi, credentialsAddress);
    });

    it("Retrieve Chair Person",async function(){
        // act
        let _chairPerson = await proposals.retrieveChairPerson({from: user_1});
        // assert
        expect(_chairPerson).to.equal(chairPerson);
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
        }
    });

    it("Approve Proposal CORRECT Chair Person",async function(){
        
        await proposals.sendProposal(provider_1, provider_1_Info, {from: user_1, gas: Gas, value: PriceWei});
        await proposals.approveProposal(provider_1, {from: chairPerson, gas: Gas});
        var info = await credentials.methods.retrieveProvider(provider_1).call({from: user_1}, function(error, result){});
        expect(info).to.be.equal(provider_1_Info);
    });
    
});