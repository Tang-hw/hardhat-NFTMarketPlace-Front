import { ethers, Contract, Event } from "ethers";

/**
 * 获取指定 NFT 的价格信息
 * @param contract 合约实例
 * @param tokenId NFT 的 Token ID
 * @returns Promise<number> 返回 NFT 价格
 */
const getNFTPriceFromEvents = async (
  contract: Contract,
  tokenId: number
): Promise<string> => {
  try {
    // 获取所有 NFTTransfer 事件
    const transferEvents: Event[] = await contract.queryFilter(
      contract.filters.NFTTransfer() // 不传任何参数，获取所有事件
    );

    // 找到与特定 tokenId 相关的最近一次上架价格
    const latestListing = transferEvents
      .reverse()
      .find(
        (event) =>
          event.args && event.args.tokenID.toString() === tokenId.toString()
      );

    if (latestListing && latestListing.args) {
      const priceInWei = latestListing.args.price;
      const price = ethers.utils.formatEther(priceInWei);
      console.log(`NFT #${tokenId} 价格: ${price} ETH`);
      return price;
    } else {
      console.log(`NFT #${tokenId} 没有找到价格信息`);
      return "Not for sale";
    }
  } catch (error) {
    console.error(`Error fetching price for Token ID ${tokenId}:`, error);
    return "Error fetching price";
  }
};

export default getNFTPriceFromEvents;
