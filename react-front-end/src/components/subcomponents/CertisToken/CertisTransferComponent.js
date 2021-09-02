import React from 'react';
const func = require("../../../functions/CertisFunctions.js");

class CertisTransferComponent extends React.Component {
    state = {
      amount : 0,
      recipient : ""
    };

    handleTransfer = async (event) => {
      event.preventDefault();
      await func.transfer(this.state.recipient, this.state.amount);
      this.setState({amount: 0, recipient: ""});
    };
    
    render(){
      return (
        <div>
            <form onSubmit={this.handleTransfer}>
            <input type="integer" name="Amount" placeholder="amount" 
                        value={this.state.amount}
                        onChange={event => this.setState({ amount: event.target.value })}/>
            <input type="text" name="Recipient" placeholder="recipient" 
                        value={this.state.recipient}
                        onChange={event => this.setState({ recipient: event.target.value })}/>
            <button type="submit">Transfer Amount</button>
          </form>
        </div>
      );
    }
  }

export default CertisTransferComponent;