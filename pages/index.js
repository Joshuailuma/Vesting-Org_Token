// import required modules
// the essential modules to interact with frontend are below imported.
// ethers is the core module that makes RPC calls using any wallet provider like Metamask which is esssential to interact with Smart Contract
import { ethers } from "ethers";
// A single Web3 / Ethereum provider solution for all Wallets
import Web3Modal from "web3modal";
// yet another module used to provide rpc details by default from the wallet connected
import WalletConnectProvider from "@walletconnect/web3-provider";
// react hooks for setting and changing states of variables
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  // env variables are initalised
  // contractAddress is deployed smart contract addressed 
  const contractAddress = process.env.CONTRACT_ADDRESS
  // application binary interface is something that defines structure of smart contract deployed.
  const abi = process.env.ABI

  // hooks for required variables
  const [provider, setProvider] = useState();

  const web3ModalRef = useRef();
  // Check if wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);

  // the value entered in the input field is stored in the below variables
  const [tokenName, setTokenName] = useState("");
  const [tokenAbbrev, setTokenAbbrev] = useState("");
  const [totalSuppply, setTotalSupply] = useState(0);
  const [stakeholderName, setStakeHolderName] = useState("");
  const [vestationPeriod, setVestationPeriod] = useState(0);
  const [addressToBeWhiteListed, setWhitelistedAddress] = useState("");
  const [amountToOffer, setAmmountToOffer] = useState(0);
  const [companyAddress, setCompanyAddress] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [whitelistBalance, setWhitelistBalance] = useState(0);
  const [companyAddressToGetWhiteList, setCompanyAddressToGetWhiteList] = useState(0);



  // the variable is used to invoke loader
  const [storeLoader, setStoreLoader] = useState(false)
  const [retrieveLoader, setRetrieveLoader] = useState(false)

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();

    const web3Provider = new ethers.BrowserProvider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId.toString() !== '11155111') {
      console.log(chainId.toString())
      window.alert("Change the network to Sepolia");
      throw new Error("Change network to Sepolia");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /*
        connectWallet: Connects the MetaMask wallet
      */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "localhost",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getBalance();
      // getBalanceOfCryptoDevTokens();
      // getTokensToBeClaimed();
      // getOwner();
    }
  }, [walletConnected]);



  // async function initWallet() {
  //   try {
  //     // check if any wallet provider is installed. i.e metamask xdcpay etc
  //     if (typeof window.ethereum === 'undefined') {
  //       console.log("Please install wallet.")
  //       alert("Please install wallet.")
  //       return
  //     }
  //     else {
  //       // raise a request for the provider to connect the account to our website
  //       const web3ModalVar = new Web3Modal({
  //         cacheProvider: true,
  //         providerOptions: {
  //           walletconnect: {
  //             package: WalletConnectProvider,
  //           },
  //         },
  //       });

  //       const instanceVar = await web3ModalVar.connect();
  //       const providerVar = new ethers.providers.Web3Provider(instanceVar);
  //       setProvider(providerVar)
  //       getBalance(providerVar)
  //       return
  //     }

  //   } catch (error) {
  //     console.log(error)
  //     return
  //   }
  // }

  async function getBalance(provider) {
    try {
      setRetrieveLoader(true)
      const signer = await getProviderOrSigner(true);

      // initalize smartcontract with the essentials detials.
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);

      console.log(contractAddress)
      // interact with the methods in smart contract
      const responsee = await contractWithSigner.getMyBalance();

      console.log(parseInt(responsee))
      setCurrentBalance(parseInt(responsee))
      setRetrieveLoader(false)
      return
    } catch (error) {
      alert(error)
      setRetrieveLoader(false)
      return
    }
  }


  /**
   * Get whitlist balance
   * @param {*} provider 
   * @returns 
   */
  async function getWhitelistBalance(provider) {
    try {
      setRetrieveLoader(true)
      const signer = await getProviderOrSigner(true);

      // initalize smartcontract with the essentials detials.
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);

      console.log(contractAddress)
      // interact with the methods in smart contract
      const response = await contractWithSigner.whitelistedBalanceBeforewithdrawal(companyAddressToGetWhiteList);

      console.log(parseInt(response))
      setWhitelistBalance(parseInt(response))
      setRetrieveLoader(false)
      return
    } catch (error) {
      alert(error)
      setRetrieveLoader(false)
      return
    }
  }

  /**
   * To register a company
   *  
   */
  async function registerCompany() {
    // Validate input
    if (tokenName.length < 1 || tokenAbbrev.length < 1) {
      alert("Please enter the token name and abbreviation")
      return
    }

    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);


      // interact with the methods in smart contract as it's a write operation, we need to invoke the transation usinf .wait()
      const writeNumTX = await contractWithSigner.registerCompany(tokenName, tokenAbbrev, totalSuppply);
      console.log(writeNumTX)
      const response = await writeNumTX.wait()
      console.log(await response)
      setStoreLoader(false)

      alert(`Company registered successfully ${tokenName}`)
      return

    } catch (error) {
      alert(error)
      setStoreLoader(false)
      return
    }
  }

  /**
   * To set stakeholder and period
   * @returns 
   */
  async function setStakeHolderAndPeriod() {
    // Validate input
    if (stakeholderName.length < 1) {
      alert("Please enter the stakeholder title")
      return
    }

    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);

      // interact with the methods in smart contract as it's a write operation, we need to invoke the transation usinf .wait()
      const writeNumTX = await contractWithSigner.setStakeholderAndPeriod(stakeholderName, ethers.parseEther(vestationPeriod));
      const response = await writeNumTX.wait()
      console.log(await response)
      setStoreLoader(false)

      alert(`Stakeholder title successfully ${stakeholderName}, vestation period is ${vestationPeriod}`)
      return

    } catch (error) {
      alert(error)
      setStoreLoader(false)
      return
    }
  }

  /**
   * Add address to whitelist
   * @returns 
   */
  async function whiteListAddress() {
    // Validate input
    if (addressToBeWhiteListed.length < 1) {
      alert("Please enter an address")
      return
    }

    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);

      // interact with the methods in smart contract as it's a write operation, we need to invoke the transation usinf .wait()
      const writeNumTX = await contractWithSigner.whiteListAddress(addressToBeWhiteListed, amountToOffer);
      const response = await writeNumTX.wait()
      console.log(await response)
      setStoreLoader(false)

      alert(`${addressToBeWhiteListed} successfully whitelisted, with amount ${amountToOffer}`)
      return

    } catch (error) {
      alert(error)
      setStoreLoader(false)
      return
    }
  }

  /**
   * Claim a token
   * @returns 
   */
  async function claimToken() {
    // Validate input
    if (companyAddress.length < 1) {
      alert("Please enter an address")
      return
    }

    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);

      // interact with the methods in smart contract as it's a write operation, we need to invoke the transation usinf .wait()
      const writeNumTX = await contractWithSigner.claimToken(companyAddress);
      const response = await writeNumTX.wait()
      console.log(await response)
      setStoreLoader(false)

      alert(`Token successfully claimed. Please check balance`)
      return

    } catch (error) {
      alert(error)
      setStoreLoader(false)
      return
    }
  }

  function handleOnFormSubmit(e) {
    e.preventDefault()
  }

  // useEffect(() => {
  //   initWallet();
  // }, [])


  return (
    <div className='m-6 space-y-4'>
      <h1 className="text-gray-700 text-3xl font-bold">
        Organization Vesting token
      </h1>

      <h3>Current balance</h3>
      <button className='px-4 py-1 rounded-2xl bg-slate-300 hover:bg-slate-500 flex justify-around transition-all w-32' onClick={() => getBalance(provider)}> {retrieveLoader ? (
        <svg
          className="animate-spin m-1 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75 text-gray-700"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : "RETRIEVE"} </button>
      <h4>Current balance is <span className='font-bold'>{currentBalance ? currentBalance : 0}</span> </h4>
      <hr></hr>


      <h3 className="mt-5">Your whitelist balance</h3>
      <input onChange={(e) => {
        setCompanyAddressToGetWhiteList(e.target.value);
      }}
        name={'name'} required maxLength={"100"}
        type='text'
        className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-80"}
        placeholder="Company address offering token"
      />
      <button className='px-4 py-1 rounded-2xl bg-slate-300 hover:bg-slate-500 flex justify-around transition-all w-32' onClick={() => getWhitelistBalance(provider)}> {retrieveLoader ? (
        <svg
          className="animate-spin m-1 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75 text-gray-700"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : "VIEW"} </button>
      <h4> Your whitelisting balance is <span className='font-bold'>{whitelistBalance ? whitelistBalance : 0}</span> </h4>
      <hr></hr>



      <h3 className="mt-5">Register organisation </h3>
      <div>
        <form onSubmit={handleOnFormSubmit} className={"mt-6"}>
          <div className=" flex flex-col space-y-3">

            {/* Name */}
            <input onChange={(e) => {
              setTokenName(e.target.value);
            }}
              name={'name'} required maxLength={"100"}
              type='text'
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-80"}
              placeholder="Token name"
            />

            <input onChange={(e) => {
              setTokenAbbrev(e.target.value);
            }} name={'name'} required maxLength={"10"}
              type='text'
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-80"}
              placeholder="Token abbreviation"
            />

            {/* Total supply*/}
            <input onChange={(e) => {
              setTotalSupply(e.target.value);
            }} name={'totalSupply'} required maxLength={"40"}
              type='number' min="1" step="1"
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-80"}
              placeholder="Total supply"
            />
          </div>
        </form>
      </div>

      <button onClick={registerCompany} className='rounded-2xl px-4 py-1 bg-slate-300 flex justify-around hover:bg-slate-500 transition-all w-32'> {storeLoader ? (
        <svg
          className="animate-spin m-1 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75 text-gray-700"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : "Register Company"} </button>
      <hr></hr>


      <h3 className="mt-3">Set stakeholder title and period </h3>
      <div>
        <form onSubmit={handleOnFormSubmit} className={"mt-6"}>
          <div className=" flex flex-col space-y-3">

            {/* Stakeholder */}
            <input onChange={(e) => {
              setStakeHolderName(e.target.value);
            }}
              name={'name'} required maxLength={"100"}
              type='text'
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-80"}
              placeholder="Stakeholder title"
            />

            {/* Vestation period*/}
            <input onChange={(e) => {
              setVestationPeriod(e.target.value);
            }} name={'totalSupply'} required maxLength={"40"}
              type='number' min="1" step="1"
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-80"}
              placeholder="Vestation period"
            />
          </div>
        </form>
      </div>

      <button onClick={setStakeHolderAndPeriod} className='rounded-2xl px-4 py-1 bg-slate-300 flex justify-around hover:bg-slate-500 transition-all w-32'> {storeLoader ? (
        <svg
          className="animate-spin m-1 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75 text-gray-700"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : "Set stakeholder and period"} </button>
      <hr></hr>


      <h3 className="mt-3">Add address to whitelist </h3>
      <div>
        <form onSubmit={handleOnFormSubmit} className={"mt-6"}>
          <div className=" flex flex-col space-y-3">

            {/* Address */}
            <input onChange={(e) => {
              setWhitelistedAddress(e.target.value);
            }}
              name={'name'} required maxLength={"100"}
              type='text'
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-80"}
              placeholder="Address"
            />

            {/* Amount to offer*/}
            <input onChange={(e) => {
              setAmmountToOffer(e.target.value);
            }} name={'amount'} required maxLength={"40"}
              type='number' min="1" step="1"
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-80"}
              placeholder="Amount to offer"
            />
          </div>
        </form>
      </div>

      <button onClick={whiteListAddress} className='rounded-2xl px-4 py-1 bg-slate-300 flex justify-around hover:bg-slate-500 transition-all w-32'> {storeLoader ? (
        <svg
          className="animate-spin m-1 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75 text-gray-700"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : "Whitelist Address"} </button>
      <hr></hr>


      <h3 className="mt-3">Claim token offered by a company </h3>
      <div>
        <form onSubmit={handleOnFormSubmit} className={"mt-6"}>
          <div className=" flex flex-col space-y-3">

            {/* Company address */}
            <input onChange={(e) => {
              setCompanyAddress(e.target.value);
            }}
              name={'name'} required maxLength={"100"}
              type='text'
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-80"}
              placeholder="Company address offering the token"
            />
          </div>
        </form>
      </div>

      <button onClick={claimToken} className='rounded-2xl px-4 py-1 bg-slate-300 flex justify-around hover:bg-slate-500 transition-all w-32'> {storeLoader ? (
        <svg
          className="animate-spin m-1 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75 text-gray-700"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : "Claim Token"} </button>

    </div>
  )
}
