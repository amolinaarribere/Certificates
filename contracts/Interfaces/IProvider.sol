// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 interface IProvider  {
    function addCertificate(address pool, bytes32 CertificateHash, address holder, uint nonce) external;
    function removeCertificate(address pool, bytes32 CertificateHash, address holder, uint nonce) external;

    function addPool(address pool, string memory poolInfo, uint nonce) external;
    function removePool(address pool, uint nonce) external;
    function retrievePool(address pool) external view returns (string memory, bool);
    function retrieveAllPools() external view returns (address[] memory);
    function retrieveTotalPools() external view returns (uint);
    
}