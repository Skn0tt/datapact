Getting Started
===============

``datapact`` can be installed via ``pip``:

.. code:: sh

   pip install datapact

Import it in your Python Script or Jupyter Notebook, call ``datapact.test`` to create a test suite,
and write your first assertions:

.. code:: python

   import pandas as pd
   import datapact

   df = pd.read_csv("titanic.csv")
   dp = datapact.test(df)

   dp.PassengerId.must.be_positive()
   dp.PassengerId.must.be_unique()
   dp.PassengerId.must.be_integer()

   dp.Survived.must.be_one_of(0, 1)

   dp.Name.must.not_be_empty()

   dp.Age.must.be_positive()
   dp.Age.should.be_normal()
   dp.Age.must.be_integer() # fails, Mr. Mansouer is 28.5 y/o!

For a full list of available expectations, check the :doc:`expectations`.
