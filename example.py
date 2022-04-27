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

datafox.connect(server="datafox.services.netcheck.de", api_key="abcde")

income_df = pd.read_csv("some_csv")

with datafox.test(income_df).describe(
    title="Income", description="Income description"
) as income:
    with income.age as age:
        age.should.be_numbers()
        age.should.be_between(0, 100)
    with income.salary as salary:
        salary.should.be_numbers()
        salary.should_not.contain_null()
        salary.should.be_between(0, "300k")
        salary.should.be_normal(alpha=0.05)


income_datafox = datafox.test(income_df)
income_datafox.describe(
    title="Income Distribution", description="Used for analyzing market changes"
)


income_datafox.age.describe(title="age of participants")
income_datafox.age.should.be_numbers()
income_datafox.age.should.be_between(0, 100)

income_datafox.salary.describe(unit="$")
income_datafox.salary.should.be_numbers()
income_datafox.salary.should_not.contain_null()
income_datafox.salary.should_not.be_between(0, "300k")
income_datafox.salary.should.be_between(0, "300k")
income_datafox.salary.should.be_normal(alpha=0.05)
income_datafox.salary.must.be_normal(alpha=0.05)


datafox.generate_report("./report.pdf")
