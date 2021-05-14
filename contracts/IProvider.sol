// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
 import "./MultiSigCertificatesPool.sol";

 interface IProvider  {
    function addCertificate(address pool, bytes memory CertificateHash, address holder) external;
    function removeCertificate(address pool, uint256 CertificateId, address holder) external;
    function updateCertificate(address pool, uint256 CertificateId, address holder, bytes memory CertificateHash) external;

    function addPool(address pool, string memory poolInfo) external;
    function removePool(address pool) external;
    function updatePool(address pool, string memory poolInfo) external;
    function retrievePool(address pool) external view returns (string memory);
    function retrieveAllPools() external view returns (address[] memory);
    function retrieveTotalPools() external view returns (uint);
    
}