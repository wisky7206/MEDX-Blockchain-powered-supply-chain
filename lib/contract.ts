import { ethers, BrowserProvider, Contract } from "ethers"; // Import necessary classes/functions
import contractABI from "../contracts/MedXSupplyChain.json";

// Contract address will be filled after deployment
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export async function getContract(withSigner = false) {
  // Add check for browser environment and window.ethereum existence
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not installed or not running in browser");
  }

  // Use BrowserProvider instead of Web3Provider
  const provider = new BrowserProvider(window.ethereum);

  if (withSigner) {
    // Request accounts if needed (required for getting signer)
    await provider.send("eth_requestAccounts", []);
    // Get signer from BrowserProvider
    const signer = await provider.getSigner();
    // Use the Contract class directly
    return new Contract(contractAddress, contractABI.abi, signer);
  }

  // Use the Contract class directly with the provider for read-only interactions
  return new Contract(contractAddress, contractABI.abi, provider);
}

// Create a new order
export async function createOrder(sellerAddress: string, amount: string, metadataURI: string) {
  const contract = await getContract(true);

  const tx = await contract.createOrder(sellerAddress, metadataURI, {
    // Use top-level ethers.parseEther
    value: ethers.parseEther(amount),
  });

  return await tx.wait();
}

// Update order status
export async function updateOrderStatus(orderId: number, status: number) {
  const contract = await getContract(true);

  const tx = await contract.updateOrderStatus(orderId, status);

  return await tx.wait();
}

// Complete an order
export async function completeOrder(orderId: number) {
  const contract = await getContract(true);

  const tx = await contract.completeOrder(orderId);

  return await tx.wait();
}

// Get order details
export async function getOrder(orderId: number) {
  const contract = await getContract();

  const order = await contract.getOrder(orderId);

  // Ensure BigInt values from contract are handled correctly before conversion
  const orderIdBigInt = typeof order.id === 'bigint' ? order.id : BigInt(order.id);
  const amountBigInt = typeof order.amount === 'bigint' ? order.amount : BigInt(order.amount);
  const timestampBigInt = typeof order.timestamp === 'bigint' ? order.timestamp : BigInt(order.timestamp);


  return {
    // Convert BigInt ID to number if appropriate for your use case
    id: Number(orderIdBigInt),
    buyer: order.buyer,
    seller: order.seller,
    // Use top-level ethers.formatEther with the BigInt value
    amount: ethers.formatEther(amountBigInt),
    // Convert BigInt timestamp (seconds) to milliseconds for Date object
    timestamp: new Date(Number(timestampBigInt * 1000n)),
    status: order.status, // Assuming status doesn't need BigInt conversion
    metadataURI: order.metadataURI,
  };
}