<!-- Add to index.html inside <head> or before </body> -->
<script src="https://cdn.jsdelivr.net/npm/@solana/web3.js@latest/lib/index.iife.min.js"></script>
<script>
  const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"));
  const treasuryWallet = new solanaWeb3.PublicKey("GVeLF72pTpTeQt2mhGBCVc6VdzaJxoH9HTim4ei2wqJC");

  let walletAddress = null;
  let flipCount = 0;

  document.getElementById("connectWallet").addEventListener("click", async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const res = await window.solana.connect();
        walletAddress = res.publicKey.toString();
        document.getElementById("walletAddress").textContent = `Connected Wallet: ${walletAddress}`;
      } catch (err) {
        console.error("Connection error:", err);
      }
    } else {
      alert("Please install Phantom Wallet: https://phantom.app");
    }
  });

  async function flipCoin() {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: new solanaWeb3.PublicKey(walletAddress),
          toPubkey: treasuryWallet,
          lamports: 0.01 * solanaWeb3.LAMPORTS_PER_SOL,
        })
      );
      transaction.feePayer = new solanaWeb3.PublicKey(walletAddress);
      transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
      
      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      const result = Math.random() < 0.5 ? "Heads 💰" : "Tails 💥";
      document.getElementById("result").textContent = `Result: ${result}`;
      flipCount++;
      document.getElementById("leaderboard").innerHTML = `<li>You: ${flipCount} flips</li>`;
    } catch (err) {
      console.error("Flip error:", err);
    }
  }

  document.getElementById("flipButton").addEventListener("click", flipCoin);
</script>

