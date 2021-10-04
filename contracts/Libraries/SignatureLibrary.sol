// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 signature verification common functionality
 */

library SignatureLibrary{

    // DATA /////////////////////////////////////////
    /*struct EIP712DomainStruct{
        string name;
        string version;
        uint256 chainId,
        address verifyingContract
    }

    struct addCertificateOnBehalfOfStruct{
        address provider,
        bytes32 CertificateHash,
        address holder,
        uint256 nonce,
        uint256 deadline
    }

    struct votingStruct{
        address voter,
        uint256 nonce,
        uint256 deadline
    }*/

    string private constant domain = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";
    bytes32 public constant domainTypeHash = keccak256(abi.encodePacked(domain));
    string private constant addCertificateOnBehalfOfType = "addCertificateOnBehalfOf(address provider,bytes32 CertificateHash,address holder,uint256 nonce,uint256 deadline)";
    bytes32 public constant addCertificateOnBehalfOfTypeHash = keccak256(abi.encodePacked(addCertificateOnBehalfOfType));
    string private constant votingType = "voting(address voter,uint256 nonce,uint256 deadline)";
    bytes32 public constant votingTypeHash = keccak256(abi.encodePacked(votingType));


    // ADD CERTIFICATES FUNCTIONALITY /////////////////////////////////////////////////////////////
    function verifyAddCertificate(address provider, bytes32 certificateHash, address holder, uint nonce, uint256 deadline, bytes memory signature, string memory ContractName, string memory ContractVersion) public view returns (bool) 
    {
        bytes32 functionHash = getMessageHashAddCertificate(provider, certificateHash, holder, nonce, deadline, ContractName, ContractVersion);
        return verify(provider, functionHash, signature);
    }

    function getMessageHashAddCertificate(address provider, bytes32 certificateHash, address holder, uint nonce, uint256 deadline, string memory ContractName, string memory ContractVersion) public view returns (bytes32) 
    {
        // first we create the part of the hash related to the contract name, version, network (prod, test, ...) and address
        bytes32 eip712DomainHash = getDomainHash(ContractName, ContractVersion);

        // then we create the part of the hash related to the function and parameters and we combine them both
        bytes32 hashStruct = keccak256(
             abi.encodePacked(
                "\x19\x01",
                eip712DomainHash,
                keccak256(abi.encode(
                        addCertificateOnBehalfOfTypeHash,
                        provider,
                        certificateHash,
                        holder,
                        nonce,
                        deadline
                    ))
            ));

        return (hashStruct);
    }

    // VOTING FUNCTIONALITY /////////////////////////////////////////////////////////////
    function verifyVoting(address voter, uint nonce, uint256 deadline, bytes memory signature, string memory ContractName, string memory ContractVersion) public view returns (bool) 
    {
        bytes32 functionHash = getMessageHashVoting(voter, nonce, deadline, ContractName, ContractVersion);
        return verify(voter, functionHash, signature);
    }

    function getMessageHashVoting(address voter, uint nonce, uint256 deadline, string memory ContractName, string memory ContractVersion) public view returns (bytes32) {
        // first we create the part of the hash related to the contract name, version, network (prod, test, ...) and address
        bytes32 eip712DomainHash = getDomainHash(ContractName, ContractVersion);

        // then we create the part of the hash related to the function and parameters and we combine them both
        bytes32 hashStruct = keccak256(
             abi.encodePacked(
                "\x19\x01",
                eip712DomainHash,
                keccak256(abi.encode(
                        votingTypeHash,
                        voter,
                        nonce,
                        deadline
                    ))
            ));

        return (hashStruct);
    }

    // COMMON FUNCTIONALITY /////////////////////////////////////////////////////////////
    function verify(address signer, bytes32 functionHash, bytes memory signature) internal pure returns (bool) 
    {
        return recoverSigner(functionHash, signature) == signer;
    }

    function getDomainHash(string memory ContractName, string memory ContractVersion) public view returns(bytes32)
    {
        return keccak256(
            abi.encode(
                domainTypeHash,
                keccak256(bytes(ContractName)),
                keccak256(bytes(ContractVersion)), // version
                block.chainid,
                address(this)
        ));
      
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