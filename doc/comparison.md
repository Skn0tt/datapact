# Comparison

The problem of improving data quality is addressed by various solutions, which can be divided
into two distinct groups:

1. libraries and frameworks that are integrated into existing pipelines and workflows
2. standalone services that directly connect to datasources, often distributed as software-as-a-service

Especially the second category has seen a recent increase in products being developed,
mostly backed by venture capital.
This is likely caused by the growing relevance of data engineering to business contexts.

## Libraries and Frameworks

These tools are used to implement a concept that
[Great Expectations](great-expectations) calls "Pipeline Tests".
Similar to how unit tests are used to ensure code behaviour,
pipeline tests ensure that the data being processed matches the analysis' requirements.

All of the below-listed tools are open-source and
can be implemented without contract negotiation or sales intervention.

(great-expectations)=

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
They are commercial Software-as-a-Service offerings that connect directly to data warehouses (all support Snowflake, Redshift and BigQuery), do semi-automatic data monitoring and tracking, and alert via Slack or Email when
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

Monte Carlo features ready-made integrations for orchestrators like AirFlow, enabling custom-made
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

Summary table:

|            | datapact       | Great Expectations                    | Monte Carlo           | Exploratory Thingy |
| ---------- | -------------- | ------------------------------------- | --------------------- | ------------------ |
| it's a ... | Python Library | Framework with upcoming Cloud Product | Cloud Product         | TODO:              |
| aimed at   | Research,      | data engineering orgs                 | data engineering orgs | research           |
