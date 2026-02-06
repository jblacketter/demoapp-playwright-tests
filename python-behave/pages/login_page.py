"""
Login page object.

Handles authentication flows for the demo application.
"""
from playwright.sync_api import Page
from .base_page import BasePage
from core.logger import get_logger

logger = get_logger(__name__)


class LoginPage(BasePage):
    """Page object for the login page."""

    # Selectors
    USERNAME_INPUT = 'input[id="username"]'
    PASSWORD_INPUT = 'input[id="password"]'
    LOGIN_BUTTON = 'button[type="submit"]'
    ERROR_MESSAGE = '[class*="error"], [class*="alert"], [role="alert"]'

    @property
    def url_path(self) -> str:
        return "/"

    def login(self, username: str, password: str) -> "LoginPage":
        """
        Perform login with given credentials.

        Args:
            username: Login username
            password: Login password

        Returns:
            Self for method chaining
        """
        logger.info(f"Logging in as {username}")

        self.fill(self.USERNAME_INPUT, username)
        self.fill(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)

        return self

    def login_as_default_user(self) -> "LoginPage":
        """Login with default credentials from config."""
        return self.login(self.config.username, self.config.password)

    def is_logged_in(self) -> bool:
        """Check if user is logged in (sidebar visible)."""
        # After login, sidebar with projects should be visible
        return self.is_visible('[class*="sidebar"]', timeout=5000) or \
               self.is_visible('nav', timeout=5000)

    def has_error(self) -> bool:
        """Check if login error is displayed."""
        return self.is_visible(self.ERROR_MESSAGE, timeout=2000)

    def get_error_message(self) -> str:
        """Get error message text."""
        if self.has_error():
            return self.get_text(self.ERROR_MESSAGE)
        return ""

    def is_on_login_page(self) -> bool:
        """Check if still on login page."""
        return self.is_visible(self.LOGIN_BUTTON, timeout=2000)
