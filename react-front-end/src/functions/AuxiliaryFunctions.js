// auxiliary
import Web3 from 'web3';

export var account = "";
export var web3 = "";

export function setAccount(_value){
  account = _value;
}

export async function LoadWeb3(){
  if(window.ethereum) {
    await window.ethereum.enable();
  }
  web3 = new Web3(window.ethereum)
}

export async function CallBackFrame(callback){
    try{
      await callback;
     }
     catch(e) { window.alert(e); }
}
  
export function Bytes32ToAddress(bytes){
      return ("0x" + (bytes.toString()).substring(26));
}

export async function RetrievePendings(callback){
    let{0:addr,1:info} = await callback;
    var output = [];
  
    for (let i = 0; i < addr.length; i++) {
      output[i] = [addr[i], info[i]]
    }
  
    return output;
}
