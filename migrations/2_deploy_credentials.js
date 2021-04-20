let Credentials = artifacts.require("./Credentials.sol");

module.exports = async function(deployer){
    await deployer.deploy(Credentials);
}