"""LLM provider abstraction built on LangChain."""

from abc import ABC, abstractmethod
from typing import ClassVar, Literal

from langchain_core.language_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from pydantic_settings import BaseSettings, SettingsConfigDict

# Reasoning effort levels for reasoning models
ReasoningEffort = Literal["low", "medium", "high"]


class LLMSettings(BaseSettings):
    """Settings for LLM providers loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # OpenAI settings
    openai_api_key: str | None = None
    openai_model: str = "gpt-5-mini"
    openai_reasoning_effort: ReasoningEffort = "medium"

    # Google Gemini settings
    google_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    gemini_reasoning_effort: ReasoningEffort = "medium"


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    def get_model(self) -> BaseChatModel:
        """Return the LangChain chat model instance.

        Returns:
            BaseChatModel: A LangChain chat model that supports:
                - .invoke() for simple completions
                - .with_structured_output() for typed Pydantic responses
                - .ainvoke() for async operations
        """
        ...

    @property
    @abstractmethod
    def name(self) -> str:
        """Return the provider name."""
        ...


class OpenAIProvider(LLMProvider):
    """OpenAI LLM provider using LangChain's ChatOpenAI."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        reasoning_effort: ReasoningEffort | None = None,
    ) -> None:
        """Initialize the OpenAI provider.

        Args:
            api_key: OpenAI API key. If None, uses OPENAI_API_KEY env var.
            model: Model name. Defaults to settings.
            reasoning_effort: Reasoning effort for reasoning models ('low', 'medium', 'high').
        """
        settings = LLMSettings()
        self._api_key = api_key or settings.openai_api_key
        self._model = model or settings.openai_model
        self._reasoning_effort = reasoning_effort or settings.openai_reasoning_effort

        if not self._api_key:
            raise ValueError(
                "OpenAI API key required. Set OPENAI_API_KEY env var or pass api_key."
            )

        # Configure model kwargs for reasoning models (o1, o3, gpt-5+)
        model_kwargs: dict[str, str] = {}
        if self._model.startswith(("o1", "o3", "gpt-5")):
            model_kwargs["reasoning_effort"] = self._reasoning_effort

        self._chat_model = ChatOpenAI(
            api_key=self._api_key,
            model=self._model,
            model_kwargs=model_kwargs if model_kwargs else None,
        )

    def get_model(self) -> BaseChatModel:
        """Return the ChatOpenAI model instance."""
        return self._chat_model

    @property
    def name(self) -> str:
        """Return the provider name."""
        return "openai"


class GeminiProvider(LLMProvider):
    """Google Gemini LLM provider using LangChain's ChatGoogleGenerativeAI."""

    # Map reasoning effort to Gemini thinking budget tokens
    _THINKING_BUDGET: ClassVar[dict[ReasoningEffort, int]] = {
        "low": 1024,
        "medium": 8192,
        "high": 24576,
    }

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        reasoning_effort: ReasoningEffort | None = None,
    ) -> None:
        """Initialize the Gemini provider.

        Args:
            api_key: Google API key. If None, uses GOOGLE_API_KEY env var.
            model: Model name. Defaults to settings.
            reasoning_effort: Reasoning effort for thinking models ('low', 'medium', 'high').
        """
        settings = LLMSettings()
        self._api_key = api_key or settings.google_api_key
        self._model = model or settings.gemini_model
        self._reasoning_effort = reasoning_effort or settings.gemini_reasoning_effort

        if not self._api_key:
            raise ValueError(
                "Google API key required. Set GOOGLE_API_KEY env var or pass api_key."
            )

        # Configure thinking budget for reasoning models (thinking models, gemini-3+)
        model_kwargs: dict[str, int] = {}
        if "thinking" in self._model or self._model.startswith("gemini-3"):
            model_kwargs["thinking_budget"] = self._THINKING_BUDGET[
                self._reasoning_effort
            ]

        self._chat_model = ChatGoogleGenerativeAI(
            google_api_key=self._api_key,
            model=self._model,
            **model_kwargs,
        )

    def get_model(self) -> BaseChatModel:
        """Return the ChatGoogleGenerativeAI model instance."""
        return self._chat_model

    @property
    def name(self) -> str:
        """Return the provider name."""
        return "gemini"


ProviderName = Literal["openai", "gemini"]


def get_provider(
    name: ProviderName,
    api_key: str | None = None,
    model: str | None = None,
    reasoning_effort: ReasoningEffort | None = None,
) -> LLMProvider:
    """Factory function to get an LLM provider by name.

    Args:
        name: Provider name ('openai' or 'gemini').
        api_key: Optional API key override.
        model: Optional model name override.
        reasoning_effort: Reasoning effort level ('low', 'medium', 'high').

    Returns:
        LLMProvider: The configured provider instance.

    Raises:
        ValueError: If the provider name is not supported.
    """
    providers: dict[ProviderName, type[LLMProvider]] = {
        "openai": OpenAIProvider,
        "gemini": GeminiProvider,
    }

    if name not in providers:
        raise ValueError(
            f"Unknown provider: {name}. Supported: {list(providers.keys())}"
        )

    return providers[name](
        api_key=api_key, model=model, reasoning_effort=reasoning_effort
    )
