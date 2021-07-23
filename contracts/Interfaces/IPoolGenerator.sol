// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */


interface IPoolGenerator {

    function createPrivateCertificatesPool(address[] memory owners,  uint256 minOwners) external payable;

    function retrievePrivateCertificatesPool(uint certificatePoolId) external view returns (address, address);

    function retrieveTotalPrivateCertificatesPool() external view returns (uint);

}