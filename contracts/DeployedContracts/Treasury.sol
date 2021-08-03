// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Interfaces/ITreasury.sol";
import "./PublicCertificatesPool.sol";
import "../Libraries/UintLibrary.sol";
import "../Libraries/Library.sol";
import "./CertisToken.sol";
import "../Base/TokenGovernanceBaseContract.sol";
import "../Base/ManagedBaseContract.sol";


contract Treasury is ITreasury, TokenGovernanceBaseContract, ManagedBaseContract{
    using Library for *;
    using UintLibrary for *;

    // DATA
    // proposition to change prices
    struct ProposedPricesStruct{
        uint NewPublicPriceWei;
        uint NewCertificatePriceWei;
        uint NewPrivatePriceWei;
        uint NewOwnerRefundPriceWei;
    }

    ProposedPricesStruct _ProposedPrices;

    // parameters
    PublicCertificatesPool  _PublicCertificatesPool;
    uint _PublicPriceWei;
    uint _CertificatePriceWei;
    uint _PrivatePriceWei;
    uint _OwnerRefundPriceWei;

    // dividends per token owner
    struct _BalanceStruct{
        mapping(uint => uint) _balance;
        uint[] _factors;
    }
    
    mapping(address => _BalanceStruct) _balances;

    // MODIFIERS
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

    modifier isPriceOK(uint256 PublicPriceWei, uint256 OwnerRefundPriceWei){
        require(PublicPriceWei >= OwnerRefundPriceWei, "EC21");
        _;
    }

    
    // CONSTRUCTOR
    /*constructor(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei, address managerContractAddress, uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) 
    TokenGovernanceBaseContract(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage)
    ManagedBaseContract(managerContractAddress)
    {
        InternalupdatePrices(PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei, true);
    }*/

    function Treasury_init(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei, address managerContractAddress, uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) public initializer 
    {
        super.TokenGovernanceContract_init(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, msg.sender);
        super.ManagedBaseContract_init(managerContractAddress);
        InternalupdatePrices(PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei, true);
    }


    // GOVERNANCE 
    function updatePrices(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei) external override
    {
        InternalupdatePrices(PublicPriceWei, PrivatePriceWei, CertificatePriceWei, OwnerRefundPriceWei, false);
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
        }
        
    }

    function propositionApproved() internal override
    {
        _PublicPriceWei = _ProposedPrices.NewPublicPriceWei;
        _PrivatePriceWei = _ProposedPrices.NewPrivatePriceWei;
        _CertificatePriceWei = _ProposedPrices.NewCertificatePriceWei;
        _OwnerRefundPriceWei = _ProposedPrices.NewOwnerRefundPriceWei;
        
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
         delete(_ProposedPrices);
    }

    function retrieveProposition() external override view returns(string[] memory)
    {
        string[] memory proposition = new string[](4);
        proposition[0] = UintLibrary.UintToString(_ProposedPrices.NewPublicPriceWei);
        proposition[1] = UintLibrary.UintToString(_ProposedPrices.NewPrivatePriceWei);
        proposition[2] = UintLibrary.UintToString(_ProposedPrices.NewCertificatePriceWei);
        proposition[3] = UintLibrary.UintToString(_ProposedPrices.NewOwnerRefundPriceWei);
        return proposition;
    }

    // FUNCTIONALITY
    function updateContracts(address PublicPoolAddressProxy, address CertisTokenAddressProxy) external 
        isFromManagerContract()
    override
    {
        _PublicCertificatesPool = PublicCertificatesPool(PublicPoolAddressProxy);
        _CertisToken = CertisToken(CertisTokenAddressProxy); 
    }

    function pay(Library.Prices price) external 
        areFundsEnough(price)
    override payable
    {
        uint256 amount = msg.value;
        if(price == Library.Prices.NewProvider) amount -= _OwnerRefundPriceWei;
        AssignDividends(amount);
    }

    function AssignDividends(uint256 amount) internal
    {
        (address[] memory DividendsRecipients, uint256[] memory DividendsRecipientsTokens) = _CertisToken.TokenOwners();
        uint256 TotalTokenSupply = _CertisToken.totalSupply();

        for(uint i=0; i < DividendsRecipients.length; i++){
            addBalance(DividendsRecipients[i], DividendsRecipientsTokens[i] * amount, TotalTokenSupply);
        }

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

    function addBalance(address addr, uint amount, uint factor) private
    {
        if(0 == _balances[addr]._balance[factor]){
             _balances[addr]._factors.push(factor);
        }

       _balances[addr]._balance[factor] += amount;
    }

    function substractBalance(address addr, uint amount, uint factor) private
    {
        require(_balances[addr]._balance[factor] >= amount, "Not enough balance for this factor");

        _balances[addr]._balance[factor] -= amount;

        if(0 == _balances[addr]._balance[factor]){
            _balances[addr]._factors = UintLibrary.UintArrayRemoveResize(UintLibrary.FindUintPosition(factor, _balances[addr]._factors), _balances[addr]._factors);
        }
        
    }

}