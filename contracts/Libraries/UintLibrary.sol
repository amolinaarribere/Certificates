// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./Library.sol";

library UintLibrary{
    using Library for *;

    // auxiliary functions

    function FindUintPosition(uint value, uint[] memory list) public pure returns (uint){
        return Library.FindPosition(bytes32(value), UintArrayToBytes32Array(list));
    }

    function UintArrayRemoveResize(uint index, uint[] memory array) public 
    pure returns(uint[] memory) 
    {
        return Bytes32ArrayToUintArray(Library.ArrayRemoveResize(index, UintArrayToBytes32Array(array)));
    }

    function UintArrayToBytes32Array(uint[] memory array) public pure returns(bytes32[] memory){
        bytes32[] memory arrayInBytes = new bytes32[](array.length);

        for(uint i=0; i < arrayInBytes.length; i++){
            arrayInBytes[i] = UintToBytes32(array[i]);
        }

        return arrayInBytes;
    }

    function UintToBytes32(uint element) public pure returns(bytes32){
        return bytes32(element);
    }

    function Bytes32ArrayToUintArray(bytes32[] memory array) public pure returns(uint[] memory){
        uint[] memory arrayInUint = new uint[](array.length);

        for(uint i=0; i < arrayInUint.length; i++){
            arrayInUint[i] = Bytes32ToUint(array[i]);
        }

        return arrayInUint;
    }

    function Bytes32ToUint(bytes32 element) public pure returns(uint){
        return uint256(element);
    }

}