import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import contractABI from './utils/WavePortal.json';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalBarks, setTotalBarks] = useState(-1);
  const [totalMeows, setTotalMeows] = useState(-1);
  const [allInteractions, setAllInteractions] = useState([]);
  const [message, setMessage] = useState("");
  const contractAddress = "0x9ed32145f3771164328eb33Cd78e975030a9357f";
  
  const checkIfWalletIsConnected = async () => {
    try {
      // Check if we have access to window.ethereum
      const { ethereum } = window;

      if (!ethereum) {
        console.log("No MetaMask connection -- Ethereum object not found.");
        return;
      }
      else {
        console.log("Ethereum object found", ethereum);
      }

      // Check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Authorized account found: ", account);
        setCurrentAccount(account)
        setTotalBarks(await getTotalBarks());
        setTotalMeows(await getTotalMeows());
        getAllInteractions(); // Sets allInteractions
      }
      else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask plugin");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  } 

  // Check if wallet is connected when page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const bark = async (message) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);
  
        const barkTxn = await wavePortalContract.bark(message === "" ? "Roof!" : message);
        console.log("Mining...", barkTxn.hash);

        await barkTxn.wait();
        console.log("Mined -- ", barkTxn.hash);

        let count = await wavePortalContract.getTotalBarks();
        setTotalBarks(count.toNumber());

        setMessage("");
        getAllInteractions();
      }
      else {
        console.log("Ethereum object missing");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const meow = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);
  
        const meowTxn = await wavePortalContract.meow(message === "" ? "Mee-ow!" : message);
        console.log("Mining...", meowTxn.hash);

        await meowTxn.wait();
        console.log("Mined -- ", meowTxn.hash);

        let count = await wavePortalContract.getTotalMeows();
        setTotalMeows(count.toNumber());

        setMessage("");
        getAllInteractions();
      }
      else {
        console.log("Ethereum object missing");
      }
    } catch (error) {
      console.log(error);
    }
  } 

  const getTotalBarks = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);

        let barkCount = await wavePortalContract.getTotalBarks();
        return barkCount.toNumber();
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  const getTotalMeows = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);

        let meowCount = await wavePortalContract.getTotalMeows();
        return meowCount.toNumber();
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  }

  const getAllInteractions = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);

        const interactions = await wavePortalContract.getAllInteractions();

        let interactionsCleaned = [];
        interactions.forEach(interaction => {
          interactionsCleaned.push({
            address: interaction.waver,
            interactionType: interaction.interactionType,
            message: interaction.message,
            timestamp: new Date(interaction.timestamp * 1000)
          });
        });

        setAllInteractions(interactionsCleaned);
        /*
        wavePortalContract.on("NewInteraction", (from, interactionType, timestamp, message) => {
          console.log("NewInteraction", from, interactionType, timestamp, message);

          setAllInteractions(prevState => [...prevState, {
            address: from,
            interactionType: interactionType,
            message: message,
            timestamp: new Date(timestamp * 1000)
          }]);
        }); 
        */
      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="mainContainer">
      <div className="dataContainer">
      
        <div className="header">
        Justin Singh's Message Board
        </div>

        <div className="bio">
        Leave a message on the Rinkeby Testnet! 
        </div>

        <div className="bio">
          <textarea name="text" rows="5" cols="60" value={message} placeholder="Add some text to your message!" onChange={e => setMessage(e.target.value)} >
          </textarea>
        </div>

        <button className="waveButton" onClick={() => bark(message)}>
          🐶 Bark at Me 🐕‍
        </button>

		    <button className="waveButton" onClick={() => meow(message)}>
          🐱 Meow at Me 🐈‍
        </button>
        
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {currentAccount && totalBarks >= 0 && totalMeows >= 0 && (
          <div className="bio">
          {totalBarks} barks and {totalMeows} meows sent to Justin!
          </div>
        )}

        {allInteractions.map((interaction, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {interaction.address}</div>
              <div>Time: {interaction.timestamp.toString()}</div>
              <div>Type: {interaction.interactionType}</div>
              <div>Message: {interaction.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
