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

income_df = pd.read_csv(
    "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv"
)

income_dp = datapact.test(income_df)
# income_dp.connect(server="datapact.services.netcheck.de", token="abcde")
income_dp.describe(title="Iris Dataset")

income_dp.sepal_width.describe(unit="$")
income_dp.sepal_width.should.be_between(3, 4)

income_dp.to_html()
