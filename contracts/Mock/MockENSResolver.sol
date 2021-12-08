// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Mock Contract simulating the ChainLink Feed Registry ETH <-> USD for the tests chains that do not include it
 */

 import "../Interfaces/IENSResolver.sol";



contract MockENSResolver is IENSResolver{
    mapping(bytes32 => address) list;

    function addr(bytes32 node) external override view returns (address){
        return list[node];
    }

    function setAddr(bytes32 node, address addr) external override{
        list[node] = addr;
    }
}