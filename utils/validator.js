var web3 = require('web3');
var url = require('is-url');
const Web3 = require('web3');
var response = {
    success: true,
    data:{
        error:'' 
    }
}
const mapping = {
        privateKey:privateKey,
        name: utf8,
        symbol:isSymbol,
        supply:amount,
        owner:publicKey, 
        docName:utf8,
        docURL:isURL,
        docHash:isNULL,
        tokenSymbol: isSymbol,
        to: publicKey,
        amount: amount,
        address: publicKey,
        spender: publicKey,
        from: publicKey
}

function applyValidations(req,res,count){
    let flag = false;
    if(paramsCount(req,res,count)){
    
    let keys = Object.keys(req.body);
    for(var i=0; i < keys.length; i++){
        flag = false;

        if(isValidParameter(keys[i],res))
        flag = mapping[keys[i]](req.body[keys[i]],keys[i],res);

        if(!flag){
            flag = false;
            break;
        }
    }
}
        return flag;

}

function paramsCount(req,res,count){
    let length = Object.keys(req.body).length;
    if(length == count){
        return true;
    }else{
        response.success = false;
        response.data.error = "expecting parameters "+count+", got "+length
        res.send(
            response
        )
    }
}

function publicKey(pk,param, res){
    let check = web3.utils.isAddress(pk);
    if(check){
        return true;
    }else{
        response.success = false;
        response.data.error = param+" is invalid"
        res.send(
            response
        )
    }
}
function privateKey(pk,param, res){
    try{
        if(pk.indexOf('0x') == -1)
            pk = '0x'+pk
    let web3 = new Web3();
    web3.eth.accounts.privateKeyToAccount(pk);
    
        return true;

    }catch(err){
        response.success = false;
        response.data.error = param+" is invalid"
        res.send(
            response
        )
    }
}
function utf8(value,param,res){
    try{
        if(value.length < 1)
            throw "error";
        web3.utils.fromUtf8(value)
        return true;
    }catch(e){
        response.success = false;
        response.data.error = param+" is invalid"
        res.send(
            response
        )
    }
}
function amount(value,param,res){

    if(!isNaN(value) && parseInt(value) > 0){
        return true;
    }else{
        response.success = false;
        response.data.error = param+" is invalid or can't be equal to 0"
        res.send(
            response
        ) 
    }
}

function isSymbol(value,param,res){
    String.prototype.isUpperCase = function() {
        return this.valueOf().toUpperCase() === this.valueOf();
    };

    if(value.length !=0 && value.isUpperCase()){
        return true;
    }else{
        response.success = false;
        response.data.error = "symbol is invalid or should be in upper-case"
        res.send(
            response
        ) 
    }
}
function isURL(URL,param,res){
    if(url(URL)){
        return true;
    }else{
        response.success = false;
        response.data.error = "URL is invalid"
        res.send(
            response
        ) 
    }
}

function isNULL(value,param,res){
    if(value.length != 0){
        return true;
    }else{
        response.success = false;
        response.data.error = param+"can't be null"
        res.send(
            response
        ) 
    }
}
function isValidParameter(key,res){
    if( mapping[key]){
        return true;
    }else{
        response.success = false;
        response.data.error = `${key}`+" is unknown parameter,please refer to API documentation"
        res.send(
            response
        )
    }
}
module.exports ={
    applyValidations
}