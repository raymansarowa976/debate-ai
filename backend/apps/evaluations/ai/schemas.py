from pydantic import BaseModel, ConfigDict, Field


class FallacyDetail(BaseModel):
    model_config = ConfigDict(strict=True)

    type: str
    explanation: str


class ScorecardSchema(BaseModel):
    model_config = ConfigDict(strict=True)

    logic: int = Field(ge=0, le=100)
    evidence: int = Field(ge=0, le=100)
    rhetoric: int = Field(ge=0, le=100)
    adherence: int = Field(ge=0, le=100)
    fallacies_detected: list[FallacyDetail]
