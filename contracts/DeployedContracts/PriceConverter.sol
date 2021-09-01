// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "../Interfaces/IPriceConverter.sol";
import "../Base/TokenGovernanceBaseContract.sol";
import "../Libraries/AddressLibrary.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/Denominations.sol";


contract PriceConverter is IPriceConverter, TokenGovernanceBaseContract {
    using AddressLibrary for *;

     // EVENTS /////////////////////////////////////////
    event _NewRegistryAddress(address);

    // DATA /////////////////////////////////////////
    FeedRegistryInterface internal _registry;

    address internal _ProposedRegistryAddress;

    // CONSTRUCTOR /////////////////////////////////////////
    function PriceConverter_init(address registry, address managerContractAddress, address chairPerson, uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) public initializer 
    {
        super.TokenGovernanceContract_init(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, chairPerson, managerContractAddress);
        _registry = FeedRegistryInterface(registry);
    }

    // GOVERNANCE /////////////////////////////////////////
    function updateRegistryAddress(address NewRegistryAddress) external override
    {
        addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
        _ProposedRegistryAddress = NewRegistryAddress;
    }

    function propositionApproved() internal override
    {
        _registry = FeedRegistryInterface(_ProposedRegistryAddress);
        
        removeProposition();

        emit _NewRegistryAddress(_ProposedRegistryAddress);
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
         delete(_ProposedRegistryAddress);
    }

    function retrieveProposition() external override view returns(bytes32[] memory)
    {
        bytes32[] memory proposition = new bytes32[](1);
        proposition[0] = AddressLibrary.AddressToBytes32(_ProposedRegistryAddress);
        return proposition;
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function fromUSDToETH(uint _USDamount) external override view returns (uint) {
        (,int price,,,) = _registry.latestRoundData(Denominations.USD, Denominations.ETH);
        return uint(price) * _USDamount;
    }

    function retrieveRegistryAddress() external override view returns(address){
        return address(_registry);
    }

}