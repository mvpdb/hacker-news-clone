import React, {useState, useEffect} from 'react';
import { Link, Route, BrowserRouter, Switch} from 'react-router-dom';
import { Login } from './components/Login'
import { Submit } from './components/Submit'
import { Submissions } from "./components/Submissions";
import { Discuss } from "./components/Discuss";
import { Comment } from "./components/Comment";
import {BASE_URL} from "./components/Constants";
import {CommentList} from "./components/CommentList";

const mvpdb = new window.MvpDB(BASE_URL);

function App() {

  const [user, setUser] = useState(null)

  const handleLogout = (ev) => {
    ev.preventDefault();
    mvpdb.Logout().then(()=>{window.location="/"});
  };

  useEffect(()=>{
    if(mvpdb.IsLoggedIn()) {
      mvpdb.GetUserData().then((data)=>{
        setUser(data)
      });
    }
  }, []);

  return <BrowserRouter>
  <div className="hn-site-container">
    <div className="hn-header">
      <div className="hn-header-container">
        <div className="hn-header-container-entry-left">
          <div className="hn-header-logo"><a className="logo-link" href="/"><h3 className="y-logo">Y</h3></a></div>
        </div>
        <div className="hn-header-container-entry-left">
          <div className="hn-header-title">
            Hacker News
          </div>
            <div className="hn-header-nav-menu">
              <div className="hn-header-nav-list">
                <div><Link to="/new">new</Link> | &nbsp; </div>
                <div><Link to="/comments">comments</Link> | &nbsp;</div>
                <div><Link to="/submit">submit</Link> &nbsp;</div>
              </div>
            </div>
        </div>
        <div className="hn-header-container-entry-right">
          {
            user ? <a onClick={handleLogout} href="#">Logout</a> : <Link to="/login">login</Link>
          }

        </div>
      </div>
    </div>

    <Switch>
      <Route path="/item" component={Discuss}/>
      <Route path="/login" component={Login}/>
      <Route path="/submit" component={Submit}/>
      <Route path="/comments" component={CommentList}/>
      <Route path="/" component={Submissions}/>
    </Switch>


  </div>
  </BrowserRouter>;
}

export default App;
