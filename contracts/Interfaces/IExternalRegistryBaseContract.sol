// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 interface IExternalRegistryBaseContract  {

    function updateRegistryAddress(address NewRegistryAddress) external;

    function retrieveRegistryAddress() external view returns(address);

}