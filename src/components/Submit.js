import React, {useState} from 'react'
import {BASE_URL} from './Constants'

const mvpdb = new window.MvpDB(BASE_URL);

export const Submit = function(props) {

    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [text, setText] = useState("");

    const handleSubmit = ()=>{
        mvpdb.fetch(`/api/submissions_2`, {
            method: 'POST',
            body: JSON.stringify({
                title: title,
                url: url,
                text: text,
            })
        }).then((resp) => {
            window.location = "/";
        });
    };

    return <table border="0">
        <tbody>
        <tr>
            <td>title</td>
            <td><input type="text" name="title" onChange={(ev)=>{setTitle(ev.target.value)}} value={title} size="50"/></td>
        </tr>
        <tr>
            <td>url</td>
            <td><input type="text" name="url" onChange={(ev)=>{setUrl(ev.target.value)}} value={url} size="50"/></td>
        </tr>
        <tr>
            <td></td>
            <td><b>or</b></td>
        </tr>
        <tr>
            <td>text</td>
            <td><textarea name="text" rows="4" cols="49"
              onChange={(ev)=>{setText(ev.target.value)}}
              value={text}
            >
            </textarea></td>
        </tr>
        <tr>
            <td></td>
            <td><input onClick={handleSubmit} type="submit" value="submit"/></td>
        </tr>
        <tr></tr>
        </tbody>
    </table>
};
