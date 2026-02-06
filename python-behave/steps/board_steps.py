"""
Step definitions for board structure scenarios.
"""
from behave import given, when, then, step
from pages.project_page import ProjectPage


@then('I should see "{project_name}" in the sidebar')
def step_see_project_in_sidebar(context, project_name: str):
    """Verify project is visible in sidebar."""
    project_page = ProjectPage(context.page)
    visible_projects = project_page.get_visible_projects()

    # Check if project name is in any of the visible project texts
    found = any(project_name in p for p in visible_projects)
    assert found, f"Project '{project_name}' should be in sidebar. Found: {visible_projects}"


@then('I should see the "{column_name}" column')
def step_see_column(context, column_name: str):
    """Verify column is visible."""
    project_page = ProjectPage(context.page)
    column_names = project_page.get_column_names()
    assert column_name in column_names, f"Column '{column_name}' should be visible. Found: {column_names}"


@then('the "{column_name}" column should have {count:d} task(s)')
def step_column_task_count(context, column_name: str, count: int):
    """Verify column has expected task count."""
    project_page = ProjectPage(context.page)
    actual_count = project_page.get_column_task_count(column_name)
    assert actual_count == count, (
        f"Column '{column_name}' should have {count} task(s), but has {actual_count}"
    )
