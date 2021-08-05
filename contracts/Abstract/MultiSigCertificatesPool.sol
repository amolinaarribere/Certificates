// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./MultiSigContract.sol";
import "../Interfaces/IPool.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract MultiSigCertificatesPool is IPool, Initializable, MultiSigContract {
    
    // EVENTS
    event _AddCertificateIdEvent(address, address);
    event _RemoveCertificateIdEvent(address, address);

    // DATA
    uint256 constant _TotalEntities = 2;

    // Owners
    uint256 constant _ownerIdCertificates = 0;
    string constant _ownerLabel = "Owner";

    // Providers
    uint256 constant _providerId = 1;
    string constant _providerLabel = "Provider";

    string[] _Label;

    // Holders
    struct _CertificatePerHolder{
        mapping(bytes32 => address) _CertificateFromProvider;
        bytes32[] _ListOfCertificates;
    }
    
    mapping(address => _CertificatePerHolder) private _CertificatesPerHolder;

    // MODIFIERS
    modifier isAProvider(){
        require(true == isProvider(msg.sender), "EC12");
        _;
    }

    modifier isTheProvider(address holder, bytes32 CertificateHash){
        require(msg.sender == _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash], "EC13");
        _;
    }

    modifier isTheProviderOrHimself(address holder, bytes32 CertificateHash){
        require(msg.sender == _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash] || msg.sender == holder, "EC14");
        _;
    }
    
    modifier CertificateDoesNotExist(address holder, bytes32 CertificateHash){
        require(address(0) == _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash], "EC15");
        _;
    }
    
    // CONSTRUCTOR
    /*constructor(address[] memory owners,  uint256 minOwners) 
        MultiSigContract(owners, minOwners, _TotalEntities, _Label, _ownerIdCertificates)
    payable
    {}*/

    function MultiSigCertPool_init(address[] memory owners,  uint256 minOwners) public initializer 
    {
        _Label = new string[](2);
        _Label[0] = _ownerLabel;
        _Label[1] = _providerLabel;

        super.MultiSigContract_init(owners, minOwners, _TotalEntities, _Label, _ownerIdCertificates); 
    }

    // FUNCTIONALITY
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
    
    function retrieveProvider(address provider) external override view returns (string memory, bool)
    {
        return (retrieveEntity(provider, _providerId));
    }

    function retrieveAllProviders() external override view returns (address[] memory)
    {
        return(retrieveAllEntities(_providerId));
    }

    function isProvider(address provider) public view returns (bool)
    {
        return(isEntity(provider, _providerId));
    }

    function retrievePendingProviders(bool addedORremove) external override view returns (address[] memory, string[] memory)
    {
        return(retrievePendingEntities(addedORremove, _providerId));
    }
    
    // Certificates CRUD Operations
    function addCertificate(bytes32 CertificateHash, address holder) external override payable virtual
    {
        addCertificateInternal(CertificateHash, holder);
    }

    function addCertificateInternal(bytes32 CertificateHash, address holder) internal
        isAProvider 
        NotEmpty(CertificateHash)
        CertificateDoesNotExist(holder, CertificateHash)
    {
        _CertificatesPerHolder[holder]._CertificateFromProvider[CertificateHash] = msg.sender;
        _CertificatesPerHolder[holder]._ListOfCertificates.push(CertificateHash);

        emit _AddCertificateIdEvent(msg.sender, holder);
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



}