// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./Library.sol";

library UintLibrary{
    using Library for *;

    // auxiliary functions

    function FindUintPosition(uint value, uint[] memory list) public pure returns (uint){
        return Library.FindPosition(bytes32(value), UintArrayToBytes(list));
    }

    function UintArrayRemoveResize(uint index, uint[] memory array) public 
    pure returns(uint[] memory) 
    {
        return BytesArrayToUint(Library.ArrayRemoveResize(index, UintArrayToBytes(array)));
    }

    function UintArrayToBytes(uint[] memory array) internal pure returns(bytes32[] memory){
        bytes32[] memory arrayInBytes = new bytes32[](array.length);

        for(uint i=0; i < arrayInBytes.length; i++){
            arrayInBytes[i] = UintToBytes(array[i]);
        }

        return arrayInBytes;
    }

    function UintToBytes(uint element) internal pure returns(bytes32){
        return bytes32(element);
    }

    function BytesArrayToUint(bytes32[] memory array) internal pure returns(uint[] memory){
        uint[] memory arrayInUint = new uint[](array.length);

        for(uint i=0; i < arrayInUint.length; i++){
            arrayInUint[i] = BytesToUint(array[i]);
        }

        return arrayInUint;
    }

    function BytesToUint(bytes32 element) internal pure returns(uint){
        return uint256(element);
    }

    function UintToString(uint element) internal pure returns(string memory){
        return Library.BytesToString(UintToBytes(element));
    }

}