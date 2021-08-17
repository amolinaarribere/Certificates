import React from 'react';
import AddProviderPoolComponent from './AddProviderPoolComponent.js';
import RemoveProviderPoolComponent from './RemoveProviderPoolComponent.js';
import ListProvidersPoolsComponent from './ListProvidersPoolsComponent.js';
import ListPendingProvidersPoolsComponent from './ListPendingProvidersPoolsComponent.js';

class ProviderPoolComponent extends React.Component{
    render(){
      var text = "Providers";
      if(3 == this.props.contractType)text = "Pools";
        return(
          <div>
            <h4 class="text-primary">{text}</h4>
            <br />
            <AddProviderPoolComponent contractType={this.props.contractType}/>
            <br />
            <RemoveProviderPoolComponent contractType={this.props.contractType} privateEnv={this.props.privateEnv}/>
            <br/>
            <ListProvidersPoolsComponent contractType={this.props.contractType} />
            <br/>
            <ListPendingProvidersPoolsComponent contractType={this.props.contractType} />
          </div>
        );
    }
  }

export default ProviderPoolComponent;