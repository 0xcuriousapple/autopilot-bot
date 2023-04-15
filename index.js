import { BigNumber, ethers } from "ethers";
import { getSimpleAccount } from "./utils/simpleAccount.js";
import {
  getHttpRpcClient,
  getGasFee,
  printOp,
  getAddress,
} from "./utils/helpers.js";
import { HttpRpcClient } from "@account-abstraction/sdk/dist/src/HttpRpcClient.js";
import imported from "./import.json" assert { type: "json" };
import AutoPilotABI from "./abi/AutoPilot.json" assert { type: "json" };
import config from "./config.json" assert { type: "json" };

import * as dotenv from "dotenv";
dotenv.config();

export const ERC20_ABI = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",

  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

const main = async () => {
  console.log("hi");
  console.log(process.env.rpcUrl);
  console.log(Date.now());

  // add logic so this server runs continuously

  const provider = new ethers.providers.JsonRpcProvider(process.env.rpcUrl);

  const botAddress = await getAddress(provider);
  const { data } = imported.nodes[2];

  console.log({ botAddress });
  // deploys bot
  //   await transfer(ethers.constants.AddressZero, "0", provider);

  const accountAPI = getSimpleAccount(
    provider,
    process.env.botPrivateKey,
    process.env.entryPoint,
    process.env.simpleAccountFactory
  );

  const tkn = data.target; //goerli LINK contract
  const token = ethers.utils.getAddress(tkn);
  const to = ethers.utils.getAddress(data.params[0]); // eth tokyo address
  const erc20 = new ethers.Contract(token, ERC20_ABI, provider);

  const amount = data.params[1].hex;

  const op = await accountAPI.createSignedUserOp({
    target: erc20.address,
    data: erc20.interface.encodeFunctionData("transfer", [to, amount]),
    ...(await getGasFee(provider)),
  });
  console.log({ op });
  console.log(`Signed UserOperation: ${await printOp(op)}`);

  const client = await getHttpRpcClient(
    provider,
    process.env.bundlerUrl,
    process.env.entryPoint
  );
  const uoHash = await client.sendUserOpToBundler(op);
  console.log(`UserOpHash: ${uoHash}`);

  console.log("Waiting for transaction...");
  const txHash = await accountAPI.getUserOpReceipt(uoHash);
  console.log(`Transaction hash: ${txHash}`);
};
await main();
