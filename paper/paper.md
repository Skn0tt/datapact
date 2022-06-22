---
title: "datapact: a Python library for checking assumptions on DataFrames"
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
  - name: Hasso-Plattner-Institute for Digital Engineering, Digital Engineering Faculty, University of Potsdam, Potsdam, Germany
    index: 1
date: 30 June 2022
bibliography: paper.bib
---

# Summary

It is crucial to have a good understanding of the datasets that are being worked with. For static datasets, users can explore the dataset once, and document their findings for other team members to consume.
For frequently changing datasets, this may not be sufficient.
After exploring, analysing and documenting it once, an understanding needs to be continously verified to be up-to-date, and adjusted when it is not.
To address these problems, we developed `datapact`, a Python library that provides an ergonomic API for running assertions on DataFrames.

`datapact` is available under MIT license and available at https://github.com/skn0tt/datapact.

# Statement of need

When working with continually changing datasets, e.g. occupancy statistics for intensive care units during a pandemic, dataset shift (@moreno2012unifying) will occur frequently.
Sometimes because of human errors in data entry, sometimes because of bugs, errors or outages in the data delivery, and sometimes because there are changes in the underlying data.
If these changes stay unnoticed, they can make their way into subtle bugs, faulty visualisations and ultimately lead to suboptimal decisions.
The faster they get noticed, the faster analysis scripts, dashboards and data pipelines can be updated.

Without dedicated systems to detect them, changes can often go unnoticed for months.
`datapact` enables such a system to be built easily, so changes are noticed as the data comes in.
It is a Python library for expressing and verifying characteristics on DataFrames, and can be embedded right within the Python scripts and Jupyter notebooks that are already being used for analysis.
Different tests are needed, both simple sanity checks ("the patient's age should be between 0 and 125") and more complex characteristics ("the age should be normally distributed").
More specialized tests can easily be added via custom code.

Exisitng projects addressing this need (e.g. Great Expectations (@Gong_Great_Expectations)) come with comparatively high entrance hurdles that are hard to overcome, particularly for non engineering heavy organisations.

With `datapact`, we provide an easily usable library that is designed to be used by researchers, industry data scientists and, data engineers alike.
For teams there is `Datapact Track`: the optional web-app that tracks test results, and notifies about failures via E-Mail, Slack, Microsoft Teams, or PagerDuty.

# Method

Qualitative interviews across a variety of research and industry organisations were conducted to learn about the problem of unnoticed dataset shift.
After evaluating prior art, the idea of an assertion library was identified as a potential solution to the problem.
To ensure that `datapact`'s developer-facing API is intuitive + ergonomic to use, the authors performed informal experiments where developers without prior knowledge about the problem were asked to explain what they think a given `datapact` snippet did.

To ensure high code quality, `datapact` maintains 100% code coverage via unit tests, automatically executed by our continuous integration.
Code style is linted via pylint (@pylint), pyright (@pyright) and Prettier (@prettier).
Documentation is auto-generated from docstrings (@goodger2010docstring).

# Comparison to Other Tools

The problem of improving data quality is addressed by various solutions, which can be divided
into two distinct groups.

The first group is made of libraries and frameworks that can be integrated into existing pipelines and workflows.
They typically implement a concept that `Great Expectations` (@Gong_Great_Expectations) calls "Pipeline Tests".
Similar to how unit tests are used to ensure code behaviour,
pipeline tests ensure that the data being processed matches the analysis' requirements.
Examples of this group are `Great Expectations`, `TDDA` (@tdda) or `datapact`.

The second group of solutions are standalone services that directly connect to datasources.
These are often proprietary, and distributed as software-as-a-service.
They typically connect directly to a data warehouse (most support Snowflake, Redshift and BigQuery), do semi-automatic data monitoring and tracking, and alert via Slack or Email when they find an anomaly.
They are geared more towards industry applications than research.
Their common pitch being "being datadog for data", they aim to prevent data pipelines from breaking, and not so much at spotting subtle changes in the data.
Compared to `datapact`, they are easier to set up, but very limited in the types of errors they can catch.
Documentation is not in scope for them.
Examples of this group are Monte Carlo (@montecarlo), Metaplane (@metaplane) or BigEye (@bigeye).

# Potential Enhancements

`datapact` is usable, however there is always room for further development.
One of these improvements would be more _built-in assertions_, extending `datapact` to more application areas out-of-the-box. This could be general statistical tests, but also assertions on domain-specific datatypes like geocoordinates, addresses, currencies or IP addresses.
Adding support for _dataset segmentation_ would allow asserting on a subset of the data, allowing more granular tests.
Furthermore, enabling _multi-variable tests_ over multiple colums would allow for tests for e.g. correlation or relational integrity.

# Acknowledgements

We acknowledge contributions from the author's coworkers at Netlify, NET CHECK's Team, Robert Koch Institute,
and other participants that brought invaluable perspectives to the research interviews.

# References
