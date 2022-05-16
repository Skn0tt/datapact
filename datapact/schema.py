from dataclasses import dataclass, field
from typing import Optional
from dataclasses_json import dataclass_json


@dataclass_json
@dataclass
class Expectation:
    name: str = None
    success: bool = True
    critical: bool = False
    message: Optional[str] = None
    args: dict = field(default_factory=dict)
    result: dict = field(default_factory=dict)

    @staticmethod
    def Fail(message: str, **kwargs):
        return Expectation(success=False, message=message, result=kwargs)

    @staticmethod
    def Pass(message: Optional[str] = None, **kwargs):
        return Expectation(success=True, message=message, result=kwargs)

    def _repr_markdown_(self):
        if self.success:
            return f"✅ {self.name}"
        return f"❌ {self.name}: {self.message}"


@dataclass_json
@dataclass
class SeriesResult:
    name: str
    title: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    expectations: "list[Expectation]" = field(default_factory=list)


@dataclass_json
@dataclass
class DataframeResult:
    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    series: "list[SeriesResult]" = field(default_factory=list)
