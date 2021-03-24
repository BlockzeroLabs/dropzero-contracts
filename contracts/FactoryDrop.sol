// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./libraries/Create2.sol";

import "./Drop.sol";
import "./interfaces/IDrop.sol";
import "./interfaces/IFactoryDrop.sol";

contract FactoryDrop is IFactoryDrop {
    mapping(address => address) public override contractList;

    bool public feeStatus=true;

    event ClaimAdded(
        uint256 tokenAmount,
        uint256 deadline,
        address indexed owner,
        address indexed tokenAddress
    );

    event DropCreated(
        address indexed dropAddress,
        address indexed tokenAddress
    );

    function createDrop(
        uint256 tokenAmount,
        uint256 deadline,
        bytes32 root,
        address tokenAddress
    ) public override returns (address dropAddress) {
        // deadline < block.timestamp
        require(deadline > block.timestamp, "Factory:: Invalid deadline");
        // check in contractlist if this contract aready exists
        require(
            contractList[tokenAddress] == address(0),
            "Factory:: Contract already exists"
        );
        // check if token address is not zero
        require(tokenAddress != address(0), "Factory:: Invalid token address");

        address owner = msg.sender;

        bytes memory bytecode = type(Drop).creationCode;

        bytes32 salt = keccak256(abi.encodePacked(block.timestamp, owner));

        dropAddress = Create2.deploy(0, salt, bytecode);

        IDrop(dropAddress).initialize(tokenAddress);

        addClaimInDrop(tokenAmount, deadline, root,tokenAddress,owner);

        // emit addclaim event
        emit ClaimAdded(tokenAmount, deadline, owner, tokenAddress);

        contractList[tokenAddress] = dropAddress;

        emit DropCreated(dropAddress, tokenAddress);
    }

    function addClaimInDrop(
        uint256 tokenAmount,
        uint256 deadline,
        bytes32 root,
        address tokenAddress,
        address owner
    ) public override {
        require(
            contractList[tokenAddress] != address(0),
            "Factory:: Drop contract doesn't exist"
        );

        require(deadline > block.timestamp, "Factory:: Invalid deadline");

        IDrop(contractList[tokenAddress]).addClaim(
            owner,
            root,
            deadline,
            tokenAmount
        );

        emit ClaimAdded(tokenAmount, deadline, msg.sender, tokenAddress);
    }
}
