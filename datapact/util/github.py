import re
import subprocess
from typing import Optional
from os import PathLike  # pylint: disable=unused-import


def get_github_url(cwd: "Optional[PathLike]" = None) -> Optional[str]:
    originUrlP = subprocess.run(
        ["git", "remote", "get-url", "origin"],
        check=False,
        capture_output=True,
        cwd=cwd,
    )
    if originUrlP.returncode != 0:
        return None

    originUrl = originUrlP.stdout.decode("utf-8").strip()
    match = re.search(r"git@github\.com:(.*)\/(.*)\.git", originUrl)
    if match is None:
        return None
    org = match.group(1)
    repo = match.group(2)

    refP = subprocess.run(
        ["git", "show", "-s", "--format=%H"],
        check=False,
        capture_output=True,
        cwd=cwd,
    )
    if refP.returncode != 0:
        return None

    ref = refP.stdout.decode("utf-8").strip()

    url = f"https://github.com/{org}/{repo}/tree/{ref}"

    isClean = (
        subprocess.run(
            ["git", "diff", "--exit-code"],
            check=False,
            capture_output=True,
            cwd=cwd,
        ).returncode
        == 0
    )
    if not isClean:
        url += "#dirty"

    return url
