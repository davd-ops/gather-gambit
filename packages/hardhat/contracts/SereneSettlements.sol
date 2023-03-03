// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./IGatherGambit.sol";
import "./Berries.sol";
import "hardhat/console.sol";

// ======================================================
//
//     There will be no foolish wand-waving
//     or silly incantations. As such, I don't expect
//     many of you to appreciate the subtle science
//     and exact art that is baby-making.
//
// ======================================================

/**
 * @title Serene Settlements
 * @notice A part of Gather Gambit on-chain risk protocol,
 * @notice In Serene Settlements, you use your $BERRIES to reproduce!
 * @dev A contract for minting new Gather Gambit NFTs for $BERRIES.
 */
contract SereneSettlements {
    // ========================================
    //     EVENT & ERROR DEFINITIONS
    // ========================================

    event ReproductionInitiated(
        uint256 indexed gatherer1,
        uint256 indexed gatherer2,
        address indexed owner
    );

    event ReproductionResolved(
        uint256 indexed gatherer1,
        uint256 indexed gatherer2,
        address indexed owner,
        bool success
    );

    error InvalidNumberOfGatherers();
    error NotAGatherer();
    error AlreadyReproducing();
    error ReproductionNotResolved();

    // ========================================
    //     VARIABLE DEFINITIONS
    // ========================================

    struct Reproduction {
        uint128 gatherer1; // The first gatherer token ID
        uint128 gatherer2; // The second gatherer token ID
        uint64 epochIndex; // The epoch index at which the reproduction was initiated
    }

    IGatherGambit private _gambit;
    IBerries private _berries;
    mapping(address => Reproduction) private _reproductions;

    // ========================================
    //    CONSTRUCTOR AND CORE FUNCTIONS
    // ========================================

    constructor(address _gambitAddress, address _berriesAddress) {
        _gambit = IGatherGambit(_gambitAddress);
        _berries = IBerries(_berriesAddress);
    }

    /**
     * @notice Stakes two tokens in the Serene Settlements & initiate reproduction.
     * @notice only Gatherers can breed.
     * @param _tokenIds The token IDs to reproduce from.
     */
    function initiateReproduction(uint256[] memory _tokenIds) external {
        if (_tokenIds.length != 2) revert InvalidNumberOfGatherers();

        _gambit.resolveEpochIfNecessary();

        for (uint256 i = 0; i < _tokenIds.length; ) {
            if (
                _gambit.getEntity(_tokenIds[i]) != IGatherGambit.Entity.Gatherer
            ) revert NotAGatherer();
            _gambit.transferFrom(msg.sender, address(this), _tokenIds[i]);

            unchecked {
                ++i;
            }
        }

        uint256 PRICE_FOR_REPRODUCTION = 10000 * (10 ** 18);

        _berries.transferFrom(
            msg.sender,
            address(this),
            PRICE_FOR_REPRODUCTION
        );

        _berries.burn(PRICE_FOR_REPRODUCTION);

        if (_reproductions[msg.sender].epochIndex != 0) {
            revert AlreadyReproducing();
        }

        _reproductions[msg.sender] = Reproduction({
            gatherer1: uint128(_tokenIds[0]),
            gatherer2: uint128(_tokenIds[1]),
            epochIndex: uint64(_gambit.getCurrentEpochIndex())
        });

        emit ReproductionInitiated(_tokenIds[0], _tokenIds[1], msg.sender);
    }

    function resolveReproduction() external {
        _gambit.resolveEpochIfNecessary();

        Reproduction memory reproduction = _reproductions[msg.sender];

        IGatherGambit.Epoch memory epoch = _gambit.getEpoch(
            reproduction.epochIndex
        );

        if (!epoch.resolved) revert ReproductionNotResolved();

        // get random number from resolved epoch
        uint256 outcomeRange = (uint256(
            keccak256(abi.encodePacked(epoch.randomness))
        ) % 100) + 1;

        bool success;
        // 90% chance of Gatherer, 10% of failure
        if (outcomeRange < 90) {
            _gambit.mint(msg.sender);
            success = true;
        }

        // send gatherers back
        _gambit.transferFrom(address(this), msg.sender, reproduction.gatherer1);
        _gambit.transferFrom(address(this), msg.sender, reproduction.gatherer2);

        emit ReproductionResolved(
            reproduction.gatherer1,
            reproduction.gatherer2,
            msg.sender,
            success
        );
    }

    // ========================================
    //     ADMIN FUNCTIONS
    // ========================================

    // ========================================
    //     GETTER FUNCTIONS
    // ========================================

    /**
     * @notice Returns the address of the Gather Gambit contract
     */
    function getGambitContract() external view returns (address) {
        return address(_gambit);
    }

    /**
     * @notice Returns the address of the Berry contract
     */
    function getBerriesContract() external view returns (address) {
        return address(_berries);
    }

    // ========================================
    //     OTHER FUNCTIONS
    // ========================================
}
