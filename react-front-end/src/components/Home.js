import React, { Component } from 'react';
import Tabs from "./Tabs"; 
import Admin from "./Admin"; 
import '../App.css';

class Home extends Component {
    render(){
        return (
            <div>
              <h1>CERTIFICATES</h1>
              <Tabs> 
               <div id="AdminTab" label="Admin"> 
                 <Admin></Admin> 
               </div> 
               <div id="PublicTab" label="Public Pool"> 
                 After 'while, <em>Crocodile</em>! 
               </div> 
               <div id="PrivateTab" label="Private Pools"> 
                 Nothing to see here, this tab is <em>extinct</em>! 
               </div> 
             </Tabs> 
            </div>
          );
    } 
}
  
  export default Home;