// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

library Library{

    // modifier
    modifier isIdCorrect(uint Id, uint length){
        require(true == IdCorrect(Id, length), "EC1");
        _;
    }

    // auxiliary functions
    function IdCorrect(uint Id, uint length) public pure returns (bool){
        return (length > Id);
    }

    function CheckValidations(uint256 signatures, uint256 minSignatures) internal pure returns(bool){
        if(signatures < minSignatures) return false;
        return true;
    }

    function FindPosition(bytes32 data, bytes32[] memory list) internal pure returns (uint){
        for(uint i=0; i < list.length; i++){
            if(data == list[i]) return i;
        }

        return list.length + 1;
    }

    function ArrayRemoveResize(uint index, bytes32[] memory array) public 
        isIdCorrect(index, array.length)
    pure returns(bytes32[] memory) 
    {
        bytes32[] memory newArray = new bytes32[](array.length - 1);
        array[index] = array[array.length - 1];
        
        for(uint i=0; i < newArray.length; i++){
            newArray[i] = array[i];
        }
        
        return newArray;
    }
    
}