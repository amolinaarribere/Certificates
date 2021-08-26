import React from 'react';
const func = require("../../Functions.js");

class CurrentAddressComponent extends React.Component{
    render(){
      return(
        <div>
          <h3>Current Address : {func.account}</h3>
          <br />
        </div>
      );
    }
  }

export default CurrentAddressComponent;