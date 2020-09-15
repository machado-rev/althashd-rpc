"use strict";
exports.__esModule = true;
var althashd_rpc_1 = require("./node_modules/althashd-rpc");
var rpc = new althashd_rpc_1["default"]('http://localhost:4889');
var balance = await rpc.getBalance();
console.log(balance);
