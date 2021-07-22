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

    // manager contract
    address _managerContract;

    // modifiers
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

    modifier isFromManagerContract(){
        require(true == Library.ItIsSomeone(_managerContract), "EC8");
        _;
    }

    modifier isPriceOK(uint256 PublicPriceWei, uint256 OwnerRefundPriceWei){
        require(PublicPriceWei >= OwnerRefundPriceWei, "EC21");
        _;
    }

    modifier isPropOK(uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage){
        require(100 >= PropositionThresholdPercentage, "EC21");
        require(100 >= minWeightToProposePercentage, "EC21");
        _;
    }

    // proposition to change
    struct ProposedPricesStruct{
        uint NewPublicPriceWei;
        uint NewCertificatePriceWei;
        uint NewPrivatePriceWei;
        uint NewOwnerRefundPriceWei;
    }

    ProposedPricesStruct _ProposedPrices;

    struct ProposedPropositionStruct{
        uint256 NewPropositionLifeTime;
        uint8 NewPropositionThresholdPercentage;
        uint8 NewMinWeightToProposePercentage;
    }

    ProposedPropositionStruct _ProposedProposition;

    enum PropositionType {None, Prices, Proposition}
    PropositionType _currentProp;

    // constants
    PublicCertificatesPool  _PublicCertificatesPool;
    uint _PublicPriceWei;
    uint _CertificatePriceWei;
    uint _PrivatePriceWei;
    uint _OwnerRefundPriceWei;
    uint _PropositionLifeTime;
    uint8 _PropositionThresholdPercentage;

    // data
    struct _BalanceStruct{
        mapping(uint => uint) _balance;
        uint[] _factors;
    }
    
    mapping(address => _BalanceStruct) _balances;

    constructor(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei, address PublicPoolAddress, address managerContractAddress, address CertisTokenAddress, uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) {
        _chairperson = msg.sender;
        _managerContract = managerContractAddress; 
        
        InternalupdatePrices(PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei, true);
        InternalupdateProp( PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, true);
        InternalupdateContracts(PublicPoolAddress, CertisTokenAddress);
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

    function updatePrices(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei) external override
    {
        InternalupdatePrices(PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei, false);
    }

    function updateProp(uint256 PropLifeTime, uint8 PropThresholdPerc, uint8 minWeightToPropPerc) external override
    {
        InternalupdateProp(PropLifeTime, PropThresholdPerc, minWeightToPropPerc, false);
    }

    function updateContracts(address PublicPoolAddress, address CertisTokenAddress) external 
        isFromManagerContract()
    override
    {
        InternalupdateContracts(PublicPoolAddress, CertisTokenAddress);
    }

    function InternalupdatePrices(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei, bool fromConstructor) internal
        isPriceOK(PublicPriceWei, OwnerRefundPriceWei)
    {
        if(fromConstructor){
            _PublicPriceWei = PublicPriceWei;
            _PrivatePriceWei = PrivatePriceWei;
            _CertificatePriceWei = CertificatePriceWei;
            _OwnerRefundPriceWei = OwnerRefundPriceWei;
        }
        else{
            addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
            _ProposedPrices.NewPublicPriceWei = PublicPriceWei;
            _ProposedPrices.NewCertificatePriceWei = CertificatePriceWei;
            _ProposedPrices.NewPrivatePriceWei = PrivatePriceWei;
            _ProposedPrices.NewOwnerRefundPriceWei = OwnerRefundPriceWei;
            _currentProp = PropositionType.Prices;
        }
        
    }

    function InternalupdateProp(uint256 PropLifeTime, uint8 PropThresholdPerc, uint8 minWeightToPropPerc, bool fromConstructor) internal
        isPropOK(PropThresholdPerc, minWeightToPropPerc)
    {
        if(fromConstructor){
            _PropositionLifeTime = PropLifeTime;
            _PropositionThresholdPercentage = PropThresholdPerc;
            _minWeightToProposePercentage = minWeightToPropPerc;
        }
        else{
            addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
            _ProposedProposition.NewPropositionLifeTime = PropLifeTime;
            _ProposedProposition.NewPropositionThresholdPercentage = PropThresholdPerc;
            _ProposedProposition.NewMinWeightToProposePercentage = minWeightToPropPerc;
            _currentProp = PropositionType.Proposition;
        }
        
    }

    function InternalupdateContracts(address PublicPoolAddress, address CertisTokenAddress) internal
    {
        _PublicCertificatesPool = PublicCertificatesPool(PublicPoolAddress);
        _CertisToken = CertisToken(CertisTokenAddress); 
    }

    function propositionApproved() internal override
    {
        if(PropositionType.Prices == _currentProp){
            _PublicPriceWei = _ProposedPrices.NewPublicPriceWei;
            _PrivatePriceWei = _ProposedPrices.NewPrivatePriceWei;
            _CertificatePriceWei = _ProposedPrices.NewCertificatePriceWei;
            _OwnerRefundPriceWei = _ProposedPrices.NewOwnerRefundPriceWei;
        }
        else if(PropositionType.Proposition == _currentProp){
            _PropositionLifeTime = _ProposedProposition.NewPropositionLifeTime;
            _PropositionThresholdPercentage = _ProposedProposition.NewPropositionThresholdPercentage;
            _minWeightToProposePercentage = _ProposedProposition.NewMinWeightToProposePercentage;
        }
        
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
        if(PropositionType.Prices == _currentProp){
            delete(_ProposedPrices);
        }
        else if(PropositionType.Proposition == _currentProp){
            delete(_ProposedProposition);
        }
        _currentProp = PropositionType.None;
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

    function retrievePrices() external override view returns(uint, uint, uint, uint)
    {
        return(_PublicPriceWei, _PrivatePriceWei, _CertificatePriceWei, _OwnerRefundPriceWei);
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