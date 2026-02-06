"""
Step definitions for task verification scenarios.
"""
from behave import given, when, then
from pages.project_page import ProjectPage


@then('I should see task "{task_name}" in the "{column_name}" column')
def step_see_task_in_column(context, task_name: str, column_name: str):
    """Verify task exists in specified column."""
    project_page = ProjectPage(context.page)
    project_page.verify_task_in_column(task_name, column_name)
    if not hasattr(context, "task_columns"):
        context.task_columns = {}
    context.task_columns[task_name] = column_name


@then('the task "{task_name}" should have tags "{tags}"')
def step_task_has_tags(context, task_name: str, tags: str):
    """Verify task has expected tags."""
    project_page = ProjectPage(context.page)

    # Parse comma-separated tags
    expected_tags = [tag.strip() for tag in tags.split(",")]
    column_name = None
    if hasattr(context, "task_columns"):
        column_name = context.task_columns.get(task_name)

    if not column_name:
        raise AssertionError(
            f"Column for task '{task_name}' not found in context. "
            "Ensure the task-in-column step ran before tag verification."
        )

    project_page.verify_task_tags(task_name, expected_tags, column_name)
