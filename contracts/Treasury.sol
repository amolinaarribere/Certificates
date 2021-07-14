// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./Interfaces/ITreasury.sol";
import "./PublicCertificatesPool.sol";



contract Treasury is ITreasury{

    // modifiers
    modifier areFundsEnough(uint minPrice){
        require(msg.value >= minPrice, "EC2");
        _;
    }

    modifier isBalanceEnough(uint amount){
        require(_balance[msg.sender] >= amount, "does not have enough money");
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
    mapping(address => uint) _balance;

    constructor(uint256 PublicPriceWei, uint256 PrivatePriceWei, uint256 OwnerRefundPriceWei, address PublicPoolAddress) {
        _PublicPriceWei = PublicPriceWei;
        _PrivatePriceWei = PrivatePriceWei;
        _OwnerRefundPriceWei = OwnerRefundPriceWei;
        _PublicCertificatesPool = PublicCertificatesPool(PublicPoolAddress);
    }

    function payForNewProposal() external 
        areFundsEnough(_PublicPriceWei)
    override payable
    {}

    function payForNewPool() external 
        areFundsEnough(_PrivatePriceWei)
    override payable
    {}

    function getRefund(address addr) external 
        isFromPublicPool()
    override
    {
        uint numberOfOwners = _PublicCertificatesPool.retrieveMinOwners();
        uint amountToRefund = _OwnerRefundPriceWei / numberOfOwners;
        _balance[addr] += amountToRefund;
    }

    function withdraw(uint amount) external 
        isBalanceEnough(amount)
    override
    {
        _balance[msg.sender] -= amount;
        msg.sender.transfer(amount);
    }

    function checkBalance(address addr) external override view returns(uint)
    {
        return _balance[addr];
    }

}