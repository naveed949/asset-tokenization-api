const wallet = require("ethereumjs-wallet");
const Web3 = require('web3');
const validator = require('../utils/validator');

const ethUtils = require("../utils/eth");
/**
 * In case you want to switch these APIs from rinkeby to mainnet
 *  1. change NETWORK = mainnet
 *  2. add mainnet.System contract address in ethUtils.getContracts()
 */
const NETWORK = "rinkeby";

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
    if(! validator.applyValidations(req,res,4)){
        return;
    }

    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork()[NETWORK]));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let privateKey = req.body.privateKey;
    if(privateKey.indexOf('0x') == -1)
        privateKey = '0x'+privateKey
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    let name = req.body.name 
    let symbol = req.body.symbol 
    let supply = req.body.supply 
    System.methods.tokenize(name,symbol,supply).send({from: web3.eth.defaultAccount,gas:5000000})
    .then(tx =>{
        console.log(tx)
        web3.eth.accounts.wallet.clear();
        res.send(
                    {
                        success:true,
                        data:{
                            tx
                            
                        }
                    })
    }).catch(error =>{
        console.log(error)
       // web3.eth.accounts.wallet.clear();
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

    if(! validator.applyValidations(req,res,5)){
        return;
    }

    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork()[NETWORK]));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let privateKey = req.body.privateKey;
    if(privateKey.indexOf('0x') == -1)
    privateKey = '0x'+privateKey
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    let name = req.body.docName 
    let url = req.body.docURL 
    let hash = req.body.docHash 
    let symbol = req.body.tokenSymbol;

    System.methods.setDocument(web3.utils.fromUtf8(name),url,web3.utils.fromUtf8(hash),symbol).send({from: web3.eth.defaultAccount,gas:1000000})
    .then(tx =>{
        console.log(tx)
        web3.eth.accounts.wallet.clear();
        res.send(
                    {
                        success:true,
                        data:{
                            tx
                            
                        }
                    })
    }).catch(error =>{
        console.log(error)
       //  web3.eth.accounts.wallet.clear();
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

        if(! validator.applyValidations(req,res,2)){
            return;
        }

    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork()[NETWORK]));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let name = req.body.docName 
    let symbol = req.body.tokenSymbol;

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   if(assetAddr == '0x0000000000000000000000000000000000000000')
   throw(symbol+" contract isn't found");
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr); 

   let document = await assetContract.methods.getDocument(web3.utils.fromUtf8(name)).call() 
    
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

        if(! validator.applyValidations(req,res,4)){
            return;
        }

    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork()[NETWORK]));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let to = req.body.to 
    let amount = req.body.amount
    let symbol = req.body.tokenSymbol;
    let privateKey = req.body.privateKey;
    
    if(privateKey.indexOf('0x') == -1)
    privateKey = '0x'+privateKey
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   if(assetAddr == '0x0000000000000000000000000000000000000000')
   throw(symbol+" contract isn't found");
   
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr); 
//   let estimateGas = await assetContract.methods.transfer(to,amount).estimateGas();
   let tx = await assetContract.methods.transfer(to,amount).send({from: web3.eth.defaultAccount,gas:1000000})
   web3.eth.accounts.wallet.clear();
        res.send(
                    {
                        success:true,
                        data:{
                            tx
                            
                        }
                    })
    }catch(error){
        console.log(error)
        // web3.eth.accounts.wallet.clear();
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
    let symbol;
    try{
        if(! validator.applyValidations(req,res,2)){
            return;
        }

    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork()[NETWORK]));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let address = req.body.address
        symbol = req.body.tokenSymbol;
    

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   if(assetAddr == '0x0000000000000000000000000000000000000000')
   throw(symbol+" contract isn't found");
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr); 

   let balance = await assetContract.methods.balanceOf(address).call()
    
        res.send(
                    {
                        success:true,
                        data:{
                            balance: balance +" "+symbol
                            
                        }
                    })
    }catch(error){
        console.log(error)
        if(error.message.indexOf('did it run Out of Gas?' != -1)){
            res.send(
                {
                    success:true,
                    data:{
                        balance: "0 "+symbol
                        
                    }
                }) 
        }else{
            res.send(
                    {
                        success:false,
                        data:{
                            error: ""+error
                            
                        }
                    })
        }
        
        
    }
}
async function getAllowance(req,res){
    try{

        if(! validator.applyValidations(req,res,3)){
            return;
        }

    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork()[NETWORK]));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let owner = req.body.owner
    let spender = req.body.spender
    let symbol = req.body.tokenSymbol;
    

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   if(assetAddr == '0x0000000000000000000000000000000000000000')
   throw(symbol+" contract isn't found");
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr); 

   let allowance = await assetContract.methods.allowance(owner,spender).call() 
    
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

        if(! validator.applyValidations(req,res,4)){
            return;
        }

    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork()[NETWORK]));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let spender = req.body.spender 
    let amount = req.body.amount
    let symbol = req.body.tokenSymbol;
    let privateKey = req.body.privateKey;
    
    if(privateKey.indexOf('0x') == -1)
    privateKey = '0x'+privateKey
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   if(assetAddr == '0x0000000000000000000000000000000000000000')
   throw(symbol+" contract isn't found");
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi
   let assetContract = new web3.eth.Contract(assetAbi,assetAddr); 

 //  let estimateGas = await assetContract.methods.approve(spender,amount).estimateGas();
   let tx = await assetContract.methods.approve(spender,amount).send({from: web3.eth.defaultAccount,gas:1000000})
   web3.eth.accounts.wallet.clear();
        res.send(
                    {
                        success:true,
                        data:{
                            tx
                            
                        }
                    })
    }catch(error){
        console.log(error)
      //  web3.eth.accounts.wallet.clear();
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

        if(! validator.applyValidations(req,res,5)){
            return;
        }

    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork()[NETWORK]));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let from = req.body.from
    let to = req.body.to 
    let amount = req.body.amount
    let symbol = req.body.tokenSymbol;
    let privateKey = req.body.privateKey;
    
    if(privateKey.indexOf('0x') == -1)
    privateKey = '0x'+privateKey
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   if(assetAddr == '0x0000000000000000000000000000000000000000')
   throw(symbol+" contract isn't found");
   let assetAbi = ethUtils.getContracts().rinkeby.AssetTokenization.abi

   let assetContract = new web3.eth.Contract(assetAbi,assetAddr); 

 //  let estimateGas = await assetContract.methods.transferFrom(from,to,amount).estimateGas();
   let tx = await assetContract.methods.transferFrom(from,to,amount).send({from: web3.eth.defaultAccount,gas:1000000})
   web3.eth.accounts.wallet.clear();
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
        // web3.eth.accounts.wallet.clear();
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

        if(! validator.applyValidations(req,res,1)){
            return;
        }

    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork()[NETWORK]));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let symbol = req.body.tokenSymbol;
    

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   if(assetAddr == '0x0000000000000000000000000000000000000000')
   throw(symbol+" contract isn't found");
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

        if(! validator.applyValidations(req,res,1)){
            return;
        }

    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork()[NETWORK]));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let symbol = req.body.tokenSymbol;
    

   let assetAddr = await System.methods.getTokenContract(symbol).call();
   if(assetAddr == '0x0000000000000000000000000000000000000000')
   throw(symbol+" contract isn't found");
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

async function issueTokens(req,res){

    if(! validator.applyValidations(req,res,3)){
        return;
    }

    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork()[NETWORK]));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let privateKey = req.body.privateKey;
    if(privateKey.indexOf('0x') == -1)
    privateKey = '0x'+privateKey
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    let owner = req.body.owner
    let symbol = req.body.symbol;

    System.methods.issueTokens(symbol,owner).send({from: web3.eth.defaultAccount,gas:2000000})
    .then(tx =>{
        console.log(tx)
        web3.eth.accounts.wallet.clear();
        res.send(
                    {
                        success:true,
                        data:{
                            tx
                            
                        }
                    })
    }).catch(error =>{
        console.log(error)
       //  web3.eth.accounts.wallet.clear();
        res.send(
                    {
                        success:false,
                        data:{
                            error: ""+error
                            
                        }
                    })
    })
}
async function isSymbolAvailable(req,res){
    try{

        if(! validator.applyValidations(req,res,1)){
            return;
        }

    let web3 = new Web3(new Web3.providers.HttpProvider(ethUtils.getEthNetwork()[NETWORK]));
    let system = ethUtils.getContracts().rinkeby.System;
    let System = new web3.eth.Contract(system.abi,system.address);

    let symbol = req.body.tokenSymbol;
    

   let assetAddr = await System.methods.tokens(symbol).call();
   if(assetAddr == '0x0000000000000000000000000000000000000000'){
       res.send(
                    {
                        success:true,
                        data:{
                            available: true
                            
                        }
                    })
   }else{
    res.send(
        {
            success:true,
            data:{
                available: false,
                message:"Symbol already exists"
                
            }
        })
   }
        
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
    getName,
    issueTokens,
    isSymbolAvailable
}