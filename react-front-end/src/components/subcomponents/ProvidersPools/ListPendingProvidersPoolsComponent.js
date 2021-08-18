import React from 'react';
const func = require("../../../Functions.js");

class ListPendingProvidersPoolsComponent extends React.Component{
    render(){
      if (this.props.contractType == 1){
        return(
          <div>
            <p><b>Pending Public Providers to be Added :</b>
              <ol>
                {func.pendingPublicProvidersAdd.map(pendingPublicProviderAdd => (
                <li key={pendingPublicProviderAdd[0]}>{pendingPublicProviderAdd[0]}: {pendingPublicProviderAdd[1]}</li>
                ))}
              </ol>
            </p>
            <br />
            <p><b>Pending Public Providers to be Removed :</b>
              <ol>
                {func.pendingPublicProvidersRemove.map(pendingPublicProviderRemove => (
                <li key={pendingPublicProviderRemove[0]}>{pendingPublicProviderRemove[0]}: {pendingPublicProviderRemove[1]}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      else if(this.props.contractType == 2){
        return(
          <div>
            <p><b>Pending Private Providers to be Added :</b>
              <ol>
                {func.pendingPrivateProvidersAdd.map(pendingPrivateProviderAdd => (
                <li key={pendingPrivateProviderAdd[0]}>{pendingPrivateProviderAdd[0]}: {pendingPrivateProviderAdd[1]}</li>
                ))}
              </ol>
            </p>
            <br />
            <p><b>Pending Private Providers to be Removed :</b>
              <ol>
                {func.pendingPrivateProvidersRemove.map(pendingPrivateProviderRemove => (
                <li key={pendingPrivateProviderRemove[0]}>{pendingPrivateProviderRemove[0]}: {pendingPrivateProviderRemove[1]}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      else {
        return(
          <div>
            <p><b>Pending Pools to be Added :</b>
              <ol>
                {func.pendingProviderPoolsAdd.map(pendingPoolAdd => (
                <li key={pendingPoolAdd[0]}>{pendingPoolAdd[0]}: {pendingPoolAdd[1]}</li>
                ))}
              </ol>
            </p>
            <br />
            <p><b>Pending Pools to be Removed :</b>
              <ol>
                {func.pendingProviderPoolsRemove.map(pendingPoolRemove => (
                <li key={pendingPoolRemove[0]}>{pendingPoolRemove[0]}: {pendingPoolRemove[1]}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
    }
    
  }

export default ListPendingProvidersPoolsComponent;