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
    function FindAddress(address add, address[] memory list) internal pure returns (bool){
        for(uint i=0; i < list.length; i++){
            if(add == list[i]) return true;
        }

        return false;
    }

    function FindAddressPosition(address add, address[] memory list) internal pure returns (uint){
        return Library.FindPosition(bytes32(uint256(uint160(add))), AddressArrayToBytes(list));
    }

    function AddressArrayRemoveResize(uint index, address[] memory array) internal 
    pure returns(address[] memory) 
    {
        return BytesArrayToAddress(Library.ArrayRemoveResize(index, AddressArrayToBytes(array)));
    }

    function AddressArrayToBytes(address[] memory array) internal pure returns(bytes32[] memory){
        bytes32[] memory arrayInBytes = new bytes32[](array.length);

        for(uint i=0; i < arrayInBytes.length; i++){
            arrayInBytes[i] = AddressToBytes(array[i]);
        }

        return arrayInBytes;
    }

    function AddressToBytes(address element) internal pure returns(bytes32){
        return bytes32(uint256(uint160(element)));
    }

    function BytesArrayToAddress(bytes32[] memory array) internal pure returns(address[] memory){
        address[] memory arrayInAddress = new address[](array.length);

        for(uint i=0; i < arrayInAddress.length; i++){
            arrayInAddress[i] = BytesToAddress(array[i]);
        }

        return arrayInAddress;
    }

    function BytesToAddress(bytes32 element) internal pure returns(address){
        return address(uint160(uint256(element)));
    }

    function AddressToString(address element) internal pure returns(string memory){
        return Library.BytesToString(AddressToBytes(element));
    }

}