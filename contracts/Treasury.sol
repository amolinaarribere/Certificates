// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./Interfaces/ITreasury.sol";
import "./PublicCertificatesPool.sol";
import "./Libraries/Library.sol";


contract Treasury is ITreasury{

    // modifiers
    modifier areFundsEnough(uint minPrice){
        require(msg.value >= minPrice, "EC2");
        _;
    }

    modifier isBalanceEnough(uint amount){
        require(checkBalance(msg.sender) >= amount, "does not have enough money");
        _;
    }

    modifier isFromPublicPool(){
        require(msg.sender == address(_PublicCertificatesPool), "only invocations from public pool");
        _;
    }

    // constants
    PublicCertificatesPool  _PublicCertificatesPool;
    uint _PublicPriceWei;
    uint _PrivatePriceWei;
    uint _OwnerRefundPriceWei;

    // data
    struct _BalanceStruct{
        mapping(uint => uint) _balance;
        uint[] _factors;
    }
    
    mapping(address => _BalanceStruct) _balances;

    constructor(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 OwnerRefundPriceWei, address PublicPoolAddress) {
        _PublicPriceWei = PublicPriceWei;
        _PrivatePriceWei = PrivatePriceWei;
        _OwnerRefundPriceWei = OwnerRefundPriceWei;
        _PublicCertificatesPool = PublicCertificatesPool(PublicPoolAddress);
    }

    function payForNewProposal() external 
        areFundsEnough(_PublicPriceWei)
    override payable
    {
        // Assign dividends propotionaly (substracting the owners cut)
    }

    function payForNewPool() external 
        areFundsEnough(_PrivatePriceWei)
    override payable
    {
        // Assign dividends propotionaly (substracting the owners cut)
    }

    function getRefund(address addr, uint numberOfOwners) external 
        isFromPublicPool()
    override
    {
        addBalance( addr, _OwnerRefundPriceWei, numberOfOwners);
    }

    function withdraw(uint amount) external 
        isBalanceEnough(amount)
    override
    {
        uint[] memory f = returnFactors(msg.sender);
        uint total = 0;
        uint i = 0;

        while(total < amount){
            uint amountForFactor = returnBalanceForFactor(msg.sender, f[i]) / f[i];
            if(amountForFactor > (amount - total)) amountForFactor = amount - total;
            total += amountForFactor;
            substractBalance(msg.sender, amountForFactor, f[i]);
            i++;
        }

        msg.sender.transfer(amount);
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
            _balances[addr]._factors = Library.UintArrayRemoveResize(Library.FindUintPosition(factor, _balances[addr]._factors), _balances[addr]._factors);
        }
        
    }

}