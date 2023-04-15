import { BigNumber, ethers } from "ethers";
import { getSimpleAccount } from "./utils/simpleAccount.js";
import { getHttpRpcClient, getGasFee, printOp } from "./utils/helpers.js"
import { HttpRpcClient } from "@account-abstraction/sdk/dist/src/HttpRpcClient.js";
import AutoPilotABI from "./abi/AutoPilot.json" assert { type: "json" };
import config from "./config.json" assert {type: "json"};
import { AbiCoder } from "ethers/lib/utils.js";
import * as dotenv from "dotenv";
dotenv.config()

const main = async() =>
{
console.log("hi");
console.log(process.env.rpcUrl);
console.log(Date.now());

// add logic so this server runs continuously

const provider = new ethers.providers.JsonRpcProvider(process.env.rpcUrl);
const wallet = new ethers.Wallet(process.env.botPrivateKey, provider);
const signer = wallet.provider.getSigner(wallet.address);
const accountAPI = getSimpleAccount(
        provider,
        process.env.botPrivateKey,
        process.env.entryPoint,
        process.env.simpleAccountFactory
      );

console.log("bot", wallet.address);
for (var i = 0; i < config.length; i++)
{   
    const target = config[i].account;
    const autoPilotInterface = new ethers.utils.Interface(AutoPilotABI);
    const contract = new ethers.Contract(target, AutoPilotABI, signer);    
    const abi = ethers.utils.defaultAbiCoder;

    for (var j = 0; j < config[i].actions.length; j++)
    {
        console.log();

        const abi = await ethers.utils.defaultAbiCoder;
        const parentCalldata = abi.encode([ "bytes4", "address", "uint256", "bytes" ], ["0xb61d27f6", config[i].actions[j].dest, config[i].actions[j].value, "0x" ]);
        console.log(target);
        console.log(parentCalldata)
        
        const op = {
            sender: target,
            nonce: await contract.nonce(),
            initCode:"0x",     
            callData: parentCalldata,
            callGasLimit: BigNumber.from("0x1ffff"),
            verificationGasLimit: BigNumber.from("0x1ffff"),
            preVerificationGas: BigNumber.from("0x1ffff"),
            maxFeePerGas: BigNumber.from("0x1ffff"),
            maxPriorityFeePerGas: BigNumber.from("0x1ffff"),
            paymasterAndData:"0x",
            signature: "0xf5b1c9289af6e6a61ba242b06092694a85f820837a2c87be23afa5b40333ed9d0659a9d6b76ce3355dc87340f99031009f296e398a23c809cf0b595be2be22b71c"
        }

        const client = await getHttpRpcClient(
            provider,
            config.bundlerUrl,
            config.entryPoint
          );
          const uoHash = await client.sendUserOpToBundler(op);
          console.log(`UserOpHash: ${uoHash}`);
            
      
          console.log("Waiting for transaction...");
          const txHash = await accountAPI.getUserOpReceipt(uoHash);
          console.log(`Transaction hash: ${txHash}`);
    }
   
}

}
main();

