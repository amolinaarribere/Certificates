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
import "../Base/StdPropositionBaseContract.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";


contract Treasury is ITreasury, StdPropositionBaseContract{
    using Library for *;
    using UintLibrary for *;

    // EVENTS /////////////////////////////////////////
    event _NewPrices(uint Public, uint Private, uint Provider, uint Certificate, uint OwnerRefund);
    event _Pay(address indexed Payer, uint Amount, uint AggregatedAmount);
    event _Refund(address indexed Owner, uint Amount, uint TotalOwners);
    event _AssignDividend(address indexed Recipient, uint Amount, uint TotalSupply);
    event _Withdraw(address indexed Recipient, uint Amount);

    // DATA /////////////////////////////////////////
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
    modifier areFundsEnough(uint256 value, Library.Prices price){
        uint256 minPriceUSD = 2**256 - 1;

        if(Library.Prices.NewProvider == price) minPriceUSD = _PublicPriceUSD;
        else if(Library.Prices.NewPool == price) minPriceUSD = _PrivatePriceUSD;
        else if(Library.Prices.NewCertificate == price) minPriceUSD = _CertificatePriceUSD;
        else minPriceUSD = _ProviderPriceUSD;

        uint256 minPriceETH = IPriceConverter(_managerContract.retrieveTransparentProxies()[5]).fromUSDToETH(minPriceUSD);

        require(value >= minPriceETH, "EC2-");
        _;
    }

    modifier isBalanceEnough(uint amount, address addr){
        require(checkFullBalance(addr) >= amount, "EC20-");
        _;
    }

    modifier isFromPublicPool(address addr){
        Library.ItIsSomeone(addr, _managerContract.retrieveTransparentProxies()[0]);
        _;
    }

    modifier isPriceOK(uint256 PublicPriceUSD, uint256 OwnerRefundFeeUSD){
        isPriceOKFunc(PublicPriceUSD, OwnerRefundFeeUSD);
        _;
    }

    function isPriceOKFunc(uint256 PublicPriceUSD, uint256 OwnerRefundFeeUSD) internal pure{
        require(PublicPriceUSD >= OwnerRefundFeeUSD, "EC21-");
    }
    
    // CONSTRUCTOR /////////////////////////////////////////
    function Treasury_init(uint256 PublicPriceUSD, uint256 PrivatePriceUSD, uint256 ProviderPriceUSD, uint256 CertificatePriceUSD, uint256 OwnerRefundFeeUSD, address managerContractAddress, address chairPerson, string memory contractName, string memory contractVersion) public initializer 
        isPriceOK(PublicPriceUSD, OwnerRefundFeeUSD)
    {
        super.StdPropositionBaseContract_init(chairPerson, managerContractAddress, contractName, contractVersion);
        InternalupdatePrices(PublicPriceUSD, PrivatePriceUSD, ProviderPriceUSD, CertificatePriceUSD, OwnerRefundFeeUSD);
    }

    // GOVERNANCE /////////////////////////////////////////
    function checkProposition(bytes[] memory NewValues) internal override 
        isPriceOK(UintLibrary.Bytes32ToUint(Library.BytestoBytes32(NewValues[0])[0]), UintLibrary.Bytes32ToUint(Library.BytestoBytes32(NewValues[4])[0]))
    {}

    function UpdateAll() internal override
    {
        bytes32[] memory ProposedNewValues = PropositionsToBytes32();

        uint256 PublicPriceUSD = UintLibrary.Bytes32ToUint(ProposedNewValues[0]);
        uint256 PrivatePriceUSD = UintLibrary.Bytes32ToUint(ProposedNewValues[1]);
        uint256 ProviderPriceUSD = UintLibrary.Bytes32ToUint(ProposedNewValues[2]);
        uint256 CertificatePriceUSD = UintLibrary.Bytes32ToUint(ProposedNewValues[3]);
        uint256 OwnerRefundFeeUSD = UintLibrary.Bytes32ToUint(ProposedNewValues[4]);

        InternalupdatePrices(PublicPriceUSD, PrivatePriceUSD, ProviderPriceUSD, CertificatePriceUSD, OwnerRefundFeeUSD);

        emit _NewPrices(PublicPriceUSD, PrivatePriceUSD, ProviderPriceUSD, CertificatePriceUSD, OwnerRefundFeeUSD);
    }

    function InternalupdatePrices(uint256 PublicPriceUSD, uint256 PrivatePriceUSD, uint256 ProviderPriceUSD, uint256 CertificatePriceUSD, uint256 OwnerRefundFeeUSD) internal
    {
        _PublicPriceUSD = PublicPriceUSD;
        _PrivatePriceUSD = PrivatePriceUSD;
        _ProviderPriceUSD = ProviderPriceUSD;
        _CertificatePriceUSD = CertificatePriceUSD;
        _OwnerRefundFeeUSD = OwnerRefundFeeUSD;
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function pay(Library.Prices price) external 
        areFundsEnough(msg.value, price)
    override payable
    {
        uint256 amount = msg.value;
        if(price == Library.Prices.NewProvider) amount -= IPriceConverter(_managerContract.retrieveTransparentProxies()[5]).fromUSDToETH(_OwnerRefundFeeUSD);
        _AggregatedDividendAmount += amount;

        emit _Pay(msg.sender, msg.value, _AggregatedDividendAmount);
    }

    function InternalonTokenBalanceChanged(address from, address to, uint256 amount) internal override
    {
        super.InternalonTokenBalanceChanged(from, to, amount);
        if(address(0) != from) InternalAssignDividends(from);
        if(address(0) != to) InternalAssignDividends(to);
    }

    function InternalAssignDividends(address recipient) internal
    {
        (uint totalOffBalance, uint DividendOffBalance) = sumUpTotalOffBalance(recipient);
        _lastAssigned[recipient] = _AggregatedDividendAmount;
        
        if(totalOffBalance > 0){   
           addBalance(recipient, totalOffBalance, DividendOffBalance);
           emit _AssignDividend(recipient, totalOffBalance, DividendOffBalance);
        }
    }

    function getRefund(address addr, uint numberOfOwners) external 
        isFromPublicPool(msg.sender)
    override
    {
        uint OwnerRefundFeeWei = IPriceConverter(_managerContract.retrieveTransparentProxies()[5]).fromUSDToETH(_OwnerRefundFeeUSD);
        addBalance(addr, OwnerRefundFeeWei, numberOfOwners);

        emit _Refund(addr, OwnerRefundFeeWei, numberOfOwners);
    }

    function withdraw(uint amount) external 
    override
    {
        InternalWithdraw(amount);
    }

    function withdrawAll() external override
    {
        uint All = checkFullBalance(msg.sender);
        InternalWithdraw(All);
    }

    function InternalWithdraw(uint amount) internal 
        isBalanceEnough(amount, msg.sender)
    {
        InternalAssignDividends(msg.sender);
        uint[] memory f = returnFactors(msg.sender);
        (uint total, uint commonDividend) = sumUpTotalOnBalance(msg.sender);
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

    function retrieveFullBalance(address addr) external override view returns(uint)
    {
        return checkFullBalance(addr);
    }

    function retrieveSettings() external override view returns(uint, uint, uint, uint, uint)
    {
        return(_PublicPriceUSD, _PrivatePriceUSD, _ProviderPriceUSD, _CertificatePriceUSD, _OwnerRefundFeeUSD);
    }

    function retrieveAggregatedAmount() external override view returns(uint){
        return _AggregatedDividendAmount;
    }

    function checkFullBalance(address addr) internal view returns(uint){
        (uint total, uint commonDividend) = sumUpTotal(addr);

        return total / commonDividend;
    }

    function sumUpTotal(address addr) internal view returns (uint, uint)
    {
        (uint totalOnBalance, uint commonDividendOnBalance) = sumUpTotalOnBalance(addr);
        (uint totalOffBalance, uint DividendOffBalance) = sumUpTotalOffBalance(addr);

        uint total = (totalOnBalance * DividendOffBalance) + (totalOffBalance * commonDividendOnBalance);
        uint CommonDividend = commonDividendOnBalance * DividendOffBalance;

        return (total, CommonDividend);
    }

    function sumUpTotalOnBalance(address addr) internal view returns (uint, uint)
    {
        uint[] memory f = returnFactors(addr);
        uint CommonDividend = UintLibrary.ProductOfFactors(f);
        uint total = 0;

        for(uint i=0; i < f.length; i++){
            total += returnBalanceForFactor(addr, f[i]) * CommonDividend / f[i];
        }

        return (total, CommonDividend);
    }

    function sumUpTotalOffBalance(address addr) internal view returns (uint, uint)
    {
        uint total = 0;

        if(_lastAssigned[addr] < _AggregatedDividendAmount)
        {
            total = (_AggregatedDividendAmount - _lastAssigned[addr]) * GetTokensBalance(addr);           
        }

        return (total, totalSupply());
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