---
title: "datapact: An assertion library for Python Dataframes"
tags:
  - Python
  - data
  - dataframes
  - verification
  - workflow
authors:
  - name: Simon Knott
    orcid: 123 # todo: add
    affiliation: 1 # todo: should we list netlify here?
  # todo: add other authors
affiliations:
  - name: DACS Chair, Hasso Plattner Institue, Germany
    index: 1
date: 30 June 2022
bibliography: paper.bib
---

# Summary

It is crucial to have a good understanding of the datasets you're working with. For static datasets, you can explore it once, and document your findings for other team members to consume.
For frequently changing datasets, this is not enough. After exploring, analysing and documenting it once, you need to continously verify your understanding is up-to-date, and update it when it's not.
`datapact` is a Python library that allows you to do just that, by providing an ergonomic API to run assertions on DataFrames.

# Statement of need

When working with continually changing datasets, e.g. occupancy stats for intensive care units, data will change frequently.
Sometimes because of human errors in data entry, sometimes because of bugs, errors or outages in the data delivery, and sometimes because there are changes in the underlying data.
If these changes stay unnoticed, they can become serious problems.
The faster you notice them, the faster you can update your analysis scripts, dashboards and data pipelines.

Without dedicated systems to detect them, changes can often go unnoticed for months!

`datapact` allows you to easily build such a system, so you notice changes as the data comes in.
It is a Python library for expressing + verifying characteristics on DataFrames, and can be embedded right within the Python scripts and Jupyter notebooks you already use for analysis.
With X (TODO) different assertions built in, both for simple sanity checks ("the ICU patient's age should be between 0 and 150") and for more complex characteristics ("the age should be normal distributed"), a lot of the common tests are already there.
Specialized tests can be added easily in your own code.

`datapact` is designed to be used by researchers, industry data scientists and data engineers alike.
If you're working in a team, there's `Datapact Track`: the optional web-app allows you to track test results.
When critical assertions fail, it notifies you via E-Mail, Slack, Teams or PagerDuty.

# Method

The pain points around continous data verification were identified by the author during a research project involving continously surveyed mobility data.
These were validated via qualitative interviews across several research + industry organisations (RKI, NetCheck, Great Expecations, Netlify, TODO: make full list).
After evaluating prior art (especially Great Expectations), the idea of an assertion library was identified as a potential solution to the problem.
To ensure that `datapact`'s developer-facing API is intuitive + ergonomic to use, the author performed (informal) experiments where developers without prior knowledge about the problem were asked to explain what they think a given `datapact` snippet did.

# Comparison to Other Tools

`datapact` implements a concept that _Great Expectations_ calls "Pipeline Tests".
As opposed to unit tests, which run at development time, Pipeline Tests run while data is flowing in.

- datapact is easy to integrate with your existing code
- you can put it into your jupyter notebooks

- great expectations
  - connects to Postgres / Snowflake / ... directly, running expectations on the data
  - is way harder to use, more jargon
  - very hard to get started with
- Monte Carlo
  - geared towards data engineering. does some limited tests really well (data missing, average moving, ...)
  - only for snowflake & co
  - only cloud-hosted
- this other tool I found which is datadog for sql
  - only for snowflake & co
  - only cloud-hosted
- Exploratory Thingy
  - TODO: find out what it does differently!

Summary table:

|            | datapact       | Great Expectations                    | Monte Carlo           | Exploratory Thingy |
| ---------- | -------------- | ------------------------------------- | --------------------- | ------------------ |
| it's a ... | Python Library | Framework with upcoming Cloud Product | Cloud Product         | TODO:              |
| aimed at   | Research,      | data engineering orgs                 | data engineering orgs | research           |

# Acknowledgements

We acknowledge contributions from the author's coworkers at Netlify, especially Laurie Voss, NetCheck's Team, TODO: add rest of people i talked to.
