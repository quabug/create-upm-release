### Inputs
- `upm_tag_prefix`: the prefix of the tag for this release
- `upm_package_path`: directory path of unity package which including `package.json`
- `draft`: `true` to create a draft (unpublished) release, `false` to create a published one. Default: `false`
- `prerelease`: `true` to identify the release as a prerelease. `false` to identify the release as a full release. Default `false`
- `create_unitypackage`: `true` to create an unitypackage from `upm_package_path` and attach it into release
- `unitypackage_name`: prefix name of created unity package

### Outputs
For more information on these outputs, see the [API Documentation](https://developer.github.com/v3/repos/releases/#response-4) for an example of what these outputs look like

- `id`: The release ID
- `html_url`: The URL users can navigate to in order to view the release. i.e. `https://github.com/octocat/Hello-World/releases/v1.0.0`
- `upload_url`: The URL for uploading assets to the release, which could be used by GitHub Actions for additional uses, for example the [`@actions/upload-release-asset`](https://www.github.com/actions/upload-release-asset) GitHub Action

### Example workflow - create a release
On every `push` to a tag matching the pattern `v*`, [create a release](https://developer.github.com/v3/repos/releases/#create-a-release):

```yaml
name: Publish UPM Package

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  upm-release:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Create Release for OpenUPM
      id: create_release
      uses: quabug/create-upm-release@v2
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        target: main
        upm_tag_prefix: v
        upm_package_path: Packages/com.quabug.one-shot-injection
        create_unitypackage: true
        unitypackage_name: OneShot
```

This will create a [Release](https://help.github.com/en/articles/creating-releases), as well as a [`release` event](https://developer.github.com/v3/activity/events/types/#releaseevent), which could be handled by a third party service, or by GitHub Actions for additional uses, for example the [`@actions/upload-release-asset`](https://www.github.com/actions/upload-release-asset) GitHub Action. This uses the `GITHUB_TOKEN` provided by the [virtual environment](https://help.github.com/en/github/automating-your-workflow-with-github-actions/virtual-environments-for-github-actions#github_token-secret), so no new token is needed.

### Example Project
[quabug/OneShot](https://github.com/quabug/OneShot/blob/main/.github/workflows/release-upm.yml)

## License
The scripts and documentation in this project are released under the [MIT License](LICENSE)
