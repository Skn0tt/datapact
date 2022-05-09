
from dataclasses import dataclass, field
from typing import Optional
from dataclasses_json import dataclass_json


@dataclass_json
@dataclass
class Line:
    """
    demo docstring
    """

    type: str
    success: bool = True
    critical: bool = False
    message: Optional[str] = None
    meta: dict = field(default_factory=dict)

    def fail(self, message: str):
        self.success = False
        self.message = message


@dataclass_json
@dataclass
class SeriesTestEvaluationResult:
    """
    demo docstring
    """

    name: str
    title: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    lines: "list[Line]" = field(default_factory=list)


@dataclass_json
@dataclass
class DataframeTestEvaluationResult:
    """
    demo docstring
    """

    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    series: "list[SeriesTestEvaluationResult]" = field(default_factory=list)
