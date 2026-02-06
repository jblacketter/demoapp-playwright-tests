"""
Browser factory singleton for Playwright lifecycle management.

Manages browser at feature level, fresh context/page per scenario.
"""
from typing import Optional
from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page, Playwright
from .config import Config
from .logger import get_logger

logger = get_logger(__name__)


class BrowserFactory:
    """Singleton browser factory managing Playwright lifecycle."""

    _instance: Optional["BrowserFactory"] = None

    def __new__(cls) -> "BrowserFactory":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return

        self._playwright: Optional[Playwright] = None
        self._browser: Optional[Browser] = None
        self._context: Optional[BrowserContext] = None
        self._page: Optional[Page] = None
        self._config = Config()
        self._initialized = True

    def initialize(self) -> None:
        """Initialize Playwright and launch browser."""
        if self._browser is not None:
            return

        logger.info(f"Launching {self._config.browser} browser (headless={self._config.headless})")

        self._playwright = sync_playwright().start()

        # Get browser launcher based on config
        browser_type = getattr(self._playwright, self._config.browser)

        self._browser = browser_type.launch(
            headless=self._config.headless,
            args=["--disable-blink-features=AutomationControlled"],
        )

    def new_context(self) -> BrowserContext:
        """Create a new browser context."""
        if self._browser is None:
            self.initialize()

        self._context = self._browser.new_context(
            viewport={
                "width": self._config.viewport_width,
                "height": self._config.viewport_height,
            },
            ignore_https_errors=True,
        )
        return self._context

    def new_page(self) -> Page:
        """Create a new page in a fresh context."""
        if self._context is None:
            self.new_context()

        self._page = self._context.new_page()
        self._page.set_default_timeout(self._config.default_timeout)
        return self._page

    def close_context(self) -> None:
        """Close current context (keeps browser for next scenario)."""
        if self._page is not None:
            try:
                self._page.close()
            except Exception:
                pass
            self._page = None

        if self._context is not None:
            try:
                self._context.close()
            except Exception:
                pass
            self._context = None

    def close(self) -> None:
        """Close browser and Playwright."""
        self.close_context()

        if self._browser is not None:
            try:
                self._browser.close()
            except Exception:
                pass
            self._browser = None

        if self._playwright is not None:
            try:
                self._playwright.stop()
            except Exception:
                pass
            self._playwright = None

        logger.info("Browser closed")

    @property
    def page(self) -> Optional[Page]:
        """Get current page."""
        return self._page

    @classmethod
    def reset(cls) -> None:
        """Reset singleton instance."""
        if cls._instance is not None:
            cls._instance.close()
        cls._instance = None
