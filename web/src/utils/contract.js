import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./abi.js";

export function getProvider() {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  } else {
    // fallback read-only via public RPC if you want (set env var)
    return null;
  }
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error("Please install MetaMask");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider;
}

export function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}
