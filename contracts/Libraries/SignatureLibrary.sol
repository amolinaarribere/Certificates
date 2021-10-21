// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 signature verification common functionality
 */

library SignatureLibrary{

    // DATA /////////////////////////////////////////
    bytes32 public constant domainTypeHash = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 public constant addCertificateOnBehalfOfTypeHash = keccak256("addCertificateOnBehalfOf(address provider,bytes32 certificateHash,address holder,uint256 nonce,uint256 deadline)");
    bytes32 public constant voteTypeHash = keccak256("voteOnBehalfOf(address voter,uint256 propID,bool vote,uint256 nonce,uint256 deadline)");
    string public constant salt = '\x19\x01';


    // ADD CERTIFICATES FUNCTIONALITY /////////////////////////////////////////////////////////////
    function verifyAddCertificate(address provider, bytes32 certificateHash, address holder, uint nonce, uint256 deadline, bytes memory signature, string memory ContractName, string memory ContractVersion) public view returns (bool) 
    {
        bytes32 functionHash = getMessageHashAddCertificate(provider, certificateHash, holder, nonce, deadline);
        return verify(provider, functionHash, signature, ContractName, ContractVersion);
    }

    function getMessageHashAddCertificate(address provider, bytes32 certificateHash, address holder, uint nonce, uint256 deadline) public pure returns (bytes32) 
    {
        return keccak256(
                abi.encode(
                    addCertificateOnBehalfOfTypeHash,
                    provider,
                    certificateHash,
                    holder,
                    nonce,
                    deadline
            ));
    }

    // VOTE FUNCTIONALITY /////////////////////////////////////////////////////////////
    function verifyVote(address voter, uint256 propID, bool vote, uint nonce, uint256 deadline, bytes memory signature, string memory ContractName, string memory ContractVersion) public view returns (bool) 
    {
        bytes32 functionHash = getMessageHashVote(voter, propID, vote, nonce, deadline);
        return verify(voter, functionHash, signature, ContractName, ContractVersion);
    }

    function getMessageHashVote(address voter, uint256 propID, bool vote, uint nonce, uint256 deadline) public pure returns (bytes32) 
    {
        return keccak256(
             abi.encode(
                voteTypeHash,
                voter,
                propID,
                vote,
                nonce,
                deadline
            ));
    }

    // COMMON FUNCTIONALITY /////////////////////////////////////////////////////////////
    function verify(address signer, bytes32 _functionHash, bytes memory signature, string memory ContractName, string memory ContractVersion) internal view returns (bool) 
    {
        bytes32 domainHash = getDomainHash(ContractName, ContractVersion);
        bytes32 prefixedHash = keccak256(abi.encodePacked(salt, domainHash, _functionHash));
        return (recoverSigner(prefixedHash, signature) == signer);
    }

    function getDomainHash(string memory ContractName, string memory ContractVersion) public view returns(bytes32)
    {
        return keccak256(
            abi.encode(
                domainTypeHash,
                keccak256(bytes(ContractName)),
                keccak256(bytes(ContractVersion)),
                block.chainid,
                address(this)
        ));
      
    }

    function recoverSigner(bytes32 _prefixedHash, bytes memory _signature) public pure returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_prefixedHash, v, r, s);
    }

    function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "invalid signature length");
        assembly {
            // first 32 bytes, after the length prefix which are 32 bytes long too
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }
        // implicitly return (r, s, v)
    }
}