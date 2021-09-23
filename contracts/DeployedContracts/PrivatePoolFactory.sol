// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Private Pool Factory inherits from Factory.
  Before creating a new Element a payment is made to Treasury.
  Private Pool Elements are Beacon Proxy, the Beacon implementation address is stored in Manager contract.
 */

 import "../Interfaces/ITreasury.sol";
 import "../Abstract/Factory.sol";
 import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract PrivatePoolFactory is Factory{

    // CONSTRUCTOR /////////////////////////////////////////
    function PrivatePoolFactory_init(address managerContractAddress) public initializer {
        super.Factory_init(managerContractAddress);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function create(address[] memory owners,  uint256 minOwners, string memory ElementName) external override payable
    {
        ITreasury(_managerContract.retrieveTreasuryProxy()).pay{value:msg.value}(Library.Prices.NewPool);
        bytes memory data = abi.encodeWithSignature("PrivateCertPool_init(address[],uint256)", owners, minOwners);
        BeaconProxy certificatePoolProxy = new BeaconProxy(_managerContract.retrievePrivatePoolBeacon(), data);
        internalCreate(address(certificatePoolProxy), "Private Pool", ElementName);
    }


}