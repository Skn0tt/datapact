# `datapact` - pytest, but for dataframes

<!-- prettier-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- prettier-ignore-end -->

<a href="https://codecov.io/gh/Skn0tt/datapact">
  <img alt="codecov" src="https://codecov.io/gh/Skn0tt/datapact/branch/main/graph/badge.svg?token=I9GG5WH8SU" />
</a>
<a href="https://pypi.org/project/datapact">
  <img alt="Pypi" src="https://img.shields.io/pypi/v/datapact" />
</a>
<a href="https://github.com/Skn0tt/datapact/actions/workflows/test.yml">
  <img alt="Test" src="https://github.com/Skn0tt/datapact/actions/workflows/test.yml/badge.svg" />
</a>

`datapact` is a Python library for verifying your data.

```py
import datapact

dp = datapact.test(df)

dp.age.must.be_positive()
dp.name.should.not_be_empty()
```

It works with Pandas + Dask DataFrames, and has special support for Jupyter Notebooks.

![jupyter notebooks screenshot](./doc/jupyter_screenshot.png)

Here's some features:

- dozens of existing assertions, easy to add your own
- great in-editor documentation via docstrings + types
- two severence levels (`.should` for warnings, `.must` for failures)
- failure notifications via E-Mail, MS Teams, Slack or PagerDuty (via Datapact Track)

Get Started here: https://datapact.dev

## `Datapact` Track

Datapact Track is an optional, browser-based data tracking service.

![Datapact Track dataset overview. code snippet for how to connect test suite to service](./doc/track_screenshot_dataset.png)

It's fully self-hostable via Docker and Postgres, and there's a hosted version available at `track.datapact.dev`.

Connecting your test suite is one line of code:

```py
dp.connect(
  server="track.datapact.dev",
  token="..." # get this from the UI
)
```

Datapact track gives you:

- notifications via E-Mail, Slack, MS Teams and PagerDuty
- a central documentation of your datasets
- history of data expectations + reality
- data quality tracking

Try out Datapact Track at [track.datapact.dev](https://track.datapact.dev), or follow the [self-hosting guide](https://datapact.dev/track.html) to deploy your own instance.

## `datapact` vs [Great Expectations](https://greatexpectations.io)

Both datapact and Great Expectations help you improve Data Quality, but with a different approach.

Great Expectations has its own JSON-based storage format for expectation suites, and it gives you a custom UI to edit them.
It's way bigger than datapact - in project size, project scope, but also in complexity.

`datapact` is a lot younger, community-run, and more of a _library_ than a _framework_.
The main differentiator is that it allows you to express your test suites in Python code, right along your other code.
This works in Python Scripts, Jupyter Notebooks, Pipeline Tests - everywhere that Python runs.
And by having your tests _in code_, you can co-locate them with the rest of your code, and version control + review them just like all of it.

If you already know how to use Great Expectations, you should use it.
If you found its learning curve to steep, maybe look at `datapact` - it's designed to be easy to get started, and intuitive to use.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://simonknott.de"><img src="https://avatars.githubusercontent.com/u/14912729?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Simon Knott</b></sub></a><br /><a href="https://github.com/Skn0tt/datapact/commits?author=skn0tt" title="Code">💻</a> <a href="https://github.com/Skn0tt/datapact/commits?author=skn0tt" title="Documentation">📖</a> <a href="#ideas-skn0tt" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-skn0tt" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/st-sch"><img src="https://avatars.githubusercontent.com/u/62374911?v=4?s=100" width="100px;" alt=""/><br /><sub><b>st-sch</b></sub></a><br /><a href="https://github.com/Skn0tt/datapact/issues?q=author%3Ast-sch" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/doetterl"><img src="https://avatars.githubusercontent.com/u/5360291?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jeremias Dötterl</b></sub></a><br /><a href="https://github.com/Skn0tt/datapact/issues?q=author%3Adoetterl" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
