// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./Interfaces/ITreasury.sol";
import "./PublicCertificatesPool.sol";
import "./Libraries/UintLibrary.sol";
import "./Libraries/Library.sol";
import "./CertisToken.sol";
import "./Base/TokenGovernanceBaseContract.sol";


contract Treasury is ITreasury, TokenGovernanceBaseContract{
    using Library for *;
    using UintLibrary for *;

    // creator
    address _creator;

    modifier areFundsEnough(Library.Prices price){
        uint256 minPrice = 2**256 - 1;

        if(Library.Prices.NewProvider == price) minPrice = _PublicPriceWei;
        else if(Library.Prices.NewPool == price) minPrice = _PrivatePriceWei;
        else if(Library.Prices.NewCertificate == price) minPrice = _CertificatePriceWei;

        require(msg.value >= minPrice, "EC2");
        _;
    }

    modifier isBalanceEnough(uint amount){
        require(checkBalance(msg.sender) >= amount, "EC20");
        _;
    }

    modifier isFromPublicPool(){
        require(true == Library.ItIsSomeone(address(_PublicCertificatesPool)), "EC8");
        _;
    }

    modifier isFromCreator(){
        require(true == Library.ItIsSomeone(_creator), "EC8");
        _;
    }

    modifier isConfigOK(uint256 PublicPriceWei, uint256 OwnerRefundPriceWei){
        require(PublicPriceWei >= OwnerRefundPriceWei, "EC21");
        _;
    }

    // proposition to change
    struct ProposedConfigStruct{
        address  NewPublicCertificatesPool;
        address  NewCertisToken;
        uint NewPublicPriceWei;
        uint NewCertificatePriceWei;
        uint NewPrivatePriceWei;
        uint NewOwnerRefundPriceWei;
        uint NewPropositionLifeTime;
        uint NewPropositionThresholdPercentage;
    }

    ProposedConfigStruct ProposedConfig;

    // constants
    PublicCertificatesPool  _PublicCertificatesPool;
    uint _PublicPriceWei;
    uint _CertificatePriceWei;
    uint _PrivatePriceWei;
    uint _OwnerRefundPriceWei;
    uint _PropositionLifeTime;
    uint _PropositionThresholdPercentage;

    // data
    struct _BalanceStruct{
        mapping(uint => uint) _balance;
        uint[] _factors;
    }
    
    mapping(address => _BalanceStruct) _balances;

    constructor(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei, address PublicPoolAddress, address managerContractAddress, address CertisTokenAddress, uint256 PropositionLifeTime, uint256 PropositionThresholdPercentage) {
        _creator = managerContractAddress; 
        InternalupdateConfig(PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei, PublicPoolAddress, CertisTokenAddress, PropositionLifeTime, PropositionThresholdPercentage, true);
    }


    function pay(Library.Prices price) external 
        areFundsEnough(price)
    override payable
    {
        uint256 amount = msg.value;
        if(price == Library.Prices.NewProvider) amount -= _OwnerRefundPriceWei;
        AssignDividends(amount);
    }

    function AssignDividends(uint256 amount) internal{
        (address[] memory DividendsRecipients, uint256[] memory DividendsRecipientsTokens) = _CertisToken.TokenOwners();
        uint256 TotalTokenSupply = _CertisToken.totalSupply();

        for(uint i=0; i < DividendsRecipients.length; i++){
            addBalance(DividendsRecipients[i], DividendsRecipientsTokens[i] * amount, TotalTokenSupply);
        }

    }

    function updateConfig(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei, address PublicPoolAddress, address CertisTokenAddress, uint256 PropositionLifeTime, uint256 PropositionThresholdPercentage) external override
    {
        InternalupdateConfig(PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei, PublicPoolAddress, CertisTokenAddress, PropositionLifeTime, PropositionThresholdPercentage, false);
    }

    function InternalupdateConfig(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei, address PublicPoolAddress, address CertisTokenAddress, uint256 PropositionLifeTime, uint256 PropositionThresholdPercentage, bool fromConstructor) internal
        isConfigOK(PublicPriceWei, OwnerRefundPriceWei)
    {
        if(fromConstructor){
            _PublicPriceWei = PublicPriceWei;
            _PrivatePriceWei = PrivatePriceWei;
            _CertificatePriceWei = CertificatePriceWei;
            _OwnerRefundPriceWei = OwnerRefundPriceWei;
            _PublicCertificatesPool = PublicCertificatesPool(PublicPoolAddress);
            _CertisToken = CertisToken(CertisTokenAddress);
            _PropositionLifeTime = PropositionLifeTime;
            _PropositionThresholdPercentage = PropositionThresholdPercentage;
        }
        else{
            addProposition(block.timestamp + PropositionLifeTime, PropositionThresholdPercentage);
            ProposedConfig.NewPublicCertificatesPool = PublicPoolAddress;
            ProposedConfig.NewCertisToken = CertisTokenAddress;
            ProposedConfig.NewPublicPriceWei = PublicPriceWei;
            ProposedConfig.NewCertificatePriceWei = CertificatePriceWei;
            ProposedConfig.NewPrivatePriceWei = PrivatePriceWei;
            ProposedConfig.NewOwnerRefundPriceWei = OwnerRefundPriceWei;
            ProposedConfig.NewPropositionLifeTime = PropositionLifeTime;
            ProposedConfig.NewPropositionThresholdPercentage = PropositionThresholdPercentage;
        }
        
    }

    function propositionApproved() internal override
    {
        _PublicPriceWei = ProposedConfig.NewPublicPriceWei;
        _PrivatePriceWei = ProposedConfig.NewPrivatePriceWei;
        _CertificatePriceWei = ProposedConfig.NewCertificatePriceWei;
        _OwnerRefundPriceWei = ProposedConfig.NewOwnerRefundPriceWei;
        _PublicCertificatesPool = PublicCertificatesPool(ProposedConfig.NewPublicCertificatesPool);
        _CertisToken = CertisToken(ProposedConfig.NewCertisToken);
        _PropositionLifeTime = ProposedConfig.NewPropositionLifeTime;
        _PropositionThresholdPercentage = ProposedConfig.NewPropositionThresholdPercentage;
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

    function removeProposition() internal{
        delete(ProposedConfig);
    }

    function getRefund(address addr, uint numberOfOwners) external 
        isFromPublicPool()
    override
    {
        addBalance(addr, _OwnerRefundPriceWei, numberOfOwners);
    }

    function withdraw(uint amount) external 
        isBalanceEnough(amount)
    override
    {
        uint[] memory f = returnFactors(msg.sender);
        uint total = 0;
        uint i = 0;

        while ((total < amount) && (i < f.length)){
            uint amountForFactor = returnBalanceForFactor(msg.sender, f[i]) / f[i];
            if(amountForFactor > (amount - total)) amountForFactor = amount - total;
            total += amountForFactor;
            substractBalance(msg.sender, amountForFactor * f[i], f[i]);
            i++;
        }

        require(total == amount, "UnExpected problem calculating the amount to withdraw");

        payable(msg.sender).transfer(total);
    }

    function retrieveBalance(address addr) external override view returns(uint)
    {
        return checkBalance(addr);
    }

    function checkBalance(address addr) internal view returns(uint){
        uint[] memory f = returnFactors(addr);
        uint total = 0;

        for(uint i=0; i < f.length; i++){
            total += returnBalanceForFactor(addr, f[i]) / f[i];
        }

        return total;
    }

    function returnFactors(address addr) public view returns(uint[] memory){
        return _balances[addr]._factors;
    }

    function returnBalanceForFactor(address addr, uint factor) public view returns(uint){
        return _balances[addr]._balance[factor];
    }

    function addBalance(address addr, uint amount, uint factor) private{
        if(0 == _balances[addr]._balance[factor]){
             _balances[addr]._factors.push(factor);
        }

       _balances[addr]._balance[factor] += amount;
    }

    function substractBalance(address addr, uint amount, uint factor) private{
        require(_balances[addr]._balance[factor] >= amount, "Not enough balance for this factor");

        _balances[addr]._balance[factor] -= amount;

        if(0 == _balances[addr]._balance[factor]){
            _balances[addr]._factors = UintLibrary.UintArrayRemoveResize(UintLibrary.FindUintPosition(factor, _balances[addr]._factors), _balances[addr]._factors);
        }
        
    }

}