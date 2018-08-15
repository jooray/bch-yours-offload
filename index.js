let BITBOXCli = require('bitbox-cli/lib/bitbox-cli').default;
let BITBOX = new BITBOXCli();
let shuffle = require('shuffle-array')
let fs = require('fs')

async function withdrawTo(fromWIF, toAddress, leaveUSD) {

  var ecPair = BITBOX.ECPair.fromWIF(fromWIF)
  var address = BITBOX.ECPair.toCashAddress(ecPair)
  var price = await BITBOX.Price.current('usd')
  var leaveSat = Math.floor(leaveUSD/(price*0.00000001))

  var availUtxos = await BITBOX.Address.utxo(address)
  var keptSatoshis = 0
  var transferredSatoshis = 0
  var spentInputs = 0
  var utxos = []

  var transactionBuilder = new BITBOX.TransactionBuilder('bitcoincash')
  shuffle(availUtxos).forEach( (utxo) => {
    if (keptSatoshis < leaveSat) {
      keptSatoshis = keptSatoshis + utxo["satoshis"]
    } else {
      transferredSatoshis = transferredSatoshis + utxo["satoshis"]
      spentInputs = spentInputs+1
      transactionBuilder.addInput(utxo.txid, utxo.vout)
      utxos.push(utxo)
    }
  })

  if (transferredSatoshis == 0) return

  // we have spentInputs inputs and one output, let's find out what type it is
  var outputTypes = { P2SH: 1 }
  if (BITBOX.Address.detectAddressType(toAddress) == "p2pkh") outputTypes = { P2PKH: 1 }
  var byteCount = BITBOX.BitcoinCash.getByteCount({ P2PKH: spentInputs }, outputTypes)

  // one output, amount - fee
  var satPerByte = 1
  var sendAmount = transferredSatoshis - (byteCount * satPerByte)
  transactionBuilder.addOutput(toAddress, sendAmount)

  // sign transaction
  var inputNo = 0
  let redeemScript
  utxos.forEach( (utxo) => {
    transactionBuilder.sign(inputNo, ecPair, redeemScript, transactionBuilder.hashTypes.SIGHASH_ALL, utxo.satoshis)
    inputNo = inputNo + 1
  })

  await BITBOX.RawTransactions.sendRawTransaction(transactionBuilder.build().toHex())

}

if (process.argv.length != 5) {
   console.log("Usage: " + __filename + " privateKeyFilename.wif toAddress leaveUSD")
   console.log("Example: " + __filename + " privateKey.wif bitcoincash:qpera89pw9pfwemmccyy6eyq3l2g9cvkuqssl56php 0.2")
   console.log(" - read private key from privateKey.wif")
   console.log(" - leave at least 0.2 USD according to current exchange rate untouched")
   console.log(" - send the rest to bitcoincash:qpera89pw9pfwemmccyy6eyq3l2g9cvkuqssl56php")
} else {
  fs.readFile(process.argv[2], 'utf8', (error, data) => {
      if (error) throw error;
      withdrawTo(data.toString().trim(), process.argv[3], process.argv[4])
  })
}
