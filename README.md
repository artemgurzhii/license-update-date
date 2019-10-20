# License update date
Program to automatically update LICENSE date if is outdated.

**NOTE:** This project was done during the hackaton so there is no big use case for that :)

## Usage
Current implementation scraps random github repositories and checks their LICENSE if is ok.
If not [license-update-date-bot](https://github.com/license-update-date-bot) will send an automated PR with the date fix.

If you want to update LICENSE for your self project or organization projects change `getRepositories` method at the  [bin/github-scrapper.js](https://github.com/artemgurzhii/license-update-date/blob/master/bin/github-scrapper.js#L35) file. Update it with [user repositories url](https://developer.github.com/v3/repos/#list-user-repositories) or [organization repositories url](https://developer.github.com/v3/repos/#list-organization-repositories).

After you will need to: 
  - generate [personal access token](https://github.com/settings/tokens)
  - create `.env` file
  - fill `.env` file with `GITHUB_TOKEN={YOUR_PERSONAL_ACCESS_TOKEN}`

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with yarn)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone https://github.com/artemgurzhii/license-update-date` this repository
* `cd license-update-date`
* `yarn`

## Linting

* `yarn lint`

## Running Tests

nope:)

## License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE).
