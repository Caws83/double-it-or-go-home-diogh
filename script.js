import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from "https://cdn.jsdelivr.net/npm/@solana/web3.js/+esm";

const TREASURY_WALLET = "GVeLF72pTpTeQt2mhGBCVc6VdzaJxoH9HTim4ei2wqJC";
const TOKEN_ADDRESS = "CnJzTPbjFzpo5ogNPwRFjt2ade8s2NoBfJVhrFAt31X9";
const SOLANA_NETWORK = "mainnet-beta";

let wallet = null;
let flipCount = 0;
let tokenBalance = 0;

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectWallet").addEventListener("click", connectWallet);
  document.getElementById("flipButton").addEventListener("click", flipCoin);
});

async function connectWallet() {
  if (window.solana && window.solana.isPhantom) {
    try {
      const res = await window.solana.connect();
      wallet = res.publicKey.toString();
      document.getElementById("walletAddress").textContent = "Connected Wallet: " + wallet;
      await updateBalances();
    } catch (err) {
      console.error("Wallet connect error:", err);
    }
  } else {
    alert("Phantom Wallet not found. Get it at https://phantom.app");
  }
}

async function updateBalances() {
  const connection = new Connection(clusterApiUrl(SOLANA_NETWORK));
  const pubKey = new PublicKey(wallet);

  // SOL Balance
  const solBalance = await connection.getBalance(pubKey);
  let sol = (solBalance / LAMPORTS_PER_SOL).toFixed(4);

  // $DIOGH Token Balance
  try {
    const accounts = await connection.getParsedTokenAccountsByOwner(pubKey, {
      mint: new PublicKey(TOKEN_ADDRESS),
    });
    if (accounts.value.length > 0) {
      tokenBalance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    } else {
      tokenBalance = 0;
    }
  } catch (err) {
    console.error("Token balance check failed:", err);
    tokenBalance = 0;
  }

  document.getElementById("balance").textContent = `SOL: ${sol} | Token: ${tokenBalance} $DIOGH`;
}

async function flipCoin() {
  if (!wallet) {
    alert("Please connect your wallet first.");
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

    // Flip Result
    const result = Math.random() < 0.5 ? "Heads 💰" : "Tails 💥";
    document.getElementById("result").textContent = "Result: " + result;

    // Update leaderboard
    flipCount++;
    document.getElementById("leaderboard").innerHTML = `<li>You: ${flipCount} flips</li>`;

    await updateBalances();
  } catch (err) {
    console.error("Flip failed:", err);
    alert("Transaction failed. Try again.");
  }
}

