// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../Abstract/MultiSigCertificatesPool.sol";
 import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

 contract PrivateCertificatesPool is Initializable, MultiSigCertificatesPool {

    // CONSTRUCTOR & INIT /////////////////////////////////////////
    function PrivateCertPool_init(address[] memory owners,  uint256 minOwners) public initializer 
    {
      super.MultiSigCertPool_init(owners, minOwners);
    }

  }