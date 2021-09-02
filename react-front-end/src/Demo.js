import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import PublicComponent from './components/PublicComponent.js';
import PrivateComponent from './components/PrivateComponent.js';
import CertisTokensComponent from './components/CertisTokensComponent.js';
import IssuerComponent from './components/IssuerComponent.js';
import TreasuryComponent from './components/TreasuryComponent.js';
import ManagerComponent from './components/ManagerComponent.js';
import PriceConverterComponent from './components/PriceConverterComponent.js';


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
            <Tab label="Provider" {...a11yProps(3)} />
            <Tab label="Treasury" {...a11yProps(4)} />
            <Tab label="Certis Tokens" {...a11yProps(5)} />
            <Tab label="Price Converter" {...a11yProps(6)} />
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
        <TabPanel value={this.state.value} index={3}>
          <IssuerComponent />
        </TabPanel>
        <TabPanel value={this.state.value} index={4}>
          <TreasuryComponent />
        </TabPanel>
        <TabPanel value={this.state.value} index={5}>
          <CertisTokensComponent />
        </TabPanel>
        <TabPanel value={this.state.value} index={6}>
          <PriceConverterComponent />
        </TabPanel>
      </div>
    );
  }
  
}

export default Demo;
