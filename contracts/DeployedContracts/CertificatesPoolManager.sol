// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Interfaces/IProxyManager.sol";
import "./Proxies/GenericProxy.sol";
import "./Proxies/CertisTokenProxy.sol";
import "../Base/TokenGovernanceBaseContract.sol";
import "../Libraries/AddressLibrary.sol";
import "../Libraries/Library.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";


contract CertificatesPoolManager is IProxyManager, TokenGovernanceBaseContract{
    using AddressLibrary for *;
    using Library for *;

    // EVENTS /////////////////////////////////////////
    event _NewContracts(address, address, address, address, address, address, address);

    // DATA /////////////////////////////////////////
    // proposition to change
    Library.ProposedContractsStruct private _ProposedContracts;
    
    // Private Certificate Pools Factory
    GenericProxy private _PrivatePoolFactory;

    // Private Certificates Pool
    UpgradeableBeacon private _PrivateCertificatePoolBeacon;

    // Provider Factory
    GenericProxy private _ProviderFactory;

    // Provider
    UpgradeableBeacon private _ProviderBeacon;

    // Public Certificates Pool
    GenericProxy private _PublicCertificatesPool;

    // Treasury
    GenericProxy private _Treasury;

    // Certis Token
    CertisTokenProxy private _CertisToken;

    // init
    bool private _init;

    // MODIFIERS /////////////////////////////////////////
    modifier isNotInitialized(){
        require(false == _init, "EC26");
        _;
    }

    // CONSTRUCTOR and INITIALIZATION /////////////////////////////////////////
    constructor(uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) 
    {
        super.TokenGovernanceContract_init(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, msg.sender, address(this));
        _init = false;
    }

    function InitializeContracts(Library.InitialContractsStruct calldata initialContracts) 
        isFromChairPerson()
        isNotInitialized()
    external
    {
        _init = true;
        initProxies(initialContracts);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    // governance : contracts assignment and management
    function upgradeContracts(Library.ProposedContractsStruct calldata UpgradeProposition) external override
    {
        _ProposedContracts = UpgradeProposition;
        addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
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
        bytes32[] memory proposition = new bytes32[](7);
        proposition[0] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewPublicPoolAddress);
        proposition[1] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewTreasuryAddress);
        proposition[2] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewCertisTokenAddress);
        proposition[3] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewPrivatePoolFactoryAddress);
        proposition[4] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewPrivatePoolAddress);
        proposition[5] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewProviderFactoryAddress);
        proposition[6] = AddressLibrary.AddressToBytes32(_ProposedContracts.NewProviderAddress);
        return proposition;
    }

    function initProxies(Library.InitialContractsStruct calldata initialContracts) private
    {
        _PublicCertificatesPool = GenericProxy(initialContracts.PublicPoolProxyAddress);
        _Treasury = GenericProxy(initialContracts.TreasuryProxyAddress);
        _CertisToken = CertisTokenProxy(initialContracts.CertisTokenProxyAddress);
        _PrivatePoolFactory = GenericProxy(initialContracts.PrivatePoolFactoryProxyAddress);
        _PrivateCertificatePoolBeacon = new UpgradeableBeacon(initialContracts.PrivateCertificatePoolImplAddress);
        _ProviderFactory = GenericProxy(initialContracts.ProviderFactoryProxyAddress);
        _ProviderBeacon = new UpgradeableBeacon(initialContracts.ProviderImplAddress);
    }

    function upgradeContractsImplementations() private
    {
        if(address(0) != _ProposedContracts.NewPublicPoolAddress){
            if(0 < _ProposedContracts.NewPublicPoolData.length)_PublicCertificatesPool.upgradeToAndCall(_ProposedContracts.NewPublicPoolAddress, _ProposedContracts.NewPublicPoolData);
            else _PublicCertificatesPool.upgradeTo(_ProposedContracts.NewPublicPoolAddress);
        }
        if(address(0) != _ProposedContracts.NewTreasuryAddress){
            if(0 < _ProposedContracts.NewTreasuryData.length)_Treasury.upgradeToAndCall(_ProposedContracts.NewTreasuryAddress, _ProposedContracts.NewTreasuryData);
            else _Treasury.upgradeTo(_ProposedContracts.NewTreasuryAddress);
        }
        if(address(0) != _ProposedContracts.NewCertisTokenAddress){
            if(0 < _ProposedContracts.NewCertisTokenData.length)_CertisToken.upgradeToAndCall(_ProposedContracts.NewCertisTokenAddress, _ProposedContracts.NewCertisTokenData);
            else _CertisToken.upgradeTo(_ProposedContracts.NewCertisTokenAddress);
        }
        if(address(0) != _ProposedContracts.NewPrivatePoolFactoryAddress){
            if(0 < _ProposedContracts.NewPrivatePoolFactoryData.length)_PrivatePoolFactory.upgradeToAndCall(_ProposedContracts.NewPrivatePoolFactoryAddress, _ProposedContracts.NewPrivatePoolFactoryData);
            else _PrivatePoolFactory.upgradeTo(_ProposedContracts.NewPrivatePoolFactoryAddress);
        }
        if(address(0) != _ProposedContracts.NewProviderFactoryAddress){
            if(0 < _ProposedContracts.NewProviderFactoryData.length)_ProviderFactory.upgradeToAndCall(_ProposedContracts.NewProviderFactoryAddress, _ProposedContracts.NewProviderFactoryData);
            else _ProviderFactory.upgradeTo(_ProposedContracts.NewProviderFactoryAddress);
        }
        if(address(0) != _ProposedContracts.NewPrivatePoolAddress)_PrivateCertificatePoolBeacon.upgradeTo(_ProposedContracts.NewPrivatePoolAddress);
        if(address(0) != _ProposedContracts.NewProviderAddress)_ProviderBeacon.upgradeTo(_ProposedContracts.NewProviderAddress);

        emit _NewContracts(internalRetrievePublicCertificatePool(), internalRetrieveTreasury(), internalRetrieveCertisToken(), internalRetrievePrivatePoolFactory(), internalRetrievePrivatePool(), internalRetrieveProviderFactory(), internalRetrieveProvider());
    }

    function InternalonTokenBalanceChanged(address from, address to, uint256 amount) internal override
    {
        super.InternalonTokenBalanceChanged(from, to, amount);
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

    // configuration implementations
    function retrievePublicCertificatePool() external override view returns (address) {
        return internalRetrievePublicCertificatePool();
    }

    function retrieveTreasury() external override view returns (address) {
        return internalRetrieveTreasury();
    }

    function retrieveCertisToken() external override view returns (address) {
        return internalRetrieveCertisToken();
    }

    function retrievePrivatePoolFactory() external override view returns (address) {
        return internalRetrievePrivatePoolFactory();
    }

    function retrievePrivatePool() external override view returns (address) {
        return internalRetrievePrivatePool();
    }

    function retrieveProviderFactory() external override view returns (address) {
        return internalRetrieveProviderFactory();
    }

    function retrieveProvider() external override view returns (address) {
        return internalRetrieveProvider();
    }

    // internal
    function internalRetrievePublicCertificatePool() internal view returns (address) {
        return _PublicCertificatesPool.retrieveImplementation();
    }

    function internalRetrieveTreasury() internal view returns (address) {
        return _Treasury.retrieveImplementation();
    }

    function internalRetrieveCertisToken() internal view returns (address) {
        return _CertisToken.retrieveImplementation();
    }

    function internalRetrievePrivatePoolFactory() internal view returns (address) {
        return _PrivatePoolFactory.retrieveImplementation();
    }

    function internalRetrievePrivatePool() internal view returns (address) {
        return _PrivateCertificatePoolBeacon.implementation();
    }

    function internalRetrieveProviderFactory() internal view returns (address) {
        return _ProviderFactory.retrieveImplementation();
    }

    function internalRetrieveProvider() internal view returns (address) {
        return _ProviderBeacon.implementation();
    }
    
}