import React from 'react';
const func = require("../../../Functions.js");

class ListProvidersPoolsComponent extends React.Component{

    render(){
      if (this.props.contractType == 1){
        return(
          <div>
            <p><b>Total Public Providers :</b> {func.publicTotalProviders}</p>
            <p><b>Public Providers :</b>
              <ol>
                {func.publicProviders.map(publicProvider => (
                <li key={publicProvider[0]}>{func.Bytes32ToAddress(publicProvider[0])}: {publicProvider[1]}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      else if(this.props.contractType == 2){
        return(
          <div>
            <p><b>Total Private Providers :</b> {func.privateTotalProviders}</p>
            <p><b>Private Providers :</b>
              <ol>
                {func.privateProviders.map(privateProvider => (
                <li key={privateProvider[0]}>{func.Bytes32ToAddress(privateProvider[0])}: {privateProvider[1]}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      else{
        return(
          <div>
            <p><b>Total Pools :</b> {func.providerTotalPools}</p>
            <p><b>Pools :</b>
              <ol>
                {func.providerPools.map(Pool => (
                <li key={Pool[0]}>{func.Bytes32ToAddress(Pool[0])}: {Pool[1]}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
    }
  }

export default ListProvidersPoolsComponent;