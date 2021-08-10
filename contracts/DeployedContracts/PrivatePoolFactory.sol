// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../Interfaces/ITreasury.sol";
 import "../Libraries/Library.sol";
 import "../Abstract/Factory.sol";
 import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
 import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract PrivatePoolFactory is Initializable, Factory{
    using Library for *;

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