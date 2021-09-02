// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
import "../Libraries/Library.sol";

 interface IProvider  {
    function addCertificate(address pool, bytes32 CertificateHash, address holder) external;
    function validateCertificate(address pool, bytes32 CertificateHash, address holder) external;
    function rejectCertificate(address pool, bytes32 CertificateHash, address holder) external;
    function isCertificate(address pool, bytes32 CertificateHash, address holder) external view returns(bool);
    function retrievePendingCertificates() external view returns (Library._pendingCertificatesStruct[] memory);

    //function addPool(address pool, string calldata poolInfo, uint256 AddCertificatePrice, uint256 SubscriptionPrice, bool mustSubscribe) external;
    function addPool(address pool, string calldata poolInfo, bool mustSubscribe) external;
    function removePool(address pool) external;
    function validatePool(address pool) external;
    function rejectPool(address pool) external;
    //function retrievePool(address pool) external view returns (string memory, bool, uint256, uint256, bool);
    function retrievePool(address pool) external view returns (string memory, bool, bool);
    function retrieveAllPools() external view returns (bytes32[] memory);
    function retrievePendingPools(bool addedORremove) external view returns (bytes32[] memory, string[] memory);
    
    receive() external payable;
    
}