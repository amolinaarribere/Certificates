import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Web3 from 'web3'
import { CERTIFICATE_POOL_MANAGER_ABI, CERTIFICATE_POOL_MANAGER_ADDRESS, PUBLIC_ABI } from './config'


var web3 = ""
var certificatePoolManager = ""
var publicPool = ""
const PublicPriceWei = 10

var publicPoolAddress = ""
var chairPerson = ""
var balance = ""
var publicTotalProviders = ""
var publicProviders = ""
var account = ""

async function LoadBlockchain() {
  if(window.ethereum) {
    await window.ethereum.enable();
  }
  web3 = new Web3(window.ethereum)
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  account = accounts[0];
  certificatePoolManager = new web3.eth.Contract(CERTIFICATE_POOL_MANAGER_ABI, CERTIFICATE_POOL_MANAGER_ADDRESS)
  const config = await certificatePoolManager.methods.retrieveConfiguration().call()
  publicPoolAddress = config[0]
  chairPerson = config[1]
  balance = config[2]
  publicPool = new web3.eth.Contract(PUBLIC_ABI, publicPoolAddress)
  publicTotalProviders = await publicPool.methods.retrieveTotalProviders().call()
  publicProviders = await publicPool.methods.retrieveAllProviders().call()


  console.log("main address " + CERTIFICATE_POOL_MANAGER_ADDRESS)
  console.log("public address " + publicPoolAddress)
  console.log("chairPerson " + chairPerson)
  console.log("balance " + balance)
  console.log("accounts " + accounts.length)
  console.log("first account " + account)
}


async function SendnewProposal(address, info){
  await certificatePoolManager.methods.sendProposal(address, info).send({from: account, value: PublicPriceWei});
}

async function ValidateProposal(address){
  await publicPool.methods.validateProvider(address).send({from: account});
}

async function RemoveProvider(address){
  await publicPool.methods.removeProvider(address).send({from: account});
}

async function DisplayProvider(address) {
  return await publicPool.methods.retrieveProvider(address).call();
}


class Manager extends React.Component {
  state = {
    newProvider : "",
    newProviderInfo : ""
  };
  handleNewProposal = (event) => {
  	event.preventDefault();
    SendnewProposal(this.state.newProvider, this.state.newProviderInfo)
  };

  render(){
    return (
      <div>
        <h3>Current Address : {account}</h3>
        <br />
        <br />
        <p>main address : {CERTIFICATE_POOL_MANAGER_ADDRESS}</p>
        <p>Public Address : {publicPoolAddress}</p>
        <p>Chair Person : {chairPerson}</p>
        <p>Balance : {balance}</p>
        <br />
        <form onSubmit={this.handleNewProposal}>
            <input type="text" name="newProvider" placeholder="address" 
                value={this.state.newProvider}
                onChange={event => this.setState({ newProvider: event.target.value })}/>
              <input type="text" name="newProviderInfo" placeholder="Info" 
                value={this.state.newProviderInfo}
                onChange={event => this.setState({ newProviderInfo: event.target.value })}/>
            <button>Send Proposal</button>
        </form>
      </div>
    );
  }
}

class Public extends React.Component {

  state = {
    validateProvider : "",
    removeProvider : "",
    displayedProvider : ""
  };
  handleValidateProvider = (event) => {
  	event.preventDefault();
    ValidateProposal(this.state.validateProvider)
  };
  handleRemoveProvider = (event) => {
  	event.preventDefault();
    RemoveProvider(this.state.removeProvider)
  };
  handleDisplayProvider = (event) => {
  	event.preventDefault();
    return (DisplayProvider(this.state.displayedProvider))
  };

  render(){
    return (
      <div>
        <h3>Current Address : {account}</h3>
        <br />
        <br />
        <p>Total Public Providers : {publicTotalProviders}</p>
        <p>Public Providers : 
          <ol>
            {publicProviders.map(publicProvider => (
            <li key={publicProvider}>{publicProvider}</li>
            ))}
          </ol>
        </p>
        <br/>
        <form onSubmit={this.handleValidateProvider}>
            <input type="text" name="validateProvider" placeholder="address" 
                value={this.state.validateProvider}
                onChange={event => this.setState({ validateProvider: event.target.value })}/>
            <button>Validate Provider</button>
        </form>
        <br/>
        <form onSubmit={this.handleRemoveProvider}>
            <input type="text" name="RemoveProvider" placeholder="address" 
                value={this.state.removeProvider}
                onChange={event => this.setState({ removeProvider: event.target.value })}/>
            <button>Remove Provider</button>
        </form>
        <br/>
        <form onSubmit={this.handleDisplayProvider}>
            <input type="text" name="DisplayProvider" placeholder="address" 
                value={this.state.displayedProvider}
                onChange={event => this.setState({ displayedProvider: event.target.value })}/>
            <button>Display Provider</button>
        </form>
      </div>
    );
  }
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

class Demo extends React.Component {
  state = {
    value : 0
  };

  render(){
    LoadBlockchain();
  
    const handleChange = (event, newValue) => {
      this.setState({value: newValue});
    };
  
    return (
      <div>
        <AppBar position="static">
          <Tabs value={this.state.value} onChange={handleChange} aria-label="simple tabs example">
            <Tab label="Manager" {...a11yProps(0)} />
            <Tab label="Public" {...a11yProps(1)} />
            <Tab label="Private" {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        <TabPanel value={this.state.value} index={0}>
          <Manager />
        </TabPanel>
        <TabPanel value={this.state.value} index={1}>
          <Public />
        </TabPanel>
        <TabPanel value={this.state.value} index={2}>
          Private
        </TabPanel>
      </div>
    );
  }
  
}

export default Demo;
