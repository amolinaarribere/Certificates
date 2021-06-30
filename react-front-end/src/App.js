import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import Web3 from 'web3'
import './App.css'
//import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from './config'
import { CERTIFICATE_POOL_MANAGER_ABI, CERTIFICATE_POOL_MANAGER_ADDRESS } from './config'
import TodoList from './TodoList'
import Demo from './Demo';


class App extends Component {

  componentWillMount() {
    this.loadBlockchainData()
  }


  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS)
    this.setState({ todoList })
    const taskCount = await todoList.methods.taskCount().call()
    this.setState({ taskCount })
    for (var i = 1; i <= taskCount; i++) {
      const task = await todoList.methods.tasks(i).call()
      this.setState({
        tasks: [...this.state.tasks, task]
      })
    }
    this.setState({ loading: false })
    if(window.ethereum) {
      await window.ethereum.enable();
    }
    const web3 = new Web3(window.ethereum)
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    //this.setState({ account: accounts[0] })
    const certificatePoolManager = new web3.eth.Contract(CERTIFICATE_POOL_MANAGER_ABI, CERTIFICATE_POOL_MANAGER_ADDRESS)
    //this.setState({ certificatePoolManager })
    const {0: publicPoolAddress, 1: chairPerson, 2: balance} = await certificatePoolManager.methods.retrieveConfiguration().call()
    console.log("main address " + CERTIFICATE_POOL_MANAGER_ADDRESS)
    console.log("public address " + publicPoolAddress)
    console.log("chairPerson " + chairPerson)
    console.log("balance " + balance)
    console.log("accounts " + accounts.length)
    console.log("first account " + accounts[0])

  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      taskCount: 0,
      tasks: [],
      loading: true
    }

    this.createTask = this.createTask.bind(this)
    this.toggleCompleted = this.toggleCompleted.bind(this)
  }

  createTask(content) {
    this.setState({ loading: true })
    this.state.todoList.methods.createTask(content).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  toggleCompleted(taskId) {
    this.setState({ loading: true })
    this.state.todoList.methods.toggleCompleted(taskId).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="http://www.dappuniversity.com/free-download" target="_blank">Certificates Manager</a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small><a className="nav-link" href="#"><span id="account"></span></a></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex justify-content-center">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <TodoList
                  tasks={this.state.tasks}
                  createTask={this.createTask}
                  toggleCompleted={this.toggleCompleted} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
  

  render() {
    
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a className="navbar-brand col-sm-3 col-md-2 mr-0">Certificates Manager</a>
        </nav>
          ReactDOM.render(<Demo />, document.querySelector('#root'));
      </div>
    );
  }
}

export default App;
