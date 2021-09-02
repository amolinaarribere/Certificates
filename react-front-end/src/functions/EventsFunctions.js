
const Aux = require("./AuxiliaryFunctions.js");

export var eventlogs = [];


export async function GetEvents(contractAddresses){
    let options = {
        fromBlock: 0,
        address: contractAddresses,    //Only get events from specific addresses
        topics: []                              //What topics to subscribe to
    };

    let subscription = Aux.web3.eth.subscribe('logs', options)

    subscription.on('data', event => eventlogs[eventlogs.length] = event)
    subscription.on('changed', changed => window.alert("event removed from blockchain : " + changed))
    subscription.on('error', err => window.alert("event error : " + err))
    subscription.on('connected', nr => window.alert("event connected : " + nr))
}