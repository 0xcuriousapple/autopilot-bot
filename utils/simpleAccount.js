import { SimpleAccountAPI } from "@account-abstraction/sdk";
import { ethers } from "ethers";

export function getSimpleAccount(
  provider,
  owner,
  entryPointAddress,
  factoryAddress,
  paymasterAPI
) {
  const sw = new SimpleAccountAPI({
    provider,
    entryPointAddress,
    owner,
    factoryAddress,
    paymasterAPI,
  });
  // Hack: default getUserOpReceipt does not include fromBlock which causes an error for some RPC providers.
  sw.getUserOpReceipt = async (
    userOpHash,
    timeout = 30000,
    interval = 5000
  ) => {
    const endtime = Date.now() + timeout;
    const block = await sw.provider.getBlock("latest");
    while (Date.now() < endtime) {
      // @ts-ignore
      const events = await sw.entryPointView.queryFilter(
        // @ts-ignore
        sw.entryPointView.filters.UserOperationEvent(userOpHash),
        Math.max(0, block.number - 100)
      );
      if (events.length > 0) {
        return events[0].transactionHash;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return null;
  };
  return sw;
}
