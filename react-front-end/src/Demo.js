import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {SendnewProposal, CreatenewPrivatePool, ValidateProposal, AddPrivateProvider,
  RemoveProvider, AddOwner, RemoveOwner, AddCertificate, retrieveCertificatesByHolder,
  LoadBlockchain, chairPerson, balance, publicPoolAddress, privatePoolKey, privatePoolAddress,
  publicMinOwners, SelectPrivatePool, account, privatePoolAddresses, publicOwners,  pendingPublicOwnersAdd, 
  pendingPublicOwnersRemove, pendingPrivateOwnersAdd, pendingPrivateOwnersRemove, pendingPublicProvidersAdd, pendingPublicProvidersRemove,
  pendingPrivateProvidersAdd, pendingPrivateProvidersRemove, publicTotalProviders,
publicProviders, privateMinOwners, privateTotalOwners, publicTotalOwners, privateOwners, privateTotalProviders, privateProviders,currentHolder,
certificatesByHolder, web3, DisconnectBlockchain, certificateProvider, CheckCertificate, SwitchContext} from './Functions';
import {  CERTIFICATE_POOL_MANAGER_ADDRESS} from './config'

class ManagerComponent extends React.Component {
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
        <CurrentAddressComponent />
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
        <p><b>Private Pool Addresses :</b>
          <ol>
            {privatePoolAddresses.map(privatePoolAddress => (
            <li key={privatePoolAddress[1]}><i>creator</i> {privatePoolAddress[0]} :  
                                            <i> address</i> {privatePoolAddress[1]}</li>
            ))}
          </ol>
        </p>
        <br/>
      </div>
    );
  }
}

class PublicComponent extends React.Component {
  componentWillMount() {
    LoadBlockchain()
    SwitchContext()
 }
  state = {
    privateEnv : false
  };

  render(){
    return (
      <div>
        <CurrentAddressComponent />
        <br />
        <CertificateComponent privateEnv={this.state.privateEnv}/>
        <br />
        <OwnerComponent privateEnv={this.state.privateEnv}/>
        <br/>
        <ProviderComponent privateEnv={this.state.privateEnv}/>
      </div>
    );
  }
}

class PrivateComponent extends React.Component {
  componentWillMount() {
    LoadBlockchain()
    SwitchContext()
    if(privatePoolAddress != null && privatePoolAddress !== "" && privatePoolAddress !== "undefined"){
      SelectPrivatePool(privatePoolAddress);
    }
 }
  state = {
    privatePool : "",
    privateEnv : true
  };

  handleSelectPool = async (event) => {
  	event.preventDefault();
    sessionStorage.setItem(privatePoolKey, this.state.privatePool, { path: '/' });
    await SelectPrivatePool(this.state.privatePool);
    this.setState({ privatePool: "" })
  };
  
  render(){
    return (
      <div>
        <CurrentAddressComponent />
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
        <CertificateComponent privateEnv={this.state.privateEnv}/>
        <br />
        <OwnerComponent privateEnv={this.state.privateEnv}/>
        <br/>
        <ProviderComponent privateEnv={this.state.privateEnv}/>
      </div>
    );
  }
}

class CurrentAddressComponent extends React.Component{
  render(){
    return(
      <div>
        <h3>Current Address : {account}</h3>
        <br />
      </div>
    );
  }
}

class ProviderComponent extends React.Component{
  render(){
    return(
      <div>
        <h4 class="text-primary">Providers</h4>
        <br />
        <AddProviderComponent privateEnv={this.props.privateEnv}/>
        <br />
        <RemoveProviderComponent privateEnv={this.props.privateEnv}/>
        <br/>
        <ListProvidersComponent privateEnv={this.props.privateEnv} />
        <br/>
        <ListPendingProvidersComponent privateEnv={this.props.privateEnv} />
      </div>
    );
  }
}

class AddProviderComponent extends React.Component{
  state = {
    validateProvider : "",
    addProvider : "",
    addProviderInfo : ""
  };

  handleValidateProvider = async (event) => {
  	event.preventDefault();
    await ValidateProposal(this.state.validateProvider)
    this.setState({ validateProvider: "" })
  };
  handleAddProvider = async (event) => {
  	event.preventDefault();
    await AddPrivateProvider(this.state.addProvider, this.state.addProviderInfo)
    this.setState({ addProviderInfo: "" })
    this.setState({ addProvider: "" })
  };

  render(){
    if(this.props.privateEnv){
      return(
        <div>
          <form onSubmit={this.handleAddProvider}>
            <input type="text" name="addProvider" placeholder="address" 
                value={this.state.addProvider}
                onChange={event => this.setState({ addProvider: event.target.value })}/>
            <input type="text" name="addProviderInfo" placeholder="Info" 
                value={this.state.addProviderInfo}
                onChange={event => this.setState({ addProviderInfo: event.target.value })}/>
            <button>Add Provider</button>
        </form>
        </div>
      );
    }
    else{
      return(
        <div>
          <form onSubmit={this.handleValidateProvider}>
            <input type="text" name="validateProvider" placeholder="address" 
                value={this.state.validateProvider}
                onChange={event => this.setState({ validateProvider: event.target.value })}/>
            <button>Validate Provider</button>
        </form>
        </div>
      );
    }
  }
}

class RemoveProviderComponent extends React.Component{
  state = {
    removeProvider : ""
  };
  handleRemoveProvider = async (event) => {
  	event.preventDefault();
    await RemoveProvider(this.state.removeProvider, this.props.privateEnv)
    this.setState({ removeProvider: "" })
  };

  render(){
      return(
        <div>
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

class ListProvidersComponent extends React.Component{

  render(){
    if(this.props.privateEnv){
      return(
        <div>
          <p><b>Total Private Providers :</b> {privateTotalProviders}</p>
          <p><b>Private Providers :</b>
            <ol>
              {privateProviders.map(privateProvider => (
              <li key={privateProvider[0]}>{privateProvider[0]} : {privateProvider[1]}</li>
              ))}
            </ol>
          </p>
        </div>
      );
    }
    else{
      return(
        <div>
          <p><b>Total Public Providers :</b> {publicTotalProviders}</p>
          <p><b>Public Providers :</b>
            <ol>
              {publicProviders.map(publicProvider => (
              <li key={publicProvider[0]}>{publicProvider[0]} : {publicProvider[1]}</li>
              ))}
            </ol>
          </p>
        </div>
      );
    }
  }
}

class ListPendingProvidersComponent extends React.Component{
  render(){
    if(this.props.privateEnv){
      return(
        <div>
          <p><b>Pending Private Provider to be Added :</b>
            <ol>
              {pendingPrivateProvidersAdd.map(pendingPrivateProviderAdd => (
              <li key={pendingPrivateProviderAdd}>{pendingPrivateProviderAdd}</li>
              ))}
            </ol>
          </p>
          <br />
          <p><b>Pending Private Provider to be Removed :</b>
            <ol>
              {pendingPrivateProvidersRemove.map(pendingPrivateProviderRemove => (
              <li key={pendingPrivateProviderRemove}>{pendingPrivateProviderRemove}</li>
              ))}
            </ol>
          </p>
        </div>
      );
    }
    else{
      return(
        <div>
          <p><b>Pending Public Provider to be Added :</b>
            <ol>
              {pendingPublicProvidersAdd.map(pendingPublicProviderAdd => (
              <li key={pendingPublicProviderAdd}>{pendingPublicProviderAdd}</li>
              ))}
            </ol>
          </p>
          <br />
          <p><b>Pending Public Provider to be Removed :</b>
            <ol>
              {pendingPublicProvidersRemove.map(pendingPublicProviderRemove => (
              <li key={pendingPublicProviderRemove}>{pendingPublicProviderRemove}</li>
              ))}
            </ol>
          </p>
        </div>
      );
    }
    
  }
  
}

class OwnerComponent extends React.Component{
  render(){
    return(
      <div>
        <h4 class="text-primary">Owners</h4>
        <br />
        <AddOwnerComponent privateEnv={this.props.privateEnv}/>
        <br/>
        <RemoveOwnerComponent privateEnv={this.props.privateEnv}/>
        <br />
        <ListOwnersComponent privateEnv={this.props.privateEnv}/>
        <br />
        <ListPendingOwnersComponent privateEnv={this.props.privateEnv}/>
      </div>
    );
  }
}

class AddOwnerComponent extends React.Component{
  state = {
    addOwner : ""
  };
  handleAddOwner = async (event) => {
  	event.preventDefault();
    await AddOwner(this.state.addOwner, "", this.props.privateEnv)
    this.setState({ addOwner: "" })
  };

  render(){
    return(
      <div>
        <form onSubmit={this.handleAddOwner}>
            <input type="text" name="AddOwner" placeholder="address" 
                value={this.state.addOwner}
                onChange={event => this.setState({ addOwner: event.target.value })}/>
            <button>Add Owner</button>
        </form>
      </div>
    );
}
}

class RemoveOwnerComponent extends React.Component{
  state = {
    removeOwner : ""
  };
  handleRemoveOwner = async (event) => {
  	event.preventDefault();
    await RemoveOwner(this.state.removeOwner, this.props.privateEnv)
    this.setState({ removeOwner: "" })
  };

  render(){
      return(
        <div>
          <form onSubmit={this.handleRemoveOwner}>
              <input type="text" name="RemoveOwner" placeholder="address" 
                  value={this.state.removeOwner}
                  onChange={event => this.setState({ removeOwner: event.target.value })}/>
              <button>Remove Owner</button>
          </form>
        </div>
      );
  }
}

class ListOwnersComponent extends React.Component{
  render(){
    if(this.props.privateEnv){
      return(
        <div>
          <p><b>Total Private Owners :</b> {privateTotalOwners}</p>
          <p><b>Min Private Owners :</b> {privateMinOwners}</p>
          <p><b>Private Owners :</b>
            <ol>
              {privateOwners.map(privateOwner => (
              <li key={privateOwner}>{privateOwner}</li>
              ))}
            </ol>
          </p>
        </div>
      );
    }
    else{
      return(
        <div>
          <p><b>Total Public Owners :</b> {publicTotalOwners}</p>
          <p><b>Min Public Owners :</b> {publicMinOwners}</p>
          <p><b>Public Owners :</b>
            <ol>
              {publicOwners.map(publicOwner => (
              <li key={publicOwner}>{publicOwner}</li>
              ))}
            </ol>
          </p>
        </div>
      );
    }
    
  }
  
}

class ListPendingOwnersComponent extends React.Component{
  render(){
    if(this.props.privateEnv){
      return(
        <div>
          <p><b>Pending Private Owners to be Added :</b>
            <ol>
              {pendingPrivateOwnersAdd.map(pendingPrivateOwnerAdd => (
              <li key={pendingPrivateOwnerAdd}>{pendingPrivateOwnerAdd}</li>
              ))}
            </ol>
          </p>
          <br />
          <p><b>Pending Private Owners to be Removed :</b>
            <ol>
              {pendingPrivateOwnersRemove.map(pendingPrivateOwnerRemove => (
              <li key={pendingPrivateOwnerRemove}>{pendingPrivateOwnerRemove}</li>
              ))}
            </ol>
          </p>
        </div>
      );
    }
    else{
      return(
        <div>
          <p><b>Pending Public Owners to be Added :</b>
            <ol>
              {pendingPublicOwnersAdd.map(pendingPublicOwnerAdd => (
              <li key={pendingPublicOwnerAdd}>{pendingPublicOwnerAdd}</li>
              ))}
            </ol>
          </p>
          <br />
          <p><b>Pending Public Owners to be Removed :</b>
            <ol>
              {pendingPublicOwnersRemove.map(pendingPublicOwnerRemove => (
              <li key={pendingPublicOwnerRemove}>{pendingPublicOwnerRemove}</li>
              ))}
            </ol>
          </p>
        </div>
      );
    }
    
  }
  
}

class CertificateComponent extends React.Component{
  state = {
    certificateHash : "",
    holderAddress: "",
    retrieveholderAddress: ""
  };

  captureFile = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => this.convertToBuffer(reader);
  };

  convertToBuffer = async (reader) => {
    const buffer = await Buffer.from(reader.result);
    this.setState({certificateHash: web3.utils.keccak256(buffer)});
  };

  handleAddCertificate = async (event) => {
  	event.preventDefault();
    await AddCertificate(this.state.certificateHash, this.state.holderAddress, this.props.privateEnv);
    this.setState({ certificateHash: "",  holderAddress: ""})
  };

  handleCheckCertificate = async (event) => {
  	event.preventDefault();
    await CheckCertificate(this.state.certificateHash, this.state.holderAddress, this.props.privateEnv);
    this.setState({ certificateHash: "",  holderAddress: ""})
  };

  handleRetrieveByHolder = async (event) => {
  	event.preventDefault();
    await retrieveCertificatesByHolder(this.state.retrieveholderAddress, 0, 99, this.props.privateEnv)
    this.setState({ retrieveholderAddress: ""})
  };

  render(){
    return (
      <div>
        <h4 class="text-primary">Certificates</h4>
        <br />
        <form onSubmit={this.handleAddCertificate}>
            <input type="file" onChange={this.captureFile} className="input-file" />
            <br />
            <input type="text" name="HolderAddress" placeholder="holder address" 
                value={this.state.holderAddress}
                onChange={event => this.setState({ holderAddress: event.target.value })}/>
            <br />
            <button type="submit">Add Certificate</button>
            <button type="button" onClick={this.handleCheckCertificate}>Check Certificate</button>
        </form>
        <br />
        <p>{certificateProvider}</p>
        <br />
        <br/>
        <form onSubmit={this.handleRetrieveByHolder}>
            <input type="text" name="RetreiveByHolder" placeholder="holder address" 
                value={this.state.retrieveholderAddress}
                onChange={event => this.setState({ retrieveholderAddress: event.target.value })}/>
            <button>Retrieve By Holder</button>
        </form>
        <br />
        <p><b>Certificates for Holder : {currentHolder}</b>
          <ol>
            {certificatesByHolder.map(certificateByHolder => (
            <li key={certificateByHolder}>{certificateByHolder}</li>
            ))}
          </ol>
        </p>
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
  state = {
    value : 0
  };

  render(){
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
          <ManagerComponent />
        </TabPanel>
        <TabPanel value={this.state.value} index={1}>
          <PublicComponent />
        </TabPanel>
        <TabPanel value={this.state.value} index={2}>
          <PrivateComponent />
        </TabPanel>
      </div>
    );
  }
  
}

export default Demo;
