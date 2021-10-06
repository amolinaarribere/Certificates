// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/*
  Signature Base Contract contains the basic common functionality to contracts that accept EIP712 signature
 */
import "../Interfaces/ISignatureBaseContract.sol";

contract SignatureBaseContract is ISignatureBaseContract{

    // DATA /////////////////////////////////////////
    string internal _ContractName;
    string internal _ContractVersion;

    mapping(address => mapping(uint256 => bool)) internal nonces;

    // MODIFIERS /////////////////////////////////////////
    modifier isDeadlineOK(uint256 deadline){
        require(block.timestamp < deadline, "EC33-");
        _;
    }

    modifier isNonceOK(address addr, uint256 nonce){
        require(false == nonces[addr][nonce], "EC34-");
        _;
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function validateNonce(address addr, uint256 nonce) internal 
    {
        nonces[addr][nonce] = true;
    }

    function setContractConfig(string memory contractName, string memory contractVersion) internal
    {
        _ContractName = contractName;
        _ContractVersion = contractVersion;
    }

    function retrieveContractConfig() external override view returns(string memory, string memory)
    {
        return(_ContractName, _ContractVersion);
    }

    function retrieveNonce(address addr, uint256 nonce) external override view returns(bool)
    {
        return nonces[addr][nonce];
    } 

}