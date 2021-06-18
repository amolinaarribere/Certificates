import React, { Component } from 'react';

class Admin extends React.Component {
	render() {
  	return (
        <div>
            <form action="">
                <input type="text" placeholder="List of owners"/>
                <input type="integer" placeholder="Min owners"/>
                <button>Create Private Pool</button>
            </form>
            < br></br>
            <form action="">
                <input type="text" placeholder="Provider Address"/>
                <input type="text" placeholder="Provider Info"/>
                <button>Submit to Public Pool</button>
            </form>
        </div>	
    );
  }
}

export default Admin;