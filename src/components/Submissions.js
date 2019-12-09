import {useEffect, useState} from "react";
import {useLocation} from 'react-router-dom';
import React from "react";
import {BASE_URL} from "./Constants"

const mvpdb = new window.MvpDB(BASE_URL);

export const Submissions = function(props) {

    const [submissions, setSubmissions] = useState([]);
    const [upvotesBySubmission, setUpvotesBySubmission] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    let location = useLocation();

    useEffect(()=>{
        let base = `/api/submissions`;

        // If we are on the new page, grab the newest submissions from the api using the "order" keyword
        // Since we want the newest, we sort by created_date descending.
        if(location.pathname === "/new") {
            base = `${base}?order=created_date.desc`
        }

        // Otherwise, we get the top submissions based on score.
        else {
            base = `${base}?order=score.desc`
        }

        mvpdb.fetch(base).then((submissionData)=>{
            setSubmissions(submissionData.results);
        })
    }, [location.pathname]);

    useEffect(()=>{
        // Only get upvotes if logged in
        if(!mvpdb.IsLoggedIn()) {
            setUpvotesBySubmission({});
            return;
        };

        mvpdb.fetch(`/api/upvotes`)
            .then((upvoteResults)=>{
                const submissionHasUpvote = {};
                upvoteResults.results.forEach((upvote)=>{
                    submissionHasUpvote[upvote.upvoted_id] = true
                });

                setUpvotesBySubmission(submissionHasUpvote);
            }, alert);
    }, [location.pathname]);

    useEffect(()=>{
        if(mvpdb.IsLoggedIn()) {
            mvpdb.GetUserData().then((data)=>{setUserInfo(data)});
        }
    }, []);

    const upVoteSubmission = (submission) => {
        if(!userInfo.id) return;
        mvpdb.fetch(`/api/upvotes`, {
            method: 'POST',
            body: JSON.stringify({
                upvoted_id: submission.id,
                type: 'submission',
            })
        }).then((resp)=>{
            setUpvotesBySubmission({...upvotesBySubmission, [submission.id]: true})
        }, (err) => {
            alert(err);
        });
    };

    if (!submissions.length || !upvotesBySubmission) {
        return <div></div>
    }

    return submissions.map((submission, index)=>{
        return <div key={index}>
            <div className="hn-entry-row-1">
                <div className="entry-counter"/>

                { !upvotesBySubmission[submission.id] ?
                    <div onClick={() => {
                        return upVoteSubmission(submission)
                    }}>
                        <div style={{cursor: "pointer"}} className="arrow-up"/>
                    </div> :

                    <div>
                        <div style={{opacity: 0}} className="arrow-up"/>
                    </div>
                }

                {submission.url ?
                    <a href={submission.url}><div className="hn-entry-title">{submission.title}</div></a> :
                    <a href={"/item?id="+submission.id}><div className="hn-entry-title">{submission.title}</div></a>
                }
                <a href={submission.url}>({submission.url})</a>
            </div>
            <div className="hn-entry-row-2">
                <div>{submission.points} points by</div>
                <div>{submission.created_by}</div>
                <a href={'/item?id='+submission.id}>discuss</a>
            </div>
        </div>
    })
}
