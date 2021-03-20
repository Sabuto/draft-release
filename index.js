const core = require('@actions/core');
const github = require('@actions/github');
//const release = require('lib/release');


// most @actions toolkit packages have async methods
async function run() {
  try {
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
      if(obj.draft == true && obj.name.startsWith("RL Drafter:")){
        return true;
      }
    });

    const withTags = releases.filter(obj => {
      return obj.draft == false;
    });

    core.info(JSON.stringify(withTags));

    if (Object.keys(draft).length !== 0) {
      core.info(JSON.stringify(withTags[Object.keys(withTags)[0]].tag_name));
      core.info(JSON.stringify(draft));
    } else {
      core.info("No Draft found.... Creating new draft.");
      core.info(`latest tag: ${tag}`);
      // await octokit.repos.createRelease({
      //   owner: owner,
      //   repo: repo,
      //   tag_name: `${prefix}`
      // })
    }

    // Get the prefix from the inputs
    //const prefix = core.getInput('prefix', {required: true});
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
