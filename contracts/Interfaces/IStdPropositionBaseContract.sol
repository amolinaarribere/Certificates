// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 interface IStdPropositionBaseContract  {

    function sendProposition(bytes32[] memory NewValues) external;

    function retrieveProposition() external view returns(bytes32[] memory);

}