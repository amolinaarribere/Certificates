// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
 import "./CertificatesPool.sol";

 interface IProvider  {
    function addCertificate(uint PoolId, string memory CertificateContent, string memory CertificateLocation, bytes memory CertificateHash, address holder) external;
    function removeCertificate(uint PoolId, uint256 CertificateId, address holder) external;
    function updateCertificate(uint PoolId, uint256 CertificateId, address holder, string memory CertificateContent, string memory CertificateLocation, bytes memory CertificateHash) external;

    function addCertificatePool(address NewCertificatePoolAddress) external;
    function removeCertificatePool(uint PoolId) external;

    function retrieveTotalPools() external view returns(uint256);
    function retrievePool(uint PoolId) external view returns(CertificatesPool);
    
}