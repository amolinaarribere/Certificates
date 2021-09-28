// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Private Certificate Pools offer the default MultiSig Certificate Pool functionality
 */

 import "../Abstract/MultiSigCertificatesPool.sol";

 contract PrivateCertificatesPool is MultiSigCertificatesPool {

    // CONSTRUCTOR & INIT /////////////////////////////////////////
    function PrivateCertPool_init(address[] memory owners,  uint256 minOwners, string memory contractName, string memory contractVersion) public initializer 
    {
      super.MultiSigCertPool_init(owners, minOwners, contractName, contractVersion);
    }

  }