
let tokenBalance = 0;
let flipCount = 0;

function flipCoin() {
  const result = Math.random() < 0.5 ? "Heads 💰" : "Tails 💥";
  document.getElementById("result").textContent = "Result: " + result;
  const reward = Math.floor(Math.random() * 10 + 1);
  tokenBalance += reward;
  flipCount++;
  document.getElementById("balance").textContent = `Token Balance: ${tokenBalance} $DIOGH`;

  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = `<li>You: ${flipCount} flips</li>`;
}

document.getElementById("connectWallet").addEventListener("click", async () => {
  if (window.solana && window.solana.isPhantom) {
    try {
      const response = await window.solana.connect();
      const pubKey = response.publicKey.toString();
      document.getElementById("walletAddress").textContent = `Connected Wallet: ${pubKey}`;
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  } else {
    alert("Phantom Wallet not found. Please install it from https://phantom.app");
  }
});
