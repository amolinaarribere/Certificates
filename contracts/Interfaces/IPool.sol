// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 interface IPool  {
    function addCertificate(bytes32 CertificateHash, address holder) external;
    function removeCertificate(bytes32 CertificateHash, address holder) external;
    function retrieveCertificateProvider(bytes32 CertificateHash, address holder) external view returns (address);
    function retrieveTotalCertificatesByHolder(address holder) external view returns (uint256);
    function retrieveCertificatesByHolder(address holder, uint skipFirst, uint max) external view returns (bytes32[] memory);

    function addProvider(address provider, string memory providerInfo) external;
    function removeProvider(address provider) external;
    function retrieveProvider(address provider) external view returns (string memory, bool);
    function retrieveAllProviders() external view returns (address[] memory);
    function retrieveTotalProviders() external view returns (uint);
    function retrievePendingProviders(bool addedORremove) external view returns (address[] memory, string[] memory);
    
}