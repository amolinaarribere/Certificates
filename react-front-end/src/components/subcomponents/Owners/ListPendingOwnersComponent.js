import React from 'react';
const func = require("../../../Functions.js");

class ListPendingOwnersComponent extends React.Component{
    render(){
      if(this.props.privateEnv){
        return(
          <div>
            <p><b>Pending Private Owners to be Added :</b>
              <ol>
                {func.pendingPrivateOwnersAdd.map(pendingPrivateOwnerAdd => (
                <li key={pendingPrivateOwnerAdd[0]}>{pendingPrivateOwnerAdd[0]}</li>
                ))}
              </ol>
            </p>
            <br />
            <p><b>Pending Private Owners to be Removed :</b>
              <ol>
                {func.pendingPrivateOwnersRemove.map(pendingPrivateOwnerRemove => (
                <li key={pendingPrivateOwnerRemove[0]}>{pendingPrivateOwnerRemove[0]}</li>
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
                {func.pendingPublicOwnersAdd.map(pendingPublicOwnerAdd => (
                <li key={pendingPublicOwnerAdd}>{pendingPublicOwnerAdd}</li>
                ))}
              </ol>
            </p>
            <br />
            <p><b>Pending Public Owners to be Removed :</b>
              <ol>
                {func.pendingPublicOwnersRemove.map(pendingPublicOwnerRemove => (
                <li key={pendingPublicOwnerRemove}>{pendingPublicOwnerRemove}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      
    }
    
  }

  export default ListPendingOwnersComponent;