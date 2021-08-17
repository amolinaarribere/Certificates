import React from 'react';
import AddOwnerComponent from './AddOwnerComponent.js';
import RemoveOwnerComponent from './RemoveOwnerComponent.js';
import ListOwnersComponent from './ListOwnersComponent.js';
import ListPendingOwnersComponent from './ListPendingOwnersComponent.js';

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

  export default OwnerComponent;