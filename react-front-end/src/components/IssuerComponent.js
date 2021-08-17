import React from 'react';
const func = require("../Functions.js");

class IssuerComponent extends React.Component {
    componentWillMount() {
      func.LoadBlockchain()
      func.SwitchContext()
   }
    state = {
      
    };
    
    render(){
      return (
        <div>
        </div>
      );
    }
  }
  

export default IssuerComponent;