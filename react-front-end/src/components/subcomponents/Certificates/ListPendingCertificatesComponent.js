import React from 'react';
const func = require("../../../Functions.js");

class ListPendingCertificatesComponent extends React.Component{
    render(){
      return(
        <div>
          <p><b>Pending Certificates to be Added :</b>
            <ol>
              {func.pendingProviderPoolsAdd.map(pendingPoolAdd => (
              <li key={pendingPoolAdd[0]}>{pendingPoolAdd[0]}: {pendingPoolAdd[1]}</li>
              ))}
            </ol>
          </p>
        </div>
      );
    }
  }

export default ListPendingCertificatesComponent;