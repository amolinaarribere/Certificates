import React from 'react';
const func = require("../../../Functions.js");

class ListPendingProvidersComponent extends React.Component{
    render(){
      if(this.props.privateEnv){
        return(
          <div>
            <p><b>Pending Private Provider to be Added :</b>
              <ol>
                {func.pendingPrivateProvidersAdd.map(pendingPrivateProviderAdd => (
                <li key={pendingPrivateProviderAdd[0]}>{pendingPrivateProviderAdd[0]}: {pendingPrivateProviderAdd[1]}</li>
                ))}
              </ol>
            </p>
            <br />
            <p><b>Pending Private Provider to be Removed :</b>
              <ol>
                {func.pendingPrivateProvidersRemove.map(pendingPrivateProviderRemove => (
                <li key={pendingPrivateProviderRemove[0]}>{pendingPrivateProviderRemove[0]}: {pendingPrivateProviderRemove[1]}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      else{
        return(
          <div>
            <p><b>Pending Public Provider to be Added :</b>
              <ol>
                {func.pendingPublicProvidersAdd.map(pendingPublicProviderAdd => (
                <li key={pendingPublicProviderAdd[0]}>{pendingPublicProviderAdd[0]}: {pendingPublicProviderAdd[1]}</li>
                ))}
              </ol>
            </p>
            <br />
            <p><b>Pending Public Provider to be Removed :</b>
              <ol>
                {func.pendingPublicProvidersRemove.map(pendingPublicProviderRemove => (
                <li key={pendingPublicProviderRemove[0]}>{pendingPublicProviderRemove[0]}: {pendingPublicProviderRemove[1]}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      
    }
    
  }

export default ListPendingProvidersComponent;