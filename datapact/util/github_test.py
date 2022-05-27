import subprocess
from pathlib import Path
from .github import get_github_url


def test_get_github_url(tmp_path: Path):
    subdir_without_git = tmp_path / "subdir_without_git"
    subdir_without_git.mkdir()
    assert get_github_url(cwd=subdir_without_git) is None

    subdir_with_git = tmp_path / "subdir_with_git"
    subdir_with_git.mkdir()
    subprocess.call(["git", "init"], cwd=subdir_with_git)
    assert get_github_url(cwd=subdir_with_git) is None

    subprocess.call(
        ["git", "remote", "add", "origin", "git@gitlab.com"],
        cwd=subdir_with_git,
    )
    assert get_github_url(cwd=subdir_with_git) is None  # only supports github for now

    subprocess.call(
        ["git", "remote", "set-url", "origin", "git@github.com:test/test.git"],
        cwd=subdir_with_git,
    )
    assert get_github_url(cwd=subdir_with_git) is None

    subprocess.call(
        [
            "git",
            "config",
            "--local",
            "user.email",
            "bot@datapact.dev",
        ],
        cwd=subdir_with_git,
    )
    subprocess.call(
        [
            "git",
            "config",
            "--local",
            "user.name",
            "Test Bot",
        ],
        cwd=subdir_with_git,
    )

    subprocess.call(
        ["git", "commit", "--allow-empty", "-m", "init"],
        cwd=subdir_with_git,
    )
    url = get_github_url(cwd=subdir_with_git)
    assert url is not None
    assert url.startswith("https://github.com/test/test/tree/")
