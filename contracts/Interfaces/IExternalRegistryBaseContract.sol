// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 interface IExternalRegistryBaseContract  {

    function update(address NewRegistryAddress, bytes32[] memory NewOthers) external;

    function retrieveRegistryAddress() external view returns(address);

}