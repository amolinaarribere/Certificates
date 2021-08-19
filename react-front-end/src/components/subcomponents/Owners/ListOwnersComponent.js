import React from 'react';
const func = require("../../../Functions.js");

class ListOwnersComponent extends React.Component{
    render(){
      if (this.props.contractType == 1){
        return(
          <div>
            <p><b>Total Public Owners :</b> {func.publicTotalOwners}</p>
            <p><b>Min Public Owners :</b> {func.publicMinOwners}</p>
            <p><b>Public Owners :</b>
              <ol>
                {func.publicOwners.map(publicOwner => (
                <li key={publicOwner}>{func.Bytes32ToAddress(publicOwner)}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      else if (this.props.contractType == 2){
        return(
          <div>
            <p><b>Total Private Owners :</b> {func.privateTotalOwners}</p>
            <p><b>Min Private Owners :</b> {func.privateMinOwners}</p>
            <p><b>Private Owners :</b>
              <ol>
                {func.privateOwners.map(privateOwner => (
                <li key={privateOwner}>{func.Bytes32ToAddress(privateOwner)}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      else{
        return(
          <div>
            <p><b>Total Provider Owners :</b> {func.providerTotalOwners}</p>
            <p><b>Min Provider Owners :</b> {func.providerMinOwners}</p>
            <p><b>Provider Owners :</b>
              <ol>
                {func.providerOwners.map(providerOwner => (
                <li key={providerOwner}>{func.Bytes32ToAddress(providerOwner)}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      
    }
    
  }

export default ListOwnersComponent;