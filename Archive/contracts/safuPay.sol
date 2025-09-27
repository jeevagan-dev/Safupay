// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}


contract SafuPay {
    uint256 public constant CANCEL_WINDOW = 5 minutes;
    uint256 public constant RECLAIM_DELAY = 30 days;

    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    constructor() {
        _status = _NOT_ENTERED;
    }

    struct Deposit {
        address sender;
        address recipient;
        address token;    
        uint256 amount;
        uint256 originalAmount;
        bytes32 claimHash; 
        uint256 createdAt;
        bool claimed;
        bool reclaimed;
    }

    mapping(uint256 => Deposit) public deposits;
    uint256 public nextId;

    
    event DepositCreated(
        uint256 indexed id,
        uint256 indexed chainId,
        address indexed sender,
        address recipient,
        address token,
        uint256 amount,
        bytes32 claimHash,
        uint256 createdAt
    );

    event Claimed(
        uint256 indexed id,
        uint256 indexed chainId,
        address indexed recipient,
        uint256 amount,
        address token
    );

    event Cancelled(uint256 indexed id, address indexed sender);
    event Reclaimed(uint256 indexed id, address indexed sender);

   
    function _safeTransferETH(address to, uint256 amount) internal returns (bool) {
        if (amount == 0) return true;
        (bool ok, ) = to.call{value: amount}("");
        return ok;
    }

    function _safeTransferERC20(address token, address to, uint256 amount) internal returns (bool) {
        return IERC20(token).transfer(to, amount);
    }

   
    function createDepositETH(address recipient, bytes32 claimHash) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "zero value");
        uint256 id = nextId++;
        deposits[id] = Deposit({
            sender: msg.sender,
            recipient: recipient,
            token: address(0),
            amount: msg.value,
            originalAmount: msg.value,
            claimHash: claimHash,
            createdAt: block.timestamp,
            claimed: false,
            reclaimed: false
        });

        emit DepositCreated(id, block.chainid, msg.sender, recipient, address(0), msg.value, claimHash, block.timestamp);
        return id;
    }

   
    function createDepositERC20(address recipient, address token, uint256 amount, bytes32 claimHash) external nonReentrant returns (uint256) {
        require(amount > 0, "zero amount");
        require(token != address(0), "invalid token");

        bool ok = IERC20(token).transferFrom(msg.sender, address(this), amount);
        require(ok, "transferFrom failed");

        uint256 id = nextId++;
        deposits[id] = Deposit({
            sender: msg.sender,
            recipient: recipient,
            token: token,
            amount: amount,
            originalAmount: amount,
            claimHash: claimHash,
            createdAt: block.timestamp,
            claimed: false,
            reclaimed: false
        });

        emit DepositCreated(id, block.chainid, msg.sender, recipient, token, amount, claimHash, block.timestamp);
        return id;
    }

   
    function computeClaimHash(string calldata claimCode, address recipient) public view returns (bytes32) {
        return keccak256(abi.encodePacked(block.chainid, address(this), claimCode, recipient));
    }

  
    function computeClaimHashWithChain(
        uint256 chainId,
        address contractAddr,
        string calldata claimCode,
        address recipient
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(chainId, contractAddr, claimCode, recipient));
    }

   
    function claim(uint256 id, string calldata claimCode) external nonReentrant {
        Deposit storage d = deposits[id];
        require(!d.claimed && !d.reclaimed, "inactive deposit");
        require(d.amount > 0, "no funds");
        require(msg.sender == d.recipient, "only recipient");

        bytes32 recomputed = keccak256(abi.encodePacked(block.chainid, address(this), claimCode, d.recipient));
        require(recomputed == d.claimHash, "invalid claim code");

        d.claimed = true;
        uint256 amount = d.amount;
        address token = d.token;
        d.amount = 0;

        if (token == address(0)) {
            require(_safeTransferETH(d.recipient, amount), "ETH transfer failed");
        } else {
            require(_safeTransferERC20(token, d.recipient, amount), "ERC20 transfer failed");
        }

        emit Claimed(id, block.chainid, d.recipient, amount, token);
    }

  
    function cancelBySender(uint256 id) external nonReentrant {
        Deposit storage d = deposits[id];
        require(d.sender == msg.sender, "only sender");
        require(!d.claimed && !d.reclaimed, "inactive");
        require(block.timestamp <= d.createdAt + CANCEL_WINDOW, "cancel window passed");

        d.reclaimed = true;
        uint256 amount = d.amount;
        address token = d.token;
        d.amount = 0;

        if (token == address(0)) {
            require(_safeTransferETH(d.sender, amount), "ETH refund failed");
        } else {
            require(_safeTransferERC20(token, d.sender, amount), "ERC20 refund failed");
        }

        emit Cancelled(id, d.sender);
    }

  
    function reclaim(uint256 id) external nonReentrant {
        Deposit storage d = deposits[id];
        require(d.sender == msg.sender, "only sender");
        require(!d.claimed && !d.reclaimed, "inactive");
        require(block.timestamp >= d.createdAt + RECLAIM_DELAY, "too early");

        d.reclaimed = true;
        uint256 amount = d.amount;
        address token = d.token;
        d.amount = 0;

        if (token == address(0)) {
            require(_safeTransferETH(d.sender, amount), "ETH reclaim failed");
        } else {
            require(_safeTransferERC20(token, d.sender, amount), "ERC20 reclaim failed");
        }

        emit Reclaimed(id, d.sender);
    }


    function getDeposit(uint256 id) external view returns (
        address sender,
        address recipient,
        address token,
        uint256 amount,
        uint256 originalAmount,
        bytes32 claimHash,
        uint256 createdAt,
        bool claimed,
        bool reclaimed
    ) {
        Deposit storage d = deposits[id];
        return (
            d.sender,
            d.recipient,
            d.token,
            d.amount,
            d.originalAmount,
            d.claimHash,
            d.createdAt,
            d.claimed,
            d.reclaimed
        );
    }

    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

    receive() external payable {}
}
