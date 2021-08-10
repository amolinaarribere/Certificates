// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

 interface ICertisToken is IERC20Upgradeable {
    function TokenOwners() external view returns (address[] memory, uint256[] memory);
 }