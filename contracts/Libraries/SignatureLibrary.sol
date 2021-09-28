// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 signature verification common functionality
 */

library SignatureLibrary{

    // ADD CERTIFICATES FUNCTIONALITY /////////////////////////////////////////////////////////////
    function verifyAddCertificate(address provider, bytes32 CertificateHash, address holder, uint nonce, uint256 deadline, bytes memory signature, string memory ContractName, string memory ContractVersion) public view returns (bool) 
    {
        (bytes32 domainHash, bytes32 functionHash) = getMessageHashAddCertificate(provider, CertificateHash, holder, nonce, deadline, ContractName, ContractVersion);
        return verify(provider, domainHash, functionHash, signature);
    }

    function getMessageHashAddCertificate(address provider, bytes32 CertificateHash, address holder, uint nonce, uint256 deadline, string memory ContractName, string memory ContractVersion) public view returns (bytes32, bytes32) 
    {
        // first we create the part of the hash related to the contract name, version, network (prod, test, ...) and address
        bytes32 eip712DomainHash = getDomainHash(ContractName, ContractVersion);

        // then we create the part of the hash related to the function and parameters
        bytes32 hashStruct = keccak256(
            abi.encode(
                keccak256("addCertificateOnBehalfOf(address provider,bytes32 CertificateHash,address holder,uint nonce,uint256 deadline)"),
                provider,
                CertificateHash, 
                holder, 
                nonce, 
                deadline
            )
        );

        return (eip712DomainHash, hashStruct);
    }

    // VOTING FUNCTIONALITY /////////////////////////////////////////////////////////////
    function verifyVoting(address voter, uint nonce, uint256 deadline, bytes memory signature, string memory ContractName, string memory ContractVersion) public view returns (bool) 
    {
        (bytes32 domainHash, bytes32 functionHash) = getMessageHashVoting(voter, nonce, deadline, ContractName, ContractVersion);
        return verify(voter, domainHash, functionHash, signature);
    }

    function getMessageHashVoting(address voter, uint nonce, uint256 deadline, string memory ContractName, string memory ContractVersion) public view returns (bytes32, bytes32) {
        // first we create the part of the hash related to the contract name, version, network (prod, test, ...) and address
        bytes32 eip712DomainHash = getDomainHash(ContractName, ContractVersion);

        // then we create the part of the hash related to the function and parameters
        bytes32 hashStruct = keccak256(
            abi.encode(
                keccak256("votingOnBehalfOf(address voter, uint nonce,uint256 deadline)"),
                voter,
                nonce, 
                deadline
            )
        );

        return (eip712DomainHash, hashStruct);
    }

    // COMMON FUNCTIONALITY /////////////////////////////////////////////////////////////
    function verify(address signer, bytes32 domainHash, bytes32 functionHash, bytes memory signature) internal pure returns (bool) 
    {
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(domainHash, functionHash);
        return recoverSigner(ethSignedMessageHash, signature) == signer;
    }

    function getDomainHash(string memory ContractName, string memory ContractVersion) public view returns(bytes32)
    {
        return keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(ContractName)),
                keccak256(bytes(ContractVersion)),
                block.chainid,
                address(this)
            )
        );
    }

    function getEthSignedMessageHash(bytes32 domainHash, bytes32 functionHash) public pure returns (bytes32)
    {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", domainHash, functionHash));
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
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