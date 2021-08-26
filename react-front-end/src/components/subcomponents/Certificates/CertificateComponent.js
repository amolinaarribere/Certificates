import React from 'react';
import ListPendingCertificatesComponent from './ListPendingCertificatesComponent';
import ValidateCertificateComponent from './ValidateCertificateComponent';
import RejectCertificateComponent from './RejectCertificateComponent';
const func = require("../../../Functions.js");


class CertificateComponent extends React.Component{
    state = {
      certificateHash : "",
      holderAddress: "",
      poolAddress: "",
      retrieveholderAddress: ""
    };
  
    captureFile = (event) => {
      event.stopPropagation();
      event.preventDefault();
      const file = event.target.files[0];
      let reader = new window.FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = () => this.convertToBuffer(reader);
    };
  
    convertToBuffer = async (reader) => {
      const buffer = await Buffer.from(reader.result);
      this.setState({certificateHash: func.web3.utils.keccak256(buffer)});
    };
  
    handleAddCertificate = async (event) => {
        event.preventDefault();
      await func.AddCertificate(this.state.certificateHash, this.state.holderAddress, this.props.privateEnv, this.props.contractType, this.state.poolAddress);
      this.setState({ certificateHash: "",  holderAddress: ""})
    };
  
    handleCheckCertificate = async (event) => {
        event.preventDefault();
      await func.CheckCertificate(this.state.certificateHash, this.state.holderAddress, this.props.privateEnv);
      this.setState({ certificateHash: "",  holderAddress: ""})
    };
  
    handleRetrieveByHolder = async (event) => {
        event.preventDefault();
      await func.retrieveCertificatesByHolder(this.state.retrieveholderAddress, 0, 99, this.props.privateEnv)
      this.setState({ retrieveholderAddress: ""})
    };
  
    render(){
      if(3 != this.props.contractType){
        return (
          <div>
            <h4 class="text-primary">Certificates</h4>
            <br />
            <form onSubmit={this.handleAddCertificate}>
                <input type="file" onChange={this.captureFile} className="input-file" />
                <br />
                <input type="text" name="HolderAddress" placeholder="holder address" 
                    value={this.state.holderAddress}
                    onChange={event => this.setState({ holderAddress: event.target.value })}/>
                <br />
                <button type="submit">Add Certificate</button>
                <button type="button" onClick={this.handleCheckCertificate}>Check Certificate</button>
            </form>
            <br />
            <p>{func.certificateProvider}</p>
            <br />
            <br/>
            <form onSubmit={this.handleRetrieveByHolder}>
                <input type="text" name="RetreiveByHolder" placeholder="holder address" 
                    value={this.state.retrieveholderAddress}
                    onChange={event => this.setState({ retrieveholderAddress: event.target.value })}/>
                <button>Retrieve By Holder</button>
            </form>
            <br />
            <p><b>Certificates for Holder : {func.currentHolder}</b>
              <ol>
                {func.certificatesByHolder.map(certificateByHolder => (
                <li key={certificateByHolder}>{certificateByHolder}</li>
                ))}
              </ol>
            </p>
          </div>
        );
      }
      else{
        return (
          <div>
            <h4 class="text-primary">Certificates</h4>
            <br />
            <form onSubmit={this.handleAddCertificate}>
                <input type="file" onChange={this.captureFile} className="input-file" />
                <br />
                <input type="text" name="HolderAddress" placeholder="holder address" 
                    value={this.state.holderAddress}
                    onChange={event => this.setState({ holderAddress: event.target.value })}/>
                <br />
                <input type="text" name="PoolAddress" placeholder="pool address" 
                    value={this.state.poolAddress}
                    onChange={event => this.setState({ poolAddress: event.target.value })}/>
                <br />
                <button type="submit">Add Certificate</button>
            </form>
            <br />
            <ValidateCertificateComponent />
            <br />
            <RejectCertificateComponent />
            <br />
            <p>{func.certificateProvider}</p>
            <br />
            <br/>
            <ListPendingCertificatesComponent />
          </div>
        );
      }
      
    }
  }

  export default CertificateComponent;