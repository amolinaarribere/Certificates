// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 interface IENS  {

    function createSubdomain(bytes32 label) external;
    
    function retrieveNodes() external view returns(bytes32[] memory);

}