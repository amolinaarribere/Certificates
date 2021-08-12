// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../Interfaces/ICertisToken.sol";
 import "../Libraries/AddressLibrary.sol";
 import "../Libraries/Library.sol";
 import "./ManagedBaseContract.sol";
 import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract TokenGovernanceBaseContract is Initializable, ManagedBaseContract {
    using Library for *;
    using AddressLibrary for *; 

    // EVENTS /////////////////////////////////////////
    event _AddedProposition(uint256, address indexed, uint256, uint256);
    event _CancelledProposition(uint256, address indexed);
    event _PropositionVote(uint256, address indexed, bool, uint256);
    event _PropositionApproved(uint256, address indexed, uint256, uint256);
    event _PropositionRejected(uint256, address indexed, uint256, uint256);

    // DATA /////////////////////////////////////////
    // chair person
    address internal _chairperson;

    // Proposition Structure
    struct PropositionStruct{
        uint256 PropID;
        address Proposer;
        uint256 DeadLine;
        uint256 validationThreshold;
        uint256 VotesFor;
        uint256 VotesAgainst;
    }

    PropositionStruct internal _Proposition;

    uint internal _PropositionLifeTime;
    uint8 internal _PropositionThresholdPercentage;
    uint8 internal _minWeightToProposePercentage;

    // Proposition to change Prop parameters
    bool internal _currentPropisProp;

    struct ProposedPropositionStruct{
        uint256 NewPropositionLifeTime;
        uint8 NewPropositionThresholdPercentage;
        uint8 NewMinWeightToProposePercentage;
    }

    ProposedPropositionStruct internal _ProposedProposition;

    // MODIFIERS /////////////////////////////////////////
    modifier isFromChairPerson(){
        require(true == Library.ItIsSomeone(_chairperson), "EC8");
        _;
    }

    modifier isAuthorizedToPropose(){
        require(true == AuthorizedToPropose(msg.sender), "EC22");
        _;
    }

    modifier isAuthorizedToCancel(){
        require(msg.sender == _Proposition.Proposer, "EC22");
        _;
    }

    modifier canVote(){
        require(true == AuthorizedToVote(msg.sender), "EC23");
         _;
    }

    modifier PropositionInProgress(bool yesOrno){
        if(yesOrno) require(true == CheckIfPropositionActive(), "EC25");
        else require(false == CheckIfPropositionActive(), "EC24");
        _;
    }
/*
    modifier HasNotAlreadyVoted(){
        require(false == AddressLibrary.FindAddress(msg.sender, _Proposition.AlreadyVoted), "EC5");
        _;
    }*/

    modifier isPropOK(uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage){
        require(100 >= PropositionThresholdPercentage, "EC21");
        require(100 >= minWeightToProposePercentage, "EC21");
        _;
    }

    // auxiliairy function
    function AuthorizedToPropose(address addr) internal view returns(bool) {
        if(addr == _chairperson) return true;
        else 
        {
            uint numberOfTokens = GetTokensBalance(addr);
            if(numberOfTokens >= (_minWeightToProposePercentage * totalSupply() / 100)) return true;
            return false;
        }
    }

    function AuthorizedToVote(address addr) internal view returns(bool) {
        uint votingTokens = GetVotingTokens(addr);
        return (votingTokens > 0);
    }

 /*   function GetId(address add, address[] memory list) internal pure returns(uint256)
    {
        return AddressLibrary.FindAddressPosition(add, list);
    }*/

    function totalSupply() internal view returns(uint256){
        return ICertisToken(_managerContract.retrieveCertisTokenProxy()).totalSupply();
    }

    function GetTokensBalance(address add) internal view returns(uint256){
        return ICertisToken(_managerContract.retrieveCertisTokenProxy()).balanceOf(add);
    }

    function GetVotingTokens(address addr) internal view returns(uint256){
        return ICertisToken(_managerContract.retrieveCertisTokenProxy()).GetVotingTokens(_Proposition.PropID, addr);
    }

    function CheckIfPropositionActive() internal returns(bool){
        if(block.timestamp < _Proposition.DeadLine)
        {
            return true;
        }
        else 
        {
            if(address(0) != _Proposition.Proposer){
                propositionExpired();
                InternalCancelProposition();
            } 
            return false;
        }
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function TokenGovernanceContract_init(uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage, address chairperson, address managerContractAddress) internal initializer {
        super.ManagedBaseContract_init(managerContractAddress);
        _chairperson = chairperson; 
        InternalupdateProp(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, true);
    }
    
    // Manage Prop Parameters
    function updateProp(uint256 PropLifeTime, uint8 PropThresholdPerc, uint8 minWeightToPropPerc) external
    {
        InternalupdateProp(PropLifeTime, PropThresholdPerc, minWeightToPropPerc, false);
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
            _ProposedProposition.NewPropositionLifeTime = PropLifeTime;
            _ProposedProposition.NewPropositionThresholdPercentage = PropThresholdPerc;
            _ProposedProposition.NewMinWeightToProposePercentage = minWeightToPropPerc;
            _currentPropisProp = true;
            addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
        }   
    }

    function retrievePropConfig() external view returns(uint, uint8, uint8)
    {
        return(_PropositionLifeTime, _PropositionThresholdPercentage, _minWeightToProposePercentage);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function addProposition(uint256 _DeadLine, uint8 _validationThresholdPercentage) internal
        PropositionInProgress(false)
        isAuthorizedToPropose()
    {
        _Proposition.Proposer = msg.sender;
        _Proposition.DeadLine = _DeadLine;
        _Proposition.validationThreshold = totalSupply() * _validationThresholdPercentage / 100;
        _Proposition.PropID = ICertisToken(_managerContract.retrieveCertisTokenProxy()).RegisterProp(_DeadLine);

        emit _AddedProposition(_Proposition.PropID, _Proposition.Proposer, _Proposition.DeadLine, _Proposition.validationThreshold);
    }

    function cancelProposition() external
        PropositionInProgress(true)
        isAuthorizedToCancel()
    {
        InternalCancelProposition();
        emit _CancelledProposition(_Proposition.PropID, _Proposition.Proposer);
    }

    function voteProposition(bool vote) external
        PropositionInProgress(true)
        canVote()
    {
        if(block.timestamp < _Proposition.DeadLine)
        {

            if(vote){
                _Proposition.VotesFor += GetTokensBalance(msg.sender);
            }
            else{
                _Proposition.VotesAgainst += GetTokensBalance(msg.sender);
            }

            ICertisToken(_managerContract.retrieveCertisTokenProxy()).Voted(_Proposition.PropID, msg.sender, GetTokensBalance(msg.sender));
            emit _PropositionVote(_Proposition.PropID, msg.sender, vote, GetTokensBalance(msg.sender));
            checkProposition();
        }

        else 
        {
            if(_currentPropisProp){
                removePropositionProp();
            }
            else{
                propositionExpired();
            }
            InternalCancelProposition();
        }
    }

    function checkProposition() internal
    {
        if(_Proposition.VotesFor > _Proposition.validationThreshold) 
        {
            if(_currentPropisProp){
                _PropositionLifeTime = _ProposedProposition.NewPropositionLifeTime;
                _PropositionThresholdPercentage = _ProposedProposition.NewPropositionThresholdPercentage;
                _minWeightToProposePercentage = _ProposedProposition.NewMinWeightToProposePercentage;
                removePropositionProp();
            }
            else{
                propositionApproved();
            }
            InternalCancelProposition();
            emit _PropositionApproved(_Proposition.PropID, _Proposition.Proposer, _Proposition.VotesFor, _Proposition.VotesAgainst);
        }
        else if(_Proposition.VotesAgainst > _Proposition.validationThreshold)
        {
            if(_currentPropisProp){
                removePropositionProp();
            }
            else{
                propositionRejected();
            }
            InternalCancelProposition();
            emit _PropositionRejected(_Proposition.PropID, _Proposition.Proposer, _Proposition.VotesFor, _Proposition.VotesAgainst);
        } 
    }

    function removePropositionProp() internal
    {
        delete(_ProposedProposition);
        _currentPropisProp = false;
    }

    function InternalCancelProposition() internal
    {
        delete(_Proposition);
        ICertisToken(_managerContract.retrieveCertisTokenProxy()).RemoveProp(_Proposition.PropID);
    }

    function retrievePropositionStatus() external view returns(address, uint256, uint256, uint256, uint256){
        return (_Proposition.Proposer,
            _Proposition.DeadLine,
            _Proposition.validationThreshold,
            _Proposition.VotesFor,
            _Proposition.VotesAgainst
        );
    }

    function retrieveProposition() external virtual view returns(bytes32[] memory){}

    function propositionApproved() internal virtual{}

    function propositionRejected() internal virtual{}

    function propositionExpired() internal virtual{}

}