// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract NFTStakingPool is Ownable, IERC721Receiver {
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableMap for EnumerableMap.UintToAddressMap;
    using SafeMath for uint256;
    using Address for address;

    IERC20 private _rewardToken;
    IERC721 private _nftToken;
    uint private _rewardsPerday;

    bytes4 private constant MINT_SELECTOR = bytes4(keccak256("mint(address,uint256)"));

    struct DepositInfo {
        uint256 depositTime;
        uint256 currentWithdrawals;
    }

    // tokenID -> DepositInfo mapping
    mapping(uint256 => DepositInfo) private _depositInfo;

    // tokenID -> Owners (Using this, can get total number of nft tokens deposited in this staking pool)
    EnumerableMap.UintToAddressMap private _tokenOwners;

    // stakers -> tokenIds array map
    mapping(address => EnumerableSet.UintSet) private _stakedTokens;

    constructor(address nftToken_, address rewardToken_, uint rewardsPerday_) {
        _rewardToken = IERC20(rewardToken_);
        _nftToken = IERC721(nftToken_);
        _rewardsPerday = rewardsPerday_;
    }

    function rewardsPerday() public view returns (uint) {
        return _rewardsPerday;
    }

    // Withdraw staked NFT
    function withdrawNFT(uint256 tokenId) external {
        address tokenOwner = _msgSender();
        require(stakerOfToken(tokenId) == tokenOwner, "Not the token owner");

        // remove from token owners map
        _tokenOwners.remove(tokenId);

        // remove staked tokens info also
        _stakedTokens[tokenOwner].remove(tokenId);

        // Give NFT back to user
        _nftToken.transferFrom(address(this), tokenOwner, tokenId);

        withdrawReward(tokenId);
    }

    // Withdraw Reward
    function withdrawReward(uint256 tokenId) public {
        address tokenOwner = _msgSender();
        require(stakerOfToken(tokenId) == tokenOwner, "Not the token owner");
        // Send remaining rewards
        _sendReward(_remainingReward(tokenId), tokenOwner);
    }

    function stakerOfToken(uint256 tokenId) public view returns (address){
        (bool existing, address owner) = _tokenOwners.tryGet(tokenId);
        return owner;
    }

    function isTokenStaked(uint256 tokenId) public view returns (bool){
        (bool existing, address owner) = _tokenOwners.tryGet(tokenId);
        return existing;
    }

    function numberOfTokensStaked() public view returns (uint256) {
        return _tokenOwners.length();
    }

    function tokenIdAtIndex(uint256 index) public view returns (uint256, address) {
        return _tokenOwners.at(index);
    }

    // returns (depositTime, currentWithdrawal, totalRewards)
    function stakeInfoForToken(uint256 tokenId) public view returns (address, uint256, uint256, uint256) {
        (bool existing, address owner) = _tokenOwners.tryGet(tokenId);
        require(existing, "Not staked token");

        DepositInfo memory info = _depositInfo[tokenId];
        return (owner, info.depositTime, info.currentWithdrawals, _totalRewards(tokenId));
    }

    function numberOfTokensStakedFor(address owner) public view returns (uint256) {
        EnumerableSet.UintSet storage tokensSet = _stakedTokens[owner];
        return tokensSet.length();
    }

    function stakeInfoForUserAt(address owner, uint256 index) public view returns (address, uint256, uint256, uint256) {
        EnumerableSet.UintSet storage tokensSet = _stakedTokens[owner];
        return stakeInfoForToken(tokensSet.at(index));
    }

    /**
    @dev This is private function and should only be called from onERC721Received() function
    */
    function _depositNFT(address owner, uint256 tokenId) private {
        // This might be commented as other user is approved to stake this token instead of owner.
        // require(_nftToken.ownerOf(tokenId) == owner, "depositer does not own this token");
        EnumerableSet.UintSet storage tokens =  _stakedTokens[owner];

        // Check if this is already staked
        require(!tokens.add(tokenId), "Already staked pool");

        // Add to _tokenOwners
        _tokenOwners.set(tokenId, owner);

        // Update deposit info
        DepositInfo storage info = _depositInfo[tokenId];
        info.depositTime = block.timestamp;
        info.currentWithdrawals = 0;
    }

    function _remainingReward(uint256 tokenId) private view returns(uint256) {
        (address owner, uint depositTime, uint currentWithdrawal, uint total) = stakeInfoForToken(tokenId);
        return total - currentWithdrawal;
    }

    function _totalRewards(uint256 tokenId) private view returns(uint256) {
        // TODO Calculation Logic Here
        uint secondsElapsed = block.timestamp - _depositInfo[tokenId].depositTime;
        uint daysElapsed = secondsElapsed / 86400; // per-day
        return daysElapsed * _rewardsPerday;
    }

    function _sendReward(uint256 amount, address to) private {
        bytes memory data = abi.encodeWithSelector(MINT_SELECTOR, to, amount);
        address(_rewardToken).functionCall(data);
    }

    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.
     *
     * The selector can be obtained in Solidity with `IERC721.onERC721Received.selector`.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        require(_msgSender() == address(_nftToken), "Pool does not accept other NFT tokens");
        // deposit nft
        _depositNFT(from, tokenId);
        return this.onERC721Received.selector;
    }
}
