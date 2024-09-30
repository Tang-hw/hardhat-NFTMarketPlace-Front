import { PinataSDK } from "pinata-web3";

export async function uploadToIPFS(file: File) {
  try {
    const pinata = await setUpPinata();

    // 确保 pinata 实例存在
    if (pinata) {
      const upload = await pinata.upload.file(file);

      // 获取文件的名称和格式
      const fileName = file.name; // 获取文件名，如 'image.png'
      const imageUrl = `https://ipfs.io/ipfs/${upload.IpfsHash}?filename=${fileName}`;
      console.log("imageUrl :", imageUrl);
      return imageUrl;
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
