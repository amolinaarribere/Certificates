// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Interfaces/IProxyManager.sol";
import "./Proxies/PublicCertificatesPoolProxy.sol";
import "./PrivateCertificatesPool.sol";
import "./Proxies/PrivatePoolFactoryProxy.sol";
import "./Proxies/TreasuryProxy.sol";
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
    }

    ProposedContractsStruct _ProposedContracts;
    
    // Private Certificate Pools Factory
    PrivatePoolFactoryProxy _PrivatePoolFactory;

    // Private Certificates Pool
    UpgradeableBeacon _PrivateCertificatePoolBeacon;

    // Public Certificates Pool
    PublicCertificatesPoolProxy  _PublicCertificatesPool;

    // Treasury
    TreasuryProxy _Treasury;

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


    function InitializeContracts(address payable PublicPoolProxyAddress, address payable TreasuryProxyAddress, address payable CertisTokenProxyAddress, address payable PrivatePoolFactoryProxyAddress, address PrivateCertificatePoolImplAddress) 
        isFromChairPerson()
        isNotInitialized()
    external
    {
        _init = true;
        initProxies(PublicPoolProxyAddress, TreasuryProxyAddress, CertisTokenProxyAddress, PrivatePoolFactoryProxyAddress, PrivateCertificatePoolImplAddress);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    // governance : contracts assignment and management
    function updateContracts(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolFactoryAddress, address PrivatePoolImplAddress) external
    {
        _ProposedContracts.NewPublicPoolAddress = PublicPoolAddress;
        _ProposedContracts.NewTreasuryAddress = TreasuryAddress;
        _ProposedContracts.NewCertisTokenAddress = CertisTokenAddress;
        _ProposedContracts.NewPrivatePoolFactoryAddress = PrivatePoolFactoryAddress;
        _ProposedContracts.NewPrivatePoolAddress = PrivatePoolImplAddress;
        addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
    }

    function propositionApproved() internal override
    {
        upgradeContractsImplementations(_ProposedContracts.NewPublicPoolAddress, _ProposedContracts.NewTreasuryAddress, _ProposedContracts.NewCertisTokenAddress, _ProposedContracts.NewPrivatePoolFactoryAddress, _ProposedContracts.NewPrivatePoolAddress);
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

    function retrieveProposition() external override view returns(string[] memory)
    {
        string[] memory proposition = new string[](5);
        proposition[0] = AddressLibrary.AddressToString(_ProposedContracts.NewPublicPoolAddress);
        proposition[1] = AddressLibrary.AddressToString(_ProposedContracts.NewTreasuryAddress);
        proposition[2] = AddressLibrary.AddressToString(_ProposedContracts.NewCertisTokenAddress);
        proposition[3] = AddressLibrary.AddressToString(_ProposedContracts.NewPrivatePoolFactoryAddress);
        proposition[4] = AddressLibrary.AddressToString(_ProposedContracts.NewPrivatePoolAddress);
        return proposition;
    }

    function initProxies(address payable PublicPoolProxyAddress, address payable TreasuryProxyAddress, address payable CertisTokenProxyAddress, address payable PrivatePoolFactoryProxyAddress, address PrivateCertificatePoolImplAddress) internal
    {
        _PublicCertificatesPool = PublicCertificatesPoolProxy(PublicPoolProxyAddress);
        _Treasury = TreasuryProxy(TreasuryProxyAddress);
        _CertisToken = CertisTokenProxy(CertisTokenProxyAddress);
        _PrivatePoolFactory = PrivatePoolFactoryProxy(PrivatePoolFactoryProxyAddress);
        _PrivateCertificatePoolBeacon = new UpgradeableBeacon(PrivateCertificatePoolImplAddress);
    }

    function upgradeContractsImplementations(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolFactoryAddress, address PrivatePoolImplAddress) internal
    {
        _PublicCertificatesPool.upgradeTo(PublicPoolAddress);
        _Treasury.upgradeTo(TreasuryAddress);
        _CertisToken.upgradeTo(CertisTokenAddress);
        _PrivatePoolFactory.upgradeTo(PrivatePoolFactoryAddress);
        _PrivateCertificatePoolBeacon.upgradeTo(PrivatePoolImplAddress);
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

    // configuration implementations
    function retrievePublicCertificatePool() external override view returns (address) {
        return _PublicCertificatesPool.implementation();
    }

    function retrieveTreasury() external override view returns (address) {
        return _Treasury.implementation();
    }

    function retrieveCertisToken() external override view returns (address) {
        return _CertisToken.implementation();
    }

    function retrievePrivatePoolFactory() external override view returns (address) {
        return _PrivatePoolFactory.implementation();
    }

    function retrievePrivatePool() external override view returns (address) {
        return _PrivateCertificatePoolBeacon.implementation();
    }
    
}