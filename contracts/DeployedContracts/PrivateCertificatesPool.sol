// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Private Certificate Pools offer the default MultiSig Certificate Pool functionality
 */

 import "../Abstract/MultiSigCertificatesPool.sol";
 import "../Base/ReverseRegistryBaseContract.sol";


 contract PrivateCertificatesPool is ReverseRegistryBaseContract, MultiSigCertificatesPool {

    // CONSTRUCTOR & INIT /////////////////////////////////////////
    function PrivateCertPool_init(address[] memory owners,  uint256 minOwners, string memory contractName, string memory contractVersion, string memory ENSName, address ReverseRegistryAddress) public initializer 
    {
      super.MultiSigCertPool_init(owners, minOwners, contractName, contractVersion);

      if(0 < bytes(ENSName).length){
        RegisterReverseAddress(ENSName, ReverseRegistryAddress);
      }
      
    }

  }