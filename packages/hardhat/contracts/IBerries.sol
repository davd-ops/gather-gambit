// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBerries is IERC20 {
    event NewEpoch(uint256 indexed epochId, uint256 indexed revealBlock);

    enum Entity {
        Unrevealed,
        Gatherer,
        Protector,
        Wolf
    }

    struct Epoch {
        uint128 randomness; // The source of randomness for tokens from this epoch
        uint64 revealBlock; // The block at which this epoch was / is revealed
        bool committed; // Whether the epoch has been instantiated
        bool revealed; // Whether the epoch has been revealed
    }

    function mint(address _address, uint256 _amount) external;

    function burn(uint256 _tokenId) external;
}
