"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi"; // 获取当前账户信息
import Navbar from "./components/Navbar";
import NFTCard from "./components/NFTCard";
import getNFTPriceFromEvents from "./utils/getNFTPriceFromEvents";

const contractAddress = "0x921b3467bC56802adD5347ff5277bE5E813eDfF7";
import { abi } from "./contracts/NFTMarket.json"; // 你的合约ABI文件

export default function Home() {
  const [nfts, setNfts] = useState<any[]>([]);
  const { address, isConnected, chainId } = useAccount(); // 获取当前连接的地址
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);

  // 初始化 Web3Provider
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("web3Provider", web3Provider);
      setProvider(web3Provider);
    }
  }, []);

  // 添加钱包授权逻辑
  useEffect(() => {
    const connectWallet = async () => {
      if (provider) {
        try {
          await provider.send("eth_requestAccounts", []); // 请求用户授权连接钱包
          console.log("Wallet connected");
        } catch (error) {
          console.error("Wallet connection failed:", error);
        }
      }
    };
    connectWallet();
  }, [provider]); // 当 provider 初始化时执行钱包授权逻辑

  // 检查连接状态并获取 NFT
  useEffect(() => {
    if (isConnected && chainId !== 11155111) {
      alert("请切换到 Sepolia 网络");
    } else if (isConnected && address) {
      fetchNFTs();
    }
  }, [address, isConnected, chainId, location.pathname]);

  // 获取合约地址上的NFT
  const fetchNFTs = async () => {
    try {
      if (!provider || !address) return;

      const contract = new ethers.Contract(contractAddress, abi, provider);
      console.log("contract", contract);

      const [receivedEvents] = await Promise.all([
        contract.queryFilter(contract.filters.Transfer(null, contractAddress)), // 所有上架的NFT都会放在合约地址上
      ]);
      console.log("receivedEvents", receivedEvents);

      const ownedTokenIds = new Set(
        receivedEvents.map((event) => event.args!.tokenId.toString())
      );

      console.log("Owned Token IDs:", ownedTokenIds);

      const fetchedNFTs = await Promise.all(
        Array.from(ownedTokenIds).map(async (tokenId) => {
          try {
            const tokenURI = await contract.tokenURI(tokenId);
            console.log(`Token ${tokenId} URI:`, tokenURI);
            const price = await getNFTPriceFromEvents(contract, tokenId);
            const metadataResponse = await fetch(tokenURI);
            if (!metadataResponse.ok) throw new Error("元数据请求失败");

            const metadata = await metadataResponse.json();
            return {
              id: tokenId,
              imageUri: metadata.image,
              name: metadata.name,
              tokenId: tokenId,
              price: price,
            };
          } catch (error) {
            console.error(`获取 Token ID ${tokenId} 的元数据失败:`, error);
            return null;
          }
        })
      );

      setNfts(fetchedNFTs.filter((nft) => nft !== null));
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            NFT Marketplace
          </h2>
          <div className="flex mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {nfts.map((nft) => (
              <NFTCard
                key={nft.id}
                imageUri={nft.imageUri}
                name={nft.name}
                tokenId={nft.tokenId}
                price={nft.price}
                buttonText="Buy Now" // 自定义按钮文本
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
