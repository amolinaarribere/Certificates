// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "./Library.sol";

library AddressLibrary{
    using Library for *;

    // auxiliary functions
    function FindAddress(address add, address[] memory list) public pure returns (bool){
        for(uint i=0; i < list.length; i++){
            if(add == list[i]) return true;
        }

        return false;
    }

    function FindAddressPosition(address add, address[] memory list) public pure returns (uint){
        return Library.FindPosition(bytes32(uint256(uint160(add))), AddressArrayToBytes32Array(list));
    }

    function AddressArrayRemoveResize(uint index, address[] memory array) public 
    pure returns(address[] memory) 
    {
        return Bytes32ArrayToAddressArray(Library.ArrayRemoveResize(index, AddressArrayToBytes32Array(array)));
    }

    function AddressArrayToBytes32Array(address[] memory array) public pure returns(bytes32[] memory){
        bytes32[] memory arrayInBytes = new bytes32[](array.length);

        for(uint i=0; i < arrayInBytes.length; i++){
            arrayInBytes[i] = AddressToBytes32(array[i]);
        }

        return arrayInBytes;
    }

    function AddressToBytes32(address element) public pure returns(bytes32){
        return bytes32(uint256(uint160(element)));
    }

    function Bytes32ArrayToAddressArray(bytes32[] memory array) public pure returns(address[] memory){
        address[] memory arrayInAddress = new address[](array.length);

        for(uint i=0; i < arrayInAddress.length; i++){
            arrayInAddress[i] = Bytes32ToAddress(array[i]);
        }

        return arrayInAddress;
    }

    function Bytes32ToAddress(bytes32 element) public pure returns(address){
        return address(uint160(uint256(element)));
    }

    function UintToAddress(uint element) public pure returns(address){
        return address(uint160(element));
    }

    function AddressToUint(address element) public pure returns(uint){
        return uint256(uint160(element));
    }

}