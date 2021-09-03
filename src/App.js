import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/BuildSpace.json";

export default function App() {

  const handOptions =  {
    rock:0,
    paper: 1,
    scissors: 2
  }
  const [currAccount, setCurrentAccount] = React.useState("")

  console.log(currAccount)
  console.log(setCurrentAccount)

  const checkIfWalletConnected = () => {
    // first make sure have access to window.etherem
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask")
      return
    } else {
      console.log("We have ethereum", ethereum)
      getAllThrows()
    }

     //check if authorized to access wallet
    ethereum.request({ method: 'eth_accounts'})
    .then(accounts => {
      // We could have multiple accounts.  Check for each one.

      if(accounts.length !== 0) {
        const account = accounts[0]; // grab the first one
        console.log("Found an authorized account: ", account)

        //store user account for later
        setCurrentAccount(account);
      } else {
        console.log("No user account found.")
      }
    })
   
  }

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get metamask!")
    }  

   console.log("ethereum", ethereum)

    ethereum.request({method: 'eth_requestAccounts'})
    .then(accounts => {
      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
    })
    .catch(err => console.log(err));
  }
  
  const contractAddress = "0xB4C1036A7a73875a05D21c88B1c8EBcb7b9e10c2";
  const contractABI = abi.abi
  console.log("contractAddress:", contractAddress)
  console.log("contractABI", contractABI)

  const wave = async () => {
    console.log("Pressed wave")

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log("provider:", provider)

    const signer = provider.getSigner()
    console.log("signer:", signer)

    const buildSpaceContract = new ethers.Contract(contractAddress, contractABI, signer)
    
    console.log("buildSpaceContract:", buildSpaceContract)

    let count = await buildSpaceContract.getTotalWaves();

    console.log("Retrieved total waves:", count.toNumber())

    const waveTxn = await buildSpaceContract.wave(handOptions.rock)
    console.log("Mining...", waveTxn.hash)

    await waveTxn.wait()
    console.log("Mined --", waveTxn.hash)

    count = await buildSpaceContract.getTotalWaves()
    console.log("Retrieved total wave count", count.toNumber())

  }

  // pass a rock, paper, scissors value
  const throwHand = async (hand : any)  => {
      console.log("hand: ", hand)

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("provider:", provider)

      const signer = provider.getSigner()
      console.log("signer:", signer)

      const buildSpaceContract = new ethers.Contract(contractAddress, contractABI, signer)
      console.log("buildSpaceContract:", buildSpaceContract)

      const throwTxn = await buildSpaceContract.throwHand(0, "some message")
      console.log("Mining...", throwTxn.hash)

      await throwTxn.wait()
      console.log("Mined --", throwTxn.hash)

  }

  const [allThrows, setAllThrows] = React.useState([]) //https://www.geeksforgeeks.org/what-is-usestate-in-react/

  async function getAllThrows() {
    console.log("running getAllThrows")

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log("provider:", provider)

    const signer = provider.getSigner()
    console.log("signer:", signer)

    const buildSpaceContract = new ethers.Contract(contractAddress, contractABI, signer)
    console.log("buildSpaceContract:", buildSpaceContract)

    let throws = await buildSpaceContract.getAllThrows()

    let throwsCleaned = []
    throws.forEach(handThrow => {
      throwsCleaned.push({
        address: handThrow.address,
        timestamp: new Date(handThrow.timestamp * 1000),
        message: handThrow.message 
      })
    })

    setAllThrows(throwsCleaned)
  }
  
  // check if function is used upon page load
    React.useEffect(() => {
      checkIfWalletConnected()
    }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        <span role="img" aria-label="metamask">👋</span> Read to Throw Hands?
        </div>

        <div className="bio">
        Rock. Paper. Scissors.  Whatever the last blockchain transaction shows, you will throw against it.
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        <button className="waveButton" onClick={() => throwHand(handOptions.rock)}>
          Rock <span role="img" aria-label="metamask">🪨</span>
        </button>

        <button className="waveButton" onClick={() => throwHand(handOptions.paper)}>
          Paper <span role="img" aria-label="metamask">📃</span>
        </button>

        <button className="waveButton" onClick={() => throwHand(handOptions.scissors)}>
          Scissors <span role="img" aria-label="metamask">✂️</span>
        </button>

        {console.log("currAccount:", currAccount)}

        {currAccount ? null : (
          <button className="waveButton" onClick={connectWallet}>  
            ConnectWallet
          </button>
        )}

        {allThrows.map((handThrow, index) => {
          return (
            <div style = {{backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
              <div>Address: {handThrow.address}</div>
              <div>Time: {handThrow.timestamp.toString()}</div>
              <div>Message: {handThrow.message}</div>
            </div>
          )
        })}
       
      </div>
    </div>
  );
}
