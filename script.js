let tokenBalance = 0;
let flipCount = 0;

function flipCoin() {
  const wager = parseFloat(document.getElementById("wagerAmount").value);
  const chosen = document.getElementById("chosenSide").value;
  if (!wager || wager <= 0) {
    alert("Enter a valid wager amount.");
    return;
  }

  const result = Math.random() < 0.5 ? "Heads" : "Tails";
  document.getElementById("result").textContent = "Coin landed on: " + result;

  if (result === chosen) {
    tokenBalance += wager;
    document.getElementById("result").textContent += " — You Win! 🎉";
  } else {
    tokenBalance -= wager;
    document.getElementById("result").textContent += " — You Lose 💀";
  }

  flipCount++;
  document.getElementById("balance").textContent = "Token Balance: " + tokenBalance + " $DIOGH";
  document.getElementById("leaderboard").innerHTML = "<li>You: " + flipCount + " flips</li>";
}

function rollDice() {
  const roll = Math.floor(Math.random() * 6) + 1;
  document.getElementById("diceResult").textContent = "You rolled a 🎲 " + roll;
  if (roll >= 5) {
    tokenBalance += 5;
    document.getElementById("balance").textContent = "Token Balance: " + tokenBalance + " $DIOGH";
  }
}
<script>
  document.addEventListener("DOMContentLoaded", () => {
    const walletBtn = document.getElementById("connectWallet");
    const walletStatus = document.getElementById("walletStatus");

    walletBtn.addEventListener("click", async () => {
      if (window.solana && window.solana.isPhantom) {
        try {
          const res = await window.solana.connect();
          const address = res.publicKey.toString();
          const short = address.slice(0, 4) + "..." + address.slice(-4);

          walletStatus.textContent = "✅ Wallet: " + short;
          walletStatus.style.display = "inline-block";
          walletBtn.style.display = "none";
        } catch (err) {
          console.error("Wallet connection failed:", err);
        }
      } else {
        alert("Phantom Wallet not found. Please install it from https://phantom.app");
      }
    });
  });
</script>
