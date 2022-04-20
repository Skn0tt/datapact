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
import datafox

datafox.connect(server="lynx.services.rki.de", api_key="abcde")

income_df = pd.read_csv("some_csv")

with datafox.test(income_df).describe(
    title="Income", description="Income description"
) as income:
    with income.age as age:
        age.expect_numbers()
        age.expect_between(0, 100)
    with income.salary as salary:
        salary.expect_numbers()
        salary.expect_not_null()
        salary.expect_between(0, "300k")
        salary.expect_normal(p=0.05, method="chi2")


## alternative, without with statements:
income_datafox = datafox.test(income_df)
income_datafox.describe(
    title="Income Distribution", description="Used for analyzing market changes"
)

## -- potentially: jupyter block end

income_datafox.age.describe(title="age of participants")
income_datafox.age.expect_numbers()
income_datafox.age.expect_between(0, 100)

## -- potentially: jupyter block end

income_datafox.salary.describe(unit="$")
income_datafox.salary.expect_numbers()
income_datafox.salary.expect_not_null()
income_datafox.salary.expect_between(0, "300k")
income_datafox.salary.expect_normal(alpha=0.05)
