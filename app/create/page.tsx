"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { uploadToIPFS } from "../utils/uploadToIPFS";
import { uploadToIPFSWithAndGetERC721Token } from "../utils/uploadToIPFSByERC721From";
import { ethers } from "ethers";
import { useAccount } from "wagmi"; // 获取当前账户信息

// 合约地址与 ABI
const contractAddress =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x921b3467bC56802adD5347ff5277bE5E813eDfF7";
import { abi } from "../contracts/NFTMarket.json"; // 你的合约ABI文件

export default function Create() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [NFTUrl, setNFTUrl] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // 使用 RainbowKit 来获取已连接的钱包地址
  const { address, isConnected } = useAccount();

  // 文件上传处理
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];

      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validImageTypes.includes(uploadedFile.type)) {
        alert("Please upload a valid image file (JPEG, PNG, GIF, or WEBP).");
        return;
      }

      setFile(uploadedFile);
      const fileUrl = URL.createObjectURL(uploadedFile);
      console.log("File URL:", fileUrl);
    }
  };

  const handleDelete = () => {
    setFile(null);
  };

  // 提交表单处理
  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    if (!isConnected) {
      alert("Please connect your wallet.");
      return;
    }

    setIsLoading(true);

    // 上传图片并获取URL
    const imageUrl = await uploadToIPFS(file);

    if (imageUrl) {
      const NFTUrl = await uploadToIPFSWithAndGetERC721Token(
        name,
        description,
        imageUrl
      );
      console.log("NFT Metadata URL:", NFTUrl);
      setNFTUrl(NFTUrl!);
    }
  };

  // 如果 NFT URL 已生成，调用合约 mint 函数
  useEffect(() => {
    const mintNFT = async () => {
      if (NFTUrl && isConnected) {
        try {
          console.log("start mint NFT ----------");
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          console.log("provider", provider);
          await provider.send("eth_requestAccounts", []); // 请求钱包连接
          const signer = provider.getSigner(); // 获取已连接的钱包签名者
          console.log("signer", signer);
          const address = await signer.getAddress(); // 确认地址已获取
          console.log("Connected address:", address);
          const contract = new ethers.Contract(contractAddress, abi, signer);
          console.log("contract", contract);

          // 调用合约的 createNFT 方法
          const tx = await contract.createNFT(NFTUrl);
          setTxHash(tx.hash);

          console.log("Transaction sent:", tx.hash);

          // 等待交易完成
          await tx.wait();

          console.log("Transaction confirmed");
          setIsSuccess(true);
        } catch (error) {
          console.error("Error minting NFT:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (NFTUrl) {
      mintNFT();
    }
  }, [NFTUrl, isConnected]);

  const closeModal = () => {
    setIsSuccess(false);
  };

  return (
    <>
      <Navbar />
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">
            Create Your NFT Today
          </h2>
          <div className="flex flex-col items-center justify-center min-h-screen sm:flex-row sm:space-x-6">
            {/* 上传区域 */}
            <div
              className="w-[380px] h-[380px] border-2 border-gray-300 rounded-lg flex items-center justify-center relative mb-4 sm:mb-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <label className="flex flex-col items-center justify-center cursor-pointer">
                {file ? (
                  <>
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Uploaded"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {isHovered && (
                      <button
                        onClick={handleDelete}
                        className="absolute bottom-2 bg-red-500 text-white px-3 py-1 rounded-lg"
                      >
                        Delete
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-gray-500 mb-2 text-2xl">⬆️</span>
                    <span className="text-gray-500 font-bold">Upload</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </>
                )}
              </label>
            </div>

            {/* 表单区域 */}
            <div className="flex flex-col space-y-4 w-full sm:w-auto">
              <input
                type="text"
                placeholder="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-gray-300 rounded-lg p-2 w-full sm:w-80"
              />
              <textarea
                placeholder="description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-2 border-gray-300 rounded-lg p-2 w-full sm:w-80 h-32"
              ></textarea>
              <button
                onClick={handleSubmit}
                className={`w-full text-white rounded-lg py-2 font-bold ${
                  isLoading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-700"
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create"}
              </button>

              {/* 交易状态显示 */}
              {txHash && <div>Transaction Hash: {txHash}</div>}
              {isLoading && <div>Waiting for confirmation...</div>}
              {isSuccess && <div>Transaction confirmed.</div>}
            </div>
          </div>
        </div>
      </div>

      {/* 弹窗提示成功 */}
      {isSuccess && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Success!</h2>
            <p>Your NFT has been created successfully.</p>
            <button
              onClick={closeModal}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
