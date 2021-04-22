let Proposals = artifacts.require("./Proposals.sol");

module.exports = async function(deployer){
    await deployer.deploy(Proposals);
}