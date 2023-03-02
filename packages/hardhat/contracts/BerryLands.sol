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
    event AttackInitiated(
        uint256 indexed attackerId,
        uint256 indexed defenderId,
        address indexed owner,
        Location location
    );
    event AttackResolved(
        uint256 indexed attackerId,
        uint256 indexed defenderId,
        address indexed owner,
        Location location
    );

    error NoPermission();
    error InvalidLocation();
    error NotAGatherer();
    error NotAProtector();
    error NotAWolf();
    error NotStaked();
    error AttackNotResolved();
    error NoTargets();

    // ========================================
    //     VARIABLE DEFINITIONS
    // ========================================

    enum Location {
        FertileFields,
        WhisperingWoods
    }

    struct StakedAsset {
        uint128 tokenId; // The token ID of the staked token // TODO: is this neccessary?
        uint128 protectorId; // The token ID of the protector (0 if no protector)
        uint128 indexInGathArray; // The index of the token in the gatherers array
        uint64 initBlock; // The block at which was this token staked
        address owner; // The owner of the token
        uint256 claimableBerries; // The amount of berries that can be claimed
    }

    struct Attack {
        uint128 attackerId; // The token ID of the attacking wolf
        uint64 epochIndex; // The epoch index at which the attack was initiated
        uint8 location; // The location of the attack
        address owner; // The owner of the attacking wolf
    }

    IGatherGambit private _gambit;
    IBerries private _berries;
    uint128 private _stakedProtectors;
    uint16 private constant _denominator = 10000;

    uint128[] private _gatherersInFertileFields;
    uint128[] private _gatherersInWhisperingWoods;

    mapping(uint256 => StakedAsset) private _stakedInFertileFields;
    mapping(uint256 => StakedAsset) private _stakedInWhisperingWoods;
    mapping(uint256 => bool) private _isStakedProtector;
    mapping(uint256 => Attack) private _attacks;

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

            uint256 newIndex = _gatherersInFertileFields.length;
            _gatherersInFertileFields.push(uint128(_tokenId));

            _stakedInFertileFields[_tokenId] = StakedAsset({
                tokenId: uint128(_tokenId),
                protectorId: 0,
                indexInGathArray: uint128(newIndex),
                initBlock: uint64(block.number),
                owner: msg.sender,
                claimableBerries: 0
            });
        } else if (_location == Location.WhisperingWoods) {
            if (_stakedInWhisperingWoods[_tokenId].owner != address(0))
                revert NoPermission();

            uint256 newIndex = _gatherersInWhisperingWoods.length;
            _gatherersInWhisperingWoods.push(uint128(_tokenId));

            _gambit.transferFrom(msg.sender, address(this), _tokenId);
            _stakedInWhisperingWoods[_tokenId] = StakedAsset({
                tokenId: uint128(_tokenId),
                protectorId: 0,
                indexInGathArray: uint128(newIndex),
                initBlock: uint64(block.number),
                owner: msg.sender,
                claimableBerries: 0
            });
        } else {
            revert InvalidLocation();
        }

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
            StakedAsset storage stakedAsset = _stakedInFertileFields[_tokenId];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            uint256 claimableBerries = getClaimableBerries(_tokenId, _location);

            // override the old position with the last element of the array, and then pop the last element
            // this clears the storage and saves gas
            uint256 index = stakedAsset.indexInGathArray;
            uint128 lastIndexValue = _gatherersInFertileFields[
                _gatherersInFertileFields.length - 1
            ];
            _gatherersInFertileFields[index] = lastIndexValue;
            _stakedInFertileFields[lastIndexValue].indexInGathArray = uint128(
                index
            );
            _gatherersInFertileFields.pop();

            uint128 protectorId = stakedAsset.protectorId;
            delete _stakedInFertileFields[_tokenId];
            _stakedInFertileFields[_tokenId] = stakedAsset;

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
            StakedAsset storage stakedAsset = _stakedInWhisperingWoods[
                _tokenId
            ];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            uint256 claimableBerries = getClaimableBerries(_tokenId, _location);

            // override the old position with the last element of the array, and then pop the last element
            // this clears the storage and saves gas
            uint256 index = stakedAsset.indexInGathArray;
            uint128 lastIndexValue = _gatherersInWhisperingWoods[
                _gatherersInWhisperingWoods.length - 1
            ];
            _gatherersInWhisperingWoods[index] = lastIndexValue;
            _stakedInWhisperingWoods[lastIndexValue].indexInGathArray = uint128(
                index
            );
            _gatherersInWhisperingWoods.pop();

            uint128 protectorId = stakedAsset.protectorId;
            delete _stakedInWhisperingWoods[_tokenId];
            _stakedInWhisperingWoods[_tokenId] = stakedAsset;

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
            revert InvalidLocation();
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
            _stakedInFertileFields[_gathererId] = stakedAsset;
        } else if (_location == Location.WhisperingWoods) {
            StakedAsset memory stakedAsset = _stakedInWhisperingWoods[
                _gathererId
            ];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            _gambit.transferFrom(msg.sender, address(this), _tokenId);

            _isStakedProtector[_tokenId] = true;
            stakedAsset.protectorId = uint128(_tokenId);
            _stakedInWhisperingWoods[_gathererId] = stakedAsset;
        } else {
            revert InvalidLocation();
        }

        _stakedProtectors++;
        emit ProtectorAdded(_tokenId, _gathererId, msg.sender, _location);
    }

    /**
     * @notice Removes a protector from a staked token.
     * @param _gathererId The token ID of the gatherer.
     * @param _location The location of where the gatherer is staked.
     * @dev make sure to call this with gatherer ID, not protector ID
     */
    function removeProtector(uint256 _gathererId, Location _location) external {
        if (_location == Location.FertileFields) {
            StakedAsset memory stakedAsset = _stakedInFertileFields[
                _gathererId
            ];
            uint128 protectorId = stakedAsset.protectorId;
            if (stakedAsset.owner != msg.sender) revert NoPermission();
            if (!_isStakedProtector[protectorId]) revert NotStaked();

            _isStakedProtector[protectorId] = false;
            delete stakedAsset.protectorId;
            _stakedInFertileFields[_gathererId] = stakedAsset;
            _stakedProtectors--;
            _gambit.transferFrom(address(this), msg.sender, protectorId);
            emit ProtectorRemoved(
                protectorId,
                _gathererId,
                msg.sender,
                _location
            );
        } else if (_location == Location.WhisperingWoods) {
            StakedAsset memory stakedAsset = _stakedInWhisperingWoods[
                _gathererId
            ];
            uint128 protectorId = stakedAsset.protectorId;
            if (stakedAsset.owner != msg.sender) revert NoPermission();
            if (!_isStakedProtector[protectorId]) revert NotStaked();

            _isStakedProtector[protectorId] = false;
            delete stakedAsset.protectorId;
            _stakedInWhisperingWoods[_gathererId] = stakedAsset;
            _stakedProtectors--;
            _gambit.transferFrom(address(this), msg.sender, protectorId);
            emit ProtectorRemoved(
                protectorId,
                _gathererId,
                msg.sender,
                _location
            );
        } else {
            revert InvalidLocation();
        }
    }

    /**
     * @notice Initiates an attack.
     * @notice This locks your wolf until the attack is resolved.
     * @param _tokenId The token ID of the attacking Wolf.
     * @param _location The location of where the attacker is staked.
     */
    function initiateAttack(uint256 _tokenId, Location _location) external {
        if (_gambit.getEntity(_tokenId) != IGatherGambit.Entity.Wolf)
            revert NotAWolf();
        if (_gambit.ownerOf(_tokenId) != msg.sender) revert NoPermission();

        _gambit.resolveEpochIfNecessary();

        uint256 epochIndex = _gambit.getCurrentEpochIndex();

        _gambit.transferFrom(msg.sender, address(this), _tokenId);

        _attacks[_tokenId] = Attack({
            attackerId: uint128(_tokenId),
            epochIndex: uint64(epochIndex),
            location: uint8(_location),
            owner: msg.sender
        });
    }

    /**
     * @notice Resolves an attack.
     * @param _tokenId The token ID of the attacking Wolf.
     */
    function resolveAttack(uint256 _tokenId) external {
        Attack memory attack = _attacks[_tokenId];
        address attacker = attack.owner;
        uint256 stolen;
        bool wolfKilled;
        if (attacker != msg.sender) revert NoPermission();

        _gambit.resolveEpochIfNecessary();

        IGatherGambit.Epoch memory epoch = _gambit.getEpoch(attack.epochIndex);

        if (!epoch.resolved) revert AttackNotResolved();

        if (Location(attack.location) == Location.FertileFields) {
            if (_gatherersInFertileFields.length == 0) revert NoTargets();

            // get random index from staked gatherers, using randomness from resolved epoch
            uint256 index = uint256(
                keccak256(abi.encodePacked(epoch.randomness))
            ) % _gatherersInFertileFields.length;

            StakedAsset memory stakedAsset = _stakedInFertileFields[
                _gatherersInFertileFields[index]
            ];

            // protected - in fertile fields
            if (stakedAsset.protectorId > 0) {
                // get total claimable berries
                uint256 claimable = getClaimableBerries(
                    stakedAsset.tokenId,
                    Location(attack.location)
                );

                // keep 40% as a reward for wolf
                stolen = (claimable * (4000)) / _denominator;

                // keep 60% for gatherer
                claimable = claimable - stolen;

                // update state
                _stakedInFertileFields[stakedAsset.tokenId] = StakedAsset({
                    tokenId: stakedAsset.tokenId,
                    protectorId: stakedAsset.protectorId,
                    indexInGathArray: stakedAsset.indexInGathArray,
                    initBlock: uint64(block.number),
                    owner: stakedAsset.owner,
                    claimableBerries: claimable
                });
                delete _attacks[_tokenId];
            }
            // not protected - in fertile fields
            else {
                // steal all claimable berries
                stolen = getClaimableBerries(
                    stakedAsset.tokenId,
                    Location(attack.location)
                );

                // update state
                _stakedInFertileFields[stakedAsset.tokenId] = StakedAsset({
                    tokenId: stakedAsset.tokenId,
                    protectorId: stakedAsset.protectorId,
                    indexInGathArray: stakedAsset.indexInGathArray,
                    initBlock: uint64(block.number),
                    owner: stakedAsset.owner,
                    claimableBerries: 0
                });
                delete _attacks[_tokenId];
            }
        } else if (attack.location == uint8(Location.WhisperingWoods)) {
            if (_gatherersInWhisperingWoods.length == 0) revert NoTargets();

            // get random index from staked gatherers, using randomness from resolved epoch
            uint256 index = uint256(
                keccak256(abi.encodePacked(epoch.randomness))
            ) % _gatherersInWhisperingWoods.length;

            StakedAsset memory stakedAsset = _stakedInWhisperingWoods[
                _gatherersInWhisperingWoods[index]
            ];

            // protected - in whispering woods
            if (stakedAsset.protectorId > 0) {
                // get total claimable berries
                uint256 claimable = getClaimableBerries(
                    stakedAsset.tokenId,
                    Location(attack.location)
                );

                // keep 70% as a reward for wolf
                stolen = (claimable * (7000)) / _denominator;

                // keep 30% for gatherer
                claimable = claimable - stolen;

                // update state
                _stakedInWhisperingWoods[stakedAsset.tokenId] = StakedAsset({
                    tokenId: stakedAsset.tokenId,
                    protectorId: stakedAsset.protectorId,
                    indexInGathArray: stakedAsset.indexInGathArray,
                    initBlock: uint64(block.number),
                    owner: stakedAsset.owner,
                    claimableBerries: claimable
                });
                delete _attacks[_tokenId];

                // 5% chance to kill the wolf
                if (
                    (uint256(keccak256(abi.encodePacked(epoch.randomness))) %
                        100) +
                        1 <
                    5
                ) wolfKilled = true;
            }
            // not protected - in whispering woods
            else {
                // steal all claimable berries
                stolen = getClaimableBerries(
                    stakedAsset.tokenId,
                    Location(attack.location)
                );

                // kill gatherer
                delete _stakedInWhisperingWoods[stakedAsset.tokenId];
                // override the old position with the last element of the array, and then pop the last element
                // this clears the storage and saves gas
                uint128 lastIndexValue = _gatherersInWhisperingWoods[
                    _gatherersInWhisperingWoods.length - 1
                ];
                _gatherersInWhisperingWoods[index] = lastIndexValue;
                _stakedInWhisperingWoods[lastIndexValue]
                    .indexInGathArray = uint128(index);
                _gatherersInWhisperingWoods.pop();

                // update state
                delete _attacks[_tokenId];

                //burn gatherer
                _gambit.burn(stakedAsset.tokenId);
            }
        } else {
            revert InvalidLocation();
        }

        if (stolen > 0) {
            // mint berries
            _berries.mint(msg.sender, stolen);
        }

        if (wolfKilled) {
            // burn wolf
            _gambit.burn(_tokenId);
        } else {
            // transfer Wolf back to attacker
            _gambit.transferFrom(address(this), attacker, _tokenId);
        }
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

            uint256 DAILY_FERTILE_FIELDS_RATE = 1000 * (10**18);

            claimable =
                ((block.number - stakedAsset.initBlock) *
                    DAILY_FERTILE_FIELDS_RATE) /
                1 days +
                stakedAsset.claimableBerries;
        } else if (_location == Location.WhisperingWoods) {
            StakedAsset memory stakedAsset = _stakedInWhisperingWoods[_tokenId];
            if (stakedAsset.owner != msg.sender) revert NoPermission();

            uint256 DAILY_WHISPERING_WOODS_RATE = 5000 * (10**18);
            claimable =
                ((block.number - stakedAsset.initBlock) *
                    DAILY_WHISPERING_WOODS_RATE) /
                1 days +
                stakedAsset.claimableBerries;
        }

        return claimable;
    }

    function getStakedGatherer(
        uint256 _tokenId,
        Location _location
    ) external view returns (StakedAsset memory) {
        if (_location == Location.FertileFields) {
            StakedAsset memory stakedAsset = _stakedInFertileFields[_tokenId];
            return stakedAsset;
        } else if (_location == Location.WhisperingWoods) {
            StakedAsset memory stakedAsset = _stakedInWhisperingWoods[_tokenId];
            return stakedAsset;
        } else {
            revert InvalidLocation();
        }
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
