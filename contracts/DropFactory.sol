// SPDX-License-Identifier: MIT
pragma solidity 0.8.3;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interfaces/IDropFactory.sol";

import "./Drop.sol";

contract DropFactory is IDropFactory {
    using SafeERC20 for IERC20;

    mapping(address => address) public drops;

    modifier dropExists(address tokenAddress) {
        require(drops[tokenAddress] != address(0), "FACTORY_DROP_DOES_NOT_EXIST");
        _;
    }

    function createDrop(address tokenAddress) external override {
        bytes memory bytecode = type(Drop).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(tokenAddress));
        address dropAddress = Create2.deploy(0, salt, bytecode);
        Drop(dropAddress).initialize(tokenAddress);
        drops[tokenAddress] = dropAddress;
        emit DropCreated(dropAddress, tokenAddress);
    }

    function addDropData(
        uint256 tokenAmount,
        uint256 deadline,
        bytes32 merkleRoot,
        address tokenAddress
    ) external override dropExists(tokenAddress) {
        address dropAddress = drops[tokenAddress];
        IERC20(tokenAddress).transferFrom(msg.sender, dropAddress, tokenAmount);
        Drop(dropAddress).addDropData(msg.sender, merkleRoot, deadline, tokenAmount);
    }

    function claimFromDrop(
        address tokenAddress,
        uint256 index,
        uint256 amount,
        bytes32 merkleRoot,
        bytes32[] calldata merkleProof
    ) external override dropExists(tokenAddress) {
        Drop(drops[tokenAddress]).claim(index, msg.sender, amount, merkleRoot, merkleProof);
        DropClaimed(tokenAddress, index, msg.sender, amount, merkleRoot);
    }

    function multipleClaimsFromDrop(
        address tokenAddress,
        uint256[] calldata indexes,
        uint256[] calldata amounts,
        bytes32[] calldata merkleRoots,
        bytes32[][] calldata merkleProofs
    ) external override dropExists(tokenAddress) {
        address dropAddress = drops[tokenAddress];
        address user = msg.sender;
        for (uint256 i = 0; i < indexes.length; i++) {
            Drop(dropAddress).claim(indexes[i], user, amounts[i], merkleRoots[i], merkleProofs[i]);
            DropClaimed(tokenAddress, indexes[i], user, amounts[i], merkleRoots[i]);
        }
    }

    function withdrawFromDropAfterDeadline(address tokenAddress, bytes32 merkleRoot) external override dropExists(tokenAddress) {
        uint256 withdrawAmount = Drop(drops[tokenAddress]).withdrawAfterDeadline(msg.sender, merkleRoot);
        emit DropWithdrawn(tokenAddress, msg.sender, merkleRoot, withdrawAmount);
    }

    function isDropClaimed(
        address tokenAddress,
        uint256 index,
        bytes32 merkleRoot
    ) external view override dropExists(tokenAddress) returns (bool) {
        return Drop(drops[tokenAddress]).isClaimed(index, merkleRoot);
    }
}
