
let walletAddress = null;
let flipCount = 0;
const TREASURY_WALLET = "GVeLF72pTpTeQt2mhGBCVc6VdzaJxoH9HTim4ei2wqJC";
const TOKEN_ADDRESS = "CnJzTPbjFzpo5ogNPwRFjt2ade8s2NoBfJVhrFAt31X9";
const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"));

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectWallet").addEventListener("click", connectWallet);
  document.getElementById("flipButton").addEventListener("click", flipCoin);
});

async function connectWallet() {
  if (window.solana && window.solana.isPhantom) {
    try {
      const res = await window.solana.connect({ onlyIfTrusted: false });
      walletAddress = res.publicKey.toString();
      document.getElementById("walletAddress").textContent = "Connected Wallet: " + walletAddress;
      await updateBalances();
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  } else {
    alert("Phantom Wallet not found. Please install it from https://phantom.app");
  }
}

async function updateBalances() {
  const pubKey = new solanaWeb3.PublicKey(walletAddress);
  const solBalance = await connection.getBalance(pubKey);
  const sol = (solBalance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4);

  let tokenBalance = 0;
  try {
    const accounts = await connection.getParsedTokenAccountsByOwner(pubKey, {
      mint: new solanaWeb3.PublicKey(TOKEN_ADDRESS),
    });

    if (accounts.value.length > 0) {
      tokenBalance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    }
  } catch (err) {
    console.error("Error reading token balance:", err);
  }

  document.getElementById("balance").textContent = `SOL: ${sol} | Token: ${tokenBalance} $DIOGH`;
}

async function flipCoin() {
  if (!walletAddress) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    const fromPubkey = new solanaWeb3.PublicKey(walletAddress);
    const toPubkey = new solanaWeb3.PublicKey(TREASURY_WALLET);
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: 0.01 * solanaWeb3.LAMPORTS_PER_SOL,
      })
    );

    transaction.feePayer = fromPubkey;
    transaction.recentBlockhash = recentBlockhash;

    const signed = await window.solana.signTransaction(transaction);
    const rawTx = signed.serialize();

    const signature = await connection.sendRawTransaction(rawTx);
    await connection.confirmTransaction(signature, "confirmed");

    const result = Math.random() < 0.5 ? "Heads 💰" : "Tails 💥";
    document.getElementById("result").textContent = "Result: " + result;
    flipCount++;
    document.getElementById("leaderboard").innerHTML = `<li>You: ${flipCount} flips</li>`;

    await updateBalances();
  } catch (err) {
    console.error("Flip failed:", err);
    alert("Flip failed. Try again.");
  }
}
