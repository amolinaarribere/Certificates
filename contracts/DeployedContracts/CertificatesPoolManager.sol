// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Interfaces/IManager.sol";
import "../Interfaces/IFactory.sol";
import "../Base/StdPropositionBaseContract.sol";
import "../Libraries/AddressLibrary.sol";
import "../Libraries/Library.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";


contract CertificatesPoolManager is IManager, StdPropositionBaseContract{
    using AddressLibrary for *;
    using Library for *;

    // EVENTS /////////////////////////////////////////
    event _NewContracts(address Public, address Treasury, address Certis, address PrivateFactory, 
    address Private, address ProviderFactory, address Provider, address PriceConverter, 
    address PropositionSettings, address ENS);

    // DATA /////////////////////////////////////////
    address private _ManagerOwner;

    // Admin Proxy to manage all the TransparentUpgradeableProxies
    ProxyAdmin private _Admin;

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
    TransparentUpgradeableProxy private _Treasury;

    // Certis Token
    TransparentUpgradeableProxy private _CertisToken;

    // Price Converter
    TransparentUpgradeableProxy private _PriceConverter;

    // Proposition Settings
    TransparentUpgradeableProxy private _PropositionSettings;

    // ENS
    TransparentUpgradeableProxy private _ENS;

    // init
    bool private _init;

    // MODIFIERS /////////////////////////////////////////
    modifier isOwner(address addr){
        Library.ItIsSomeone(addr, _ManagerOwner);
        _;
    }

    modifier isNotInitialized(){
        require(false == _init, "EC26-");
        _;
    }

    // INITIALIZATION /////////////////////////////////////////
    function CertificatesPoolManager_init(string memory contractName, string memory contractVersion) public initializer
    {
        super.StdPropositionBaseContract_init(msg.sender, address(this), contractName, contractVersion);
        _Admin = new ProxyAdmin();
    }

    function InitializeContracts(Library.ProposedContractsStruct calldata initialContracts) 
        isFromChairPerson(msg.sender)
        isNotInitialized()
    external override
    {
        initProxies(initialContracts);
        _init = true;
    }

    // FUNCTIONALITY /////////////////////////////////////////
    // governance : contracts assignment and management
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
        _PropositionSettings = new TransparentUpgradeableProxy(initialContracts.NewPropositionSettingsAddress, address(_Admin), initialContracts.NewPropositionSettingsData);
        _ENS = new TransparentUpgradeableProxy(initialContracts.NewENSAddress, address(_Admin), initialContracts.NewENSData);

        IFactory(address(_PrivatePoolFactory)).updateContractName(initialContracts.NewPrivatePoolContractName);
        IFactory(address(_PrivatePoolFactory)).updateContractVersion(initialContracts.NewPrivatePoolContractVersion);
    }

    function UpdateAll() internal override
    {
        upgradeContractImplementation(_PublicCertificatesPool, _ProposedNewValues[0], _ProposedNewValues[10]);
        upgradeContractImplementation(_Treasury, _ProposedNewValues[1], _ProposedNewValues[11]);
        upgradeContractImplementation(_CertisToken, _ProposedNewValues[2], _ProposedNewValues[12]);
        upgradeContractImplementation(_PrivatePoolFactory, _ProposedNewValues[3], _ProposedNewValues[13]);
        upgradeContractImplementation(_ProviderFactory, _ProposedNewValues[5],_ProposedNewValues[14]);
        upgradeContractImplementation(_PriceConverter, _ProposedNewValues[7], _ProposedNewValues[15]);
        upgradeContractImplementation(_PropositionSettings, _ProposedNewValues[8], _ProposedNewValues[16]);
        upgradeContractImplementation(_ENS, _ProposedNewValues[9],_ProposedNewValues[17]);

        if(address(0) != AddressLibrary.Bytes32ToAddress(Library.BytestoBytes32(_ProposedNewValues[4])[0]))_PrivateCertificatePoolBeacon.upgradeTo(AddressLibrary.Bytes32ToAddress(Library.BytestoBytes32(_ProposedNewValues[4])[0]));
        if(address(0) != AddressLibrary.Bytes32ToAddress(Library.BytestoBytes32(_ProposedNewValues[6])[0]))_ProviderBeacon.upgradeTo(AddressLibrary.Bytes32ToAddress(Library.BytestoBytes32(_ProposedNewValues[6])[0]));

        if(0 < _ProposedNewValues[18].length)
            IFactory(address(_PrivatePoolFactory)).updateContractName(string(_ProposedNewValues[18]));

        if(0 < _ProposedNewValues[19].length)
            IFactory(address(_PrivatePoolFactory)).updateContractVersion(string(_ProposedNewValues[19]));
        
        emit _NewContracts(internalRetrieveImpl(_PublicCertificatesPool), internalRetrieveImpl(_Treasury), 
        internalRetrieveImpl(_CertisToken), internalRetrieveImpl(_PrivatePoolFactory), 
        internalRetrievePrivatePool(), internalRetrieveImpl(_ProviderFactory), internalRetrieveProvider(),
        internalRetrieveImpl(_PriceConverter), internalRetrieveImpl(_PropositionSettings), internalRetrieveImpl(_ENS));
    }

    function upgradeContractImplementation(TransparentUpgradeableProxy proxy, bytes memory NewImpl, bytes memory Data) private
    {
        address NewImplAddress = AddressLibrary.Bytes32ToAddress(Library.BytestoBytes32(NewImpl)[0]);
        if(address(0) != NewImplAddress){
            if(0 < Data.length)_Admin.upgradeAndCall(proxy, NewImplAddress, Data);
            else _Admin.upgrade(proxy, NewImplAddress);
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

    function retrievePropositionSettingsProxy() external override view returns (address) {
        return (address(_PropositionSettings));
    }

    function retrieveENSProxy() external override view returns (address) {
        return (address(_ENS));
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

    function retrievePropositionSettings() external override view returns (address) {
        return internalRetrieveImpl(_PropositionSettings);
    }

    function retrieveENS() external override view returns (address) {
        return internalRetrieveImpl(_ENS);
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