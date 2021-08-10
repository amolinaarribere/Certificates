// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Libraries/Library.sol";
import "../Interfaces/IProxyManager.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ManagedBaseContract is Initializable{
    using Library for *;

    // DATA /////////////////////////////////////////
    IProxyManager _managerContract;

    // MODIFIERS /////////////////////////////////////////
     modifier isFromManagerContract(){
        require(true == Library.ItIsSomeone(address(_managerContract)), "EC8");
        _;
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function ManagedBaseContract_init(address managerContractAddress) internal initializer {
        _managerContract = IProxyManager(managerContractAddress);
    }

}