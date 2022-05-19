bundle:
	rm -rf dist
	cd track && npm run build:visualiser
	python3 -m build

test-bundled: bundle
	cd $(mkdtemp -d); \
	python3 -m venv env; \
	source env/bin/activate; \
	pip install "$$(ls ${PWD}/dist/*.tar.gz)"; \
	cp "${PWD}/example.py" .; \
	python example.py
