// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Provider Factory inherits from Factory.
  Before creating a new Element a payment is made to Treasury.
  Provider Elements are Beacon Proxy, the Beacon implementation address is stored in Manager contract.
 */

 import "../Interfaces/ITreasury.sol";
 import "../Abstract/Factory.sol";

contract ProviderFactory is Factory{
    
    // CONSTRUCTOR /////////////////////////////////////////
    function ProviderFactory_init(address managerContractAddress) public initializer {
        super.Factory_init("Provider", managerContractAddress);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function create(address[] memory owners,  uint256 minOwners, string memory ElementName, string memory ENSName) external override payable
    {
        ITreasury(_managerContract.retrieveTransparentProxies()[uint256(Library.TransparentProxies.Treasury)]).pay{value:msg.value}(Library.Prices.NewProviderContract);
        (,address ENSReverseAddress,,,,string memory ENSSuffix) = IENS(_managerContract.retrieveTransparentProxies()[uint256(Library.TransparentProxies.ENS)]).retrieveSettings();

        string memory ENSCompleteName = ENSName;
        if(0 < bytes(ENSName).length) ENSCompleteName = string(abi.encodePacked(ENSName, ENSSuffix));

        bytes memory data = abi.encodeWithSignature("Provider_init(address[],uint256,string,string,address)", owners, minOwners, ElementName, ENSCompleteName, ENSReverseAddress);
        internalCreate(_managerContract.retrieveBeacons()[uint256(Library.Beacons.Provider)], data, ElementName, ENSName);
    }


}