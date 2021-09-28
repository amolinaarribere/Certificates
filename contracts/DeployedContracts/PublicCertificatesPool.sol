// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Public Certificate Pools offer the default MultiSig Certificate Pool functionality
  except for Providers Creation and Certificate Issuing since payments must be made
  Besides Public Certificate Pool is a managed contract
 */

 import "../Abstract/MultiSigCertificatesPool.sol";
 import "../Interfaces/ITreasury.sol";
 import "../Base/ManagedBaseContract.sol";
 import "../Interfaces/IPriceConverter.sol";

 contract PublicCertificatesPool is MultiSigCertificatesPool, ManagedBaseContract {

    // EVENTS /////////////////////////////////////////
    event _NewProposal(address indexed Provider, string Info);

    // MODIFIERS /////////////////////////////////////////
    modifier ProviderisNotActivated(address entity){
        require(false == isEntity(entity, _providerId), "EC6-");
        _;
    }

    modifier ProviderisNotPending(address entity){
        bytes32 entityInBytes = AddressLibrary.AddressToBytes32(entity);
        require(false == ItemsLibrary.isItemPendingToAdded(entityInBytes, _Entities[_providerId]) && 
                false == ItemsLibrary.isItemPendingToRemoved(entityInBytes, _Entities[_providerId]), "EC27-");
        _;
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function PublicCertPool_init(address[] memory owners,  uint256 minOwners, address managerContractAddress, string memory contractName, string memory contractVersion) public initializer {
        super.MultiSigCertPool_init(owners, minOwners, contractName, contractVersion); 
        super.ManagedBaseContract_init(managerContractAddress); 
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function addProvider(address provider, string memory providerInfo) external 
        ProviderisNotActivated(provider) 
        ProviderisNotPending(provider)
    override payable
    {
        ITreasury(_managerContract.retrieveTreasuryProxy()).pay{value:msg.value}(Library.Prices.NewProvider);
        bytes32 providerInBytes = AddressLibrary.AddressToBytes32(provider);
        _Entities[_providerId]._items[providerInBytes]._Info = providerInfo;
        _Entities[_providerId]._pendingItemsAdd.push(providerInBytes);
        _Entities[_providerId]._items[providerInBytes]._pendingId = _Entities[_providerId]._pendingItemsAdd.length - 1;

        emit _NewProposal(provider, providerInfo);
    }

    function payBack(bytes32 entityInBytes, bool validatedOrRejected) internal
    {
        address[] memory Voters = (validatedOrRejected) ? _Entities[_providerId]._items[entityInBytes]._Validations : _Entities[_providerId]._items[entityInBytes]._Rejections;

        for(uint i=0; i < Voters.length; i++){
            ITreasury(_managerContract.retrieveTreasuryProxy()).getRefund(Voters[i], Voters.length);
        }
    }

    function onBeforeAddCertificate() internal override 
    {
        ITreasury(_managerContract.retrieveTreasuryProxy()).pay{value:msg.value}(Library.Prices.NewCertificate);
    }

    function retrieveAddCertificatePriceWei() external override view returns(uint256)
    {
        (, , , uint Price, ) = ITreasury(_managerContract.retrieveTreasuryProxy()).retrievePrices();
        return IPriceConverter(_managerContract.retrievePriceConverterProxy()).fromUSDToETH(Price);
    }

    function retrieveSubscriptionPriceWei() external override virtual view returns(uint256)
    {
        (uint Price, , , , ) = ITreasury(_managerContract.retrieveTreasuryProxy()).retrievePrices();
        return IPriceConverter(_managerContract.retrievePriceConverterProxy()).fromUSDToETH(Price);
    }

    // Callback functions
    function onItemValidated(bytes32 item, uint256[] calldata ids, bool addOrRemove) public override 
    {
        super.onItemValidated(item, ids, addOrRemove);

        if(ids[0] == _providerId){
            if(addOrRemove)payBack(item, true);
        }
    }

    function onItemRejected(bytes32 item, uint256[] calldata ids, bool addOrRemove) public override  
    {
        super.onItemRejected(item, ids, addOrRemove);

        if(ids[0] == _providerId){
            if(addOrRemove)payBack(item, false);
        }
    }

 }