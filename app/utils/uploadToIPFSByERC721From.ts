import { PinataSDK } from "pinata-web3";

export async function uploadToIPFSWithAndGetERC721Token(
  name: string,
  description: string,
  image: string,
  trait_type?: string,
  value?: string
) {
  try {
    const pinata = await setUpPinata();

    // 确保 pinata 实例存在
    if (pinata) {
      const metadata = {
        name: name || "Default NFT Name",
        description: description || "Default NFT Description",
        image: image,
        attributes: [
          { trait_type: trait_type || "Penguins", value: value || "100" },
        ],
      };

      // 将 metadata 写入 JSON Blob
      const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: "application/json",
      });

      // 将 Blob 转换为 File 对象
      const metadataFile = new File([metadataBlob], `${name}_metadata.json`, {
        type: "application/json",
      });

      const upload = await pinata.upload.file(metadataFile);

      // 获取文件的名称和格式
      const fileName = metadataFile.name; // 获取文件名，如 'xxx.json'
      const NFTUrl = `https://ipfs.io/ipfs/${upload.IpfsHash}?filename=${fileName}`;

      console.log("NFTUrl :", NFTUrl);
      return NFTUrl;
    } else {
      console.log("Failed to set up Pinata");
    }
  } catch (error) {
    console.log("Error uploading to IPFS:", error);
  }
}

async function setUpPinata() {
  try {
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
    const pinata = new PinataSDK({
      pinataJwt: jwt,
      pinataGateway: gateway || "tan-tough-pig-84.mypinata.cloud",
    });
    return pinata;
  } catch (error) {
    console.log("Error set up Pinata:", error);
  }
}
