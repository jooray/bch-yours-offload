let BITBOXCli = require('bitbox-cli/lib/bitbox-cli').default;
let BITBOX = new BITBOXCli();

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stderr
});

rl.question('Please enter mnemonic seed from yours.org account: ', (mnemonic) => {
  var seedBuffer = BITBOX.Mnemonic.toSeed(mnemonic)
  var hdNode = BITBOX.HDNode.fromSeed(seedBuffer)
  var firstKey = BITBOX.HDNode.derivePath(hdNode, "m/44'/0'/0'/0/0")
  console.log(BITBOX.HDNode.toWIF(firstKey))
  rl.close()
})