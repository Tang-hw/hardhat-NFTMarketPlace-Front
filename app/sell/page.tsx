"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "../components/Navbar";
import NFTCard from "../components/NFTCard";
import { useAccount } from "wagmi"; // 获取当前账户信息

const contractAddress = "0x921b3467bC56802adD5347ff5277bE5E813eDfF7";
import { abi } from "../contracts/NFTMarket.json"; // 你的合约ABI文件

export default function Sell() {
  const [nfts, setNfts] = useState<any[]>([]);
  const { address, isConnected } = useAccount(); // 获取当前连接的地址

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!isConnected) return;

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);

        // 获取 Transfer 事件的过滤器
        const filter = contract.filters.Transfer(null, address);
        // 查询所有 Transfer 事件
        const events = await contract.queryFilter(filter);

        // 筛选当前地址拥有的 tokenId
        const ownedTokenIds = events.map((event: any) =>
          event.args.tokenId.toString()
        );

        const fetchedNFTs = await Promise.all(
          ownedTokenIds.map(async (tokenId: any) => {
            const tokenURI = await contract.tokenURI(tokenId); // 获取 token 的 URI
            const metadataResponse = await fetch(tokenURI); // 请求 token 的元数据
            const metadata = await metadataResponse.json();

            return {
              id: tokenId,
              imageUri: metadata.image,
              name: metadata.name,
              tokenId: `#${tokenId}`,
              price: "Not for sale", // 你可以根据需求更改价格部分的逻辑
            };
          })
        );

        setNfts(fetchedNFTs); // 更新状态
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      }
    };

    fetchNFTs();
  }, [address, isConnected]);

  return (
    <>
      <Navbar />
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            To List Your NFT
          </h2>
          <div className="flex mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {nfts.map((nft) => (
              <NFTCard
                key={nft.id}
                imageUri={nft.imageUri}
                name={nft.name}
                tokenId={nft.tokenId}
                price={nft.price}
                buttonText="List Now" // 自定义按钮文本
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
