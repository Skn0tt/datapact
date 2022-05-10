const fs = require("fs/promises");
const child_process = require("child_process");
const path = require("path");

module.exports = async () => {
  const excludedFiles = ["ExpectationProtocol.py", "__init__.py"];
  const expectationFiles = await fs.readdir("../datafox/expectations");
  const pythonFiles = expectationFiles.filter(
    (file) => file.endsWith(".py") && !excludedFiles.includes(file)
  );

  return await Promise.all(
    pythonFiles.map(async (fileName) => {
      const className = path.basename(fileName, ".py");
      const pythonScript = `
import json

from datafox.expectations.${className} import ${className}

methods = [
  method for method in ${className}.__dict__.keys()
  if method.replace("_", "") == "${className}".lower()
]
method = methods[0]

docstring = ${className}.__dict__[method].__doc__

output = {
  "docstring": docstring,
  "method": method
}

print(json.dumps(output))`;
      const ouputJSON = child_process
        .execSync("python3", {
          input: pythonScript,
          cwd: "../",
        })
        .toString("utf-8");
      const { docstring, method } = JSON.parse(ouputJSON);
      return {
        name: method,
        docstring,
        path: `datafox/expectations/${fileName}`,
        className,
        signature:
          "def be_between(self, minimum: float, maximum: float) -> None:",
      };
    })
  );
};
