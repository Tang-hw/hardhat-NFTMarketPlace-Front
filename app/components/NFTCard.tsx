"use client";
import { useState } from "react";

// 定义 NFTCard 的 props 类型
interface NFTCardProps {
  imageUri: string;
  name: string;
  tokenId: string;
  price: string;
  buttonText?: string; // 可选的按钮文本 props
  onButtonClick?: (action: { type: string; tokenId: string }) => void; // 传入处理点击的函数
}

export default function NFTCard({
  imageUri,
  name,
  price,
  tokenId,
  buttonText = "Buy Now", // 设置默认按钮文本为 "Buy Now"
  onButtonClick, // 新增的 props
}: NFTCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-white shadow-md rounded-lg overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 图片容器 */}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 group-hover:opacity-75">
        <img
          src={imageUri}
          alt={name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* 信息部分 */}
      <div className="p-4 relative">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm text-gray-700">
              <a href="#">
                <span aria-hidden="true" className="absolute inset-0" />
                {name}
              </a>
            </h3>
            <p className="mt-1 text-sm text-gray-500"># {tokenId}</p>
          </div>
          <p className="text-sm font-medium text-gray-900">{price} ETH</p>
        </div>

        {/* 悬停时显示按钮 */}
        {isHovered && (
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-full"
              onClick={() =>
                onButtonClick && onButtonClick({ type: "list", tokenId })
              } // 调用处理函数
            >
              {buttonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
