import {useEffect, useState} from "react";
import {useLocation} from 'react-router-dom';
import React from "react";
import {BASE_URL} from "./Constants";

const mvpdb = new window.MvpDB(BASE_URL);

const alert_fail = () => {
    alert("something went wrong")
};

export const Comment = function(props) {

    const [comment, setComment] = useState(null);
    const [commentText, setCommentText] = useState("");
    const urlParams = new URLSearchParams(window.location.search);

    const loading = (!comment);

    useEffect(() => {
        if (!urlParams.has('id')) return;

        mvpdb.fetch(`/api/comments/${urlParams.get('id')}`)
            .then((data) => {setComment(data)}, alert_fail);
    }, [urlParams.get('id')]);

    const postComment = () => {
        mvpdb.fetch(`/api/comments_2`, {
            method: 'POST',
            body: JSON.stringify({
                text: commentText,
                path: `${comment.path}/${comment.id}`,
                submission_id: comment.submission_id,
            })
        }).then((resp) => {
            window.location = `/item?id=${comment.submission_id}`;
        }, alert);
    };

    if (loading) {
        return <div>loading...</div>;
    }

    return <> <table>
        <tbody>

    <tr style={{height: 10}}></tr>

    <tr>
        <div className="comment-container">
            <div className="comment-head">
                <span>{comment.created_by}</span>
                <span>{comment.created_date}</span>
            </div>
            <div className="comment-text">{comment.text}</div>
        </div>
    </tr>

    <tr style={{height: 20}}></tr>

    <tr>
        <td>
            <textarea onChange={(ev)=>{setCommentText(ev.target.value)}} name="text" rows="6" cols="60"></textarea>
            <br/><br/>
            <input type="submit" value="add comment" onClick={postComment}/>
        </td>
    </tr>
    </tbody>

    </table>
    </>
};
