import {useEffect, useState} from "react";
import {useLocation} from 'react-router-dom';
import React from "react";
import {BASE_URL} from "./Constants";

const mvpdb = new window.MvpDB(BASE_URL);

const alert_fail = () => {
    alert("something went wrong")
};

export const CommentList = function(props) {

    const [comments, setComments] = useState(null);

    useEffect(() => {
        mvpdb.fetch(`/api/comments/?order=created_date.desc&limit=100`)
            .then((data) => {setComments(data.results)}, alert_fail);
    }, []);

    if (!comments) {
        return <div>loading...</div>;
    }

    const commentTags = comments.map((c, index)=>{
       return <div style={{marginLeft: 20}} className="comment-container">
            <div className="comment-head" key={index} >
                <span>{c.created_by}</span>
                <span>{c.created_date}</span>
                <span><a href={"/comments?id="+c.id}>reply</a></span>
                <span><a href={"/item?id="+c.submission_id}>Submission</a></span>
            </div>
            <div className="comment-text" style={{ marginTop:10, marginBottom: 20}}>{c.text}</div>
        </div>
    });

    return <>
        {commentTags}
    </>
};
