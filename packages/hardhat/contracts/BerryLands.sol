// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./IGatherGambit.sol";
import "./IBerries.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

// ========================================
//
//     Enter, stranger, but take heed
//     Of what awaits the sin of greed,
//     For those who take, but do not earn,
//     Must pay most dearly in their turn.
//
// ========================================

/**
 * @title Berry Lands
 * @notice A part of Gather Gambit on-chain risk protocol,
 * @notice In Berry Lands, you collect $BERRIES!
 * @dev A contract for staking your Gather Gambit NFTs.
 */
contract BerryLands is Ownable {
    // ========================================
    //     EVENT & ERROR DEFINITIONS
    // ========================================

    event StakedInBerryLands(
        uint256 indexed tokenId,
        address indexed owner,
        Location indexed location
    );
    event UnstakedFromBerryLands(
        uint256 indexed tokenId,
        address indexed owner,
        Location indexed location
    );
    event ProtectorAdded(
        uint256 indexed tokenId,
        uint256 indexed gathererId,
        address indexed owner,
        Location location
    );
    event ProtectorRemoved(
        uint256 indexed tokenId,
        uint256 indexed gathererId,
        address indexed owner,
        Location location
    );

    error NoPermission();
    error InvalidInput();
    error NotAGatherer();
    error NotAProtector();
    error NotAWolf();
    error NotStaked();

    // ========================================
    //     VARIABLE DEFINITIONS
    // ========================================

    enum Location {
        FertileFields,
        WhisperingWoods
    }

    struct StakedAsset {
        uint128 tokenId; // The token ID of the staked token
        uint128 protectorId; // The token ID of the protector (0 if no protector)
        uint64 initBlock; // The block at which was this token staked
        address owner; // The owner of the token
        uint256 berries; // The amount of accumulated berries
    }

    IGatherGambit private _gambit;
    IBerries private _berries;
    uint128 private _stakedGatherers;
    uint128 private _stakedProtectors;

    mapping(uint256 => StakedAsset) private _stakedInFertileFields;
    mapping(uint256 => StakedAsset) private _stakedInWhisperingWoods;
    mapping(uint256 => bool) private _isStakedProtector;

    // ========================================
    //    CONSTRUCTOR AND CORE FUNCTIONS
    // ========================================

    constructor(address _gambitAddress, address _berriesAddress) {
        _gambit = IGatherGambit(_gambitAddress);
        _berries = IBerries(_berriesAddress);
    }

    /**
     * @notice Stakes a token in the Fertile Fields.
     * @param _tokenId The token ID to stake.
     */
    function enterBerryLands(uint256 _tokenId, Location _location) external {
        if (_gambit.getEntity(_tokenId) != IGatherGambit.Entity.Gatherer)
            revert NotAGatherer();

        if (_location == Location.FertileFields) {
            if (_stakedInFertileFields[_tokenId].owner != address(0))
                revert NoPermission();

            _gambit.transferFrom(msg.sender, address(this), _tokenId);
            _stakedInFertileFields[_tokenId] = StakedAsset({
                tokenId: uint128(_tokenId),
                protectorId: 0,
                initBlock: uint64(block.number),
                owner: msg.sender,
                berries: 0
            });
        } else if (_location == Location.WhisperingWoods) {
            if (_stakedInWhisperingWoods[_tokenId].owner != address(0))
                revert NoPermission();

            _gambit.transferFrom(msg.sender, address(this), _tokenId);
            _stakedInWhisperingWoods[_tokenId] = StakedAsset({
                tokenId: uint128(_tokenId),
                protectorId: 0,
                initBlock: uint64(block.number),
                owner: msg.sender,
                berries: 0
            });
        } else {
            revert InvalidInput();
        }

        _stakedGatherers++;
        emit StakedInBerryLands(_tokenId, msg.sender, _location);
    }

    /**
     * @notice Unstakes a token from Berry Lands and claims $BERRIES.
     * @notice This also removes the protector if there is one.
     * @param _tokenId The token ID to unstake.
     * @param _location The location of where the token is staked.
     */
    function exitBerryLands(uint256 _tokenId, Location _location) external {
        if (_location == Location.FertileFields) {
            StakedAsset memory stakedAsset = _stakedInFertileFields[_tokenId];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            uint256 claimableBerries = getClaimableBerries(_tokenId, _location);

            _stakedGatherers--;
            uint128 protectorId = stakedAsset.protectorId;
            delete _stakedInFertileFields[_tokenId];

            if (protectorId != 0) {
                _isStakedProtector[protectorId] = false;
                _stakedProtectors--;
                _gambit.transferFrom(address(this), msg.sender, protectorId);
                emit ProtectorRemoved(
                    protectorId,
                    _tokenId,
                    msg.sender,
                    _location
                );
            }

            _berries.mint(msg.sender, claimableBerries);
            _gambit.transferFrom(address(this), msg.sender, _tokenId);
        } else if (_location == Location.WhisperingWoods) {
            StakedAsset memory stakedAsset = _stakedInWhisperingWoods[_tokenId];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            uint256 claimableBerries = getClaimableBerries(_tokenId, _location);

            _stakedGatherers--;
            uint128 protectorId = stakedAsset.protectorId;
            delete _stakedInWhisperingWoods[_tokenId];

            if (protectorId != 0) {
                _isStakedProtector[protectorId] = false;
                _stakedProtectors--;
                _gambit.transferFrom(address(this), msg.sender, protectorId);
                emit ProtectorRemoved(
                    protectorId,
                    _tokenId,
                    msg.sender,
                    _location
                );
            }

            _berries.mint(msg.sender, claimableBerries);
            _gambit.transferFrom(address(this), msg.sender, _tokenId);
        } else {
            revert InvalidInput();
        }

        emit UnstakedFromBerryLands(_tokenId, msg.sender, _location);
    }

    /**
     * @notice Adds a protector to a staked token.
     * @param _tokenId The token ID of the protector.
     * @param _gathererId The token ID of the gatherer.
     * @param _location The location of where the gatherer is staked.
     */
    function addProtector(
        uint256 _tokenId,
        uint256 _gathererId,
        Location _location
    ) external {
        if (_gambit.getEntity(_tokenId) != IGatherGambit.Entity.Protector)
            revert NotAProtector();

        if (_location == Location.FertileFields) {
            StakedAsset memory stakedAsset = _stakedInFertileFields[
                _gathererId
            ];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            _gambit.transferFrom(msg.sender, address(this), _tokenId);

            _isStakedProtector[_tokenId] = true;
            stakedAsset.protectorId = uint128(_tokenId);
        } else if (_location == Location.WhisperingWoods) {
            StakedAsset memory stakedAsset = _stakedInWhisperingWoods[
                _gathererId
            ];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            _gambit.transferFrom(msg.sender, address(this), _tokenId);

            _isStakedProtector[_tokenId] = true;
            stakedAsset.protectorId = uint128(_tokenId);
        } else {
            revert InvalidInput();
        }

        _stakedProtectors++;
        emit ProtectorAdded(_tokenId, _gathererId, msg.sender, _location);
    }

    /**
     * @notice Removes a protector from a staked token.
     * @param _tokenId The token ID of the protector.
     * @param _gathererId The token ID of the gatherer.
     * @param _location The location of where the gatherer is staked.
     */
    function removeProtector(
        uint256 _tokenId,
        uint256 _gathererId,
        Location _location
    ) external {
        if (!_isStakedProtector[_tokenId]) revert NotStaked();

        if (_location == Location.FertileFields) {
            StakedAsset memory stakedAsset = _stakedInFertileFields[
                _gathererId
            ];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            _isStakedProtector[_tokenId] = false;
            delete stakedAsset.protectorId;
            _stakedProtectors--;

            _gambit.transferFrom(address(this), msg.sender, _tokenId);
        } else if (_location == Location.WhisperingWoods) {
            StakedAsset memory stakedAsset = _stakedInWhisperingWoods[
                _gathererId
            ];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            _isStakedProtector[_tokenId] = false;
            delete stakedAsset.protectorId;
            _stakedProtectors--;

            _gambit.transferFrom(address(this), msg.sender, _tokenId);
        } else {
            revert InvalidInput();
        }

        emit ProtectorRemoved(_tokenId, _gathererId, msg.sender, _location);
    }

    // ========================================
    //     ADMIN FUNCTIONS
    // ========================================

    // ========================================
    //     GETTER FUNCTIONS
    // ========================================

    function getClaimableBerries(
        uint256 _tokenId,
        Location _location
    ) public view returns (uint256) {
        uint256 claimable;
        if (_location == Location.FertileFields) {
            StakedAsset memory stakedAsset = _stakedInFertileFields[_tokenId];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            uint256 DAILY_FERTILE_FIELDS_RATE = 1000;
            claimable =
                ((block.timestamp - stakedAsset.initBlock) *
                    DAILY_FERTILE_FIELDS_RATE) /
                1 days;
        } else if (_location == Location.WhisperingWoods) {
            StakedAsset memory stakedAsset = _stakedInWhisperingWoods[_tokenId];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            uint256 DAILY_WHISPERING_WOODS_RATE = 5000;
            claimable =
                ((block.timestamp - stakedAsset.initBlock) *
                    DAILY_WHISPERING_WOODS_RATE) /
                1 days;
        }

        return claimable;
    }

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
