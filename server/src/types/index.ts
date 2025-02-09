export interface MintResponse {
  data: {
    response: {
      contract: {
        fungible: {
          address: string;
          symbol: string;
        };
      };
    };
  };
}
