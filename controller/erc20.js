const wallet = require("ethereumjs-wallet");
const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');

const ethUtils = require("../utils/eth");
const { all } = require("../router/erc20");

function createAccount(req,res){
    try{
    let address = wallet.generate();
    let KeyPair = {
        privateKey: address.getPrivateKeyString(),
        publicKey: address.getAddressString()
    }

    res.send({success:true,data:KeyPair})
    }catch(error)
    {
        console.log(error);
        
        res.send(
            {
                success:false,
                data:{
                    error: ""+error
                    }
            })
    }

}
async function tokenize(req,res){
    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork().rinkeby));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let privateKey = req.body.privateKey;
    let account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    let name = req.body.name //"Asset";
    let symbol = req.body.symbol // "AST";
    let supply = req.body.supply //100;
    let owner = req.body.owner;
    // let estimateGas = await System.methods.createToken(name,symbol,supply,owner).estimateGas(); // ()
    // console.log(estimateGas);
    System.methods.createToken(name,symbol,supply,owner).send({from: web3.eth.defaultAccount,gas:100000})
    .then(tx =>{
        console.log(tx)
        res.send(
                    {
                        success:true,
                        data:{
                            tx
                            
                        }
                    })
    }).catch(error =>{
        console.log(eror)
        res.send(
                    {
                        success:false,
                        data:{
                            error: ""+error
                            
                        }
                    })
    })

}
async function setDocument(req,res){
    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork().rinkeby));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let privateKey = req.body.privateKey;
    let account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    let name = req.body.docName //"Asset";
    let url = req.body.docURL // "AST";
    let hash = req.body.docHash //100;
    let symbol = req.body.tokenSymbol;
    // let estimateGas = await System.methods.setDocument(web3.utils.fromUtf8(name),url,web3.utils.fromUtf8(hash),symbol).estimateGas(); // ()
    // console.log(estimateGas);
    System.methods.setDocument(web3.utils.fromUtf8(name),url,web3.utils.fromUtf8(hash),symbol).send({from: web3.eth.defaultAccount,gas:100000})
    .then(tx =>{
        console.log(tx)
        res.send(
                    {
                        success:true,
                        data:{
                            tx
                            
                        }
                    })
    }).catch(error =>{
        console.log(eror)
        res.send(
                    {
                        success:false,
                        data:{
                            error: ""+error
                            
                        }
                    })
    })
}
async function getDocument(req,res){
    try{
    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork().rinkeby));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let name = req.body.docName // MyDoc .. lenght restriction >= 5
    let symbol = req.body.tokenSymbol;
    let privateKey = req.body.privateKey;
    
    let account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr); 
  // let estimateGas = await assetContract.methods.getDocument(web3.utils.fromUtf8(name)).estimateGas();
   let document = await assetContract.methods.getDocument(web3.utils.fromUtf8(name)).call() //.send({from: web3.eth.defaultAccount,gas:estimateGas})
    
        res.send(
                    {
                        success:true,
                        data:{
                            url:document[0],
                            hash:web3.utils.toUtf8(document[1])
                            
                        }
                    })
    }catch(error){
        console.log(error)
        res.send(
                    {
                        success:false,
                        data:{
                            error: ""+error
                            
                        }
                    })
    }
}

async function transfer(req,res){
    try{
    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork().rinkeby));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let to = req.body.to 
    let amount = req.body.amount
    let symbol = req.body.tokenSymbol;
    let privateKey = req.body.privateKey;
    
    let account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr); 
   let estimateGas = await assetContract.methods.transfer(to,amount).estimateGas();
   let tx = await assetContract.methods.transfer(to,amount).send({from: web3.eth.defaultAccount,gas:estimateGas})
    
        res.send(
                    {
                        success:true,
                        data:{
                            tx
                            
                        }
                    })
    }catch(error){
        console.log(error)
        res.send(
                    {
                        success:false,
                        data:{
                            error: ""+error
                            
                        }
                    })
    }
}

async function getBalance(req,res){
    try{
    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork().rinkeby));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let address = req.body.address
    let symbol = req.body.tokenSymbol;
    

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr); 
  // let estimateGas = await assetContract.methods.getDocument(web3.utils.fromUtf8(name)).estimateGas();
   let balance = await assetContract.methods.balanceOf(address).call() //.send({from: web3.eth.defaultAccount,gas:estimateGas})
    
        res.send(
                    {
                        success:true,
                        data:{
                            balance: balance +" "+symbol
                            
                        }
                    })
    }catch(error){
        console.log(error)
        res.send(
                    {
                        success:false,
                        data:{
                            error: ""+error
                            
                        }
                    })
    }
}
async function getAllowance(req,res){
    try{
    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork().rinkeby));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let owner = req.body.owner
    let spender = req.body.spender
    let symbol = req.body.tokenSymbol;
    

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr); 
  // let estimateGas = await assetContract.methods.getDocument(web3.utils.fromUtf8(name)).estimateGas();
   let allowance = await assetContract.methods.allowance(owner,spender).call() //.send({from: web3.eth.defaultAccount,gas:estimateGas})
    
        res.send(
                    {
                        success:true,
                        data:{
                            allowance: allowance +" "+symbol
                            
                        }
                    })
    }catch(error){
        console.log(error)
        res.send(
                    {
                        success:false,
                        data:{
                            error: ""+error
                            
                        }
                    })
    }
}

async function approve(req,res){
    try{
    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork().rinkeby));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let spender = req.body.spender 
    let amount = req.body.amount
    let symbol = req.body.tokenSymbol;
    let privateKey = req.body.privateKey;
    
    let account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr); 

   let estimateGas = await assetContract.methods.approve(spender,amount).estimateGas();
   let tx = await assetContract.methods.approve(spender,amount).send({from: web3.eth.defaultAccount,gas:estimateGas})
    
        res.send(
                    {
                        success:true,
                        data:{
                            tx
                            
                        }
                    })
    }catch(error){
        console.log(error)
        res.send(
                    {
                        success:false,
                        data:{
                            error: ""+error
                            
                        }
                    })
    }
}
async function transferFrom(req,res){
    try{
    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork().rinkeby));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let from = req.body.from
    let to = req.body.to 
    let amount = req.body.amount
    let symbol = req.body.tokenSymbol;
    let privateKey = req.body.privateKey;
    
    let account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr); 

   let estimateGas = await assetContract.methods.transferFrom(from,to,amount).estimateGas();
   let tx = await assetContract.methods.transferFrom(from,to,amount).send({from: web3.eth.defaultAccount,gas:estimateGas})
    
        res.send(
                    {
                        success:true,
                        data:{
                            tx
                            
                        }
                    }
                )
    }catch(error){
        console.log(error)
        res.send(
                    {
                        success:false,
                        data:{
                            error: ""+error
                            
                            }
                            
                        
                    })
    }
}

async function getTotalSupply(req,res){
    try{
    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork().rinkeby));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let symbol = req.body.tokenSymbol;
    

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr);

   let supply = await assetContract.methods.totalSupply().call() 

        res.send(
                    {
                        success:true,
                        data:{
                            totalSupply: supply +" "+symbol
                            
                        }
                    })
    }catch(error){
        console.log(error)
        res.send(
                    {
                        success:false,
                        data:{
                            error
                            
                        }
                    })
    }
}

async function getName(req,res){
    try{
    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork().rinkeby));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let symbol = req.body.tokenSymbol;
    

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr);

   let name = await assetContract.methods.name().call() 

        res.send(
                    {
                        success:true,
                        data:{
                            tokenName: name
                            
                        }
                    })
    }catch(error){
        console.log(error)
        res.send(
                    {
                        success:false,
                        data:{
                            error
                            
                        }
                    })
    }
}
module.exports ={
    createAccount,
    tokenize,
    setDocument,
    getDocument,
    transfer,
    getBalance,
    getAllowance,
    approve,
    transferFrom,
    getTotalSupply,
    getName
}