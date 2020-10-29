# WET NIPS
Web Engagement Technology for the New and Improved Points System

<h2>References</h2>
To create the skeleton of this project, I used various online tutorials and mashed them together
to make what I thought would be the simplest and most maintainable code structure. If you want to learn more about them here are some links.
<ul>
  <li><a href=https://auth0.com/blog/create-a-simple-and-stylish-node-express-app/#Set-Up-Express-with-Node-js>Overall NodeJS Structure</a>
  <li><a href=https://www.digitalocean.com/community/tutorials/use-expressjs-to-deliver-html-files>Serving HTML files</a></li>
</ul>

<h2>Setup</h2>
This site will use a Javascript/HTML/CSS frontend with an ExpressJS/MongoDB backend to track and display brothers' points.<br></br>
To get started, you will need to <b>clone the repository</b> on your local machine.<br></br>
To run the site, <b>cd</b> into the repository and run 
<code>npm run dev</code> or <code>node ./index.js</code><br></br>
You will likely get many errors on the first try, and to resolve these you will probably need to run various <code>npm install</code> commands.


<h2>Git Commands</h2>
Since multiple people across multiple semesters will be working on this, it's very important to maintain proper code management.
I will show an example of this, starting from the assumption that you already have the repo on your local machine with all necessary packages installed, etc.
<br>
You've been assigned a new task, and you're about to start working on it.<br>
From the command line in your local repo, run <code>git status</code> and ensure that you are on the master branch.
<li>If not, you will want to run <code>git checkout master</code> and then <code>git pull</code>. <b>This is assuming you don't have any outstanding commits.</b></li><br>
From <b>master</b> branch, run <code>git checkout -b <your-new-branch></code>
<li>Try to name your branch something useful, such as name-of-feature</li><br>
  At this point you can run <code>git status</code> again and ensure you are now on <b>your development branch</b> with the latest code from master. From here, edit the code
as needed for your task.<br>
When you are done with your changes, you can run <code>git add -A</code> to add all files you've edited to the staging area. Then you can run <code>git commit -m <message></code>
to commit these changes, and finally <code>git push origin master</code> to push them.

<h2>Version Control</h2>
After you've pushed code, you will need to go into the repo on the github website (where you are now) and create a pull request. You should see a 
notification when you open the repo with a button that will let you do it, but if not you may need to go into your branch and look for the button there.
Assuming we don't assign overlapping tasks much, you should be able to merge your changes to master without conflict. If there are conflicts, you will need
to handle those on an individual basis.
