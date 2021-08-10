// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */


interface IFactory {

    function create(address[] memory owners,  uint256 minOwners, string memory ElementName) external payable;

    function retrieve(uint Id) external view returns (address, address);

    function retrieveTotal() external view returns (uint);

}