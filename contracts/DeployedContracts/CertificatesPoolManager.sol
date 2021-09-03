// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Interfaces/IProxyManager.sol";
import "../Base/TokenGovernanceBaseContract.sol";
import "../Libraries/AddressLibrary.sol";
import "../Libraries/Library.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";


contract CertificatesPoolManager is IProxyManager, TokenGovernanceBaseContract{
    using AddressLibrary for *;
    using Library for *;

    // EVENTS /////////////////////////////////////////
    event _NewContracts(address, address, address, address, address, address, address, address);

    // DATA /////////////////////////////////////////
    // Admin Proxy to manage all the TransparentUpgradeableProxies
    ProxyAdmin private _Admin;

    // proposition to change
    Library.ProposedContractsStruct private _ProposedContracts;
    
    // Private Certificate Pools Factory
    TransparentUpgradeableProxy private _PrivatePoolFactory;

    // Private Certificates Pool
    UpgradeableBeacon private _PrivateCertificatePoolBeacon;

    // Provider Factory
    TransparentUpgradeableProxy private _ProviderFactory;

    // Provider
    UpgradeableBeacon private _ProviderBeacon;

    // Public Certificates Pool
    TransparentUpgradeableProxy private _PublicCertificatesPool;

    // Treasury
    //GenericProxy private _Treasury;
    TransparentUpgradeableProxy private _Treasury;

    // Certis Token
    TransparentUpgradeableProxy private _CertisToken;

    // Price Converter
    TransparentUpgradeableProxy private _PriceConverter;

    // init
    bool private _init;

    // MODIFIERS /////////////////////////////////////////
    modifier isNotInitialized(){
        require(false == _init, "EC26-");
        _;
    }

    // CONSTRUCTOR and INITIALIZATION /////////////////////////////////////////
    constructor(uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) 
    {
        super.TokenGovernanceContract_init(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, msg.sender, address(this));
        _Admin = new ProxyAdmin();
        _init = false;
    }

    function InitializeContracts(Library.ProposedContractsStruct calldata initialContracts) 
        isFromChairPerson()
        isNotInitialized()
    external override
    {
        initProxies(initialContracts);
        _init = true;
    }

    // FUNCTIONALITY /////////////////////////////////////////
    // governance : contracts assignment and management
    function upgradeContracts(Library.ProposedContractsStruct calldata UpgradeProposition) external override
    {
        _ProposedContracts = UpgradeProposition;
        addProposition();
    }

    function propositionApproved() internal override
    {
        upgradeContractsImplementations();
        removeProposition();
    }

    function propositionRejected() internal override
    {
        removeProposition();
    }

    function propositionExpired() internal override
    {
        removeProposition();
    }

    function removeProposition() internal
    {
       delete(_ProposedContracts);
    }

    function retrieveProposition() external override view returns(bytes32[] memory)
    {
        bytes32[] memory proposition = new bytes32[](8);
        proposition[0] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewPublicPoolAddress);
        proposition[1] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewTreasuryAddress);
        proposition[2] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewCertisTokenAddress);
        proposition[3] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewPrivatePoolFactoryAddress);
        proposition[4] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewPrivatePoolAddress);
        proposition[5] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewProviderFactoryAddress);
        proposition[6] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewProviderAddress);
        proposition[7] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewPriceConverterAddress);
        return proposition;
    }

    function initProxies(Library.ProposedContractsStruct calldata initialContracts) private
    {
        _PublicCertificatesPool = new TransparentUpgradeableProxy(initialContracts.NewPublicPoolAddress, address(_Admin), initialContracts.NewPublicPoolData);
        _Treasury = new TransparentUpgradeableProxy(initialContracts.NewTreasuryAddress, address(_Admin), initialContracts.NewTreasuryData);
        _CertisToken = new TransparentUpgradeableProxy(initialContracts.NewCertisTokenAddress, address(_Admin), initialContracts.NewCertisTokenData);
        _PrivatePoolFactory = new TransparentUpgradeableProxy(initialContracts.NewPrivatePoolFactoryAddress, address(_Admin), initialContracts.NewPrivatePoolFactoryData);
        _PrivateCertificatePoolBeacon = new UpgradeableBeacon(initialContracts.NewPrivatePoolAddress);
        _ProviderFactory = new TransparentUpgradeableProxy(initialContracts.NewProviderFactoryAddress, address(_Admin), initialContracts.NewProviderFactoryData);
        _ProviderBeacon = new UpgradeableBeacon(initialContracts.NewProviderAddress);
        _PriceConverter = new TransparentUpgradeableProxy(initialContracts.NewPriceConverterAddress, address(_Admin), initialContracts.NewPriceConverterData);
    }

    function upgradeContractsImplementations() private
    {
        upgradeContractImplementation(_PublicCertificatesPool, _ProposedContracts.NewPublicPoolAddress, _ProposedContracts.NewPublicPoolData);
        upgradeContractImplementation(_Treasury, _ProposedContracts.NewTreasuryAddress, _ProposedContracts.NewTreasuryData);
        upgradeContractImplementation(_CertisToken, _ProposedContracts.NewCertisTokenAddress, _ProposedContracts.NewCertisTokenData);
        upgradeContractImplementation(_PrivatePoolFactory, _ProposedContracts.NewPrivatePoolFactoryAddress, _ProposedContracts.NewPrivatePoolFactoryData);
        upgradeContractImplementation(_ProviderFactory, _ProposedContracts.NewProviderFactoryAddress, _ProposedContracts.NewProviderFactoryData);
        upgradeContractImplementation(_PriceConverter, _ProposedContracts.NewPriceConverterAddress, _ProposedContracts.NewPriceConverterData);

        if(address(0) != _ProposedContracts.NewPrivatePoolAddress)_PrivateCertificatePoolBeacon.upgradeTo(_ProposedContracts.NewPrivatePoolAddress);
        if(address(0) != _ProposedContracts.NewProviderAddress)_ProviderBeacon.upgradeTo(_ProposedContracts.NewProviderAddress);

        emit _NewContracts(internalRetrieveImpl(_PublicCertificatesPool), internalRetrieveImpl(_Treasury), 
        internalRetrieveImpl(_CertisToken), internalRetrieveImpl(_PrivatePoolFactory), 
        internalRetrievePrivatePool(), internalRetrieveImpl(_ProviderFactory), internalRetrieveProvider(),
        internalRetrieveImpl(_PriceConverter));
    }

    function upgradeContractImplementation(TransparentUpgradeableProxy proxy, address NewImpl, bytes memory Data) private{
        if(address(0) != NewImpl){
            if(0 < Data.length)_Admin.upgradeAndCall(proxy, NewImpl, Data);
            else _Admin.upgrade(proxy, NewImpl);
        }
    }

    // configuration Proxies
    function retrievePublicCertificatePoolProxy() external override view returns (address) {
        return (address(_PublicCertificatesPool));
    }

    function retrieveTreasuryProxy() external override view returns (address) {
        return (address(_Treasury));
    }

    function retrieveCertisTokenProxy() external override view returns (address) {
        return (address(_CertisToken));
    }

    function retrievePrivatePoolFactoryProxy() external override view returns (address) {
        return (address(_PrivatePoolFactory));
    }

    function retrievePrivatePoolBeacon() external override view returns (address) {
        return (address(_PrivateCertificatePoolBeacon));
    }

    function retrieveProviderFactoryProxy() external override view returns (address) {
        return (address(_ProviderFactory));
    }

    function retrieveProviderBeacon() external override view returns (address) {
        return (address(_ProviderBeacon));
    }

     function retrievePriceConverterProxy() external override view returns (address) {
        return (address(_PriceConverter));
    }

    // configuration implementations
    function retrievePublicCertificatePool() external override view returns (address) {
        return internalRetrieveImpl(_PublicCertificatesPool);
    }

    function retrieveTreasury() external override view returns (address) {
        return internalRetrieveImpl(_Treasury);
    }

    function retrieveCertisToken() external override view returns (address) {
        return internalRetrieveImpl(_CertisToken);
    }

    function retrievePrivatePoolFactory() external override view returns (address) {
        return internalRetrieveImpl(_PrivatePoolFactory);
    }

    function retrievePrivatePool() external override view returns (address) {
        return internalRetrievePrivatePool();
    }

    function retrieveProviderFactory() external override view returns (address) {
        return internalRetrieveImpl(_ProviderFactory);
    }

    function retrieveProvider() external override view returns (address) {
        return internalRetrieveProvider();
    }

    function retrievePriceConverter() external override view returns (address) {
        return internalRetrieveImpl(_PriceConverter);
    }

    function isInitialized() external override view returns(bool){
        return _init;
    }

    // internal
    function internalRetrieveImpl(TransparentUpgradeableProxy proxy) internal view returns (address){
        return _Admin.getProxyImplementation(proxy);
    }

    function internalRetrievePrivatePool() internal view returns (address) {
        return _PrivateCertificatePoolBeacon.implementation();
    }

    function internalRetrieveProvider() internal view returns (address) {
        return _ProviderBeacon.implementation();
    }
  
}