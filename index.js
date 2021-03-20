const core = require('@actions/core');
const { Github, context } = require('@actions/github');
//const release = require('lib/release');


// most @actions toolkit packages have async methods
async function run() {
  try {
    core.info("Test 123");
    // set the success output to false to begin with
    core.setOutput('success', false);

    // create a new instance so we can interact with the github api
    const github = new Github(process.env.GITHUB_TOKEN);

    // Get the owner and context from the payload that triggered the action
    const {owner: currentOwner, repo: context} = context.repo;

    // Get the prefix from the inputs
    //const prefix = core.getInput('prefix', {required: true});

    core.info(`owner: ${owner}`);
    core.info('Repo (context):');
    core.info(repo);
    core.info(context);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
