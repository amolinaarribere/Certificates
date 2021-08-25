import React from 'react';
const func = require("../../../Functions.js");

class ValidateCertificateComponent extends React.Component{
    state = {
      pool : "",
      hash : "",
      holder: ""
    };
    handleValidateCertificate = async (event) => {
        event.preventDefault();
      await func.ValidateCertificate(this.state.pool, this.state.hash, this.state.holder)
      this.setState({ pool: "",  hash : "", holder: ""})
    };
  
    render(){
      return(
        <div>
          <form onSubmit={this.handleValidateCertificate}>
              <input type="text" name="Pool" placeholder="pool" 
                  value={this.state.pool}
                  onChange={event => this.setState({ pool: event.target.value })}/>
              <input type="text" name="Hash" placeholder="hash" 
                  value={this.state.hash}
                  onChange={event => this.setState({ hash: event.target.value })}/>
              <input type="text" name="Holder" placeholder="holder" 
                  value={this.state.holder}
                  onChange={event => this.setState({ holder: event.target.value })}/>
              <button>Validate Certificate</button>
          </form>
        </div>
      );
    }
  }

  export default ValidateCertificateComponent;