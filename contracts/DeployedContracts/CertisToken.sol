// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../Libraries/AddressLibrary.sol";
import "../Interfaces/ICertisToken.sol";
import "../Interfaces/ITreasury.sol";
import "../Base/ManagedBaseContract.sol";

 contract CertisToken is  Initializable, ICertisToken, ManagedBaseContract, ERC20Upgradeable {
    using AddressLibrary for *;

    // DATA /////////////////////////////////////////
    // decimals
    uint8 private _decimals;

    //voting management
    uint private _lastFinishedProp;
    uint private _currentProp;
    mapping(uint => uint) private _propDeadline;
    mapping(uint => address) private _propProposer;
    mapping(uint => mapping(address => uint)) private _votersPerProp;

    // MODIFIERS /////////////////////////////////////////
    modifier isNotBlocked(address from, uint amount){
        require(false == Blocked(from, amount), "EC29");
        _;
    }

    modifier canRegister(){
        require(msg.sender == _managerContract.retrieveTreasuryProxy() ||
            msg.sender == address(_managerContract), "EC8");
        _;
    }

    modifier canCancel(uint id){
        require(msg.sender == _propProposer[id], "EC8");
        _;
    }

    modifier canVote(uint id){
        require(msg.sender == _propProposer[id], "EC8");
        _;
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function CertisToken_init(string memory name, string memory symbol, uint256 MaxSupply, address managerContractAddress, uint8 decimalsValue) public initializer {
        super.ManagedBaseContract_init(managerContractAddress);
        super.__ERC20_init(name, symbol);
    
        _decimals = decimalsValue;
        _mint(msg.sender, MaxSupply);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function decimals() public view override returns (uint8) 
    {
        return _decimals;
    }

    function RegisterProp(uint256 deadline) external 
        canRegister()
    override returns (uint256)
    {
        _propDeadline[_currentProp] = deadline;
        _propProposer[_currentProp] = msg.sender;
        _currentProp += 1;
        return _currentProp;
    }

    function RemoveProp(uint256 id) external
        canCancel(id)
    override
    {
        delete(_propDeadline[id]);
        delete(_propProposer[id]);
        if(_lastFinishedProp + 1 == id)_lastFinishedProp++;
    }

    function Voted(uint256 id, address voter, uint256 votingTokens) external
        canVote(id)
    override
    {
        _votersPerProp[id][voter] += votingTokens;
    }

    function GetVotingTokens(uint256 id, address addr) external view override returns(uint256)
    {
        return (this.balanceOf(addr) - _votersPerProp[id][addr]);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal 
        isNotBlocked(from, amount)
    override 
    {
        if(address(0) != from && address(0) != _managerContract.retrieveTreasuryProxy())
        {
            ITreasury(_managerContract.retrieveTreasuryProxy()).AssignDividends(from);
            ITreasury(_managerContract.retrieveTreasuryProxy()).AssignDividends(to);
        }

        transferVoting(from, to, amount);
    }

    function Blocked(address from, uint256 amount) internal returns(bool)
    {
        if(address(0) == from || _lastFinishedProp >= _currentProp) return false;

        bool incrementLastProp = true;

        for(uint i=_lastFinishedProp; i < _currentProp; i++){
            if(_propDeadline[i] < block.timestamp){
                delete(_propDeadline[i]);
                if(incrementLastProp)_lastFinishedProp++;
            }
            else{
                incrementLastProp = false;
                if(_votersPerProp[i][from] < amount) return true;
            }
        }

        return false;
    }

    function transferVoting(address from, address to, uint256 amount) internal 
    {
        if(address(0) != from && _lastFinishedProp < _currentProp) 
        {
            for(uint i=_lastFinishedProp; i < _currentProp; i++)
            {
                if(_propDeadline[i] >= block.timestamp)
                {
                    _votersPerProp[i][from] -= amount;
                    _votersPerProp[i][to] += amount;
                }
            }
        }
    }
  

 }