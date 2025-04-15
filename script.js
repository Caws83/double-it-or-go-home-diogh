import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from "https://cdn.jsdelivr.net/npm/@solana/web3.js/+esm";

const TREASURY_WALLET = "GVeLF72pTpTeQt2mhGBCVc6VdzaJxoH9HTim4ei2wqJC";
const TOKEN_ADDRESS = "CnJzTPbjFzpo5ogNPwRFjt2ade8s2NoBfJVhrFAt31X9"; // $DIOGH
const SOLANA_NETWORK = "mainnet-beta"; // or "devnet" for testing

let wallet = null;
let tokenBalance = 0;
let flipCount = 0;

document.getElementById("connectWallet").addEventListener("click", async () => {
  if (window.solana && window.solana.isPhantom) {
    try {
      const response = await window.solana.connect();
      wallet = response.publicKey.toString();
      document.getElementById("walletAddress").textContent = `Connected Wallet: ${wallet}`;
      await updateBalances();
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  } else {
    alert("Phantom Wallet not found. Please install it from https://phantom.app");
  }
});

async function updateBalances() {
  const connection = new Connection(clusterApiUrl(SOLANA_NETWORK));
  const pubKey = new PublicKey(wallet);
  const solBalance = await connection.getBalance(pubKey);
  document.getElementById("balance").textContent = `SOL: ${(solBalance / LAMPORTS_PER_SOL).toFixed(4)} | Token Balance: ${tokenBalance} $DIOGH`;

  // Check SPL token balance (DIOGH)
  try {
    const accounts = await connection.getParsedTokenAccountsByOwner(pubKey, {
      mint: new PublicKey(TOKEN_ADDRESS),
    });
    if (accounts.value.length > 0) {
      const amt = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      tokenBalance = amt;
    } else {
      tokenBalance = 0;
    }
  } catch (e) {
    tokenBalance = 0;
  }

  document.getElementById("balance").textContent += ` | Token: ${tokenBalance} $DIOGH`;
}

async function flipCoin() {
  if (!wallet) {
    alert("Please connect your wallet first!");
    return;
  }

  const connection = new Connection(clusterApiUrl(SOLANA_NETWORK));
  const fromPubkey = new PublicKey(wallet);
  const toPubkey = new PublicKey(TREASURY_WALLET);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: 0.01 * LAMPORTS_PER_SOL,
    })
  );

  try {
    const { signature } = await window.solana.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature);
    console.log("Transaction confirmed:", signature);

    const result = Math.random() < 0.5 ? "Heads 💰" : "Tails 💥";
    document.getElementById("result").textContent = "Result: " + result;
    flipCount++;
    document.getElementById("leaderboard").innerHTML = `<li>You: ${flipCount} flips</li>`;
    await updateBalances();
  } catch (err) {
    console.error("Flip transaction failed:", err);
    alert("Flip failed. Please try again.");
  }
}
