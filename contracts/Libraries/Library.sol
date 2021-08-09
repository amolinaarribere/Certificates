// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

library Library{

    // enum
    enum Prices{NewProvider, NewPool, NewCertificate, NewProviderContract}

    // modifier
    modifier isIdCorrect(uint Id, uint length){
        require(true == IdCorrect(Id, length), "EC1");
        _;
    }

    // Structures
    // Certificate Manager
    struct ProposedContractsStruct{
        address NewPublicPoolAddress;
        address NewTreasuryAddress;
        address NewCertisTokenAddress;
        address NewPrivatePoolFactoryAddress;
        address NewPrivatePoolAddress;
        address NewProviderFactoryAddress;
        address NewProviderAddress;
        bytes NewPublicPoolData;
        bytes NewTreasuryData;
        bytes NewCertisTokenData;
        bytes NewPrivatePoolFactoryData;
        bytes NewProviderFactoryData;
    }

    struct InitialContractsStruct{
        address payable PublicPoolProxyAddress;
        address payable TreasuryProxyAddress;
        address payable CertisTokenProxyAddress;
        address payable PrivatePoolFactoryProxyAddress;
        address PrivateCertificatePoolImplAddress;
        address payable ProviderFactoryProxyAddress;
        address ProviderImplAddress;
    }

    // auxiliary functions
    function IdCorrect(uint Id, uint length) public pure returns (bool){
        return (length > Id);
    }

    function ItIsSomeone(address someone) public view returns(bool){
        if(msg.sender == someone) return true;
        return false;
    }

    function FindPosition(bytes32 data, bytes32[] memory list) public pure returns (uint){
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

    function Bytes32ArrayToString(bytes32[] memory element) internal pure returns(string memory){
        return string(abi.encodePacked(element));
    }

    function BytestoBytes32(bytes memory _b) private pure returns(bytes32[] memory){
        uint num = _b.length / 32;
        bytes32[] memory result = new bytes32[](num + 1);
        uint t = 0;
        
        for(uint i=0; i<_b.length; i = i + 32){
            bytes32 r;
            uint p = i + 32;
             assembly {
                r := mload(add(_b, p))
            }
            result[t] = r;
            t += 1;
        }
       
        return result;
    }
    
}