// BITCOIN MULTI SIG

const bcoin = require("bcoin");
const fs = require("fs");
const KeyRing = bcoin.wallet.WalletKey;
const Script = bcoin.Script;
const network = "regtest";
const compressed = true;

const key1 = KeyRing.generate(compressed, network);
const key2 = KeyRing.generate(compressed, network);

fs.writeFileSync("key1.wif", key1.toSecret(network)); // Exporting keys to a file
fs.writeFileSync("key2.wif", key2.toSecret(network));

const m = 2; // Total key
const n = 2; // Needed key to unlock

const pubKeys = [key1.publicKey, key2.publicKey];

const multiSigScript = Script.fromMultisig(m, n, pubKeys); // Normal multisig locking script
console.log(multiSigScript);

const address = multiSigScript.getAddress().toBase58(network); //<Script_Hash> Pay to Script Hash Address
console.log(address);

fs.writeFileSync("address", address);
