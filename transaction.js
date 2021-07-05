const fs = require("fs");
const assert = require("assert");
const bcoin = require("bcoin");
const MTX = bcoin.MTX; // Multiple tx
const Coin = bcoin.Coin;
const Amount = bcoin.Amount;
const KeyRing = bcoin.wallet.WalletKey;
const Script = bcoin.Script;
const network = "regtest";
const compressed = true;

async function multiSign(){
    const secret1 = fs.readFileSync("./key1.wif").toString();
    const secret2 = fs.readFileSync("./key2.wif").toString();

    const keyring1 = KeyRing.fromSecret(secret1);
    const keyring2 = KeyRing.fromSecret(secret2);
    const receiverRing = KeyRing.fromSecret(secret2);
    const receiverAddress = receiverRing.getAddress().toBase58(network);

    const m = 2; 
    const n = 2; 

    const pubKeys = [keyring1.publicKey, keyring2.publicKey];

    const redeemScript = Script.fromMultisig(m, n, pubKeys);
    const script = Script.fromScripthash(redeemScript.hash160());
    const multiSigAddress = script.getAddress().toBase58(network);

    const cb = new MTX();

    cb.addInput({
        prevout: new bcoin.Outpoint(),
        script: new bcoin.Script()       
    });
    cb.addOutput({
        address: multiSigAddress,
        value: 50000
    });
    
    const mtx = new MTX();

    const coins = [];
    const coin = Coin.fromTX(cb, 0, -1); // coin object, output number 0, block height of this tx. Since it doesn't have a block height, we put -1
    coins.push(coin);

    mtx.addOutput({
        address: receiverAddress, 
        value: 10000
    });

    await mtx.fund(coins, {
        rate: 10000,                      // Fee rate 10000 sat/kB
        changeAddress: multiSigAddress   // Sending the change back to this address
    });

    keyring1.script = redeemScript;
    keyring2.script = redeemScript;

    mtx.scriptInput(0, coin, keyring1); // Input number 0, coin object, one of the keyring
    mtx.sign(keyring1);
    mtx.sign(keyring2);

    console.log(mtx);
    console.log(mtx.verify()); // FALSE, if 1 or 0 signature only
    assert(mtx.verify());  
}

multiSign().catch((err) => {
    console.error(err.stack);
    process.exit(1);
});
