// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Private Certificate Pools offer the default MultiSig Certificate Pool functionality
 */

 import "../Interfaces/IENSReverseRegistry.sol";

 contract ReverseRegistryBaseContract {

    // EVENTS /////////////////////////////////////////
    event _NewReverseENSCreated(string ENSName, bytes32 node, address addr);

    // CONSTRUCTOR & INIT /////////////////////////////////////////
    function RegisterReverseAddress(string memory ENSName, address ReverseRegistryAddress) internal 
    {
        IENSReverseRegistry ReverseRegistry = IENSReverseRegistry(ReverseRegistryAddress);
        bytes32 node = ReverseRegistry.setName(ENSName);
        emit _NewReverseENSCreated(ENSName, node, address(this));
    }

  }