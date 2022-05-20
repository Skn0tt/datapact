build:
	cd track && npm run build:visualiser

bundle: build
	rm -rf dist
	python3 -m build

test-bundled: bundle
	cd $(mkdtemp -d); \
	python3 -m venv env; \
	source env/bin/activate; \
	pip install "$$(ls ${PWD}/dist/*.tar.gz)"; \
	cp "${PWD}/e2e-test.py" .; \
	python e2e-test.py
