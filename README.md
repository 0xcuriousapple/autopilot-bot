# AutoPilot Bot
### Main Repo : [Main](https://github.com/abhishekvispute/autopilot) 

![Autopilot](https://user-images.githubusercontent.com/46760063/232250693-309424cc-00d5-41e2-9e54-68e09a000fab.jpg)

Please be aware that we developed this bot in last, so it doesnt follow good coding practices at all.</br>
Our usecase was tricky since we needed account derivation from owner's keys but signature from bot keys.</br>
Had to override account abstraction sdk's getAccountAddress for same.</br>
```
async getAccountAddress() {
        if (this.senderAddress == null) {
            if (this.accountAddress != null) {
                this.senderAddress = this.accountAddress;
            }
            else {
                this.senderAddress = await this.getCounterFactualAddress();
            }
        }
        return "0x5aa49C6555C639eeF5703166a2f907CB997dF1d6";
        // return this.senderAddress;
    }
```

**Example Bot Transaction:** 
https://www.jiffyscan.xyz/userOpHash/0xe36c42eb1ee4846289d63114ec53c2993090e43fb05d0b48de8fbf4e44639127?network=goerli

## How to use

1. `git clone`
2. `node index.js`
 
:warning: Dont install node modules yourself, we had to override one node module here

## How it works
1- imports exported nodes from import.json
2- for now it only runs erc20 transfer
3- it encodes transer call and creates a bot-signed userOp from that
4- account-abstraction sdk is overwritten to return user account as target, instead of getting that from the signer
5- signed userOp is sent to bundler
