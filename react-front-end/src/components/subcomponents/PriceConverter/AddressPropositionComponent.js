import React from 'react';
import { CERTIFICATE_POOL_MANAGER_ADDRESS} from '../../../config';
const func = require("../../../functions/PriceConverterFunctions.js");
const Aux = require("../../../functions/AuxiliaryFunctions.js");
const address_0 = "0x0000000000000000000000000000000000000000";

class AddressPropositionComponent extends React.Component {
    state = {
      NewRegistryAddress : ""
    };

    handleUpgradeContracts = async (event) => {
      event.preventDefault();
      var NRA = address_0;

      if(this.state.NewRegistryAddress != "") NRA = this.state.NewRegistryAddress;

      await func.UpgradeRegistryAddress(NRA);

      this.setState({ NewRegistryAddress: ""})
    };
    
    render(){
      return (
        <div>
          <p><b>Registry Address :</b> {func.RegistryAddress}</p>
          <br />
          <form onSubmit={this.handleUpgradeContracts}>
            <p>
              <input type="text" name="NewRegistryAddress" placeholder="NewRegistryAddress" 
                  value={this.state.NewRegistryAddress}
                  onChange={event => this.setState({ NewRegistryAddress: event.target.value })}/>
            </p>
              <button>Upgrade Registry</button>
          </form>
          <br />
          <p class="text-warning"><b>Pending Registry Address :</b> {Aux.Bytes32ToAddress(func.PendingRegistryAddress)}</p>
        </div>
      );
    }
  }
  
export default AddressPropositionComponent;