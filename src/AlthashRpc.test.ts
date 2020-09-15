import { jsonRpcCmd } from './json-rpc';
import AlthashRpc from './AlthashRpc';

jest.mock('delay');

jest.mock('./json-rpc', () => ({
  jsonRpcCmd: jest.fn(),
}));

describe('althashd-rpc', () => {
  const rpc = new AlthashRpc('https://localhost:4889');

  // When there's not enough funds there's no reason to retry
  it('should not retry insufficient funds', () => {
    expect.assertions(5);

    (jsonRpcCmd as jest.Mock).mockImplementationOnce(async (url: string, method: string, params: any) => {
      expect(method).toBe('sendtoaddress');
      expect(params).toEqual(['Hu3K6PrHHfT3dsnrKQXdMTzjYriqiBZsgE', '1.2']);

      throw new Error('Insufficient funds');
    });

    return rpc.sendToAddress('Hu3K6PrHHfT3dsnrKQXdMTzjYriqiBZsgE', '1.2').catch((error) => {
      const { althashRpc } = error.data;
      expect(althashRpc.methodIsPure).toBe(false);
      expect(althashRpc.attempts).toBe(1);
      expect(error.executed).toBe(false);
    });
  });

  it('should retry getRawMempool', () => {
    expect.assertions(3);

    (jsonRpcCmd as jest.Mock)
      .mockImplementationOnce(async (url: string, method: string, params: any) => {
        expect(method).toBe('getrawmempool');

        throw new Error();
      })
      .mockImplementationOnce(async (url: string, method: string, params: any) => {
        expect(method).toBe('getrawmempool');

        return ['one', 'two'];
      });

    return rpc.getRawMempool().then((result) => {
      expect(result).toEqual(['one', 'two']);
    });
  });

  it('should retry send on ECONNREFUSED', () => {
    expect.assertions(5);

    (jsonRpcCmd as jest.Mock)
      .mockImplementationOnce(async (url: string, method: string, params: any) => {
        expect(method).toBe('sendtoaddress');
        expect(params).toEqual(['Hu3K6PrHHfT3dsnrKQXdMTzjYriqiBZsgE', '1.2']);

        throw new Error('ECONNREFUSED');
      })
      .mockImplementationOnce(async (url: string, method: string, params: any) => {
        expect(method).toBe('sendtoaddress');
        expect(params).toEqual(['Hu3K6PrHHfT3dsnrKQXdMTzjYriqiBZsgE', '1.2']);

        return 'hash';
      });

    return rpc.sendToAddress('Hu3K6PrHHfT3dsnrKQXdMTzjYriqiBZsgE', '1.2').then((result) => {
      expect(result).toEqual('hash');
    });
  });

  it('throw if getBalance returns an object', () => {
    // expect.assertions(5);

    (jsonRpcCmd as jest.Mock).mockImplementationOnce(async (url: string, method: string, params: any) => {
      expect(url).toBe('https://localhost:4889');
      expect(method).toBe('getbalance');
      expect(params).toEqual([]);

      return { balance: 1 };
    });

    return rpc.getBalance().catch((error) => {
      expect(error.executed).toBe(true);
    });
  });

  describe('sendToAddress', () => {
    it('should fall back to defaults', async () => {
      (jsonRpcCmd as jest.Mock)
        .mockImplementationOnce(async (url: string, method: string, params: any) => {
          expect(url).toBe('https://localhost:4889');
          expect(method).toBe('sendtoaddress');
          expect(params).toEqual(['Hu3K6PrHHfT3dsnrKQXdMTzjYriqiBZsgE', '1.01', '', '', false, true]);

          return 'hash';
        })
        .mockImplementationOnce(async (url: string, method: string, params: any) => {
          expect(url).toBe('https://localhost');
          expect(method).toBe('sendtoaddress');
          expect(params).toEqual(['Hu3K6PrHHfT3dsnrKQXdMTzjYriqiBZsgE', '1.01', 'something', 'someone']);

          return 'hash';
        })
        .mockImplementationOnce(async (url: string, method: string, params: any) => {
          expect(url).toBe('https://localhost');
          expect(method).toBe('sendtoaddress');
          expect(params).toEqual(['Hu3K6PrHHfT3dsnrKQXdMTzjYriqiBZsgE', '1.01', '', 'someone', true, true]);

          return 'hash';
        });

      let result = await rpc.sendToAddress('Hu3K6PrHHfT3dsnrKQXdMTzjYriqiBZsgE', '1.01', undefined, undefined, undefined, true);
      expect(result).toBe('hash');
      result = await rpc.sendToAddress('Hu3K6PrHHfT3dsnrKQXdMTzjYriqiBZsgE', '1.01', 'something', 'someone');
      expect(result).toBe('hash');
      result = await rpc.sendToAddress('Hu3K6PrHHfT3dsnrKQXdMTzjYriqiBZsgE', '1.01', undefined, 'someone', true, true);
      expect(result).toBe('hash');
    });
  });
});
