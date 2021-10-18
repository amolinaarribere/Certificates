// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
Common functionality for all Contracts which configuration must be managed by Tokens owners
  - Proposition can be added only by token owners with a minimum number of token or the chair person
  - Proposition can be voted for or against only by token owners
  - Proposition have a deadline
  - Proposition that reach the threshold are validated/cancelled
  - Proposition can be cancelled by the creator if not yet validated or cancelled by voters

Proposition LifeTime, minimum number of tokens to propose and threshold percentages are common to all proposition and can be changed as well.

Only one proposition can run at a time.

If tokens are transfered after voting, the new owner cannot use them to vote again.

Functionality (with basic security check)
    - Add Proposition
    - Vote on Proposition
    - Cancel Proposition
  
  Events : 
    - Prop added : id, proposer, deadline, threshold
    - Prop cancelled : id, proposer
    - Prop voted : id, voter, vote, tokens used
    - Prop approved : id, proposer, votes For, votes Against
    - Prop rejected : id, proposer, votes For, votes Against
    - PRop used tokens transfered : id, from, to, tokes used
  
 */

 import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
 import "../Interfaces/ITokenEventSubscriber.sol";
 import "../Libraries/AddressLibrary.sol";
 import "./SignatureBaseContract.sol";
 import "./ManagedBaseContract.sol";
 import "../Libraries/SignatureLibrary.sol";

abstract contract TokenGovernanceBaseContract is ITokenEventSubscriber, SignatureBaseContract, ManagedBaseContract {
    using AddressLibrary for *; 
    using SignatureLibrary for *;

    // EVENTS /////////////////////////////////////////
    event _AddedProposition(uint256 Id, address indexed Proposer, uint256 Deadline, uint256 Threshold);
    event _CancelledProposition(uint256 Id, address indexed Proposer);
    event _PropositionVote(uint256 Id, address indexed Voter, bool Vote, uint256 AmountTokens);
    event _PropositionApproved(uint256 Id, address indexed Proposer, uint256 VotesFor, uint256 VotesAgainst);
    event _PropositionRejected(uint256 Id, address indexed Proposer, uint256 VotesFor, uint256 VotesAgainst);
    event _UsedTokensTransfered(uint256 indexed Id, address From, address To, uint256 Amount);

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

    uint256 internal _nextPropID;

    mapping(uint => mapping(address => uint)) internal _votersPerProp;

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
    modifier isFromChairPerson(address addr){
        Library.ItIsSomeone(addr, _chairperson);
        _;
    }

    modifier isAuthorizedToPropose(address addr){
        bool isAuthorized = false;
        if(addr == _chairperson) isAuthorized = true;
        else 
        {
            uint numberOfTokens = GetTokensBalance(addr);
            if(numberOfTokens > (_minWeightToProposePercentage * totalSupply() / 100)) isAuthorized = true;
        }

        require(true == isAuthorized, "EC22-");
        _;
    }

    modifier isAuthorizedToCancel(address addr){
        Library.ItIsSomeone(addr, _Proposition.Proposer);
        _;
    }

    modifier canVote(address voter, uint256 id){
        uint votingTokens = GetVotingTokens(voter, id);
        require(votingTokens > 0, "EC23-");
        _;
    }

    modifier PropositionInProgress(bool yesOrno){
        PropositionInProgressFunc(yesOrno);
        _;
    }

    function PropositionInProgressFunc(bool yesOrno) internal {
        if(yesOrno) require(true == CheckIfPropositionActive(), "EC25-");
        else require(false == CheckIfPropositionActive(), "EC24-");
    }

    modifier isFromTokenContract(address addr){
        Library.ItIsSomeone(addr, _managerContract.retrieveCertisTokenProxy());
        _;
    }

    modifier isPropOK(uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage){
        require(100 >= PropositionThresholdPercentage, "EC21-");
        require(100 >= minWeightToProposePercentage, "EC21-");
        _;
    }

    // auxiliairy function
    

    function AuthorizedToVote(address addr, uint256 id) internal view returns(bool) {
        uint votingTokens = GetVotingTokens(addr, id);
        return (votingTokens > 0);
    }

    function totalSupply() internal view returns(uint256){
        return IERC20Upgradeable(_managerContract.retrieveCertisTokenProxy()).totalSupply();
    }

    function GetTokensBalance(address add) internal view returns(uint256){
        return IERC20Upgradeable(_managerContract.retrieveCertisTokenProxy()).balanceOf(add);
    }

    function GetVotingTokens(address addr, uint id) internal view returns(uint256){
        return (GetTokensBalance(addr) - _votersPerProp[id][addr]);
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
    function TokenGovernanceContract_init(uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage, address chairperson, address managerContractAddress, string memory contractName, string memory contractVersion) internal initializer {
        super.ManagedBaseContract_init(managerContractAddress);
        _chairperson = chairperson;
        _nextPropID = 0; 
        setContractConfig(contractName, contractVersion);
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
            addProposition();
        }   
    }

    function retrievePropConfig() external view returns(uint, uint8, uint8)
    {
        return(_PropositionLifeTime, _PropositionThresholdPercentage, _minWeightToProposePercentage);
    }

    function retrievePendingPropConfig() external view returns(uint, uint8, uint8, bool)
    {
        if(_currentPropisProp && (block.timestamp < _Proposition.DeadLine)){
            return (_ProposedProposition.NewPropositionLifeTime,
                _ProposedProposition.NewPropositionThresholdPercentage,
                _ProposedProposition.NewMinWeightToProposePercentage,
                true);
        }
        return (0,0,0,false);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function addProposition() internal
        PropositionInProgress(false)
        isAuthorizedToPropose(msg.sender)
    {
        _Proposition.Proposer = msg.sender;
        _Proposition.DeadLine = block.timestamp + _PropositionLifeTime;
        _Proposition.validationThreshold = totalSupply() * _PropositionThresholdPercentage / 100;
        _Proposition.PropID = _nextPropID;
        _nextPropID++;

        emit _AddedProposition(_Proposition.PropID, _Proposition.Proposer, _Proposition.DeadLine, _Proposition.validationThreshold);
    }

    function cancelProposition() external
        PropositionInProgress(true)
        isAuthorizedToCancel(msg.sender)
    {
        InternalCancelProposition();
        emit _CancelledProposition(_Proposition.PropID, _Proposition.Proposer);
    }

    function voteProposition(bool vote) external
    {
        votePropositionInternal(msg.sender, vote);
    }

    function votePropositionOnBehalfOf(address voter, uint256 propID, bool vote, uint256 nonce, uint256 deadline, bytes memory signature) external
    {
        checkSignature(voter, propID, vote, nonce, deadline, signature);
        votePropositionInternal(voter, vote);
    }

    function votePropositionInternal(address voter, bool vote) internal
        PropositionInProgress(true)
        canVote(voter, _Proposition.PropID)
    {
        uint VotingTokens = GetVotingTokens(voter, _Proposition.PropID);

        if(vote)
        {
            _Proposition.VotesFor += VotingTokens;
        }
        else
        {
            _Proposition.VotesAgainst += VotingTokens;
        }

        Voted(_Proposition.PropID, voter, VotingTokens);

        emit _PropositionVote(_Proposition.PropID, voter, vote, VotingTokens);

        checkProposition();
    }

    function checkSignature(address voter, uint256 propID, bool vote, uint256 nonce, uint256 deadline, bytes memory signature) internal
        isDeadlineOK(deadline)
        isNonceOK(voter, nonce)
    {
        require(_Proposition.PropID == propID, "EC35-");
        require(true == SignatureLibrary.verifyVote(voter, propID, vote, nonce, deadline, signature, _ContractName, _ContractVersion), "EC32-");
        validateNonce(voter, nonce);
    }

    function onTokenBalanceChanged(address from, address to, uint256 amount) external
        isFromTokenContract(msg.sender)
    override
    {
        InternalonTokenBalanceChanged(from, to, amount);
    }

    function InternalonTokenBalanceChanged(address from, address to, uint256 amount) internal virtual
    {
        if(true == CheckIfPropositionActive()) transferVoting(from, to, amount);
    }

    function transferVoting(address from, address to, uint256 amount) internal 
    {
        if(address(0) != from && _votersPerProp[_Proposition.PropID][from] > 0)
        {
            uint256 usedTokenToTransfer = amount;
            if(amount > _votersPerProp[_Proposition.PropID][from]) usedTokenToTransfer = _votersPerProp[_Proposition.PropID][from];

            _votersPerProp[_Proposition.PropID][from] -= usedTokenToTransfer;

            if(address(0) != to)  _votersPerProp[_Proposition.PropID][to] += usedTokenToTransfer;

            emit _UsedTokensTransfered(_Proposition.PropID, from, to, usedTokenToTransfer);
        }
    }

    function Voted(uint256 id, address voter, uint256 votingTokens) internal
    {
        _votersPerProp[id][voter] += votingTokens;
    }

    function checkProposition() internal
    {
        if(_Proposition.VotesFor >= _Proposition.validationThreshold) 
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
        else if(_Proposition.VotesAgainst >= _Proposition.validationThreshold)
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
    }

    function retrievePropositionStatus() external view returns(address, uint256, uint256, uint256, uint256){
        return (_Proposition.Proposer,
            _Proposition.DeadLine,
            _Proposition.validationThreshold,
            _Proposition.VotesFor,
            _Proposition.VotesAgainst
        );
    }

    function retrieveVotesForVoter(uint256 PropId, address voter) external view returns(uint256){
        return (_votersPerProp[PropId][voter]);
    }

    function retrieveChairPerson() external view returns(address){
        return _chairperson;
    }

    function retrieveNextPropId() external view returns(uint256){
        return _nextPropID;
    }

    function isCurrentPropositionProp() external view returns(bool){
        return _currentPropisProp;
    }

    function retrieveProposition() external virtual view returns(bytes32[] memory){}

    function propositionApproved() internal virtual{}

    function propositionRejected() internal virtual{}

    function propositionExpired() internal virtual{}

}