// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 interface IProvider  {
    function addCertificate(address pool, bytes32 CertificateHash, address holder) external;
    function removeCertificate(address pool, bytes32 CertificateHash, address holder) external;

    function subscribeToPublicPool(address pool, string memory poolInfo, uint256 AddCertificatePrice, uint256 SubscriptionPrice) external;
    function addPool(address pool, string memory poolInfo, uint256 AddCertificatePrice) external;
    function removePool(address pool) external;
    function retrievePool(address pool) external view returns (string memory, bool, uint256);
    function retrieveAllPools() external view returns (address[] memory);

    receive() external payable;
    
}