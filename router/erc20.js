const express = require('express');
const router = express.Router();

const erc20Controller = require('../controller/erc20');

router.get("/createAccount", erc20Controller.createAccount);
router.post("/tokenize", erc20Controller.tokenize);
router.post("/setDocument", erc20Controller.setDocument);
router.post("/getDocument",erc20Controller.getDocument);
router.post("/transfer",erc20Controller.transfer);
router.post("/balance",erc20Controller.getBalance);
router.post("/allowance",erc20Controller.getAllowance)
router.post("/approve",erc20Controller.approve);
router.post("/transferFrom",erc20Controller.transferFrom);
router.post("/getTotalSupply",erc20Controller.getTotalSupply);
router.post("/getName",erc20Controller.getName);
router.post("/issueTokens",erc20Controller.issueTokens);
router.post("/isSymbolAvailable",erc20Controller.isSymbolAvailable);
router.post("/withdraw",erc20Controller.withdraw);

module.exports = router;