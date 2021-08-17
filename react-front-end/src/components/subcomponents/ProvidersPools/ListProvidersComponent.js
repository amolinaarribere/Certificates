import React from 'react';
const func = require("../../../Functions.js");

class ListProvidersComponent extends React.Component{

    render(){
      if(this.props.privateEnv){
        return(
          <div>
            <p><b>Total Private Providers :</b> {func.privateTotalProviders}</p>
            <p><b>Private Providers :</b>
              <ol>
                {func.privateProviders.map(privateProvider => (
                <li key={privateProvider[0]}>{privateProvider[0]}: {privateProvider[1]}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      else{
        return(
          <div>
            <p><b>Total Public Providers :</b> {func.publicTotalProviders}</p>
            <p><b>Public Providers :</b>
              <ol>
                {func.publicProviders.map(publicProvider => (
                <li key={publicProvider[0]}>{publicProvider[0]}: {publicProvider[1]}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
    }
  }

export default ListProvidersComponent;