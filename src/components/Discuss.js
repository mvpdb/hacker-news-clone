import {useEffect, useState} from "react";
import {useLocation} from 'react-router-dom';
import React from "react";
import {BASE_URL} from "./Constants"

const mvpdb = new window.MvpDB(BASE_URL);

const alertFail = () => {
    alert("something went wrong")
};

const createCommentTree = (flatComments) => {

    // Create node (without children) for each comment id
    const commentTree = {};
    commentTree['ROOT'] = {id: 'ROOT', parentId: null, children:[]};

    flatComments.forEach((c) => {
        // if path doesn't have a /, it means its a root comment
        if (!c.path || !c.path.includes('/')) {
            commentTree[c.id] = {...c, parentId:'ROOT', children:[]}
        } else {
            const paths = c.path.split('/');
            commentTree[c.id] = {...c, parentId:paths[paths.length - 1], children:[]}
        }
    });

    // populate the child nodes in the lookup table
    flatComments.forEach((c)=>{
        // If a node has a parent, append it to the parent's child array
        // (everything but the root node)
        if(commentTree[c.id].parentId) {
            commentTree[commentTree[c.id].parentId].children.push(commentTree[c.id]);

            // For convenience, add a direct link back to the parent
            commentTree[c.id].parent = commentTree[commentTree[c.id].parentId]
        }
    });

    console.log(commentTree);
    return commentTree;
};

const flattenCommentTreeHelper = (commentTree, root, work, level) => {
    root.level = level;
    work.push(root);
    if(root.children) {
        root.children.forEach((ch) => {
            flattenCommentTreeHelper(commentTree, ch, work, level+1);
        });
    }
};

const flattenCommentTree = (commentTree) => {
    const result = [];
    flattenCommentTreeHelper(commentTree, commentTree['ROOT'], result, 0);

    // Dont return "ROOT" node
    return result.slice(1);
};

export const Discuss = function(props) {

    const [commentTree, setCommentTree] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [commentText, setCommentText] = useState("");
    const urlParams = new URLSearchParams(window.location.search);

    const loading = (!submission || !commentTree);
    useEffect(() => {
        if (!urlParams.has('id')) return;

        mvpdb.fetch(`/api/comments?submission_id=eq.${urlParams.get('id')}`)
            .then((data) => {
                const commentTree = createCommentTree(data.results);
                setCommentTree(commentTree);
            }, alertFail);
    }, [urlParams.get('id')]);

    useEffect(() => {
        if (!urlParams.has('id')) return;
        mvpdb.fetch(`/api/submissions/${urlParams.get('id')}`)
            .then((data) => {setSubmission(data)}, alertFail);
    }, [urlParams.get('id')]);

    const postComment = () => {
        mvpdb.fetch(`/api/comments_2`, {
            method: 'POST',
            body: JSON.stringify({
                text: commentText,
                path: submission.id,
                submission_id: submission.id,
            })
        }).then((resp) => {
            window.location.reload();
        });
    };

    if (loading) {
        return <div>loading...</div>;
    }

    const commentsToRender = flattenCommentTree(commentTree).map((c, index) => {
        return <div className="comment-container">
            <div className="comment-head" key={index} style={{marginLeft: c.level * 20}}>
                <span>{c.created_by}</span>
                <span>{c.created_date}</span>
                <span><a href={"/comments?id="+c.id}>reply</a></span>
            </div>
            <div className="comment-text" style={{marginLeft: c.level * 20, marginTop:10, marginBottom: 20}}>{c.text}</div>
            </div>
    });


    return <> <table>
        <tbody>

    <tr style={{height: 10}}></tr>

    <tr>
        <td className="title"><a href={submission.url} className="storylink">{submission.title}</a></td>
    </tr>

    <tr style={{height: 10}}></tr>

    {submission.text &&
        <tr>
            <td><p>{submission.text}</p></td>
        </tr>
    }

    <tr style={{height: 30}}></tr>

    <tr>
        <td>
            <textarea onChange={(ev)=>{setCommentText(ev.target.value)}} name="text" rows="6" cols="60"></textarea>
            <br/><br/>
            <input type="submit" value="add comment" onClick={postComment}/>
        </td>
    </tr>
    </tbody>

    </table>
    {commentsToRender}
    </>
};
