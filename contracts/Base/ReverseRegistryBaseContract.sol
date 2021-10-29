// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Private Certificate Pools offer the default MultiSig Certificate Pool functionality
 */

 import "../Interfaces/IENSReverseRegistry.sol";

 contract ReverseRegistryBaseContract {

    // CONSTRUCTOR & INIT /////////////////////////////////////////
    function RegisterReverseAddress(string memory ENSName, address ReverseRegistryAddress) internal 
    {
        IENSReverseRegistry ReverseRegistry = IENSReverseRegistry(ReverseRegistryAddress);
        ReverseRegistry.setName(ENSName);
    }

  }