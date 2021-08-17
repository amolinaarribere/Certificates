import React from 'react';
import AddProviderComponent from './AddProviderComponent.js';
import RemoveProviderComponent from './RemoveProviderComponent.js';
import ListProvidersComponent from './ListProvidersComponent.js';
import ListPendingProvidersComponent from './ListPendingProvidersComponent.js';

class ProviderPoolComponent extends React.Component{
    render(){
      return(
        <div>
          <h4 class="text-primary">Providers / Pools</h4>
          <br />
          <AddProviderComponent contractType={this.props.contractType}/>
          <br />
          <RemoveProviderComponent contractType={this.props.contractType}/>
          <br/>
          <ListProvidersComponent contractType={this.props.contractType} />
          <br/>
          <ListPendingProvidersComponent contractType={this.props.contractType} />
        </div>
      );
    }
  }

export default ProviderPoolComponent;