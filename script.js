import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from "https://cdn.jsdelivr.net/npm/@solana/web3.js/+esm";

// CONFIG
const TREASURY_WALLET = "GVeLF72pTpTeQt2mhGBCVc6VdzaJxoH9HTim4ei2wqJC";
const TOKEN_ADDRESS = "CnJzTPbjFzpo5ogNPwRFjt2ade8s2NoBfJVhrFAt31X9"; // $DIOGH
const SOLANA_NETWORK = "mainnet-beta";

let wallet = null;
let tokenBalance = 0;
let flipCount = 0;

window.addEventListener("DOMContentLoaded", () => {
  const connectButton = document.getElementById("connectWallet");
  const flipButton = document.getElementById("flipButton");

  if (connectButton) {
    connectButton.addEventListener("click", connectWallet);
  }

  if (flipButton) {
    flipButton.addEventListener("click", flipCoin);
  }
});

async function connectWallet() {
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
}

async function updateBalances() {
  const connection = new Connection(clusterApiUrl(SOLANA_NETWORK));
  const pubKey = new PublicKey(wallet);
  const solBalance = await connection.getBalance(pubKey);
  const solAmount = (solBalance / LAMPORTS_PER_SOL).toFixed(4);

  // Check SPL token balance
  try {
    const accounts = await connection.getParsedTokenAccountsByOwner(pubKey, {
      mint: new PublicKey(TOKEN_ADDRESS),
    });
    if (accounts.value.length > 0) {
      tokenBalance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    } else {
      tokenBalance = 0;
    }
  } catch {
    tokenBalance = 0;
  }

  document.getElementById("balance").textContent = `SOL: ${solAmount} | Token: ${tokenBalance} $DIOGH`;
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

    const result = Math.random() < 0.5 ? "Heads 💰" : "Tails 💥";
    document.getElementById("result").textContent = `Result: ${result}`;
    flipCount++;
    document.getElementById("leaderboard").innerHTML = `<li>You: ${flipCount} flips</li>`;
    await updateBalances();
  } catch (err) {
    console.error("Transaction failed:", err);
    alert("Flip failed. Please try again.");
  }
}

