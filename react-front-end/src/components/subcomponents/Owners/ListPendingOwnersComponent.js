import React from 'react';
const func = require("../../../functions/OwnerFunctions.js");
const Aux = require("../../../functions/AuxiliaryFunctions.js");

class ListPendingOwnersComponent extends React.Component{
    render(){
      if (this.props.contractType == 1){
        return(
          <div>
            <p class="text-warning"><b>Pending Public Min Owner : {func.publicPendingMinOwners}</b></p>
            <br />
            <p class="text-warning"><b>Pending Public Owners to be Added :</b>
              <ol>
                {func.pendingPublicOwnersAdd.map(pendingPublicOwnerAdd => (
                <li key={pendingPublicOwnerAdd}>{Aux.Bytes32ToAddress(pendingPublicOwnerAdd)}</li>
                ))}
              </ol>
            </p>
            <br />
            <p class="text-warning"><b>Pending Public Owners to be Removed :</b>
              <ol>
                {func.pendingPublicOwnersRemove.map(pendingPublicOwnerRemove => (
                <li key={pendingPublicOwnerRemove}>{Aux.Bytes32ToAddress(pendingPublicOwnerRemove)}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      else  if (this.props.contractType == 2){
        return(
          <div>
            <p class="text-warning"><b>Pending Private Min Owner : {func.privatePendingMinOwners}</b></p>
            <br />
            <p class="text-warning"><b>Pending Private Owners to be Added :</b>
              <ol>
                {func.pendingPrivateOwnersAdd.map(pendingPrivateOwnerAdd => (
                <li key={pendingPrivateOwnerAdd[0]}>{Aux.Bytes32ToAddress(pendingPrivateOwnerAdd[0])}</li>
                ))}
              </ol>
            </p>
            <br />
            <p class="text-warning"><b>Pending Private Owners to be Removed :</b>
              <ol>
                {func.pendingPrivateOwnersRemove.map(pendingPrivateOwnerRemove => (
                <li key={pendingPrivateOwnerRemove[0]}>{Aux.Bytes32ToAddress(pendingPrivateOwnerRemove[0])}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      else{
        return(
          <div>
            <p class="text-warning"><b>Pending Provider Min Owner : {func.providerPendingMinOwners}</b></p>
            <br />
            <p class="text-warning"><b>Pending Provider Owners to be Added :</b>
              <ol>
                {func.pendingProviderOwnersAdd.map(pendingProviderOwnerAdd => (
                <li key={pendingProviderOwnerAdd}>{Aux.Bytes32ToAddress(pendingProviderOwnerAdd)}</li>
                ))}
              </ol>
            </p>
            <br />
            <p class="text-warning"><b>Pending Provider Owners to be Removed :</b>
              <ol>
                {func.pendingProviderOwnersRemove.map(pendingProviderOwnerRemove => (
                <li key={pendingProviderOwnerRemove}>{Aux.Bytes32ToAddress(pendingProviderOwnerRemove)}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      
    }
    
  }

  export default ListPendingOwnersComponent;