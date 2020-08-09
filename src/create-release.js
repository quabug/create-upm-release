const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');
const fs = require('fs');

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const github = new GitHub(process.env.GITHUB_TOKEN);

    // Get owner and repo from context of payload that triggered the action
    const { owner, repo } = context.repo;

    const packagePath = core.getInput('upm_package_path', { required: true });
    const packageFile = fs.readFileSync(`${packagePath}/package.json`, { encoding: 'utf8' });
    const packageJson = JSON.parse(packageFile);
    const { version } = packageJson;
    if (version === undefined || version === null) {
      core.setFailed('invalid package version');
    }

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const tagPrefix = core.getInput('upm_tag_prefix', { required: true });

    // This removes the 'refs/tags' portion of the string, i.e. from 'refs/tags/v1.10.15' to 'v1.10.15'
    const tag = `${tagPrefix}${version}`;

    let release = null;
    try {
      release = await github.repos.getReleaseByTag({
        owner,
        repo,
        tag
      });
    } catch (error) {
      const draft = core.getInput('draft', { required: false }) === 'true';
      const prerelease = core.getInput('prerelease', { required: false }) === 'true';
      const commitish = core.getInput('commitish', { required: false }) || context.sha;
      // Create a release
      // API Documentation: https://developer.github.com/v3/repos/releases/#create-a-release
      // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-create-release
      release = await github.repos.createRelease({
        owner,
        repo,
        tag_name: tag,
        name: tag,
        draft,
        prerelease,
        target_commitish: commitish
      });
    } finally {
      console.log(release);
      // Get the ID, html_url, and upload URL for the created Release from the response
      const {
        data: { id: releaseId, html_url: htmlUrl, upload_url: uploadUrl }
      } = release;

      // Set the output variables for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
      core.setOutput('id', releaseId);
      core.setOutput('html_url', htmlUrl);
      core.setOutput('upload_url', uploadUrl);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
