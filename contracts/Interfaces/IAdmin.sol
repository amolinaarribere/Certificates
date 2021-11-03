// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 interface IAdmin  {
    function retrieveManagerProxy() external view returns (address);
    function retrieveManager() external returns (address);
}