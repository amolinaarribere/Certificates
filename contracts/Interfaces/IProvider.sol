// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
import "../Libraries/Library.sol";
import "../Libraries/ItemsLibrary.sol";

 interface IProvider  {
    function addCertificate(address pool, bytes32 CertificateHash, address holder) external;
    function validateCertificate(address pool, bytes32 CertificateHash, address holder) external;
    function rejectCertificate(address pool, bytes32 CertificateHash, address holder) external;
    function isCertificate(address pool, bytes32 CertificateHash, address holder) external view returns(bool);
    function retrievePendingCertificates() external view returns (Library._pendingCertificatesStruct[] memory);

    function addPool(address pool, string calldata poolInfo, bool mustSubscribe) external;
    function removePool(address pool) external;
    function validatePool(address pool) external;
    function rejectPool(address pool) external;
    function retrievePool(address pool) external view returns (ItemsLibrary._itemIdentity memory);
    function retrievePoolConfg(address pool) external view returns (bool, bool);
    function retrieveAllPools() external view returns (bytes32[] memory);
    function retrievePendingPools(bool addedORremove) external view returns (bytes32[] memory);
    
    receive() external payable;
    
}