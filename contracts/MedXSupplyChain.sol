// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract MedXSupplyChain {
    address public owner;
    uint256 public orderCount;
    
    enum OrderStatus { Pending, Processing, Shipped, Delivered, Completed, Cancelled, Rejected }
    
    struct Order {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount;
        uint256 timestamp;
        OrderStatus status;
        string metadataURI; // URI pointing to off-chain data (IPFS or centralized storage)
    }
    
    mapping(uint256 => Order) public orders;
    
    // Events
    event OrderCreated(
        uint256 indexed id,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 timestamp,
        string metadataURI
    );
    
    event OrderStatusChanged(
        uint256 indexed id,
        OrderStatus status,
        address updatedBy
    );
    
    event PaymentReleased(
        uint256 indexed id,
        address indexed seller,
        uint256 amount
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }
    
    modifier onlyBuyerOrSeller(uint256 _orderId) {
        require(
            msg.sender == orders[_orderId].buyer || 
            msg.sender == orders[_orderId].seller ||
            msg.sender == owner,
            "Only buyer, seller, or owner can perform this action"
        );
        _;
    }
    
    modifier orderExists(uint256 _orderId) {
        require(_orderId > 0 && _orderId <= orderCount, "Order does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Create a new order
    function createOrder(address _seller, string memory _metadataURI) external payable {
        require(_seller != address(0), "Invalid seller address");
        require(msg.value > 0, "Payment amount must be greater than 0");
        
        orderCount++;
        
        Order storage newOrder = orders[orderCount];
        newOrder.id = orderCount;
        newOrder.buyer = msg.sender;
        newOrder.seller = _seller;
        newOrder.amount = msg.value;
        newOrder.timestamp = block.timestamp;
        newOrder.status = OrderStatus.Pending;
        newOrder.metadataURI = _metadataURI;
        
        emit OrderCreated(
            orderCount,
            msg.sender,
            _seller,
            msg.value,
            block.timestamp,
            _metadataURI
        );
    }
    
    // Update order status
    function updateOrderStatus(uint256 _orderId, OrderStatus _status) external 
        orderExists(_orderId) 
        onlyBuyerOrSeller(_orderId) 
    {
        Order storage order = orders[_orderId];
        
        // Enforce status flow rules
        if (msg.sender == order.seller) {
            // Seller can process, ship, or reject an order
            require(
                (order.status == OrderStatus.Pending && _status == OrderStatus.Processing) ||
                (order.status == OrderStatus.Processing && _status == OrderStatus.Shipped) ||
                (order.status == OrderStatus.Pending && _status == OrderStatus.Rejected),
                "Invalid status transition for seller"
            );
        } else if (msg.sender == order.buyer) {
            // Buyer can confirm delivery or cancel an order (if still pending)
            require(
                (order.status == OrderStatus.Shipped && _status == OrderStatus.Delivered) ||
                (order.status == OrderStatus.Pending && _status == OrderStatus.Cancelled),
                "Invalid status transition for buyer"
            );
        }
        
        order.status = _status;
        
        emit OrderStatusChanged(_orderId, _status, msg.sender);
        
        // If the order is marked as delivered, release payment to seller
        if (_status == OrderStatus.Delivered) {
            releasePayment(_orderId);
        }
    }
    
    // Complete an order and release payment to seller
    function completeOrder(uint256 _orderId) external 
        orderExists(_orderId) 
        onlyBuyerOrSeller(_orderId) 
    {
        Order storage order = orders[_orderId];
        
        // Only the buyer or owner can complete the order
        require(msg.sender == order.buyer || msg.sender == owner, "Only buyer or owner can complete orders");
        
        // Order must be in Delivered status
        require(order.status == OrderStatus.Delivered, "Order must be delivered before completion");
        
        order.status = OrderStatus.Completed;
        
        emit OrderStatusChanged(_orderId, OrderStatus.Completed, msg.sender);
    }
    
    // Release payment to seller
    function releasePayment(uint256 _orderId) internal orderExists(_orderId) {
        Order storage order = orders[_orderId];
        address payable sellerAddress = payable(order.seller);
        
        // Transfer payment to seller
        (bool success, ) = sellerAddress.call{value: order.amount}("");
        require(success, "Transfer failed");
        
        emit PaymentReleased(_orderId, order.seller, order.amount);
    }
    
    // Emergency fund recovery (only owner)
    function recoverFunds(uint256 _orderId) external onlyOwner orderExists(_orderId) {
        Order storage order = orders[_orderId];
        
        // Only allows recovery if order is cancelled or stuck
        require(
            order.status == OrderStatus.Cancelled || 
            order.status == OrderStatus.Rejected,
            "Can only recover funds from cancelled or rejected orders"
        );
        
        address payable buyerAddress = payable(order.buyer);
        
        // Transfer payment back to buyer
        (bool success, ) = buyerAddress.call{value: order.amount}("");
        require(success, "Transfer failed");
    }
    
    // Get order details
    function getOrder(uint256 _orderId) external view orderExists(_orderId) returns (
        uint256 id,
        address buyer,
        address seller,
        uint256 amount,
        uint256 timestamp,
        OrderStatus status,
        string memory metadataURI
    ) {
        Order storage order = orders[_orderId];
        return (
            order.id,
            order.buyer,
            order.seller,
            order.amount,
            order.timestamp,
            order.status,
            order.metadataURI
        );
    }
}
