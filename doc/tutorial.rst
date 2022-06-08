Tutorial
========

In this tutorial, we'll cover:

- how to get started with ``datapact`` in a Jupyter Notebook
- how to use built-in assertions
- what's the difference between ``.should`` and ``.must``
- how to write custom assertions
- how to use ``datapact`` in data pipelines

To start, set up a Jupyter notebook, install ``pandas`` and ``datapact``, load up the Iris Dataset, and create a new datapact test object:

TODO: replace all code snippets with jupyter images

.. code:: python

  #!pip install pandas datapact
  import pandas
  import datapact

  df = pandas.TODO_LOAD_IRIS
  dp = datapact.test(df)

I named the datapact test object ``dp`` as a shorthand for ``datapact``.
Let's write our first tests!

.. code:: python

  dp.SepalWidth.should.be_between(3, 4)

Let's dissect what's going on here:

- similar to DataFrames, ``dp.SepalWidth`` accessses the ``SepalWidth`` column of the dataset
- ``.should`` specifies the severity - ``.must`` is critical, ``.should`` only triggers warnings
- ``.be_between(3, 4)``: asserts column values to be in range ``[3, 4]``

The full statement can be read like a sentence: "The sepal width should be between 3 and 4.",
and in a Jupyter Notebook, a visual test result will be displayed.

Continue by writing some more tests. To see which expectations are available, either use your editor's
autocomplete or the :doc:`Expectation Reference <expectations>`.

If you're missing an expectation, you can write a custom one using ``.fulfil``:

.. code:: python

  def be_uniform(series: pandas.Series):
    if series.min() != series.max():
      return "found different values"

  dp.PetalWidth.should.fulfil(be_uniform) # Fail(be_uniform: found_different values)


After exploring your data and writing your tests in a Jupyter Notebook,
you can transfer them to a Python Script for usage in your data pipeline.
In the snippet below, the ``.check`` method is used to
throw an exception when there are failing critical expectations.

.. code:: python
  
  import pandas, datapact

  df = pandas.TODO_LOAD_CSV
  dp = datapact.test(df)

  def be_uniform(series: pandas.Series):
    if series.min() != series.max():
      return "found different values"

  dp.SepalWidth.should.be_between(3, 4)
  dp.SepalLength.must.be_between(5, 6)
  dp.PetalWidth.should.fulfil(be_uniform)

  dp.check() # 💥

Continue by reading through the :doc:`API Reference <api>` and :doc:`Expectation Reference <expectations>`.
For production-critical usecases, take a look at :doc:`Datapact Track <track>`.
