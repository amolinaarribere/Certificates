// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
 import "../Libraries/ItemsLibrary.sol";

 interface IPool  {
    function addCertificate(bytes32 CertificateHash, address holder) external payable;
    function addCertificateOnBehalfOf(address provider, bytes32 CertificateHash, address holder, uint256 nonce, uint256 deadline, bytes memory signature) external payable;
    function transferCertificate(bytes32 CertificateHash, address newHolder) external;
    function retrieveCertificateProvider(bytes32 CertificateHash, address holder) external view returns (address);
    function retrieveTotalCertificatesByHolder(address holder) external view returns (uint256);
    function retrieveCertificatesByHolder(address holder, uint skipFirst, uint max) external view returns (bytes32[] memory);

    function retrieveAddCertificatePriceWei() external view returns(uint256);
    function retrieveSubscriptionPriceWei() external view returns(uint256);

    function addProvider(address provider, string calldata providerInfo) external payable;
    function removeProvider(address provider) external;
    function validateProvider(address provider) external;
    function rejectProvider(address provider) external;
    function retrieveProvider(address provider) external view returns (ItemsLibrary._itemIdentity memory);
    function retrieveAllProviders() external view returns (bytes32[] memory);
    function retrievePendingProviders(bool addedORremove) external view returns (bytes32[] memory);
    
}