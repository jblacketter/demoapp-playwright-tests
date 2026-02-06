"""
Step definitions for navigation scenarios.
"""
from behave import given, when, then, step
from pages.project_page import ProjectPage


@when('I navigate to the "{project_name}" project')
@given('I navigate to the "{project_name}" project')
def step_navigate_to_project(context, project_name: str):
    """Navigate to a specific project."""
    if not hasattr(context, "project_page"):
        context.project_page = ProjectPage(context.page)
    context.project_page.navigate_to_project(project_name)


@then('the project header should show "{project_name}"')
def step_header_shows_project(context, project_name: str):
    """Verify project header shows correct name."""
    project_page = ProjectPage(context.page)
    header = project_page.get_current_project_name()
    assert header == project_name, f"Header should show '{project_name}', but shows '{header}'"


@when('I note the task count in "{column_name}" column')
def step_note_task_count(context, column_name: str):
    """Store current task count for later comparison."""
    project_page = ProjectPage(context.page)
    context.noted_task_count = project_page.get_column_task_count(column_name)
    context.noted_column_name = column_name


@then('the "{column_name}" column task count should be the same')
def step_task_count_same(context, column_name: str):
    """Verify task count matches previously noted count."""
    project_page = ProjectPage(context.page)
    current_count = project_page.get_column_task_count(column_name)
    assert current_count == context.noted_task_count, (
        f"Task count in '{column_name}' should be {context.noted_task_count}, but is {current_count}"
    )
