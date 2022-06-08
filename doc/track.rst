Datapact Track
==============

*Datapact Track* is an optional, web-based UI that helps your team keep track of your datasets.
It keeps a history of your test runs + results; and automatically sends out emails if a test failed.

A public instance of Datapact Track is available at `track.datapact.dev <https://track.datapact.dev/>`_.
To self-host Datapact, use the provided Docker image:

.. code::
  
  docker run
    -d \
    --name=datapact_track \
    -e URL="https://track.yourorganisation.com" \ 
    -e DATABASE_URL="postgresql://user:password@host:5432/database" \
    -p 3000:3000 \ # serve behind a reverse proxy, e.g. caddy
    ghcr.io/skn0tt/datapact

After signing up for Datapact Track, either create a new organisation or ask your organisation owner to invite you:

.. figure:: /track_screenshot_org.png
  :height: 400px

  Organisation View.
  Shows the members of the organisation and a list of existing datasets.

Then create a "Dataset" and use the provided code snippet to connect your Python Script:

.. figure:: /track_screenshot_dataset.png
  :height: 400px

  Dataset View.
  Shows a code snippet for connecting your Python Script and a list of test runs.
  Allows connecting a notification email.