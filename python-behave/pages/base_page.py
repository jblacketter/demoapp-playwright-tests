"""
Base page object with common methods.

All page objects inherit from this class.
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from playwright.sync_api import Page, Locator, expect
from core.config import Config
from core.logger import get_logger

logger = get_logger(__name__)


class BasePage(ABC):
    """Abstract base page providing common page interactions."""

    def __init__(self, page: Page) -> None:
        self.page = page
        self.config = Config()

    @property
    @abstractmethod
    def url_path(self) -> str:
        """URL path for this page (relative to base_url)."""
        pass

    def navigate(self) -> "BasePage":
        """Navigate to this page."""
        url = f"{self.config.base_url.rstrip('/')}{self.url_path}"
        logger.info(f"Navigating to {url}")
        self.page.goto(url)
        return self

    # --- Element Interactions ---

    def click(self, selector: str) -> "BasePage":
        """Click an element."""
        self.page.click(selector)
        return self

    def fill(self, selector: str, value: str) -> "BasePage":
        """Fill an input field."""
        self.page.fill(selector, value)
        return self

    def get_text(self, selector: str) -> str:
        """Get text content of an element."""
        return self.page.locator(selector).text_content() or ""

    def get_texts(self, selector: str) -> List[str]:
        """Get text content of all matching elements."""
        locators = self.page.locator(selector)
        return [loc.text_content() or "" for loc in locators.all()]

    def is_visible(self, selector: str, timeout: int = 5000) -> bool:
        """Check if element is visible."""
        try:
            self.page.locator(selector).wait_for(state="visible", timeout=timeout)
            return True
        except Exception:
            return False

    def is_hidden(self, selector: str, timeout: int = 5000) -> bool:
        """Check if element is hidden or not present."""
        try:
            self.page.locator(selector).wait_for(state="hidden", timeout=timeout)
            return True
        except Exception:
            return False

    # --- Wait Helpers ---

    def wait_for_element(self, selector: str, timeout: Optional[int] = None) -> Locator:
        """Wait for element to be visible."""
        timeout = timeout or self.config.default_timeout
        locator = self.page.locator(selector)
        locator.wait_for(state="visible", timeout=timeout)
        return locator

    def wait_for_text(self, text: str, timeout: Optional[int] = None) -> None:
        """Wait for text to appear on page."""
        timeout = timeout or self.config.default_timeout
        self.page.get_by_text(text).wait_for(state="visible", timeout=timeout)

    def wait_for_url(self, url_pattern: str, timeout: Optional[int] = None) -> None:
        """Wait for URL to match pattern."""
        timeout = timeout or self.config.default_timeout
        self.page.wait_for_url(url_pattern, timeout=timeout)

    def wait_for_load_state(self, state: str = "networkidle") -> None:
        """Wait for page load state."""
        self.page.wait_for_load_state(state)

    # --- Assertions ---

    def assert_visible(self, selector: str, message: Optional[str] = None) -> "BasePage":
        """Assert element is visible."""
        expect(self.page.locator(selector)).to_be_visible()
        return self

    def assert_text_visible(self, text: str) -> "BasePage":
        """Assert text is visible on page."""
        expect(self.page.get_by_text(text)).to_be_visible()
        return self

    def assert_url_contains(self, substring: str) -> "BasePage":
        """Assert current URL contains substring."""
        expect(self.page).to_have_url(f"*{substring}*")
        return self

    # --- Screenshots ---

    def take_screenshot(self, path: str) -> "BasePage":
        """Take a screenshot."""
        self.page.screenshot(path=path, full_page=True)
        logger.info(f"Screenshot saved: {path}")
        return self
