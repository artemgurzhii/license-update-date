# License update date

[![Actions Status](https://github.com/artemgurzhii/license-update-date/workflows/CI/badge.svg)](https://github.com/artemgurzhii/license-update-date/actions)

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

* `yarn test`

## Cron

I run this project as the [cron task](https://www.youtube.com/watch?v=8j0SWYNglcw) on my personal linux server

You can run `crontab -e` in your terminal and add the following code to it

```bash
*/10 * * * * /{PATH_TO_THE_DIRECTORY}/cron
```

Following lines of code will run the codemod every 10 minutes(10 minutes is taken so the github will not block your api)

## License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE).
