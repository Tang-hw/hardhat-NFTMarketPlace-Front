"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "../components/Navbar";
import NFTCard from "../components/NFTCard";
import { useAccount } from "wagmi"; // 获取当前账户信息
import getNFTPriceFromEvents from "../utils/getNFTPriceFromEvents";

const contractAddress = "0x921b3467bC56802adD5347ff5277bE5E813eDfF7";
import { abi } from "../contracts/NFTMarket.json"; // 你的合约ABI文件

export default function Sell() {
  const [nfts, setNfts] = useState<any[]>([]);
  const { address, isConnected, chainId } = useAccount(); // 获取当前连接的地址
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [modal, setModal] = useState({
    visible: false,
    type: "",
    tokenId: null as string | null,
  });
  const [price, setPrice] = useState<string>("");

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

  // 获取 NFT
  const fetchNFTs = async () => {
    try {
      if (!provider || !address) return;

      const contract = new ethers.Contract(contractAddress, abi, provider);
      console.log("contract", contract);

      const allEvents = await contract.queryFilter(contract.filters.Transfer());
      console.log("All Transfer Events:", allEvents);

      const [receivedEvents, sentEvents] = await Promise.all([
        contract.queryFilter(contract.filters.Transfer(null, address)), // 收到的NFT
        contract.queryFilter(contract.filters.Transfer(address, null)), // 发送的NFT
      ]);

      const ownedTokenIds = new Set(
        receivedEvents.map((event) => event.args!.tokenId.toString())
      );
      console.log("ownedTokenIds", ownedTokenIds);

      // 上架也是发送NFT到合约地址，但是NFT仍属于个人
      // sentEvents.forEach((event) => {
      //   ownedTokenIds.delete(event.args!.tokenId.toString());
      // });

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
              price: price || "Not for sale",
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

  // 上架 NFT
  const handleListNFT = async (tokenId: string) => {
    if (!provider) {
      alert("Provider 尚未初始化，请稍后再试！");
      return;
    }

    if (price && parseFloat(price) > 0) {
      try {
        const priceInWei = ethers.utils.parseEther(price);
        //await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await contract.listNFT(tokenId, priceInWei);
        await tx.wait();
        alert("NFT 上架成功！");
        setPrice("");
      } catch (error) {
        console.error("NFT 上架失败：", error);
        alert("上架失败，请稍后再试！");
      }
    } else {
      alert("价格必须大于零！");
    }
  };

  // 控制弹框显示
  const handleButtonClick = (action: { type: string; tokenId: string }) => {
    setModal({ visible: true, type: action.type, tokenId: action.tokenId });
  };

  const closeModal = () => {
    setModal({ visible: false, type: "", tokenId: null });
    setPrice("");
  };

  const confirmAction = async () => {
    if (modal.type === "list" && modal.tokenId) {
      await handleListNFT(modal.tokenId);
    }
    closeModal();
  };

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
                buttonText="List Now"
                onButtonClick={handleButtonClick}
              />
            ))}
          </div>
        </div>
      </div>

      {modal.visible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-bold">
              Action {modal.type === "list" ? "List" : "Buy"}
            </h3>
            <p>Token ID: {modal.tokenId}</p>
            {modal.type === "list" && (
              <div>
                <label htmlFor="price">Please Enter The Price:</label>
                <input
                  type="text"
                  id="price"
                  className="border p-1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={confirmAction}
                className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
