# Hacker News
### An Implementation in Mvp DB

Mvp DB is a low-code backend solution for web and mobile applications.  Using spreadsheet style data entry, developers / makers can upload data, and define APIs to access the data in a few clicks in a friendly web UI. Mvp DB provides out of the box user registration / login flows, allowing developers to bootstrap robust data applications with **no backend coding required**.

We are going to see how quick a multi featured site such as **Hacker News** can be built using Mvp DB.  With only a few lines of backend validation, we will achieve a working Hacker News implementation, supporting the following features:

1. **User Registration** and **Login**
2. **Anonymous User Access** - *Users not logged in can still visit site*
3. **Secure Upvoting** - *Only logged in users can vote*
4. **Post Submission** - *Only logged in users can submit*
5. **Comment threads** - *Publicly Available*
6. **Post moderation** - *Via Mvp DB Dashboard*
7. **Submission Ranking** - *Using a custom* [gravity function](https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d)

We will start with setting up our data tables in Mvp DB, using the  [Mvp DB Dashbboard](https://dashboard.mvpdb.io).  In Mvp DB every row automatically has five special columns called [system columns](https://docs.mvpdb.io/tables#system-columns) - one being `created_by`, which is the logged in user that created the row. Since these column values are *only writeable by Mvp DB*, we know that the user present in `created_by` is the true creator of the row.

Keeping that fact in mind, our table definitions will be *Submissions*, *Upvotes*, and *Comments*:

| Submissions |
|--------------|
| Title |
| Url |
| Text |
| Score ([computed hacker news score](https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d)) |
| Points (number of upvotes) |

| Upvotes |
|---------------|
| Upvoted ID (submission id) |

| Comments  |
| ------------- |
| Submission ID |
| Path          |
| Text          |

Next, we will define 5 APIs in the Mvp DB dashboard to define the access to our backend data.

### API Definitions
We will start by [defining our APIs in the Mvp DB dashboard](https://dashboard.mvpdb.io/apis).

1) To allow a *logged in* user to submit a new post to our application, we will create an API on the *Submissions* table:

|  **Table** | *Submissions* |
|---------------|-----------------|
|**API Access**| *Any Logged In User* |
|**Permission**| *CREATE*  |
|**Points, Score**| *Not Writeable*          |
| **All Others**    | *Writeable and Required* |

2) We will create a public API for all web visitors to request Submissions:

|  **Table** | *Submissions* |
|---------------|-----------------|
|**API Access**| *Public* |
|**Permission**| *READ*  |
|**All Fields**| *Viewable* |

3) We create a third API on the Upvote table. We set this API to **only allow users to READ their own upvotes** - so other users can't see an exhaustive list of things other users have upvoted.

We will additionally apply a CREATE [Pre-Request Filter](https://docs.mvpdb.io/pre-request-filters) so that one user cannot upvote the same submission multiple times.

|  **Table** | *Upvotes* |
|---------------|-----------------|
|**API Access**| *Requires Login* |
|**Permission**| *READ* and *CREATE*  |
|**All Fields**| *Writeable and Required*  |
|**Notes**|  **Users can only READ and MODIFY records they have created** |
|Pre-Request Fitler (Create)| `len(mvpdb.get_table('upvotes').get_rows(created_by=$user_id, submission_id=$old_data.submission_id)) == 0` |

4) To allow logged in users the ability to create comments, we create an API on the comment table:

|  **Table** | *Comments* |
|---------------|-----------------|
|**API Access**| *Requires Login* |
|**Permission**| *CREATE*  |
|**Fields**| *Writeable and Required*  |

5) For anonymous visitors to load comments on the website, we create a public comment api:

|  **Table** | *Comments* |
|---------------|-----------------|
|**API Access**| *Public* |
|**Permission**| *READ*  |
|**Fields**| *All Viewable*  |

With just the above configuration in Mvp DB, we have everything we need for a pretty full feature set of Hacker News.

## Setup project

We going to set up the app as a basic react app, using [create react app]().  The implementation details specific to react are out of the scope of this tutorial, but you can browse the full solution in [github](https://github.com/mvpdb/hacker-news-clone).

All API endpoints use your company specific base url.  You can find your company specific base url in the [MvpDB Dashboard](https://dashboard.mvpdb.io/profile).  It will be of the form:

```
https://<company-subdomain>.mvpdb.io
```

## Implementation

### Javascript SDK

The [MvpDB javascript SDK](https://docs.mvpdb.io/sdk) is used to authenticate with MvpDB. We will use the helper functions it provides to access our tables in Mvp DB.

Instantiating the sdk in javascript we have:

```javascript
// Replace url below with your company's base url
mvpdb = window.MvpDB("https://abc.mvpdb.io")

// Unauthenticated Request
mvpdb.fetch(`/api/upvotes`).then( (results) => {
  // Do stuff with results
}, alert);

// Authenticated Request (only need to Login() once)
mvpdb.Login('username', 'password').then(()=>{
  mvpdb.fetch(`/api/upvotes`).then( (results) => {
  // Do stuff with results
	}, alert);
})
```

### Home Page
The idea here is that we **already** have our data model definitions **and** our REST API complete - we only need to focus on displaying the data.  For the homepage, we just need to request the submissions via the _Submissions API_, and hook up the UpVote onClick handler to `POST` to the Upvote `CREATE` API.
  ```javascript
mvpdb.fetch('/api/submissions').then((submissionData)=>{
  setSubmissions(submissionData.results);
})
  ```
Upvote onClick handler:
```javascript
mvpdb.fetch(`/api/upvotes`, {
  method: 'POST',
  body: JSON.stringify({
    upvoted_id: submission.id,
    type: 'submission',
  })
}).then((resp)=>{
  setUpvotesBySubmission({...upvotesBySubmission, [submission.id]: true})
}, alert );
```

### Upvoting

For our frontend to know whether or not to display an upvote, we rely on our `Upvote GET API` to request all upvotes from the current logged in user. On that API, we specified that **Users can only READ and MODIFY records they have created** - in this way, each user is able to READ the upvotes associated with their own account, but they can't see a list of upvotes from arbitrary user X.

### Upvote Scoring

Hacker News uses a scoring mechanism to rank submissions and comments. Logged in users can upvote items which feeds into a [ranking algorithm](http://www.righto.com/2013/11/how-hacker-news-ranking-really-works.html).  Higher ranked submissions bubble to the top to be show on the front page.  To handle this feature, we will define an [Api Action](https://docs.mvpdb.io/api-actions), which we trigger after every new upvote to update the total upvotes for the submission, as well as its [score](https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d).

On our upvote `CREATE` api, we add the following Api Action:

```python
total_upvotes = len(mvpdb.get_table('upvotes').get_rows(submission_id=$new_data.submission_id))
submission = mvpdb.get_table('submissions').get_by_id($new_data.submission_id)

# Score = (P-1) / (T+2)^G
# P = points of an item (and -1 is to negate submitters vote)  
# T = time since submission (in hours)
# G = Gravity, defaults to 1.8 in news.arc
# https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d
time_diff = datetime.datetime.now() - submission.created_date
submission.score = (total_upvotes - 1) / ((time_diff.seconds / 3600) ** 1.8)
submission.total_upvotes = total_upvotes
submission.save()
```

### Post Submission

Posts are submitted using the `Submissions CREATE API`.  We added the following code to the onClick handler on the [Submit.js Page](https://www.github.com/mvpdb/hacker-news-clone):

```javascript
mvpdb.fetch(`/api/submissions`, {
  method: 'POST',
  body: JSON.stringify({
    title: title,
    url: url,
    text: text,
  })
}).then((resp) => {
  window.location = "/";
});
```

### Comment Display
Hacker News comments form a tree.  Replies to specific comments are nested underneath their parent.  Children comments who share a parent are then sorted by popularity.  This continues recursively.

Even though Mvp DB stores data in rows, we can achieve the above tree structure with field `path` on comments.  The `path` field allows us to correctly group the comments together to correctly display them as a tree.

The path works like this:

1. For a root, or top level comment, its path is the `submission id`
2. For a child comment, its path is `<PATH_PARENT> / <ID_PARENT>`

To display comments, we start by requesting all comments from the current submission:

To populate this structure from the API:

```javascript
mvpdb.fetch(`/api/comments?submission_id=eq.${urlParams.get('id')}`)
  .then((data) => {
    const commentTree = createCommentTree(data.results);
    setCommentTree(commentTree);
}, alertFail);
```

Then, our client javascript uses the rest of the information contained in `path`  to correctly organize the comments into a tree form.  The basic structure we will create has each comment containing a link to its parents, and a flat list of its children.  Check it out on [github](https://www.github.com/mvpdb/hacker-news-clone) for more details.

### Comments
Similar to Submissions, comments are created via the `CREATE Comment API`.  We attach the following `POST` to the onClick handler of the submit comment button, on the discussion page.
```javascript
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
```

### Comment List Page
Hacker news features the ability to see all new comments as they come in, sorted by new.  We can quickly accomplish exact that in `CommentList.js` by querying all comments and sorting by created date `descending`:

```javascript
mvpdb.fetch(`/api/comments/?order=created_date.desc&limit=100`)
  .then((data) => {setComments(data.results)}, alert_fail);
```

### Registration

To register a new user, we use the provided `Register()` helper from the Mvp DB SDK.  Upon a successful registration request, a session token will be added to the browsers local storage.  All subsequent calls to `.fetch()` from the SDK will be authenticated by that user.  In our example, we simple redirect to the homepage on successful registration:

```javascript
mvpdb.Register(username, password, "").then( () => { window.location = "/" } );
```

### User Login
To login a user that already has an account, we use the provided `Login()` helper from the Mvp DB SDK.  Upon a successful login request, a session token will be added to the browsers local storage.  All subsequent calls to `.fetch()` from the SDK will be authenticated by that user.  In our example, we simple redirect to the homepage on successful login:

```javascript
mvpdb.Login(username, password).then( () => { window.location = '/' } );
```

### User Info
To figure out if a user is logged in - and if so, retrieve the users details (email, name, etc) - We use the `IsLoggedIn()` helper. If the user is indeed logged in, the following api will contain an object with the users details.

```javascript
if(mvpdb.IsLoggedIn()) {
  mvpdb.GetUserData().then((data)=>{
    setUser(data)
  });
}
```

### User Logout
To logout a user, simply call the SDK helper `Logout()`.  This will clear the users session.  In our example, we simply redirect to the hompage on successful logout.

```javascript
mvpdb.Logout().then( () => { window.location = "/" } );
```

### Post Moderation
By heading to the MvpDB dashboard - an admin user can view the submission table to perform any post moderation that is necessary:
* Submission Deletion
* Submission Editing
* User Deletion
