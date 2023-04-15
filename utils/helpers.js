import { ethers } from "ethers";
import { HttpRpcClient } from "@account-abstraction/sdk/dist/src/HttpRpcClient.js";
import { getSimpleAccount } from "./simpleAccount.js";

import AutoPilotABI from "../abi/AutoPilot.json" assert { type: "json" };
const getHttpRpcClient = async (provider, bundlerUrl, entryPointAddress) => {
  const chainId = await provider.getNetwork().then((net) => net.chainId);
  return new HttpRpcClient(bundlerUrl, entryPointAddress, chainId);
};

const toJSON = async (op) =>
  ethers.utils.resolveProperties(op).then((userOp) =>
    Object.keys(userOp)
      .map((key) => {
        let val = userOp[key];
        if (typeof val !== "string" || !val.startsWith("0x")) {
          val = ethers.utils.hexValue(val);
        }
        return [key, val];
      })
      .reduce(
        (set, [k, v]) => ({
          ...set,
          [k]: v,
        }),
        {}
      )
  );

const printOp = async (op) => {
  return toJSON(op).then((userOp) => JSON.stringify(userOp, null, 2));
};

const getGasFee = async (provider) => {
  const [fee, block] = await Promise.all([
    provider.send("eth_maxPriorityFeePerGas", []),
    provider.getBlock("latest"),
  ]);
  const tip = ethers.BigNumber.from(fee);
  const buffer = tip.div(100).mul(13);
  const maxPriorityFeePerGas = tip.add(buffer);
  const maxFeePerGas = block.baseFeePerGas
    ? block.baseFeePerGas.mul(2).add(maxPriorityFeePerGas)
    : maxPriorityFeePerGas;

  return { maxFeePerGas, maxPriorityFeePerGas };
};

const getAddress = async (provider) => {
  const accountAPI = getSimpleAccount(
    provider,
    process.env.botPrivateKey,
    process.env.entryPoint,
    process.env.simpleAccountFactory
  );
  const address = await accountAPI.getCounterFactualAddress();
  return address;
};

const transfer = async (t, amt, provider) => {
  const accountAPI = getSimpleAccount(
    provider,
    process.env.botPrivateKey,
    process.env.entryPoint,
    process.env.simpleAccountFactory
  );

  const target = ethers.utils.getAddress(t);
  const value = ethers.utils.parseEther(amt);
  const op = await accountAPI.createSignedUserOp({
    target,
    value,
    data: "0x",
    ...(await getGasFee(provider)),
  });
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

export { toJSON, printOp, getGasFee, getHttpRpcClient, transfer, getAddress };
