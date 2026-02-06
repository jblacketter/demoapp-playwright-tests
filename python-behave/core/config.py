"""
Configuration management singleton.

Loads environment variables from .env file and provides typed accessors.
"""
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv


class Config:
    """Singleton configuration manager."""

    _instance: Optional["Config"] = None

    def __new__(cls) -> "Config":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return

        # Find .env file (check python-behave dir first, then parent)
        env_paths = [
            Path(__file__).parent.parent / ".env",
            Path(__file__).parent.parent.parent / ".env",
        ]

        for env_path in env_paths:
            if env_path.exists():
                load_dotenv(env_path)
                break
        else:
            # Try .env.example as fallback (CI/CD)
            for env_path in env_paths:
                example_path = env_path.with_suffix(".env.example")
                if example_path.exists():
                    load_dotenv(example_path)
                    break

        self._initialized = True

    def get(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """Get environment variable value."""
        return os.getenv(key, default)

    def get_required(self, key: str) -> str:
        """Get required environment variable, raise if missing."""
        value = os.getenv(key)
        if value is None:
            raise ValueError(f"Required environment variable '{key}' is not set")
        return value

    def get_int(self, key: str, default: int = 0) -> int:
        """Get environment variable as integer."""
        value = os.getenv(key)
        if value is None:
            return default
        try:
            return int(value)
        except ValueError:
            return default

    def get_bool(self, key: str, default: bool = False) -> bool:
        """Get environment variable as boolean."""
        value = os.getenv(key, "").lower()
        if value in ("true", "1", "yes", "on"):
            return True
        if value in ("false", "0", "no", "off"):
            return False
        return default

    @property
    def base_url(self) -> str:
        """Application base URL."""
        return self.get("BASE_URL", "https://animated-gingersnap-8cf7f2.netlify.app")

    @property
    def username(self) -> str:
        """Test user username."""
        return self.get("USERNAME", "admin")

    @property
    def password(self) -> str:
        """Test user password."""
        return self.get("PASSWORD", "password123")

    @property
    def headless(self) -> bool:
        """Run browser in headless mode."""
        # Default to headless in CI
        default = bool(os.getenv("CI"))
        return self.get_bool("HEADLESS", default)

    @property
    def browser(self) -> str:
        """Browser type (chromium, firefox, webkit)."""
        return self.get("BROWSER", "chromium")

    @property
    def default_timeout(self) -> int:
        """Default timeout in milliseconds."""
        return self.get_int("DEFAULT_TIMEOUT", 30000)

    @property
    def viewport_width(self) -> int:
        """Browser viewport width."""
        return self.get_int("VIEWPORT_WIDTH", 1920)

    @property
    def viewport_height(self) -> int:
        """Browser viewport height."""
        return self.get_int("VIEWPORT_HEIGHT", 1080)

    @property
    def screenshot_dir(self) -> str:
        """Directory for failure screenshots."""
        return self.get("SCREENSHOT_DIR", "reports/screenshots")

    @classmethod
    def reset(cls) -> None:
        """Reset singleton instance (for testing)."""
        cls._instance = None
