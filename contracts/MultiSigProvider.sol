// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
 import "./Library.sol";
 import "./IProvider.sol";
 import "./MultiSigContract.sol";


 contract MultiSigProvider is IProvider, MultiSigContract {
     using Library for *;

     uint256 constant TotalEntities = 1;

    // Owners
    uint256 constant _ownerIdProviders = 0;
    string constant _ownerLabel = "Owner";
    string[] _Label = [_ownerLabel];

    // Certificates Pools
    CertificatesPool[] _Pools;
     
     // Constructor
    constructor(address[] memory owners,  uint256 minOwners) 
        MultiSigContract(owners, minOwners, TotalEntities, _Label, _ownerIdProviders)
    payable
    {}

    // Pools management
    function addCertificatePool(address NewCertificatePoolAddress) external
    override
    {
        CertificatesPool NewCertificatePool = CertificatesPool(NewCertificatePoolAddress);
        _Pools.push(NewCertificatePool);
    }

    function removeCertificatePool(uint PoolId) external
        isIdCorrect(PoolId, _Pools.length)
    override
    {
        delete _Pools[PoolId];
    }

    function retrieveTotalPools() external 
    override
    view returns(uint256)
    {
        return(_Pools.length);
    }

    function retrievePool(uint PoolId) external 
        isIdCorrect(PoolId, _Pools.length)
    override
    view returns(CertificatesPool)
    {
        return(_Pools[PoolId]);
    }
    
    // Certificates management
     function addCertificate(uint PoolId, string memory CertificateContent, string memory CertificateLocation, bytes memory CertificateHash, address holder) external
        isIdCorrect(PoolId, _Pools.length)
     override
     {
         _Pools[PoolId].addCertificate(CertificateContent, CertificateLocation, CertificateHash, holder);
     }

    function removeCertificate(uint PoolId, uint256 CertificateId, address holder) external 
        isIdCorrect(PoolId, _Pools.length)
    override
    {
        _Pools[PoolId].removeCertificate(CertificateId, holder);
    }

    function updateCertificate(uint PoolId, uint256 CertificateId, address holder, string memory CertificateContent, string memory CertificateLocation, bytes memory CertificateHash) external
        isIdCorrect(PoolId, _Pools.length)
    override
    {
        _Pools[PoolId].updateCertificate(CertificateId, holder, CertificateContent, CertificateLocation, CertificateHash);
    }

    function retrieveTotalCertificatesByHolder(uint PoolId, address holder) external
        isIdCorrect(PoolId, _Pools.length)
    view returns (uint){
        return(_Pools[PoolId].retrieveTotalCertificatesByProviderAndHolder(address(this), holder));
    }

    function retrieveCertificatesByHolder(uint PoolId, address holder) external 
        isIdCorrect(PoolId, _Pools.length)
    view returns (uint256[] memory){
       return(_Pools[PoolId].retrieveCertificatesByProviderAndHolder(address(this), holder));
    }

 }