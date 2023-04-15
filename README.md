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

## How to use

1. `git clone`
2. `node index.js`
 
:warning: Dont install node modules yourself, we had to override one node module here
