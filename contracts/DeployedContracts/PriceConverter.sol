// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Price Converter is an interface to the Chain Link Price Registry for USD to ETH exchange
 */

import "../Interfaces/IPriceConverter.sol";
import "../Base/ExternalRegistryBaseContract.sol";
import "@chainlink/contracts/src/v0.8/interfaces/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/Denominations.sol";


contract PriceConverter is IPriceConverter, ExternalRegistryBaseContract {

    // DATA /////////////////////////////////////////
    FeedRegistryInterface internal _registry;
    uint8 constant _ETHDecimals = 18;
    uint8 constant _USDDecimals = 2;

    // CONSTRUCTOR /////////////////////////////////////////
    function PriceConverter_init(address registry, address managerContractAddress, address chairPerson, string memory contractName, string memory contractVersion) public initializer 
    {
        super.ExternalRegistryBaseContract_init(chairPerson, managerContractAddress, contractName, contractVersion);
        _registry = FeedRegistryInterface(registry);
    }

    // GOVERNANCE /////////////////////////////////////////
    function UpdateRegistry() internal override
    {
        _registry = FeedRegistryInterface(_ProposedRegistryAddress);
    }

    function retrieveRegistryAddress() external override view returns(address)
    {
        return address(_registry);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function fromUSDToETH(uint _USDamount) external override view returns (uint) {
        uint8 decimals = _registry.decimals(Denominations.ETH, Denominations.USD);
        (,int price,,,) = _registry.latestRoundData(Denominations.ETH, Denominations.USD);

        uint256 amount = 10**(decimals + _ETHDecimals - _USDDecimals) * _USDamount / uint(price);
        uint256 remainder = 10**(decimals + _ETHDecimals - _USDDecimals) * _USDamount % uint(price);

        if(remainder > 0) amount += 1;

        return amount;
    }

}