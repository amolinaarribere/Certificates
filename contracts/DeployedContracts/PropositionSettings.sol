// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
  Events : 
    - New Settings Added : list of settings
 */

import "../Interfaces/IPropositionSettings.sol";
import "../Libraries/UintLibrary.sol";
import "../Base/StdPropositionBaseContract.sol";

contract PropositionSettings is IPropositionSettings, StdPropositionBaseContract{
    using UintLibrary for *;

    // EVENTS /////////////////////////////////////////
    event _NewSettings(uint256 LifeTime, uint8 ThresholdPercentage, uint8 minWeightToProposePercentage);

    // DATA /////////////////////////////////////////
    uint256 internal _LifeTime;
    uint8 internal _ThresholdPerc;
    uint8 internal _minWeightToProposePerc;

    // MODIFIERS /////////////////////////////////////////
    modifier areSettingsOK(uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage){
        areSettingsOKFunc(PropositionThresholdPercentage, minWeightToProposePercentage);
        _;
    }

    function areSettingsOKFunc(uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage) internal pure{
        require(100 >= PropositionThresholdPercentage, "EC21-");
        require(100 >= minWeightToProposePercentage, "EC21-");
    }
    
    // CONSTRUCTOR /////////////////////////////////////////
    function PropositionSettings_init(address managerContractAddress, address chairPerson, uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage, string memory contractName, string memory contractVersion) public initializer 
        areSettingsOK(PropositionThresholdPercentage, minWeightToProposePercentage)

    {
        super.StdPropositionBaseContract_init(chairPerson, managerContractAddress, contractName, contractVersion);
        InternalupdateSettings(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage);
    }

    // GOVERNANCE /////////////////////////////////////////
    function checkProposition(bytes32[] memory NewValues) internal override 
        areSettingsOK(UintLibrary.Bytes32ToUint8(NewValues[1]), UintLibrary.Bytes32ToUint8(NewValues[2]))
    {}

    function UpdateAll() internal override
    {
        uint256 PropositionLifeTime = UintLibrary.Bytes32ToUint(_ProposedNewValues[0]);
        uint8 PropositionThresholdPercentage = UintLibrary.Bytes32ToUint8(_ProposedNewValues[1]);
        uint8 minWeightToProposePercentage = UintLibrary.Bytes32ToUint8(_ProposedNewValues[2]);

        InternalupdateSettings(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage);

        emit _NewSettings(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage);
    }

    function InternalupdateSettings(uint256 PropLifeTime, uint8 PropThresholdPerc, uint8 minWeightToPropPerc) internal
    {
        _LifeTime = PropLifeTime;
        _ThresholdPerc = PropThresholdPerc;
        _minWeightToProposePerc = minWeightToPropPerc;
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function retrieveSettings() external override view returns(uint256, uint8, uint8)
    {
        return(_LifeTime, _ThresholdPerc, _minWeightToProposePerc);
    }


}