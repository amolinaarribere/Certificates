import React, { Component } from 'react';
import Home from "./components/Home"; 
import NotFound from "./components/NotFound"; 
import { browserHistory, Router, Route } from 'react-router';
//import Admin from "./components/Admin"; 
import './App.css';

/*function App() {
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
}*/

class App extends Component {
  render(){
    return(
      <Router history={history}>
        <Container>

          <Menu secondary>
            <Menu.Item 
              name='home'
              onClick={this.navigateToHome}
            />
          </Menu>

          <Switch>
            <Route exact path='/' component={Home} />
            <Route  component={NotFound} />
          </Switch>

        </Container>
      </Router>
    );
  }


  navigateToHome(e){
    e.preventDefault();
    history.push('/');
  }
}

export default App;
