// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Mock Contract simulating the ChainLink Feed Registry ETH <-> USD for the tests chains that do not include it
 */

 import "../Interfaces/IENSReverseRegistry.sol";



contract MockENSReverseRegistry is IENSReverseRegistry{

    struct ReverStruct{
        address owner;
        string name;
    }

    mapping(address => ReverStruct) reverseRegistry;

    function claim(address owner) external override returns (bytes32){
        reverseRegistry[msg.sender].owner = owner;
        return 0;
    }

    function claimWithResolver(address owner, address resolver) external override returns (bytes32) {
        return 0;
    }

    function setName(string memory name) external override returns (bytes32){
        reverseRegistry[msg.sender].name = name;
        return 0;
    }

    function node(address addr) external pure override returns (bytes32){
        return 0;
    }

    function defaultResolver() external view override returns (address){
        return address(this);
    }
}