const Migrations = artifacts.require("./Migration/Migrations");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
