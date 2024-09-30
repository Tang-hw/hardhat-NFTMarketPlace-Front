import Navbar from "./components/Navbar";
import NFTCard from "./components/NFTCard";

export default function Home() {
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

const nfts = [
  {
    id: 1,
    imageUri: "https://raw.seadn.io/files/4cf53eee9ce7e88421c9fd776808eb9b.png",
    name: "Pudgy Penguin",
    tokenId: "#3567",
    price: "10.25 ETH",
  },
  {
    id: 2,
    imageUri: "https://raw.seadn.io/files/ef7854a409000b23f26f5edf8e19f369.png",
    name: "Pudgy Penguin",
    tokenId: "#2679",
    price: "10.85 ETH",
  },
  {
    id: 3,
    imageUri: "https://raw.seadn.io/files/aa59ddbf79b07fcc1eafb5fb85b94463.png",
    name: "Pudgy Penguin",
    tokenId: "#7348",
    price: "11.85 ETH",
  },
  {
    id: 4,
    imageUri: "https://raw.seadn.io/files/60415f03576456f7be92453f5e5f4a93.png",
    name: "Pudgy Penguin",
    tokenId: "#5254",
    price: "12.55 ETH",
  },
  {
    id: 5,
    imageUri: "https://raw.seadn.io/files/aa59ddbf79b07fcc1eafb5fb85b94463.png",
    name: "Pudgy Penguin",
    tokenId: "#7348",
    price: "11.85 ETH",
  },
  {
    id: 6,
    imageUri: "https://raw.seadn.io/files/60415f03576456f7be92453f5e5f4a93.png",
    name: "Pudgy Penguin",
    tokenId: "#5254",
    price: "12.55 ETH",
  },
  // 添加更多 NFT 数据...
];
