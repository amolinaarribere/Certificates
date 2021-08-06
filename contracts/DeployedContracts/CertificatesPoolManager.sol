// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Interfaces/IProxyManager.sol";
//import "./Proxies/PublicCertificatesPoolProxy.sol";
import "./PrivateCertificatesPool.sol";
//import "./Proxies/PrivatePoolFactoryProxy.sol";
//import "./Proxies/ProviderFactoryProxy.sol";
//import "./Proxies/TreasuryProxy.sol";
import "./Proxies/GenericProxy.sol";
import "../Base/TokenGovernanceBaseContract.sol";
import "./Proxies/CertisTokenProxy.sol";
import "../Libraries/AddressLibrary.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract CertificatesPoolManager is IProxyManager, TokenGovernanceBaseContract{
    using AddressLibrary for *;

    // DATA /////////////////////////////////////////
    // proposition to change
    struct ProposedContractsStruct{
        address NewPublicPoolAddress;
        address NewTreasuryAddress;
        address NewCertisTokenAddress;
        address NewPrivatePoolFactoryAddress;
        address NewPrivatePoolAddress;
        address NewProviderFactoryAddress;
        address NewProviderAddress;
        bytes NewPublicPoolData;
        bytes NewPTreasuryData;
        bytes NewCertisTokenData;
        bytes NewPrivatePoolFactoryData;
        bytes NewProviderFactoryData;
    }

    ProposedContractsStruct _ProposedContracts;
    
    // Private Certificate Pools Factory
    GenericProxy _PrivatePoolFactory;

    // Private Certificates Pool
    UpgradeableBeacon _PrivateCertificatePoolBeacon;

    // Provider Factory
    GenericProxy _ProviderFactory;

    // Provider
    UpgradeableBeacon _ProviderBeacon;

    // Public Certificates Pool
    GenericProxy  _PublicCertificatesPool;

    // Treasury
    GenericProxy _Treasury;

    // Certis Token
    CertisTokenProxy _CertisToken;

    // init
    bool _init;

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

    function InitializeContracts(address payable PublicPoolProxyAddress, address payable TreasuryProxyAddress, address payable CertisTokenProxyAddress, address payable PrivatePoolFactoryProxyAddress, address PrivateCertificatePoolImplAddress, address payable ProviderFactoryProxyAddress, address ProviderImplAddress) 
        isFromChairPerson()
        isNotInitialized()
    external
    {
        _init = true;
        initProxies(PublicPoolProxyAddress, TreasuryProxyAddress, CertisTokenProxyAddress, PrivatePoolFactoryProxyAddress, PrivateCertificatePoolImplAddress, ProviderFactoryProxyAddress, ProviderImplAddress);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    // governance : contracts assignment and management
    function upgradeContracts(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolFactoryAddress, address PrivatePoolImplAddress, address ProviderFactoryAddress, address ProviderImplAddress,
        bytes memory PublicPoolData, bytes memory TreasuryData, bytes memory CertisTokenData, bytes memory PrivatePoolFactoryData, bytes memory ProviderFactoryData) external override
    {
        _ProposedContracts.NewPublicPoolAddress = PublicPoolAddress;
        _ProposedContracts.NewTreasuryAddress = TreasuryAddress;
        _ProposedContracts.NewCertisTokenAddress = CertisTokenAddress;
        _ProposedContracts.NewPrivatePoolFactoryAddress = PrivatePoolFactoryAddress;
        _ProposedContracts.NewPrivatePoolAddress = PrivatePoolImplAddress;
        _ProposedContracts.NewProviderFactoryAddress = ProviderFactoryAddress;
        _ProposedContracts.NewProviderAddress = ProviderImplAddress;
        _ProposedContracts.NewPublicPoolData = PublicPoolData;
        _ProposedContracts.NewPTreasuryData = TreasuryData;
        _ProposedContracts.NewCertisTokenData = CertisTokenData;
        _ProposedContracts.NewPrivatePoolFactoryData = PrivatePoolFactoryData;
        _ProposedContracts.NewProviderFactoryData = ProviderFactoryData;
        addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
    }

    function propositionApproved() internal override
    {
        upgradeContractsImplementations(_ProposedContracts.NewPublicPoolAddress, _ProposedContracts.NewTreasuryAddress, _ProposedContracts.NewCertisTokenAddress, _ProposedContracts.NewPrivatePoolFactoryAddress, _ProposedContracts.NewPrivatePoolAddress, _ProposedContracts.NewProviderFactoryAddress, _ProposedContracts.NewProviderAddress,
        _ProposedContracts.NewPublicPoolData, _ProposedContracts.NewPTreasuryData, _ProposedContracts.NewCertisTokenData, _ProposedContracts.NewPrivatePoolFactoryData, _ProposedContracts.NewProviderFactoryData);
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

    function initProxies(address payable PublicPoolProxyAddress, address payable TreasuryProxyAddress, address payable CertisTokenProxyAddress, address payable PrivatePoolFactoryProxyAddress, address PrivateCertificatePoolImplAddress, address payable ProviderFactoryProxyAddress, address ProviderImplAddress) internal
    {
        _PublicCertificatesPool = GenericProxy(PublicPoolProxyAddress);
        _Treasury = GenericProxy(TreasuryProxyAddress);
        _CertisToken = CertisTokenProxy(CertisTokenProxyAddress);
        _PrivatePoolFactory = GenericProxy(PrivatePoolFactoryProxyAddress);
        _PrivateCertificatePoolBeacon = new UpgradeableBeacon(PrivateCertificatePoolImplAddress);
        _ProviderFactory = GenericProxy(ProviderFactoryProxyAddress);
        _ProviderBeacon = new UpgradeableBeacon(ProviderImplAddress);
    }

    function upgradeContractsImplementations(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolFactoryAddress, address PrivatePoolImplAddress, address ProviderFactoryAddress, address ProviderImplAddress,
        bytes memory PublicPoolData, bytes memory TreasuryData, bytes memory CertisTokenData, bytes memory PrivatePoolFactoryData, bytes memory ProviderFactoryData) internal
    {
        if(address(0) != PublicPoolAddress){
            if(0 < PublicPoolData.length)_PublicCertificatesPool.upgradeToAndCall(PublicPoolAddress, PublicPoolData);
            else _PublicCertificatesPool.upgradeTo(PublicPoolAddress);
        }
        if(address(0) != TreasuryAddress){
            if(0 < TreasuryData.length)_Treasury.upgradeToAndCall(TreasuryAddress, TreasuryData);
            else _Treasury.upgradeTo(TreasuryAddress);
        }
        if(address(0) != CertisTokenAddress){
            if(0 < CertisTokenData.length)_CertisToken.upgradeToAndCall(CertisTokenAddress, CertisTokenData);
            else _CertisToken.upgradeTo(CertisTokenAddress);
        }
        if(address(0) != PrivatePoolFactoryAddress){
            if(0 < PrivatePoolFactoryData.length)_PrivatePoolFactory.upgradeToAndCall(PrivatePoolFactoryAddress, PrivatePoolFactoryData);
            else _PrivatePoolFactory.upgradeTo(PrivatePoolFactoryAddress);
        }
        if(address(0) != ProviderFactoryAddress){
            if(0 < ProviderFactoryData.length)_ProviderFactory.upgradeToAndCall(ProviderFactoryAddress, ProviderFactoryData);
            else _ProviderFactory.upgradeTo(ProviderFactoryAddress);
        }
        if(address(0) != PrivatePoolImplAddress)_PrivateCertificatePoolBeacon.upgradeTo(PrivatePoolImplAddress);
        if(address(0) != ProviderImplAddress)_ProviderBeacon.upgradeTo(ProviderImplAddress);
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
        return _PublicCertificatesPool.retrieveImplementation();
    }

    function retrieveTreasury() external override view returns (address) {
        return _Treasury.retrieveImplementation();
    }

    function retrieveCertisToken() external override view returns (address) {
        return _CertisToken.retrieveImplementation();
    }

    function retrievePrivatePoolFactory() external override view returns (address) {
        return _PrivatePoolFactory.retrieveImplementation();
    }

    function retrievePrivatePool() external override view returns (address) {
        return _PrivateCertificatePoolBeacon.implementation();
    }

    function retrieveProviderFactory() external override view returns (address) {
        return _ProviderFactory.retrieveImplementation();
    }

    function retrieveProvider() external override view returns (address) {
        return _ProviderBeacon.implementation();
    }
    
}