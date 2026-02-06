"""
Behave hooks for test lifecycle management.

Handles browser lifecycle, authentication, and screenshot capture on failure.
"""
import os
from datetime import datetime
from behave import fixture, use_fixture
from behave.runner import Context
from behave.model import Feature, Scenario

from core.config import Config
from core.browser_factory import BrowserFactory
from core.logger import get_logger
from pages.login_page import LoginPage

logger = get_logger(__name__)


def before_all(context: Context) -> None:
    """Initialize framework before all tests."""
    logger.info("=" * 60)
    logger.info("Python Behave Test Framework Starting")
    logger.info("=" * 60)

    # Initialize config singleton
    context.config_manager = Config()

    # Create report directories
    screenshot_dir = context.config_manager.screenshot_dir
    os.makedirs(screenshot_dir, exist_ok=True)


def before_feature(context: Context, feature: Feature) -> None:
    """Initialize browser for the feature."""
    logger.info(f"Feature: {feature.name}")

    # Initialize browser factory
    context.browser_factory = BrowserFactory()
    context.browser_factory.initialize()


def before_scenario(context: Context, scenario: Scenario) -> None:
    """Set up fresh browser context and handle authentication."""
    logger.info(f"  Scenario: {scenario.name}")

    # Create fresh context and page for this scenario
    context.browser_factory.new_context()
    context.page = context.browser_factory.new_page()

    # Check if scenario needs authentication (default: yes, unless tagged @no_auth)
    needs_auth = "no_auth" not in scenario.effective_tags

    if needs_auth:
        _perform_login(context)


def _perform_login(context: Context) -> None:
    """Perform login for authenticated scenarios."""
    config = context.config_manager
    login_page = LoginPage(context.page)

    # Navigate to login and authenticate
    login_page.navigate()
    login_page.login(config.username, config.password)

    # Wait for successful login (sidebar should be visible)
    context.page.wait_for_load_state("networkidle")

    if not login_page.is_logged_in():
        logger.warning("Login may have failed - sidebar not visible")


def after_scenario(context: Context, scenario: Scenario) -> None:
    """Capture screenshot on failure and clean up."""
    # Capture screenshot on failure
    if scenario.status == "failed" and hasattr(context, "page") and context.page:
        _capture_failure_screenshot(context, scenario)
        _log_failure_details(context, scenario)

    # Close browser context (keeps browser for next scenario)
    if hasattr(context, "browser_factory"):
        context.browser_factory.close_context()


def _capture_failure_screenshot(context: Context, scenario: Scenario) -> None:
    """Capture screenshot when scenario fails."""
    try:
        config = context.config_manager
        screenshot_dir = config.screenshot_dir
        os.makedirs(screenshot_dir, exist_ok=True)

        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_name = "".join(c if c.isalnum() or c in "._- " else "_" for c in scenario.name)[:50]
        filename = f"{screenshot_dir}/{safe_name}_{timestamp}.png"

        # Capture screenshot
        context.page.screenshot(path=filename, full_page=True)
        logger.info(f"Screenshot saved: {filename}")

    except Exception as e:
        logger.warning(f"Failed to capture screenshot: {e}")


def _log_failure_details(context: Context, scenario: Scenario) -> None:
    """Log helpful debug information on failure."""
    try:
        if hasattr(context, "page") and context.page:
            logger.error(f"Failure URL: {context.page.url}")
    except Exception:
        pass


def after_feature(context: Context, feature: Feature) -> None:
    """Close browser after feature."""
    logger.info(f"Feature complete: {feature.name}")

    if hasattr(context, "browser_factory"):
        context.browser_factory.close()


def after_all(context: Context) -> None:
    """Clean up after all tests."""
    logger.info("=" * 60)
    logger.info("Test Suite Complete")
    logger.info("=" * 60)
