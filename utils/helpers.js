import { ethers } from "ethers";
import { HttpRpcClient } from "@account-abstraction/sdk/dist/src/HttpRpcClient.js";
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
export { toJSON, printOp, getGasFee, getHttpRpcClient };
