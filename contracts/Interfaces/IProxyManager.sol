// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 interface IProxyManager  {
    function retrievePublicCertificatePoolProxy() external view returns (address);
    function retrieveTreasuryProxy() external view returns (address);
    function retrieveCertisTokenProxy() external view returns (address);
    function retrievePrivatePoolGeneratorProxy() external view returns (address);
}