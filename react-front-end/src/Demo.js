import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Web3 from 'web3'
import Cookies from 'universal-cookie';
import { CERTIFICATE_POOL_MANAGER_ABI, CERTIFICATE_POOL_MANAGER_ADDRESS, PUBLIC_ABI, PRIVATE_ABI } from './config'

const cookies = new Cookies();
var web3 = ""
var certificatePoolManager = ""
var publicPool = ""
var privatePool = ""
const PublicPriceWei = 10
const PrivatePriceWei = 20

var publicPoolAddress = ""
var chairPerson = ""
var balance = ""
var publicTotalProviders = ""
var publicProviders = []
var privateTotalProviders = ""
var privateProviders = []
var account = ""
var privatePoolAddresses = []
var privatePoolAddress = cookies.get('privatePool');

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
  let publicProvidersAddresses = await publicPool.methods.retrieveAllProviders().call()
  publicProviders = []

  for (let i = 0; i < publicTotalProviders; i++) {
    let publicProviderInfo = await publicPool.methods.retrieveProvider(publicProvidersAddresses[i]).call()
    publicProviders[i] = [publicProvidersAddresses[i], publicProviderInfo]
  }

  let privateTotalPool = await certificatePoolManager.methods.retrieveTotalPrivateCertificatesPool().call()
  privatePoolAddresses = []

  for (let i = 0; i < privateTotalPool; i++) {
    let privatePoolAddress = await certificatePoolManager.methods.retrievePrivateCertificatesPool(i).call()
    privatePoolAddresses[i] = privatePoolAddress
  }

}


async function SendnewProposal(address, info){
  await certificatePoolManager.methods.sendProposal(address, info).send({from: account, value: PublicPriceWei});
}

async function CreatenewPrivatePool(min, list){
  await certificatePoolManager.methods.createPrivateCertificatesPool(list, min).send({from: account, value: PrivatePriceWei});
}

async function ValidateProposal(address){
  await publicPool.methods.validateProvider(address).send({from: account});
}

async function RemoveProvider(address){
  await publicPool.methods.removeProvider(address).send({from: account});
}

async function AddPrivateProvider(address, Info){
  await privatePool.methods.addProvider(address, Info).send({from: account});
}

async function RemovePrivateProvider(address){
  await privatePool.methods.removeProvider(address).send({from: account});
}

async function SelectPrivatePool(address){
  privatePoolAddress = address
  privatePool = new web3.eth.Contract(PRIVATE_ABI, address)
  privateTotalProviders = await privatePool.methods.retrieveTotalProviders().call()
  let privateProvidersAddresses = await privatePool.methods.retrieveAllProviders().call()
  privateProviders = []

  for (let i = 0; i < privateTotalProviders; i++) {
    let privateProviderInfo = await privatePool.methods.retrieveProvider(privateProvidersAddresses[i]).call()
    privateProviders[i] = [privateProvidersAddresses[i], privateProviderInfo]
  }
}


class Manager extends React.Component {
  componentWillMount() {
    LoadBlockchain()
 }
  state = {
    newProvider : "",
    newProviderInfo : "",
    minOwners : 0,
    listOfOwners : []
  };
  handleNewProposal = async (event) => {
  	event.preventDefault();
    await SendnewProposal(this.state.newProvider, this.state.newProviderInfo)
    this.setState({ newProvider: "" })
    this.setState({ newProviderInfo: "" })
  };
  handleNewPrivatePool = async (event) => {
  	event.preventDefault();
    await CreatenewPrivatePool(this.state.minOwners, this.state.listOfOwners)
    this.setState({ minOwners: 0 })
    this.setState({ listOfOwners: [] })
  };

  render(){
    return (
      <div>
        <h3>Current Address : {account}</h3>
        <br />
        <br />
        <p><b>Manager address :</b> {CERTIFICATE_POOL_MANAGER_ADDRESS}</p>
        <p><b>Public Address :</b> {publicPoolAddress}</p>
        <p><b>Chair Person :</b> {chairPerson}</p>
        <p><b>Balance :</b> {balance}</p>
        <br />
        <form onSubmit={this.handleNewProposal}>
            <input type="text" name="newProvider" placeholder="address" 
                value={this.state.newProvider}
                onChange={event => this.setState({ newProvider: event.target.value })}/>
              <input type="text" name="newProviderInfo" placeholder="Info" 
                value={this.state.newProviderInfo}
                onChange={event => this.setState({ newProviderInfo: event.target.value })}/>
            <button>Send Proposal for Public Provider</button>
        </form>
        <br />
        <p><b>Private Pool Addresses :</b>
          <ol>
            {privatePoolAddresses.map(privatePoolAddress => (
            <li key={privatePoolAddress[1]}><i>creator</i> {privatePoolAddress[0]} :  
                                            <i> address</i> {privatePoolAddress[1]}</li>
            ))}
          </ol>
        </p>
        <br/>
        <form onSubmit={this.handleNewPrivatePool}>
            <input type="integer" name="minOwners" placeholder="min Owners" 
                value={this.state.minOwners}
                onChange={event => this.setState({ minOwners: event.target.value })}/>
              <input type="text" name="listOfOwners" placeholder="list Of Owners" 
                value={this.state.listOfOwners}
                onChange={event => this.setState({ listOfOwners: event.target.value.split(",") })}/>
            <button>Request New Private Pool</button>
        </form>
        <br />
      </div>
    );
  }
}

class Public extends React.Component {
  componentWillMount() {
    LoadBlockchain()
 }
  state = {
    validateProvider : "",
    removeProvider : ""
  };
  handleValidateProvider = async (event) => {
  	event.preventDefault();
    await ValidateProposal(this.state.validateProvider)
    this.setState({ validateProvider: "" })
  };
  handleRemoveProvider = async (event) => {
  	event.preventDefault();
    await RemoveProvider(this.state.removeProvider)
    this.setState({ removeProvider: "" })
  };

  render(){
    return (
      <div>
        <h3>Current Address : {account}</h3>
        <br />
        <br />
        <p><b>Total Public Providers :</b> {publicTotalProviders}</p>
        <p><b>Public Providers :</b>
          <ol>
            {publicProviders.map(publicProvider => (
            <li key={publicProvider[0]}>{publicProvider[0]} : {publicProvider[1]}</li>
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
      </div>
    );
  }
}

class Private extends React.Component {
  componentWillMount() {
    LoadBlockchain();
    if(privatePoolAddress != null){
      SelectPrivatePool(privatePoolAddress);
    }
 }
  state = {
    privatePool : "",
    addProvider : "",
    addProviderInfo : "",
    removeProvider : ""
  };
  handleSelectPool = async (event) => {
  	event.preventDefault();
    cookies.set('privatePool', this.state.privatePool, { path: '/' });
    privatePoolAddress = this.state.privatePool
    await SelectPrivatePool(privatePoolAddress);
    this.setState({ privatePool: "" })
  };
  handleAddProvider = async (event) => {
  	event.preventDefault();
    await AddPrivateProvider(this.state.addProvider, this.state.addProviderInfo)
    this.setState({ addProviderInfo: "" })
    this.setState({ addProvider: "" })
  };
  handleRemoveProvider = async (event) => {
  	event.preventDefault();
    await RemovePrivateProvider(this.state.removeProvider)
    this.setState({ removeProvider: "" })
  };

  render(){
    return (
      <div>
        <h3>Current Address : {account}</h3>
        <br />
        <br />
        <form onSubmit={this.handleSelectPool}>
            <input type="text" name="SelectPool" placeholder="address" 
                value={this.state.privatePool}
                onChange={event => this.setState({ privatePool: event.target.value })}/>
            <button>Select Pool</button>
        </form>
        <br />
        <h4> Selected Private Pool : {privatePoolAddress}</h4>
        <br />
        <p><b>Total Private Providers :</b> {privateTotalProviders}</p>
        <p><b>Private Providers :</b>
          <ol>
            {privateProviders.map(privateProvider => (
            <li key={privateProvider[0]}>{privateProvider[0]} : {privateProvider[1]}</li>
            ))}
          </ol>
        </p>
        <br/>
        <form onSubmit={this.handleAddProvider}>
            <input type="text" name="addProvider" placeholder="address" 
                value={this.state.addProvider}
                onChange={event => this.setState({ addProvider: event.target.value })}/>
            <input type="text" name="addProviderInfo" placeholder="Info" 
                value={this.state.addProviderInfo}
                onChange={event => this.setState({ addProviderInfo: event.target.value })}/>
            <button>Add Provider</button>
        </form>
        <br/>
        <form onSubmit={this.handleRemoveProvider}>
            <input type="text" name="RemoveProvider" placeholder="address" 
                value={this.state.removeProvider}
                onChange={event => this.setState({ removeProvider: event.target.value })}/>
            <button>Remove Provider</button>
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


class Demo extends React.Component {

  componentWillMount() {
     LoadBlockchain()
  }

  state = {
    value : 0
  };

  render(){
    //LoadBlockchain();
  
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
          <Private />
        </TabPanel>
      </div>
    );
  }
  
}

export default Demo;
