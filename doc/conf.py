"""
Configuration file for the Sphinx documentation builder.
"""

# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.

import os
import sys
import configparser

sys.path.insert(0, os.path.abspath("../"))


# -- Project information -----------------------------------------------------

project = "datapact"
copyright = "2022, Simon Knott"  # pylint: disable=redefined-builtin
author = "Simon Knott"

config = configparser.ConfigParser()
config.read(r"../setup.cfg")
release = config.get("metadata", "version")

root_doc = "contents"


# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    "sphinx.ext.coverage",
    "sphinx.ext.autodoc",
    "sphinx.ext.autosummary",
    "sphinx.ext.napoleon",
    "myst_parser",
]

autodoc_member_order = "bysource"


# Add any paths that contain templates here, relative to this directory.
templates_path = ["_templates"]

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
html_theme = "furo"
html_title = f"{project} <span style='font-size: 0.7em'>{release}</span>"
html_theme_options = {
    "source_repository": "https://github.com/skn0tt/datapact/",
    "source_branch": "main",
    "source_directory": "doc/",
}

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ["_static"]
html_js_files = [
    "hypothesis.js",
    "github_link.js",
    "logo_link.js",
]
