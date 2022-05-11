"""
Idea 1: using python contexts as closure for describing & structuring
potential downsides: data science people don't know "with" statement
upside: easy structure
would allow running "upload" at the end of "with" statement

assumptions behind design:
- there's a typescript-like way of doing type suggestions
- imperative with side-effects is easier for small scripts
- with statements are useful for scripts, imperative variables are good for notebooks
- named arguments + right ordering make stuff explorable
"""

import pandas as pd
import datapact

income_df = pd.read_csv("some_csv")

with datapact.test(income_df).describe(
    title="Income", description="Income description"
) as income:
    income.connect(server="datapact.services.netcheck.de", token="abcde")
    with income.age as age:
        age.should.be_between(0, 100)
    with income.salary as salary:
        salary.should.be_between(0, 300000)
        salary.should.be_normal(alpha=0.05)


income_dp = datapact.test(income_df)
income_dp.connect(server="datapact.services.netcheck.de", token="abcde")
income_dp.describe(
    title="Income Distribution", description="Used for analyzing market changes"
)

income_dp.age.describe(title="age of participants")
income_dp.age.should.be_between(0, 100)

income_dp.salary.describe(unit="$")
income_dp.salary.should.be_between(0, 300000)
income_dp.salary.should.be_normal(alpha=0.05)
income_dp.salary.must.be_normal(alpha=0.05)
