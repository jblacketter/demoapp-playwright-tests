"""
Step definitions for authentication scenarios.
"""
from behave import given, when, then
from pages.login_page import LoginPage
from core.config import Config


@given("I am on the login page")
def step_on_login_page(context):
    """Navigate to the login page."""
    context.login_page = LoginPage(context.page)
    context.login_page.navigate()


@when("I login with valid credentials")
def step_login_valid(context):
    """Login with valid credentials from config."""
    config = Config()
    context.login_page.login(config.username, config.password)
    context.page.wait_for_load_state("networkidle")


@when('I login with username "{username}" and password "{password}"')
def step_login_with_credentials(context, username: str, password: str):
    """Login with specified credentials."""
    context.login_page.login(username, password)
    # Brief wait to allow any error messages to appear
    context.page.wait_for_timeout(1000)


@when("I login with empty credentials")
def step_login_empty(context):
    """Login with empty username and password."""
    context.login_page.login("", "")
    context.page.wait_for_timeout(1000)


@then("I should see the project sidebar")
def step_see_sidebar(context):
    """Verify sidebar is visible."""
    from pages.project_page import ProjectPage
    project_page = ProjectPage(context.page)
    assert project_page.is_sidebar_visible(), "Sidebar should be visible after login"


@then("I should be logged in")
def step_logged_in(context):
    """Verify user is logged in."""
    assert context.login_page.is_logged_in(), "User should be logged in"


@then("I should remain on the login page")
def step_remain_on_login(context):
    """Verify user is still on login page."""
    assert context.login_page.is_on_login_page(), "Should remain on login page"


@then("I should see an error or stay on login")
def step_error_or_login_page(context):
    """Verify either error message or still on login page."""
    has_error = context.login_page.has_error()
    on_login = context.login_page.is_on_login_page()
    assert has_error or on_login, "Should either show error or stay on login page"
