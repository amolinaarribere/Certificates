import React from 'react';
import AddOwnerComponent from './AddOwnerComponent.js';
import RemoveOwnerComponent from './RemoveOwnerComponent.js';
import ValidateOwnerComponent from './ValidateOwnerComponent.js';
import RejectOwnerComponent from './RejectOwnerComponent.js';
import ListOwnersComponent from './ListOwnersComponent.js';
import ListPendingOwnersComponent from './ListPendingOwnersComponent.js';

class OwnerComponent extends React.Component{
    render(){
      return(
        <div>
          <h4 class="text-primary">Owners</h4>
          <br />
          <AddOwnerComponent contractType={this.props.contractType}/>
          <br/>
          <RemoveOwnerComponent contractType={this.props.contractType}/>
          <br />
          <ValidateOwnerComponent contractType={this.props.contractType}/>
          <br/>
          <RejectOwnerComponent contractType={this.props.contractType}/>
          <br/>
          <ListOwnersComponent contractType={this.props.contractType}/>
          <br />
          <ListPendingOwnersComponent contractType={this.props.contractType}/>
        </div>
      );
    }
  }

  export default OwnerComponent;