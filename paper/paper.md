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

The problem of improving data quality is addressed by various solutions, which can be divided
into two distinct groups:

1. libraries and frameworks that are integrated into existing pipelines and workflows
2. standalone services that directly connect to your datasources, often distributed as software-as-a-service

Especially the second category has seen a recent increase in products being developed,
mostly backed by venture capital.
This is likely caused by the growing relevance of data engineering to business contexts.

## Libraries and Frameworks

These tools are used to implement a concept that
[Great Expectations](#great-expectations) calls "Pipeline Tests".
Similar to how unit tests are used to ensure code behaviour,
pipeline tests ensure that the data being processed matches the analysis' requirements.

All of the below-listed tools are open-source and
can be implemented without contract negotiation or sales intervention.

### Great Expectations

Great Expectations is a framework for pipeline tests.
It was [introduced in 2018](https://greatexpectations.io/blog/down-with-pipeline-debt-introducing-great-expectations/) and used by the likes of GitHub, Delivery Hero and ING.

At the time of writing, it comes with [a library](https://greatexpectations.io/expectations/) of 52 core Expectations such as `expect_column_mean_to_be_between` or `expect_table_row_count_to_equal`,
which users combine to form an _Expectation Suite_.
Executing an _Expectation Suites_ on a _Datasource_ (pandas, spark, and almost all relational databases are supported) outputs a _Validation Result_.
In addition to test results, this contains useful information such as summary statistics and distribution histograms, and can be used as data documentation.

Great Expectations is developed by [Superconductive](https://superconductive.ai), a company that pivoted from data engineering for healthcare to focusing fully on Great Expectations.
The framework itself is free and open-source, and the venture-backed company is in the process of
building an accompanying SaaS product called "Great Expectations Cloud".

Great Expectations is much more mature than `datapact`. This manifests not only in an extensive list of
built-in expectations, but also in the available integrations to tools like Meltano, Airflow or Slack.
Compared to the SaaS products mentioned below, it requires more setup, but is flexible enough to be adapted to custom workflows.
Especially for non-engineering-heavy organisations, the custom jargon (Data Context, Checkpoint, Batch Request, ...)
can make for a steep learning curve.

### TDDA

TDDA is short for "Test-Driven Data Analysis" and is developed by [Stochastic Solutions](https://www.stochasticsolutions.com), a Edinburgh-based data analysis consultancy.
It's a research-heavy project that consists of four sub-projects, of which `tdda.constraints`
can be used for similar purposes as `datapact`.

`tdda.constraints` works on CSV files and can verify the following constraints:

- type (bool, int, real, string, date)
- value range (min / max)
- min/max string length
- value sign (positive, negative, ...)
- maximum number of null values
- uniqueness
- allowed values

Compared to `datapact`, it has a small number of supported constraints, does not output any human-readable documentation,
and does not integrate well with Jupyter Notebooks.
It does, however, have a data profiler that seems useful for setting up an initial expectation suite.

## Standalone Services

The following tools all work very similar:
They are commercial Software-as-a-Service offerings that connect directly to your data warehouse (all support Snowflake, Redshift and BigQuery), do semi-automatic data monitoring and tracking, and alert via Slack or Email when
they find an anomaly.

Typically geared more towards industry applications than research, their common pitch is "being datadog for data", and they aim to prevent data pipelines from breaking.
Compared to `datapact`, they are easier to set up, but very limited in the types of errors they can catch.
Documentation is not in scope for them.

### Monte Carlo

Monte Carlo (https://www.montecarlodata.com) describes itself with the tagline "Data Reliability Delivered.".
It monitors freshness, volume and schema changes to all tables.
Anomaly detection is performed using machine learning, which can make it hard to predict how the tool works.
For usecases where SaaS-usage is prohibited, e.g. because of data privacy requirements,
hybrid deployments are only supported on AWS, ruling Monte Carlo out for a lot of research usecases.

Monte Carlo features ready-made integrations for orchestrators like AirFlow, allowing you to build custom-made
workflows e.g. for verifying pull requests.

### Metaplane

Metaplane (https://metaplane.dev) has the literal tagline "The Datadog for data".

Similar to Monte Carlo, it connects to a data warehouse and performs anomaly detection
on metrics like row and column count, data freshness, uniqueness, distribution, or custom SQL-based metrics.
Anomalies are alerted via the Slack integration, and allow data engineers to give model feedback to train it better.

Metaplane, like Montecarlo, is not available for on-premise hosting.

### BigEye

In addition to the common data ware houses, BigEye also connects to systems like Presto, SAP, Oracle and Rockset.
Apart from data freshness, volume (row number, nullability, uniqueness ...) and summary statistics, it can
verify a column's data format (UUID, zip codes, ...).
It tracks data freshness, volume (), format (UUID, zip codes, ...) and summary
statistics, and performs basic outlier detection.
Compared to the other tools, BigEye seems to be the most lacking feature-wise.

### Datafold

Datafold is

- Datafold
  - in a dbt+PR-based workflow, datafold does monitoring + CI reporting on PRs
  - connects to your database to alert on SQL-pulled scalars
  - can be deployed On Prem

Summary table:

|            | datapact       | Great Expectations                    | Monte Carlo           | Exploratory Thingy |
| ---------- | -------------- | ------------------------------------- | --------------------- | ------------------ |
| it's a ... | Python Library | Framework with upcoming Cloud Product | Cloud Product         | TODO:              |
| aimed at   | Research,      | data engineering orgs                 | data engineering orgs | research           |

# Acknowledgements

We acknowledge contributions from the author's coworkers at Netlify, especially Laurie Voss, NetCheck's Team, TODO: add rest of people i talked to.
