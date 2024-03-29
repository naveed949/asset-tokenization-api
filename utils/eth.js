
const axios = require('axios');
const System = require('./System.json');
const AssetTokenization = require('./AssetTokenization.json');

const getCurrentGasPrices = async () => {
  let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
  let prices = {
    low: response.data.safeLow ,
    medium: response.data.average ,
    high: response.data.fast 
  }
  return prices;
}

const getEthNetwork = () =>{
    let network = {
        rinkeby: "https://rinkeby.infura.io/v3/a9f521235df94d829754f89f68101a76",
        mainnet: "https://mainnet.infura.io/v3/a9f521235df94d829754f89f68101a76"
    }
    return network;
}

/**
 * Once you've deployed System contract on mainnet,
 *  paste its address in below mentioned field of this function.
 */
const getContracts = () =>{
    let contracts = {
        rinkeby:{
            System:{
                address:'0x46eC2B5d66d4f9081EC92Da38d483e181390e4ff',
                abi: System.abi
            },
            AssetTokenization:{
                abi: AssetTokenization.abi
            }
        },
        mainnet:{
            System:{
                address:'ENTER MAINNET SYSTEM CONTRACT ADDRESS',
                abi: System.abi
            },
            AssetTokenization:{
                abi: AssetTokenization.abi
            }
        }
    }
    return contracts;
}

module.exports = {
    getCurrentGasPrices,
    getEthNetwork,
    getContracts
}