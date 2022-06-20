---
title: "datapact: a library for checking assumptions on Python DataFrames"
tags:
  - python
  - pandas
  - data
  - dataframes
  - verification
  - workflow
authors:
  - name: Simon Knott
    orcid: 0000-0002-4852-3738
    affiliation: 1
  - name: Fabio Malcher Miranda
    orcid: 0000-0002-6823-5995
    affiliation: 1
  - name: Ferdous Nasri
    orcid: 0000-0003-2018-4786
    affiliation: 1
  - name: Bernhard Y. Renard
    orcid: 0000-0003-4589-9809
    affiliation: 1
affiliations:
  - name: DACS Chair, HPI, Digital Engineering Faculty, University of Potsdam, Potsdam, Germany
    index: 1
date: 30 June 2022
bibliography: paper.bib
---

# Summary

It is crucial to have a good understanding of the datasets that are being worked with. For static datasets, users can explore them once, and document their findings for other team members to consume.
For frequently changing datasets, this is not enough.
After exploring, analysing and documenting it once, an understanding needs to be continously verified to be up-to-date, and adjusted it when it's not.
To address these problems, we developed `datapact`, a Python library that provides an ergonomic API for running assertions on DataFrames.

# Statement of need

When working with continually changing datasets, e.g. occupancy statistics for intensive care units during a pandemic, dataset shift (@moreno2012unifying) will occur frequently.
Sometimes because of human errors in data entry, sometimes because of bugs, errors or outages in the data delivery, and sometimes because there are changes in the underlying data.
If these changes stay unnoticed, they can make their way into subtle bugs, faulty visualisations and ultimately lead to mislead decisions.
The faster they're noticed, the faster analysis scripts, dashboards and data pipelines can be updated. TODO: citatation needed

Without dedicated systems to detect them, changes can often go unnoticed for months.
`datapact` enables such a system to be built easily, so changes are noticed as the data comes in.
It is a Python library for expressing + verifying characteristics on DataFrames, and can be embedded right within the Python scripts and Jupyter notebooks that are already being used for analysis.
Different tests are needed, both simple sanity checks ("the ICU patient's age should be between 0 and 150") and more complex characteristics ("the age should be normal distributed").
Specialized tests should be easily addable via custom code.

Great Expectations (@Gong_Great_Expectations) is an existing framework that addresses these issues via Pipeline Tests. It can be hard to learn and hard to set up, especially for non-engineering-heavy organisations.

`datapact` is designed to be used by researchers, industry data scientists and data engineers alike.
For teams there's `Datapact Track`: the optional web-app that tracks test results, and notifies about failures via E-Mail, Slack, MicroSoft Teams or PagerDuty.

# Method

The pain points around continous data verification were identified by the author during a research project involving continously surveyed mobility data.
These were validated via qualitative interviews across a variety of research and industry organisations.
After evaluating prior art, the idea of an assertion library was identified as a potential solution to the problem.
To ensure that `datapact`'s developer-facing API is intuitive + ergonomic to use, the authors performed informal experiments where developers without prior knowledge about the problem were asked to explain what they think a given `datapact` snippet did.

potential TODO: mention design, implementation, unit tests, code coverage, CI, CD, documentation ...
Question to reviewers: would this be valuable? Fabio recommended this, but I'm unsure if it's interesting or bloaty.

# Comparison to Other Tools

The problem of improving data quality is addressed by various solutions, which can be divided
into two distinct groups.

The first group is made of libraries and frameworks that can be integrated into existing pipelines and workflows.
They typically implement a concept that Great Expectations (@Gong_Great_Expectations) calls "Pipeline Tests".
Similar to how unit tests are used to ensure code behaviour,
pipeline tests ensure that the data being processed matches the analysis' requirements.

The second group of solutions are standalone services that directly connect to datasources.
These are often proprietary, and distributed as software-as-a-service.
They typically connect directly to a data warehouse (most support Snowflake, Redshift and BigQuery), do semi-automatic data monitoring and tracking, and alert via Slack or Email when they find an anomaly.
They are geared more towards industry applications than research.
Their common pitch being "being datadog for data", they aim to prevent data pipelines from breaking, and not so much at spotting subtle changes in the data.
Compared to `datapact`, they are easier to set up, but very limited in the types of errors they can catch.
Documentation is not in scope for them.

Summary table:

|            | datapact       | Great Expectations                    | Monte Carlo           | Exploratory Thingy |
| ---------- | -------------- | ------------------------------------- | --------------------- | ------------------ |
| it's a ... | Python Library | Framework with upcoming Cloud Product | Cloud Product         | TODO:              |
| aimed at   | Research,      | data engineering orgs                 | data engineering orgs | research           |

# Acknowledgements

We acknowledge contributions from the author's coworkers at Netlify, especially Laurie Voss, NetCheck's Team, TODO: add rest of people i talked to.

# References
