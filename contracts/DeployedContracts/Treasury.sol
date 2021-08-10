// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Interfaces/ITreasury.sol";
import "../Libraries/UintLibrary.sol";
import "../Libraries/Library.sol";
import "../Base/TokenGovernanceBaseContract.sol";


contract Treasury is ITreasury, TokenGovernanceBaseContract{
    using Library for *;
    using UintLibrary for *;

    // EVENTS /////////////////////////////////////////
    event _NewPrices(uint, uint, uint, uint, uint);
    event _Pay(address indexed, uint);
    event _Refund(address indexed, uint);
    event _Withdraw(address indexed, uint);

    // DATA /////////////////////////////////////////
    // proposition to change prices
    struct ProposedPricesStruct{
        uint NewPublicPriceWei;
        uint NewCertificatePriceWei;
        uint NewPrivatePriceWei;
        uint NewProviderPriceWei;
        uint NewOwnerRefundPriceWei;
    }

    ProposedPricesStruct private _ProposedPrices;

    // parameters
    uint private _PublicPriceWei;
    uint private _CertificatePriceWei;
    uint private _PrivatePriceWei;
    uint private _ProviderPriceWei;
    uint private _OwnerRefundPriceWei;

    // dividends per token owner
    struct _BalanceStruct{
        mapping(uint => uint) _balance;
        uint[] _factors;
    }
    
    mapping(address => _BalanceStruct) private _balances;

    // MODIFIERS /////////////////////////////////////////
    modifier areFundsEnough(Library.Prices price){
        uint256 minPrice = 2**256 - 1;

        if(Library.Prices.NewProvider == price) minPrice = _PublicPriceWei;
        else if(Library.Prices.NewPool == price) minPrice = _PrivatePriceWei;
        else if(Library.Prices.NewCertificate == price) minPrice = _CertificatePriceWei;
        else minPrice = _ProviderPriceWei;

        require(msg.value >= minPrice, "EC2");
        _;
    }

    modifier isBalanceEnough(uint amount){
        require(checkBalance(msg.sender) >= amount, "EC20");
        _;
    }

    modifier isFromPublicPool(){
        require(true == Library.ItIsSomeone(_managerContract.retrievePublicCertificatePoolProxy()), "EC8");
        _;
    }

    modifier isPriceOK(uint256 PublicPriceWei, uint256 OwnerRefundPriceWei){
        require(PublicPriceWei >= OwnerRefundPriceWei, "EC21");
        _;
    }

    
    // CONSTRUCTOR /////////////////////////////////////////
    function Treasury_init(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 ProviderPriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei, address managerContractAddress, uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) public initializer 
    {
        super.TokenGovernanceContract_init(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, msg.sender, managerContractAddress);
        InternalupdatePrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei, true);
    }


    // GOVERNANCE /////////////////////////////////////////
    function updatePrices(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 ProviderPriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei) external override
    {
        InternalupdatePrices(PublicPriceWei, PrivatePriceWei, ProviderPriceWei, CertificatePriceWei, OwnerRefundPriceWei, false);
    }

    function InternalupdatePrices(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 ProviderPriceWei, uint256 CertificatePriceWei, uint256 OwnerRefundPriceWei, bool fromConstructor) internal
        isPriceOK(PublicPriceWei, OwnerRefundPriceWei)
    {
        if(fromConstructor){
            _PublicPriceWei = PublicPriceWei;
            _PrivatePriceWei = PrivatePriceWei;
            _ProviderPriceWei = ProviderPriceWei;
            _CertificatePriceWei = CertificatePriceWei;
            _OwnerRefundPriceWei = OwnerRefundPriceWei;
        }
        else{
            addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
            _ProposedPrices.NewPublicPriceWei = PublicPriceWei;
            _ProposedPrices.NewCertificatePriceWei = CertificatePriceWei;
            _ProposedPrices.NewPrivatePriceWei = PrivatePriceWei;
            _ProposedPrices.NewProviderPriceWei = ProviderPriceWei;
            _ProposedPrices.NewOwnerRefundPriceWei = OwnerRefundPriceWei;
        }
        
    }

    function propositionApproved() internal override
    {
        _PublicPriceWei = _ProposedPrices.NewPublicPriceWei;
        _PrivatePriceWei = _ProposedPrices.NewPrivatePriceWei;
        _ProviderPriceWei = _ProposedPrices.NewProviderPriceWei;
        _CertificatePriceWei = _ProposedPrices.NewCertificatePriceWei;
        _OwnerRefundPriceWei = _ProposedPrices.NewOwnerRefundPriceWei;
        
        removeProposition();

        emit _NewPrices(_PublicPriceWei, _PrivatePriceWei, _ProviderPriceWei, _CertificatePriceWei, _OwnerRefundPriceWei);
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

    function retrieveProposition() external override view returns(bytes32[] memory)
    {
        bytes32[] memory proposition = new bytes32[](5);
        proposition[0] = UintLibrary.UintToBytes32(_ProposedPrices.NewPublicPriceWei);
        proposition[1] = UintLibrary.UintToBytes32(_ProposedPrices.NewPrivatePriceWei);
        proposition[2] = UintLibrary.UintToBytes32(_ProposedPrices.NewProviderPriceWei);
        proposition[3] = UintLibrary.UintToBytes32(_ProposedPrices.NewCertificatePriceWei);
        proposition[4] = UintLibrary.UintToBytes32(_ProposedPrices.NewOwnerRefundPriceWei);
        return proposition;
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function pay(Library.Prices price) external 
        areFundsEnough(price)
    override payable
    {
        uint256 amount = msg.value;
        if(price == Library.Prices.NewProvider) amount -= _OwnerRefundPriceWei;
        AssignDividends(amount);

        emit _Pay(msg.sender, msg.value);
    }

    function AssignDividends(uint256 amount) internal
    {
        (address[] memory DividendsRecipients, uint256[] memory DividendsRecipientsTokens) = GetTokenOwners();
        uint256 TotalTokenSupply = totalSupply();

        for(uint i=0; i < DividendsRecipients.length; i++){
            addBalance(DividendsRecipients[i], DividendsRecipientsTokens[i] * amount, TotalTokenSupply);
        }

    }

    function getRefund(address addr, uint numberOfOwners) external 
        isFromPublicPool()
    override
    {
        addBalance(addr, _OwnerRefundPriceWei, numberOfOwners);

        emit _Refund(addr, numberOfOwners);
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

        emit _Withdraw(msg.sender, total);
    }

    function retrieveBalance(address addr) external override view returns(uint)
    {
        return checkBalance(addr);
    }

    function retrievePrices() external override view returns(uint, uint, uint, uint, uint)
    {
        return(_PublicPriceWei, _PrivatePriceWei, _ProviderPriceWei, _CertificatePriceWei, _OwnerRefundPriceWei);
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

        uint newFactorBalance = _balances[addr]._balance[factor] + amount;
        require(newFactorBalance >= _balances[addr]._balance[factor], "uint overflow adding");

       _balances[addr]._balance[factor] = newFactorBalance;
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