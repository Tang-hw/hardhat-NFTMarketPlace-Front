"use client";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { abi } from "../contracts/NFTMarket.json"; // 你的合约ABI文件

// 合约地址与 ABI
const contractAddress = "0x921b3467bC56802adD5347ff5277bE5E813eDfF7"; // 替换为你的合约地址

export async function mintNFT(fileUrl: string) {
  try {
    const { data: hash, error, isPending, writeContract } = useWriteContract();

    writeContract({
      address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      abi,
      functionName: "createNFT",
      args: [fileUrl],
    });
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
      useWaitForTransactionReceipt({
        hash,
      });

    // 等待交易完成
    const { isLoading: txLoading, isSuccess: txSuccess } =
      useWaitForTransactionReceipt({
        hash,
      });

    // 如果交易成功
    if (txSuccess) {
      console.log("NFT successfully minted");
    }

    return { isLoading: txLoading, isSuccess: txSuccess };
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw error;
  }
}
