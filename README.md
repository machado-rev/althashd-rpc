# althashd-rpc

Htmlcoin JSON RPC for TypeScript with Response Type Enforcement

## Installing

`npm install althashd-rpc`

## Example usage

```typescript
import AlthashRpc from 'althashd-rpc';

const rpc = new AlthashRpc('http://localhost:4889');

const balance = await rpc.getBalance();
console.log(balance);
```


## Motivation

This library provides TypeScript types for RPC commands and validates the responses
using `io-ts`. If the response does not match the schema, an error is thrown.

## Author

Andreas Brekken

Port to Htmlcoin on Althash by Leandro Machado with break changes

## License

MIT
