This is a a simple script to send excess funds from your
[yours.org](https://yours.org/) wallet (or any BCH wallet) to another
BCH address.

Script can be used to periodically transfer BCH out of a single
address (key).  My use-case is transferring money out of my yours.org
wallet, leaving some in the wallet for tips and purchases.

It might be useful if you want to learn how to create transactions
from UTXOs, if you only have key/address

# Requirements

Requires nodejs and npm. Tested on macOs.

Install dependencies with:

```
$ npm install
```

# Usage

## Get private key in WIF format

First you need to get private key in WIF format from your mnemonic.
It uses the standard yours.org key derivation (which is different
than standard for BCH that for example Electron Cash uses).

```
$ node derivekey.js > myPrivateKey.wif
Please enter mnemonic seed from yours.org account: beaver beaver beaver beaver beaver beaver beaver beaver beaver beaver beaver beaver
```

(please don't use this key, really!)

## Run the cashout script from command-line

```
$ node index.js myPrivateKey.wif 'bitcoincash:qpxtdlh265ulecqfau30cq6hxtcx57zapqpm99373q' 0.7
```

Replace
[bitcoincash:qpxtdlh265ulecqfau30cq6hxtcx57zapqpm99373q](bitcoincash:qpxtdlh265ulecqfau30cq6hxtcx57zapqpm99373q)
with your destination address. If you find this code useful, either
if you use it or as an educational tool for using Bitbox, I welcome
donations on that address.

This command will look at all the spendable UTXOs belonging to
address with myPrivateKey.wif as a private key, leaving at least
$0.7 worth of BCH intact and send the rest to the destination
address. There is no change address, all funds are sent to the
destination, after deducting the transaction fee (1sat/B).

## Security concerns

Please make sure that your privatekey is not readable by other users:

```
chmod 600 myPrivateKey.wif
```

## Put it into cron

You can put something like this into cron:

```
2 0 * * 0 /usr/local/bin/node ~/bch-yours-offload/index.js ~/myPrivateKey.wif 'bitcoincash:qpxtdlh265ulecqfau30cq6hxtcx57zapqpm99373q' 0.7
```

To run it every Sunday. You can usually edit your crontab with

```
crontab -e
```

