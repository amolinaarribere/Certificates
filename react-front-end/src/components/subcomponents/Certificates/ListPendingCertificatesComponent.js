import React from 'react';
const func = require("../../../Functions.js");

class ListPendingCertificatesComponent extends React.Component{
    render(){
      return(
        <div>
          <p><b>Pending Certificates to be Added :</b>
            <ol>
              {func.pendingCertificates.map(pendingCertificate => (
              <li key={pendingCertificate[0] + pendingCertificate[1] + pendingCertificate[2]}>{pendingCertificate[0]} - {pendingCertificate[1]} - {pendingCertificate[2]}</li>
              ))}
            </ol>
          </p>
        </div>
      );
    }
  }

export default ListPendingCertificatesComponent;