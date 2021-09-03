// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Manager Contract is a Base contract that simply adds a manager contract as a reference for multiple operations
 */

import "../Libraries/Library.sol";
import "../Interfaces/IProxyManager.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ManagedBaseContract is Initializable{
    using Library for *;

    // DATA /////////////////////////////////////////
    IProxyManager internal _managerContract;

    // MODIFIERS /////////////////////////////////////////
     modifier isFromManagerContract(){
        require(true == Library.ItIsSomeone(address(_managerContract)), "EC8-");
        _;
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function ManagedBaseContract_init(address managerContractAddress) internal initializer {
        _managerContract = IProxyManager(managerContractAddress);
    }

}