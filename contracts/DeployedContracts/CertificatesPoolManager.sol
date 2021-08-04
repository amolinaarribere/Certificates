// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Interfaces/IProxyManager.sol";
//import "./PublicCertificatesPool.sol";
import "./Proxies/PublicCertificatesPoolProxy.sol";
import "./PrivateCertificatesPool.sol";
//import "./PrivatePoolGenerator.sol";
import "./Proxies/PrivatePoolGeneratorProxy.sol";
//import "./Treasury.sol";
import "./Proxies/TreasuryProxy.sol";
import "../Base/TokenGovernanceBaseContract.sol";
//import "./CertisToken.sol";
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
        address NewPrivatePoolGeneratorAddress;
        address NewPrivatePoolAddress;
    }

    ProposedContractsStruct _ProposedContracts;
    
    // Private Certificate Pools Generator
    PrivatePoolGeneratorProxy _PrivatePoolGenerator;

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


    function InitializeContracts(address payable PublicPoolProxyAddress, address payable TreasuryProxyAddress, address payable CertisTokenProxyAddress, address payable PrivatePoolGeneratorProxyAddress, address PrivateCertificatePoolImplAddress) 
        isFromChairPerson()
        isNotInitialized()
    external
    {
        _init = true;
        initProxies(PublicPoolProxyAddress, TreasuryProxyAddress, CertisTokenProxyAddress, PrivatePoolGeneratorProxyAddress, PrivateCertificatePoolImplAddress);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    // governance : contracts assignment and management
    function updateContracts(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolGeneratorAddress, address PrivatePoolImplAddress) external
    {
        _ProposedContracts.NewPublicPoolAddress = PublicPoolAddress;
        _ProposedContracts.NewTreasuryAddress = TreasuryAddress;
        _ProposedContracts.NewCertisTokenAddress = CertisTokenAddress;
        _ProposedContracts.NewPrivatePoolGeneratorAddress = PrivatePoolGeneratorAddress;
        _ProposedContracts.NewPrivatePoolAddress = PrivatePoolImplAddress;
        addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
    }

    function propositionApproved() internal override
    {
        upgradeContractsImplementations(_ProposedContracts.NewPublicPoolAddress, _ProposedContracts.NewTreasuryAddress, _ProposedContracts.NewCertisTokenAddress, _ProposedContracts.NewPrivatePoolGeneratorAddress, _ProposedContracts.NewPrivatePoolAddress);
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
        proposition[3] = AddressLibrary.AddressToString(_ProposedContracts.NewPrivatePoolGeneratorAddress);
        proposition[4] = AddressLibrary.AddressToString(_ProposedContracts.NewPrivatePoolAddress);
        return proposition;
    }

    function initProxies(address payable PublicPoolProxyAddress, address payable TreasuryProxyAddress, address payable CertisTokenProxyAddress, address payable PrivatePoolGeneratorProxyAddress, address PrivateCertificatePoolImplAddress) internal
    {
        _PublicCertificatesPool = PublicCertificatesPoolProxy(PublicPoolProxyAddress);
        _Treasury = TreasuryProxy(TreasuryProxyAddress);
        _CertisToken = CertisTokenProxy(CertisTokenProxyAddress);
        _PrivatePoolGenerator = PrivatePoolGeneratorProxy(PrivatePoolGeneratorProxyAddress);
        _PrivateCertificatePoolBeacon = new UpgradeableBeacon(PrivateCertificatePoolImplAddress);
    }

    function upgradeContractsImplementations(address PublicPoolAddress, address TreasuryAddress, address CertisTokenAddress, address PrivatePoolGeneratorAddress, address PrivatePoolImplAddress) internal
    {
        _PublicCertificatesPool.upgradeTo(PublicPoolAddress);
        _Treasury.upgradeTo(TreasuryAddress);
        _CertisToken.upgradeTo(CertisTokenAddress);
        _PrivatePoolGenerator.upgradeTo(PrivatePoolGeneratorAddress);
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

    function retrievePrivatePoolGeneratorProxy() external override view returns (address) {
        return (address(_PrivatePoolGenerator));
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

    function retrievePrivatePoolGenerator() external override view returns (address) {
        return _PrivatePoolGenerator.implementation();
    }

    function retrievePrivatePool() external override view returns (address) {
        return _PrivateCertificatePoolBeacon.implementation();
    }
    
}