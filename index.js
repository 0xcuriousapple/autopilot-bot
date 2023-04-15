import { BigNumber, ethers } from "ethers";
import { getSimpleAccount } from "./utils/simpleAccount.js";
import { getHttpRpcClient, getGasFee, printOp } from "./utils/helpers.js"
import { HttpRpcClient } from "@account-abstraction/sdk/dist/src/HttpRpcClient.js";
import AutoPilotABI from "./abi/AutoPilot.json" assert { type: "json" };
import config from "./config.json" assert {type: "json"};

import * as dotenv from "dotenv";
dotenv.config()

const main = async() =>
{
console.log("hi");
console.log(process.env.rpcUrl);
console.log(Date.now());

// add logic so this server runs continuously

const provider = new ethers.providers.JsonRpcProvider(process.env.rpcUrl);


for (var i = 0; i < config.length; i++)
{   

    const target = config[i].account

    // const autoPilotInterface = new ethers.utils.Interface(AutoPilotABI);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(target, AutoPilotABI, signer);    
    
    const abi = await ethers.utils.defaultAbiCoder;
    
    for (var j = 0; j < config[i].actions.length; j++)
    {
        console.log(config[i].actions[j]);
        const parentCalldata = 
        abi.encode(
            ['bytes4', 'address', 'uint256', 'bytes'],
            ["0xb61d27f6", config[i].actions[j].dest, config[i].actions[j].value, "0x"]
        );
        const op = 
        {
            sender : target,
            nonce : BigNumber.from("2"),
            initCode : "",
            calldata : parentCalldata,
            callGasLimit : BigNumber.from("1000000"),
            verificationGasLimit : BigNumber.from("1000000"),
            preVerificationGas : BigNumber.from("1000000"),
            maxFeePerGas : BigNumber.from("1000000"),
            maxPriorityFeePerGas : BigNumber.from("1000000"),
            paymasterAndData : "",
            signature: parentCalldata
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

    // sender: PromiseOrValue<string>;
    // nonce: PromiseOrValue<BigNumberish>;
    // initCode: PromiseOrValue<BytesLike>;
    // callData: PromiseOrValue<BytesLike>;
    // callGasLimit: PromiseOrValue<BigNumberish>;
    // verificationGasLimit: PromiseOrValue<BigNumberish>;
    // preVerificationGas: PromiseOrValue<BigNumberish>;
    // maxFeePerGas: PromiseOrValue<BigNumberish>;
    // maxPriorityFeePerGas: PromiseOrValue<BigNumberish>;
    // paymasterAndData: PromiseOrValue<BytesLike>;
    // signature: PromiseOrValue<BytesLike>;
}

}
main();


  // const op = await accountAPI.createSignedUserOp({
    //    target,
    //    value: 0,
    //    data: autoPilotInterface.encodeFunctionData("execute", [config[i].]),
    //    ...
    //    (await getGasFee(provider)),
    // });
    // console.log(`Signed UserOperation: ${await printOp(op)}`);