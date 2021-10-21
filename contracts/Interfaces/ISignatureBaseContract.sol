// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 interface ISignatureBaseContract  {
    function retrieveContractConfig() external view returns(string memory, string memory);
    function retrieveNonce(address addr, uint256 nonce) external view returns(bool);
}