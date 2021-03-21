const core = require('@actions/core');
const github = require('@actions/github');
//const release = require('lib/release');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const commits = github.context.payload.commits;
    // set the success output to false to begin with
    core.setOutput('success', false);
    const prefix = core.getInput('prefix');

    // create a new instance so we can interact with the github api
    const octokit = github.getOctokit(core.getInput('token'));

    const splitRepo = core.getInput('repo').split('/');

    const owner = splitRepo[0];
    const repo = splitRepo[1];

    const {data: releases} = await octokit.repos.listReleases({
      owner: owner,
      repo: repo
    });

    let draft = releases.filter(obj => {
      if(obj.draft == true && obj.name.startsWith("Auto-Drafter:")){
        return true;
      }
    });

    const withTags = releases.filter(obj => {
      return obj.draft == false;
    });

    const lastRelease = withTags[Object.keys(withTags)[0]];

    let lastReleaseTag = lastRelease.tag_name;

    lastReleaseTag = lastReleaseTag.substring(1);

    let [major, minor, patch] = lastReleaseTag.split('.');

    patch++;

    if (Object.keys(draft).length !== 0) {
      core.info("Draft found! lets add to the content");
      const draftObj = await octokit.repos.getRelease({
        owner: owner,
        repo: repo,
        release_id: draft[Object.keys(draft)[0]].id
      });
      let body = draftObj.body;
      if(body === undefined){
        body = "";
      }
      commits.forEach(obj => {
        body += `* ${obj.message} @${obj.committer.username}`
      })
      await octokit.repos.updateRelease({
        owner: owner,
        repo: repo,
        release_id: draftObj.id,
        body: body
      });
    } else {
      core.info("No Draft found.... Creating new draft.");
      core.info(`latest tag: ${lastReleaseTag}`);
      core.info(`Creating draft release with the tag ${major}.${minor}.${patch}`);
      let body;
      commits.forEach(obj => {
        body += `* ${obj.message} @${obj.committer.username}`
      });
      await octokit.repos.createRelease({
        owner: owner,
        repo: repo,
        tag_name: `${prefix}${major}.${minor}.${patch}`,
        name: `Auto-Drafter: ${prefix}${major}.${minor}.${patch}`,
        body: body,
        draft: true
      });
      core.info("Successfully created the draft.");
    }

    // Get the prefix from the inputs
    //const prefix = core.getInput('prefix', {required: true});
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
