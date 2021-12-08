// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
  Provider contract allows for registering pools (and optionally subscribing to them too).
  Certificates can be latter delivered to those pools
 */
 import "../Interfaces/IProvider.sol";
 import "../Interfaces/IPool.sol";
 import "../Abstract/MultiSigContract.sol";
 import "../Interfaces/IPriceConverter.sol";
 import "../Base/ReverseRegistryBaseContract.sol";


 contract Provider is IProvider, ReverseRegistryBaseContract, MultiSigContract {

    // DATA /////////////////////////////////////////
    uint256 constant _TotalEntities = 2;

    // Owners
    uint256 constant _ownerIdProviders = 0;
    string constant _ownerLabel = "Owner";

    // Pools
    uint256 constant _poolId = 1;
    string constant _poolLabel = "Pool";

    mapping(address => bool) private _mustSubscribe;
    mapping(address => bool) private _submited;

    // Certificates
    uint256 constant _certId = 2;
    string constant _certLabel = "Certificate";

    string[] private _Label;
    
    struct _CertificatesPerHolderStruct{
        mapping(address => ItemsLibrary._ItemsStruct) _CertificatesPerHolder;
    }
   
    mapping(address => _CertificatesPerHolderStruct) private _CertificatesPerPool;
    
    Library._pendingCertificatesStruct[] private _pendingCertificates;

    // Provider
    string private _ProviderInfo;

    // MODIFIERS /////////////////////////////////////////
    modifier isAPool(address pool){
        isAPoolFunc(pool);
        _;
    }

    function isAPoolFunc(address pool) internal view{
        require(true == isPool(pool), "EC36-");
    }

     // CONSTRUCTOR /////////////////////////////////////////
    function Provider_init(address[] memory owners,  uint256 minOwners, string memory ProviderInfo, string memory ENSName, address ReverseRegistryAddress) public initializer 
    {
        _Label = new string[](2);
        _Label[0] = _ownerLabel;
        _Label[1] = _poolLabel;

        super.MultiSigContract_init(owners, minOwners, _TotalEntities, _Label, _ownerIdProviders); 
        _ProviderInfo = ProviderInfo;

        if(0 < bytes(ENSName).length){
            RegisterReverseAddress(ENSName, ReverseRegistryAddress);
        }
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function addPool(address pool, string calldata poolInfo, bool mustSubscribe) external override{
         if(false == _submited[pool]){
            _mustSubscribe[pool] = mustSubscribe;
            _submited[pool] = true;
        }
        addEntity(pool, poolInfo, _poolId);
    }

    function removePool(address pool) external override
    {
       removeEntity(pool, _poolId); 
    }

    function validatePool(address pool) external override
    {
        validateEntity(pool, _poolId);
    }

    function rejectPool(address pool) external override
    {
        rejectEntity(pool, _poolId);
    }

    function removeConfigForPool(address pool) internal
    {
        delete(_submited[pool]);
        delete(_mustSubscribe[pool]);
    }

    function retrievePool(address pool) external override view returns (ItemsLibrary._itemIdentity memory)
    {
        return retrieveEntity(pool, _poolId);
    }

    function retrievePoolConfg(address pool) external override view returns (bool, bool)
    {
        return (_mustSubscribe[pool], _submited[pool]);
    }

    function retrieveAllPools() external override view returns (bytes32[] memory)
    {
        return retrieveAllEntities(_poolId);
    }

    function retrievePendingPools(bool addedORremove) external override view returns (bytes32[] memory)
    {
        return(retrievePendingEntities(addedORremove, _poolId));
    }

    function isPool(address pool) internal view returns (bool)
    {
        return(isEntity(pool, _poolId));
    }
    // Certificates management
    function extractCertIds(address pool, bytes32 CertificateHash, address holder) internal returns(uint[] memory)
    {
        uint otherId;
        uint[] memory certIdIdArray = new uint[](4);
        certIdIdArray[0] = _certId;
        certIdIdArray[1] = AddressLibrary.AddressToUint(pool);
        certIdIdArray[2] = AddressLibrary.AddressToUint(holder);

        Library._pendingCertificatesStruct memory pCS = Library._pendingCertificatesStruct(pool, holder, CertificateHash);

        if(!isCertificatePendingToAdded(pool, CertificateHash, holder)){
            _pendingCertificates.push(pCS);
            otherId = _pendingCertificates.length - 1;
        }
        else{
            otherId = PositionInArray(pCS, _pendingCertificates);
        }

        certIdIdArray[3] = otherId;

        return(certIdIdArray);
    }

    function addCertificate(address pool, bytes32 CertificateHash, address holder) external override
        isAPool(pool)
        isAnOwner(msg.sender)
     {
        (ItemsLibrary._manipulateItemStruct memory manipulateItemStruct,
            ItemsLibrary._ItemsStruct storage itemsstruct) = GenerateStructsCert(pool, CertificateHash, holder);

        ItemsLibrary.addItem(manipulateItemStruct,itemsstruct, address(this));
     }

    function validateCertificate(address pool, bytes32 CertificateHash, address holder) external override
        isAPool(pool)
        isAnOwner(msg.sender)
     {
        (ItemsLibrary._manipulateItemStruct memory manipulateItemStruct,
            ItemsLibrary._ItemsStruct storage itemsstruct) = GenerateStructsCert(pool, CertificateHash, holder);

        ItemsLibrary.validateItem(manipulateItemStruct, itemsstruct, address(this));
     }

    function rejectCertificate(address pool, bytes32 CertificateHash, address holder) external override
        isAPool(pool)
        isAnOwner(msg.sender)
    {
        (ItemsLibrary._manipulateItemStruct memory manipulateItemStruct,
            ItemsLibrary._ItemsStruct storage itemsstruct) = GenerateStructsCert(pool, CertificateHash, holder);

        ItemsLibrary.rejectItem(manipulateItemStruct, itemsstruct, address(this));
    }

    function GenerateStructsCert(address pool, bytes32 CertificateHash, address holder) internal
        returns(ItemsLibrary._manipulateItemStruct memory, ItemsLibrary._ItemsStruct storage)
    {
        uint[] memory certIdIdArray = extractCertIds(pool, CertificateHash, holder);
        ItemsLibrary._manipulateItemStruct memory manipulateItemStruct = ItemsLibrary._manipulateItemStruct(CertificateHash, "", _minOwners, _certLabel, certIdIdArray);
        ItemsLibrary._ItemsStruct storage itemsstruct =  _CertificatesPerPool[pool]._CertificatesPerHolder[holder];
        return (manipulateItemStruct, itemsstruct);
    }
 
    function manipulateCertificate(address pool, bytes32 CertificateHash, address holder) internal
        isAPool(pool)
    {
        IPool poolToSend = IPool(pool);

        uint AddCertificatePriceWei = poolToSend.retrieveAddCertificatePriceWei();

        poolToSend.addCertificate{value:AddCertificatePriceWei}(CertificateHash, holder);

        ItemsLibrary._ItemsStruct storage itemStruct = _CertificatesPerPool[pool]._CertificatesPerHolder[holder];

        ItemsLibrary.RemoveResizeActivated(CertificateHash, itemStruct);
        delete(itemStruct._items[CertificateHash]);
    }

    function retrievePendingCertificates() external override view returns (Library._pendingCertificatesStruct[] memory)
    {
        return(_pendingCertificates);
    }

    function isCertificate(address pool, bytes32 CertificateHash, address holder) external override view returns(bool)
    {
        return internalisCertificate(pool, CertificateHash, holder);
    }

    function internalisCertificate(address pool, bytes32 CertificateHash, address holder) internal view returns(bool)
    {
        IPool poolToCheck = IPool(pool);
        address provider = poolToCheck.retrieveCertificateProvider(CertificateHash, holder);
        if(provider == address(this)) return true;
        return false;
    }

    function isCertificatePendingToAdded(address pool, bytes32 CertificateHash, address holder) internal view returns(bool)
    {
        return ItemsLibrary.isItemPendingToAdded(CertificateHash, _CertificatesPerPool[pool]._CertificatesPerHolder[holder]);
    }

    function RemoveResizeCertificatesStructArray(Library._pendingCertificatesStruct[] storage array, uint index) internal
    {
        array[index] = array[array.length - 1];
        array.pop();
    }

    function PositionInArray(Library._pendingCertificatesStruct memory value, Library._pendingCertificatesStruct[] memory array) internal pure returns(uint)
    {
         for(uint i=0; i < array.length; i++){
            if(value.pool == array[i].pool && 
                value.holder == array[i].holder && 
                value.certificate == array[i].certificate) return i;
        }

        return array.length + 1;
    }

    receive() external override payable{}

    // CALLBACKS /////////////////////////////////////////
    function onItemValidated(bytes32 item, uint256[] calldata ids, bool addOrRemove) public override  
    {
        super.onItemValidated(item, ids, addOrRemove);

        if(ids[0] == _poolId){
            address pool = AddressLibrary.Bytes32ToAddress(item);

            if(false == addOrRemove)removeConfigForPool(pool);
            else if(true == _mustSubscribe[pool]){
                IPool poolToSubscribe = IPool(pool);
                uint SubscriptionPrice = poolToSubscribe.retrieveSubscriptionPriceWei();
                poolToSubscribe.addProvider{value:SubscriptionPrice}(address(this), _ProviderInfo);
            }
        }
        else if(ids[0] == _certId){
            manipulateCertificate(AddressLibrary.UintToAddress(ids[1]), item, AddressLibrary.UintToAddress(ids[2]));
            RemoveResizeCertificatesStructArray(_pendingCertificates, ids[3]);
        }
    }

    function onItemRejected(bytes32 item, uint256[] calldata ids, bool addOrRemove) public override  
    {
        super.onItemRejected(item, ids, addOrRemove);

        if(ids[0] == _poolId){
            address pool = AddressLibrary.Bytes32ToAddress(item);

            if(true == addOrRemove)removeConfigForPool(pool);
        } 
        else if(ids[0] == _certId){
            RemoveResizeCertificatesStructArray(_pendingCertificates, ids[3]);
        }
    }
    
 }