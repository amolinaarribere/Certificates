// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

 interface ICertisToken is IERC20Upgradeable {
    function RegisterProp(uint256 deadline) external returns (uint256);
    function RemoveProp(uint256 id) external;
    function Voted(uint256 id, address voter, uint256 votingTokens) external;

    function GetVotingTokens(uint256 id, address addr) external view returns(uint256);
 }