import React from 'react';
const func = require("../../../functions/PriceConverterFunctions.js");

class PriceConvertToWeiComponent extends React.Component {
    state = {
      PriceUSDText : "",
      PriceUSD : 0,
      PriceWei : 0
    };

    Convert = async (event) => {
      event.preventDefault();

      if(this.state.PriceUSDText != "") this.state.PriceUSD = this.state.PriceUSDText;

      this.state.PriceWei = await func.USDToEther(this.state.PriceUSD);

      this.setState({ PriceUSDText: ""})
    };
    
    render(){
      return (
        <div>
          <br />
          <form onSubmit={this.Convert}>
            <p>
              <input type="integer" name="PriceUSD" placeholder="PriceUSD" 
                  value={this.state.PriceUSDText}
                  onChange={event => this.setState({ PriceUSDText: event.target.value })}/>
            </p>
              <button>Convert</button>
          </form>
          <br />
          <p><b>Price In Wei :</b> {this.state.PriceWei} ({this.state.PriceUSD}USD)</p>
        </div>
      );
    }
  }
  
export default PriceConvertToWeiComponent;