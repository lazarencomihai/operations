import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';

export declare const PROTOCOL_ID_PSP = '2';

export const chainNameToChainId: { [chainName: string]: number } = {
  mainnet: 1,
  ropsten: 3,
  rinkeby: 4,
  kovan: 42,
  goerli: 5,
  polygon: 137,
  polygonMumbai: 80001,
  fantom: 250,
};

export const DapiServerInterface = () => {
  const dapiServerAbi = JSON.parse(fs.readFileSync(path.resolve('./src/utils/artifacts/DapiServer.json')).toString());
  return new ethers.utils.Interface(dapiServerAbi.abi);
};

export const DapiServerContract = (dapiServerAddress: string, provider: ethers.providers.JsonRpcProvider) => {
  const dapiServerAbi = JSON.parse(fs.readFileSync(path.resolve('./src/utils/artifacts/DapiServer.json')).toString());
  return new ethers.Contract(dapiServerAddress, dapiServerAbi.abi, provider);
};
