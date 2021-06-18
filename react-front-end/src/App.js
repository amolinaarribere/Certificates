import React from 'react';
import Tabs from "./components/Tabs"; 
import Admin from "./components/Admin"; 
import './App.css';

function App() {
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

export default App;
