import React from 'react';
const func = require("../../../functions/CertificateFunctions.js");

class ListPendingCertificatesComponent extends React.Component{
    render(){
      return(
        <div>
          <p class="text-warning"><b>Pending Certificates to be Added :</b>
            <ol>
              {func.pendingCertificates.map(pendingCertificate => (
              <li key={pendingCertificate[0] + pendingCertificate[1] + pendingCertificate[2]}>pool : {pendingCertificate[0]}- holder : {pendingCertificate[1]}- certificate : {pendingCertificate[2]}</li>
              ))}
            </ol>
          </p>
        </div>
      );
    }
  }

export default ListPendingCertificatesComponent;