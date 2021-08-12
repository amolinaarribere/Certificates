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
    event _AddedProposition(address indexed, uint256, uint256, address[], uint256[]);
    event _CancelledProposition(address indexed);
    event _PropositionApproved(address indexed, uint256, uint256, address[]);
    event _PropositionRejected(address indexed, uint256, uint256, address[]);

    // DATA /////////////////////////////////////////
    // chair person
    address internal _chairperson;

    // Proposition Structure
    struct PropositionStruct{
        address Proposer;
        uint256 DeadLine;
        uint256 validationThreshold;
        uint256 VotesFor;
        uint256 VotesAgainst;
        address[] listOfAdmins;
        uint256[] AdminsWeight;
        address[] AlreadyVoted;
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
        require(true == AuthorizedToVote(msg.sender, _Proposition.listOfAdmins), "EC23");
         _;
    }

    modifier PropositionInProgress(bool yesOrno){
        if(yesOrno) require(true == CheckIfPropostiionActive(), "EC25");
        else require(false == CheckIfPropostiionActive(), "EC24");
        _;
    }

    modifier HasNotAlreadyVoted(){
        require(false == AddressLibrary.FindAddress(msg.sender, _Proposition.AlreadyVoted), "EC5");
        _;
    }

    modifier isPropOK(uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage){
        require(100 >= PropositionThresholdPercentage, "EC21");
        require(100 >= minWeightToProposePercentage, "EC21");
        _;
    }

    // auxiliairy function
    function AuthorizedToPropose(address add) internal view returns(bool) {
        if(msg.sender == _chairperson) return true;
        else 
        {
            address[] memory list = GetAdminList();
            uint256[] memory weights = GetAdminWeights();
            uint256 id = GetId(add, list);
            if(id < list.length){
                if(weights[id] >= (_minWeightToProposePercentage * totalSupply() / 100)) return true;
            }
            return false;
        }
    }

    function AuthorizedToVote(address add, address[] memory list) internal pure returns(bool) {
        return (GetId(add, list) < list.length);
    }

    function GetId(address add, address[] memory list) internal pure returns(uint256)
    {
        return AddressLibrary.FindAddressPosition(add, list);
    }

    function GetAdminList() internal view returns(address[] memory){
        (address[] memory list, ) = ICertisToken(_managerContract.retrieveCertisTokenProxy()).TokenOwners();
        return list;
    }

    function GetAdminWeights() internal view returns(uint256[] memory){
        (, uint256[] memory weights) = ICertisToken(_managerContract.retrieveCertisTokenProxy()).TokenOwners();
        return weights;
    }

    function GetTokenOwners() internal view returns(address[] memory, uint256[] memory){
        return ICertisToken(_managerContract.retrieveCertisTokenProxy()).TokenOwners();
    }

    function totalSupply() internal view returns(uint256){
        return ICertisToken(_managerContract.retrieveCertisTokenProxy()).totalSupply();
    }

    function GetTokensBalance(address add) internal view returns(uint256){
        return ICertisToken(_managerContract.retrieveCertisTokenProxy()).balanceOf(add);
    }

    function CheckIfPropostiionActive() internal returns(bool){
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
        _Proposition.listOfAdmins = GetAdminList();
        require(0 < _Proposition.listOfAdmins.length, "Impossible to add proposition, there are no admins");

        _Proposition.Proposer = msg.sender;
        _Proposition.DeadLine = _DeadLine;
        _Proposition.validationThreshold = totalSupply() * _validationThresholdPercentage / 100;
        _Proposition.AdminsWeight = GetAdminWeights();

        emit _AddedProposition(_Proposition.Proposer, _Proposition.DeadLine, _Proposition.validationThreshold, _Proposition.listOfAdmins, _Proposition.AdminsWeight);
    }

    function cancelProposition() external
        PropositionInProgress(true)
        isAuthorizedToCancel()
    {
        InternalCancelProposition();
        emit _CancelledProposition(_Proposition.Proposer);
    }

    function voteProposition(bool vote) external
        PropositionInProgress(true)
        canVote()
        HasNotAlreadyVoted()
    {
        if(block.timestamp < _Proposition.DeadLine)
        {
            _Proposition.AlreadyVoted.push(msg.sender);

            if(vote){
                _Proposition.VotesFor += _Proposition.AdminsWeight[GetId(msg.sender, GetAdminList())];
            }
            else{
                _Proposition.VotesAgainst += _Proposition.AdminsWeight[GetId(msg.sender, GetAdminList())];
            }

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
            emit _PropositionApproved(_Proposition.Proposer, _Proposition.VotesFor, _Proposition.VotesAgainst, _Proposition.AlreadyVoted);
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
            emit _PropositionRejected(_Proposition.Proposer, _Proposition.VotesFor, _Proposition.VotesAgainst, _Proposition.AlreadyVoted);
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
    }

    function retrievePropositionStatus() external view returns(address, uint256, uint256, uint256, uint256, address[] memory, uint256[] memory, address[] memory){
        return (_Proposition.Proposer,
            _Proposition.DeadLine,
            _Proposition.validationThreshold,
            _Proposition.VotesFor,
            _Proposition.VotesAgainst,
            _Proposition.listOfAdmins,
            _Proposition.AdminsWeight,
            _Proposition.AlreadyVoted
        );
    }

    function retrieveProposition() external virtual view returns(bytes32[] memory){}

    function propositionApproved() internal virtual{}

    function propositionRejected() internal virtual{}

    function propositionExpired() internal virtual{}

}