const constants = require("./constants.js");

const PropositionLifeTime = constants.PropositionLifeTime;
const PropositionThresholdPercentage = constants.PropositionThresholdPercentage;
const minPercentageToPropose = constants.minPercentageToPropose;
const TotalTokenSupply = constants.TotalTokenSupply;
const Gas = constants.Gas;

// test constants
const Unauthorized = new RegExp("EC8-");
const CannotProposeChanges = new RegExp("EC22-");
const WrongConfig = new RegExp("EC21-");
const NoPropositionActivated = new RegExp("EC25-");
const PropositionAlreadyInProgress = new RegExp("EC24-");
const CanNotVote = new RegExp("EC23-");

function AddressToBytes32(address){
    return (address.substring(0,2) + "000000000000000000000000" +  address.substring(2,address.length));
}

async function SplitTokenSupply(CT, tokenOwner, chairPerson){
    await CT.methods.transfer(tokenOwner[0], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    await CT.methods.transfer(tokenOwner[1], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    await CT.methods.transfer(tokenOwner[2], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    await CT.methods.transfer(tokenOwner[3], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
    await CT.methods.transfer(tokenOwner[4], (TotalTokenSupply / 5)).send({from: chairPerson, gas: Gas}, function(error, result){});
}

async function checkProp(_plt, _ptp, _mp, user_1, contractAddress){
    const{0:plt,1:ptp,2:mp} = await contractAddress.methods.retrieveSettings().call({from: user_1}, function(error, result){});
    expect(parseInt(plt)).to.be.equal(_plt);
    expect(parseInt(ptp)).to.be.equal(_ptp);
    expect(parseInt(mp)).to.be.equal(_mp);
}

async function Config_Proposition_Wrong(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson){
    // act
    await SplitTokenSupply(certisTokenProxy, tokenOwner, chairPerson);
    try{
        await contractAddress.methods.updateSettings(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose).send({from: user_1, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(CannotProposeChanges);
    }
    // act
    try{
        await contractAddress.methods.updateSettings(PropositionLifeTime, 101, minPercentageToPropose).send({from: chairPerson, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(WrongConfig);
    }
    // act
    try{
        await contractAddress.methods.updateSettings(PropositionLifeTime, PropositionThresholdPercentage, 101).send({from: chairPerson, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(WrongConfig);
    }
    // act
    try{
        await contractAddress.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NoPropositionActivated);
    }
    // act
    try{
        await contractAddress.methods.cancelProposition().send({from: chairPerson, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NoPropositionActivated);
    }
    // act
    try{
        await contractAddress.methods.updateSettings(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose).send({from: chairPerson, gas: Gas}, function(error, result){});
        await contractAddress.methods.voteProposition(false).send({from: chairPerson, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(CanNotVote);
    }
    // act
    try{
        await contractAddress.methods.cancelProposition().send({from: tokenOwner[0], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(Unauthorized);
    }
    // act
    try{
        await contractAddress.methods.updateSettings(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose).send({from: chairPerson, gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(PropositionAlreadyInProgress);
    }
    // act
    try{
        await contractAddress.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
        await contractAddress.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(CanNotVote);
    }
    // act
    try{
        await contractAddress.methods.voteProposition(false).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
        await contractAddress.methods.voteProposition(false).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
        await contractAddress.methods.voteProposition(false).send({from: tokenOwner[3], gas: Gas}, function(error, result){});
        expect.fail();
    }
    // assert
    catch(error){
        expect(error.message).to.match(NoPropositionActivated);
    }
    
};

async function Config_Proposition_Correct(contractAddress, certisTokenProxy, tokenOwner, user_1, chairPerson){
    // act
    await SplitTokenSupply(certisTokenProxy, tokenOwner, chairPerson);

    // Rejected
     await contractAddress.methods.updateSettings(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
     await contractAddress.methods.voteProposition(true).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, user_1, contractAddress);
     await contractAddress.methods.voteProposition(false).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, user_1, contractAddress);
     await contractAddress.methods.voteProposition(false).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, user_1, contractAddress);
     await contractAddress.methods.voteProposition(false).send({from: tokenOwner[3], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, user_1, contractAddress);

     // Cancelled
     await contractAddress.methods.updateSettings(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
     await contractAddress.methods.voteProposition(true).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, user_1, contractAddress);
     await contractAddress.methods.voteProposition(true).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, user_1, contractAddress);
     await contractAddress.methods.cancelProposition().send({from: tokenOwner[2], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, user_1, contractAddress);


     // Validated
     await contractAddress.methods.updateSettings(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
     await contractAddress.methods.voteProposition(true).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, user_1, contractAddress);
     await contractAddress.methods.voteProposition(true).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime, PropositionThresholdPercentage, minPercentageToPropose, user_1, contractAddress);
     await contractAddress.methods.voteProposition(true).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1, user_1, contractAddress);

    // Validated again
     await contractAddress.methods.updateSettings(PropositionLifeTime + 2, PropositionThresholdPercentage + 2, minPercentageToPropose + 2).send({from: tokenOwner[3], gas: Gas}, function(error, result){});
     await contractAddress.methods.voteProposition(true).send({from: tokenOwner[3], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1, user_1, contractAddress);
     await contractAddress.methods.voteProposition(false).send({from: tokenOwner[0], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1, user_1, contractAddress);
     await contractAddress.methods.voteProposition(true).send({from: tokenOwner[1], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1, user_1, contractAddress);
     await contractAddress.methods.voteProposition(false).send({from: tokenOwner[2], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime + 1, PropositionThresholdPercentage + 1, minPercentageToPropose + 1, user_1, contractAddress);
     await contractAddress.methods.voteProposition(true).send({from: tokenOwner[4], gas: Gas}, function(error, result){});
     await checkProp(PropositionLifeTime + 2, PropositionThresholdPercentage + 2, minPercentageToPropose + 2, user_1, contractAddress);
    
};

exports.AddressToBytes32 = AddressToBytes32;
exports.Config_Proposition_Wrong = Config_Proposition_Wrong;
exports.Config_Proposition_Correct = Config_Proposition_Correct;
exports.SplitTokenSupply = SplitTokenSupply;