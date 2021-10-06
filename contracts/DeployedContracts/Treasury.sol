// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Treasury receives all the payments and assigns dividends to token holders.
 Public Certificate Pool contract can ask for its owners to eb refunded even if they do not own tokens.

 First dividends must be assigned to an account and then the account owner can withdraw the funds.
 Both actions must be triggered by the account owner.

  Events : 
    - New Prices Added : list of prices
    - Payment recieved : payer, amount, new total aggregated contract amount
    - Refund : who, amount, among how many
    - Assign Dividends : who, amount (number of tokens), among how many (total supply)
    - Withdraw : who, how much
 */

import "../Interfaces/ITreasury.sol";
import "../Interfaces/IPriceConverter.sol";
import "../Libraries/UintLibrary.sol";
import "../Libraries/Library.sol";
import "../Base/TokenGovernanceBaseContract.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";


contract Treasury is ITreasury, TokenGovernanceBaseContract{
    using Library for *;
    using UintLibrary for *;

    // EVENTS /////////////////////////////////////////
    event _NewPrices(uint Public, uint Private, uint Provider, uint Certificate, uint OwnerRefund);
    event _Pay(address indexed Payer, uint Amount, uint AggregatedAmount);
    event _Refund(address indexed Owner, uint Amount, uint TotalOwners);
    event _AssignDividend(address indexed Recipient, uint Amount, uint TotalSupply);
    event _Withdraw(address indexed Recipient, uint Amount);

    // DATA /////////////////////////////////////////
    // proposition to change prices
    struct ProposedPricesStruct{
        uint NewPublicPriceUSD;
        uint NewCertificatePriceUSD;
        uint NewPrivatePriceUSD;
        uint NewProviderPriceUSD;
        uint NewOwnerRefundFeeUSD;
    }

    ProposedPricesStruct private _ProposedPrices;

    // prices parameters usd
    uint private _PublicPriceUSD;
    uint private _CertificatePriceUSD;
    uint private _PrivatePriceUSD;
    uint private _ProviderPriceUSD;
    uint private _OwnerRefundFeeUSD;

    // last amount at which dividends where assigned for each token owner
    uint private _AggregatedDividendAmount;
    mapping(address => uint) private _lastAssigned;

    // dividends per token owner
    struct _BalanceStruct{
        mapping(uint => uint) _balance;
        uint[] _factors;
    }
    
    mapping(address => _BalanceStruct) private _balances;

    // MODIFIERS /////////////////////////////////////////
    modifier areFundsEnough(Library.Prices price){
        uint256 minPriceUSD = 2**256 - 1;

        if(Library.Prices.NewProvider == price) minPriceUSD = _PublicPriceUSD;
        else if(Library.Prices.NewPool == price) minPriceUSD = _PrivatePriceUSD;
        else if(Library.Prices.NewCertificate == price) minPriceUSD = _CertificatePriceUSD;
        else minPriceUSD = _ProviderPriceUSD;

        uint256 minPriceETH = IPriceConverter(_managerContract.retrievePriceConverterProxy()).fromUSDToETH(minPriceUSD);

        require(msg.value >= minPriceETH, "EC2-");
        _;
    }

    modifier isBalanceEnough(uint amount){
        require(checkBalance(msg.sender) >= amount, "EC20-");
        _;
    }

    modifier isFromPublicPool(){
        require(true == Library.ItIsSomeone(_managerContract.retrievePublicCertificatePoolProxy()), "EC8-");
        _;
    }

    modifier isPriceOK(uint256 PublicPriceUSD, uint256 OwnerRefundFeeUSD){
        require(PublicPriceUSD >= OwnerRefundFeeUSD, "EC21-");
        _;
    }
    
    // CONSTRUCTOR /////////////////////////////////////////
    function Treasury_init(uint256 PublicPriceUSD, uint256 PrivatePriceUSD, uint256 ProviderPriceUSD, uint256 CertificatePriceUSD, uint256 OwnerRefundFeeUSD, address managerContractAddress, address chairPerson, uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage, string memory contractName, string memory contractVersion) public initializer 
    {
        super.TokenGovernanceContract_init(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, chairPerson, managerContractAddress, contractName, contractVersion);
        InternalupdatePrices(PublicPriceUSD, PrivatePriceUSD, ProviderPriceUSD, CertificatePriceUSD, OwnerRefundFeeUSD, true);
    }

    // GOVERNANCE /////////////////////////////////////////
    function updatePrices(uint256 PublicPriceUSD, uint256 PrivatePriceUSD, uint256 ProviderPriceUSD, uint256 CertificatePriceUSD, uint256 OwnerRefundFeeUSD) external override
    {
        InternalupdatePrices(PublicPriceUSD, PrivatePriceUSD, ProviderPriceUSD, CertificatePriceUSD, OwnerRefundFeeUSD, false);
    }

    function InternalupdatePrices(uint256 PublicPriceUSD, uint256 PrivatePriceUSD, uint256 ProviderPriceUSD, uint256 CertificatePriceUSD, uint256 OwnerRefundFeeUSD, bool fromConstructor) internal
        isPriceOK(PublicPriceUSD, OwnerRefundFeeUSD)
    {
        if(fromConstructor){
            _PublicPriceUSD = PublicPriceUSD;
            _PrivatePriceUSD = PrivatePriceUSD;
            _ProviderPriceUSD = ProviderPriceUSD;
            _CertificatePriceUSD = CertificatePriceUSD;
            _OwnerRefundFeeUSD = OwnerRefundFeeUSD;
        }
        else{
            addProposition();
            _ProposedPrices.NewPublicPriceUSD = PublicPriceUSD;
            _ProposedPrices.NewCertificatePriceUSD = CertificatePriceUSD;
            _ProposedPrices.NewPrivatePriceUSD = PrivatePriceUSD;
            _ProposedPrices.NewProviderPriceUSD = ProviderPriceUSD;
            _ProposedPrices.NewOwnerRefundFeeUSD = OwnerRefundFeeUSD;
        }
        
    }

    function propositionApproved() internal override
    {
        _PublicPriceUSD = _ProposedPrices.NewPublicPriceUSD;
        _PrivatePriceUSD = _ProposedPrices.NewPrivatePriceUSD;
        _ProviderPriceUSD = _ProposedPrices.NewProviderPriceUSD;
        _CertificatePriceUSD = _ProposedPrices.NewCertificatePriceUSD;
        _OwnerRefundFeeUSD = _ProposedPrices.NewOwnerRefundFeeUSD;
        
        removeProposition();

        emit _NewPrices(_PublicPriceUSD, _PrivatePriceUSD, _ProviderPriceUSD, _CertificatePriceUSD, _OwnerRefundFeeUSD);
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
        proposition[0] = UintLibrary.UintToBytes32(_ProposedPrices.NewPublicPriceUSD);
        proposition[1] = UintLibrary.UintToBytes32(_ProposedPrices.NewPrivatePriceUSD);
        proposition[2] = UintLibrary.UintToBytes32(_ProposedPrices.NewProviderPriceUSD);
        proposition[3] = UintLibrary.UintToBytes32(_ProposedPrices.NewCertificatePriceUSD);
        proposition[4] = UintLibrary.UintToBytes32(_ProposedPrices.NewOwnerRefundFeeUSD);
        return proposition;
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function pay(Library.Prices price) external 
        areFundsEnough(price)
    override payable
    {
        uint256 amount = msg.value;
        if(price == Library.Prices.NewProvider) amount -= IPriceConverter(_managerContract.retrievePriceConverterProxy()).fromUSDToETH(_OwnerRefundFeeUSD);
        _AggregatedDividendAmount += amount;

        emit _Pay(msg.sender, msg.value, _AggregatedDividendAmount);
    }

    function InternalonTokenBalanceChanged(address from, address to, uint256 amount) internal override
    {
        super.InternalonTokenBalanceChanged(from, to, amount);
        if(address(0) != from) InternalAssignDividends(from);
        if(address(0) != to) InternalAssignDividends(to);
    }

    function AssignDividends() external override
    {
       InternalAssignDividends(msg.sender);
    }

    function InternalAssignDividends(address recipient) internal
    {
        if(_lastAssigned[recipient] < _AggregatedDividendAmount){
           uint amountToSplit = _AggregatedDividendAmount - _lastAssigned[recipient];
           _lastAssigned[recipient] = _AggregatedDividendAmount;
           addBalance(recipient, amountToSplit * GetTokensBalance(recipient), totalSupply());
           
           emit _AssignDividend(recipient, amountToSplit * GetTokensBalance(recipient), totalSupply());
        }
    }

    function getRefund(address addr, uint numberOfOwners) external 
        isFromPublicPool()
    override
    {
        uint OwnerRefundFeeWei = IPriceConverter(_managerContract.retrievePriceConverterProxy()).fromUSDToETH(_OwnerRefundFeeUSD);
        addBalance(addr, OwnerRefundFeeWei, numberOfOwners);

        emit _Refund(addr, OwnerRefundFeeWei, numberOfOwners);
    }

    function withdraw(uint amount) external 
        isBalanceEnough(amount)
    override
    {
        uint[] memory f = returnFactors(msg.sender);
        (uint total, uint commonDividend) = sumUpTotal(msg.sender);
        uint remainder =  total - (amount * commonDividend);

        for(uint i=0; i < f.length; i++){
            substractBalance(msg.sender, returnBalanceForFactor(msg.sender, f[i]), f[i]);
        }

        addBalance(msg.sender, remainder, commonDividend);

        (bool success, bytes memory data) = msg.sender.call{value: amount}("");
        require(success, string(abi.encodePacked("Error transfering funds to address : ", data)));

        emit _Withdraw(msg.sender, amount);
    }

    function retrieveLastAssigned(address addr) external override view returns(uint)
    {
        return _lastAssigned[addr];
    }

    function retrieveBalance(address addr) external override view returns(uint)
    {
        return checkBalance(addr);
    }

    function retrievePrices() external override view returns(uint, uint, uint, uint, uint)
    {
        return(_PublicPriceUSD, _PrivatePriceUSD, _ProviderPriceUSD, _CertificatePriceUSD, _OwnerRefundFeeUSD);
    }

    function retrieveAggregatedAmount() external override view returns(uint){
        return _AggregatedDividendAmount;
    }

    function checkBalance(address addr) internal view returns(uint){
        (uint total, uint commonDividend) = sumUpTotal(addr);

        return total / commonDividend;
    }

    function sumUpTotal(address addr) internal view returns (uint, uint)
    {
        uint[] memory f = returnFactors(addr);
        uint CommonDividend = UintLibrary.ProductOfFactors(f);
        uint total = 0;

        for(uint i=0; i < f.length; i++){
            total += returnBalanceForFactor(addr, f[i]) * CommonDividend / f[i];
        }

        return (total, CommonDividend);
    }

    function returnFactors(address addr) internal view returns(uint[] memory){
        return _balances[addr]._factors;
    }

    function returnBalanceForFactor(address addr, uint factor) internal view returns(uint){
        return _balances[addr]._balance[factor];
    }

    function addBalance(address addr, uint amount, uint factor) internal
    {
        if(amount > 0){
            if(0 == _balances[addr]._balance[factor])
            {
                _balances[addr]._factors.push(factor);
            }
            _balances[addr]._balance[factor] += amount;
        }
    }

    function substractBalance(address addr, uint amount, uint factor) internal
    {
        require(_balances[addr]._balance[factor] >= amount, "Not enough balance for this factor");

        _balances[addr]._balance[factor] -= amount;

        if(0 == _balances[addr]._balance[factor])
        {
            UintLibrary.UintArrayRemoveResize(UintLibrary.FindUintPosition(factor, _balances[addr]._factors), _balances[addr]._factors);
        }
        
    }

}