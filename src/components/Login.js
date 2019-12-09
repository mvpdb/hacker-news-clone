import React, {useEffect, useState} from 'react'
import {BASE_URL} from './Constants'

const mvpdb = new window.MvpDB(BASE_URL);

export const Login = function(props) {

    const [username, setUsername] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleLogin = () => {
        mvpdb.Login(username, password).then(()=>{window.location = '/'});
    };

    const handleCreateAccount = () => {
        mvpdb.Register(newUsername, newPassword, "").then(()=>{
            window.location="/"
        });
    };

    return <div>
        <b>Login</b><br/><br/>
        <div><input type="hidden" name="goto" value="news"/>
            <table border="0">
                <tbody>
                <tr>
                    <td>username:</td>
                    <td><input type="text" name="acct" size="20" autoCorrect="off" spellCheck="false" autoCapitalize="off"
                               autoFocus={true} onChange={(ev)=>{setUsername(ev.target.value)}} value={username}/></td>
                </tr>
                <tr>
                    <td>password:</td>
                    <td><input onChange={(ev)=>{setPassword(ev.target.value)}} value={password} type="password" name="pw" size="20"/></td>
                </tr>
                </tbody>
            </table>
            <br/>
            <button onClick={handleLogin} value="login">Login</button></div>
        <a href="forgot">Forgot your password?</a><br/><br/>
        <b>Create Account</b><br/><br/>
        <div><input type="hidden" name="goto" value="news"/><input type="hidden"
                                                                                                name="creating" value="t"/>
            <table border="0">
                <tbody>
                <tr>
                    <td>username:</td>
                    <td><input onChange={(ev)=>{setNewUsername(ev.target.value)}} value={newUsername} type="text" name="acct" size="20" autoCorrect="off" spellCheck="false" autoCapitalize="off"/>
                    </td>
                </tr>
                <tr>
                    <td>password:</td>
                    <td><input type="password" name="pw" size="20" onChange={(ev)=>{setNewPassword(ev.target.value)}} value={newPassword}/></td>
                </tr>
                </tbody>
            </table>
            <br/>
            <button onClick={handleCreateAccount} value="create account">Create Account</button></div>
    </div>
};
