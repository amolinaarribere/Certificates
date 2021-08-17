import React from 'react';
import AddProviderComponent from './AddProviderComponent.js';
import RemoveProviderComponent from './RemoveProviderComponent.js';
import ListProvidersComponent from './ListProvidersComponent.js';
import ListPendingProvidersComponent from './ListPendingProvidersComponent.js';

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

export default ProviderComponent;