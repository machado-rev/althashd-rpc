import AlthashRpc from 'althashd-rpc';

const rpc = new AlthashRpc('http://localhost:4889');

const balance = await rpc.getBalance();
console.log(balance);
