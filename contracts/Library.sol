// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

library Library{
    function IdCorrect(uint Id, uint length) public pure returns (bool){
        return (length > Id);
    }
}