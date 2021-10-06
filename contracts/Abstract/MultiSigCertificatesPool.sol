// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  MultiSig Certificate Pool Contract.
    Inherits from MultiSig and simply defines CRUD operations for Providers as a second Entity next to Owners
    Also allows for Certificates to be generated for specific holders
 */

import "./MultiSigContract.sol";
import "../Interfaces/IPool.sol";
import "../Base/SignatureBaseContract.sol";
import "../Libraries/SignatureLibrary.sol";


abstract contract MultiSigCertificatesPool is IPool, SignatureBaseContract, MultiSigContract { 
    using SignatureLibrary for *;

    // EVENTS /////////////////////////////////////////
    event _AddCertificate(address indexed Provider, address indexed Holder, bytes32 Certificate);

    // DATA /////////////////////////////////////////
    // Contract configuration
    uint256 constant _TotalEntities = 2;

    // Owners
    uint256 constant _ownerIdCertificates = 0;
    string constant _ownerLabel = "Owner";

    // Providers
    uint256 constant _providerId = 1;
    string constant _providerLabel = "Provider";

    string[] internal _Label;
    // Holders
    struct _CertificatePerHolder{
        mapping(bytes32 => address) _CertificateFromProvider;
        bytes32[] _ListOfCertificates;
    }
    
    mapping(address => _CertificatePerHolder) private _CertificatesPerHolder;

    // MODIFIERS /////////////////////////////////////////
    modifier isAProvider(address provider){
        require(true == isProvider(provider), "EC12-");
        _;
    }

    modifier isTheProvider(address holder, bytes32 CertificateHash){
        require(msg.sender == _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash], "EC13-");
        _;
    }

    modifier isTheProviderOrHimself(address holder, bytes32 CertificateHash){
        require(msg.sender == _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash] || msg.sender == holder, "EC14-");
        _;
    }
    
    modifier CertificateDoesNotExist(address holder, bytes32 CertificateHash){
        require(address(0) == _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash], "EC15-");
        _;
    }
    
    // CONSTRUCTOR /////////////////////////////////////////
    function MultiSigCertPool_init(address[] memory owners,  uint256 minOwners, string memory contractName, string memory contractVersion) public initializer 
    {
        _Label = new string[](2);
        _Label[0] = _ownerLabel;
        _Label[1] = _providerLabel;
        setContractConfig(contractName, contractVersion);
        super.MultiSigContract_init(owners, minOwners, _TotalEntities, _Label, _ownerIdCertificates); 
    }

    // FUNCTIONALITY /////////////////////////////////////////
    // Providers CRUD Operations
    function addProvider(address provider, string calldata providerInfo) external override payable virtual
    {
        addEntity(provider, providerInfo, _providerId);
    }

    function removeProvider(address provider) external override
    {
       removeEntity(provider, _providerId); 
    }   

    function validateProvider(address provider) external override
    {
        validateEntity(provider, _providerId);
    }

    function rejectProvider(address provider) external override
    {
        rejectEntity(provider, _providerId);
    }
    
    function retrieveProvider(address provider) external override view returns (ItemsLibrary._itemIdentity memory)
    {
        return (retrieveEntity(provider, _providerId));
    }

    function retrieveAllProviders() external override view returns (bytes32[] memory)
    {
        return(retrieveAllEntities(_providerId));
    }

    function isProvider(address provider) internal view returns (bool)
    {
        return(isEntity(provider, _providerId));
    }

    function retrievePendingProviders(bool addedORremove) external override view returns (bytes32[] memory)
    {
        return(retrievePendingEntities(addedORremove, _providerId));
    }
    
    // Certificates CRUD Operations
    function addCertificate(bytes32 CertificateHash, address holder) external override payable virtual
    {
        onBeforeAddCertificate();
        addCertificateInternal(msg.sender, CertificateHash, holder);
    }

    function addCertificateOnBehalfOf(address provider, bytes32 CertificateHash, address holder, uint256 nonce, uint256 deadline, bytes memory signature) external override payable virtual
    {
        onBeforeAddCertificate();
        checkSignature(provider, CertificateHash, holder, nonce, deadline, signature);
        addCertificateInternal(provider, CertificateHash, holder);
    }

    function onBeforeAddCertificate() internal virtual {}

    function checkSignature(address provider, bytes32 CertificateHash, address holder, uint256 nonce, uint256 deadline, bytes memory signature) internal
        isDeadlineOK(deadline)
        isNonceOK(provider, nonce)
    {
        require(true == SignatureLibrary.verifyAddCertificate(provider, CertificateHash, holder, nonce, deadline, signature, _ContractName, _ContractVersion), "EC32-");
        validateNonce(provider, nonce);
    }

    function addCertificateInternal(address provider, bytes32 CertificateHash, address holder) internal
        isAProvider(provider) 
        NotEmpty(CertificateHash)
        CertificateDoesNotExist(holder, CertificateHash)
    {
        _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash] = provider;
        _CertificatesPerHolder[holder]._ListOfCertificates.push(CertificateHash);

        emit _AddCertificate(provider, holder, CertificateHash);
    }

    function retrieveCertificateProvider(bytes32 CertificateHash, address holder) external override
    view returns (address)
    {
        return (_CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash]);
    }

    function retrieveTotalCertificatesByHolder(address holder) public override 
    view returns (uint256)
    {
        return (_CertificatesPerHolder[holder]._ListOfCertificates.length);
    }

    function retrieveCertificatesByHolder(address holder, uint skipFirst, uint max) external override
    view returns (bytes32[] memory)
    {
        if(retrieveTotalCertificatesByHolder(holder) <= skipFirst){
            return (new bytes32[](0));
        }

        uint maxSize = max;
        if(retrieveTotalCertificatesByHolder(holder) - skipFirst < max){
            maxSize = retrieveTotalCertificatesByHolder(holder) - skipFirst;
        }
        bytes32[] memory ListOfCertificatesByHolder = new bytes32[](maxSize);
        bytes32[] memory listOfCert = _CertificatesPerHolder[holder]._ListOfCertificates;
        uint count = 0;
        uint skipped = 0;
        
        for(uint i=0; i < listOfCert.length; i++){
            if(count >= max) break;
            if(skipFirst > skipped){
                    skipped += 1;
            }
            else{
                ListOfCertificatesByHolder[count] = listOfCert[i];
                count += 1;
            }             
        }

        return (ListOfCertificatesByHolder);
    }

    function retrieveAddCertificatePriceWei() external override virtual view returns(uint256)
    {
        return 0;
    }

    function retrieveSubscriptionPriceWei() external override virtual view returns(uint256)
    {
        return 0;
    }

}