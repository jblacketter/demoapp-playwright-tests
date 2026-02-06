"""
Project page object for the Kanban board.

Handles navigation between projects and task verification.
"""
from typing import List
import re
from playwright.sync_api import Page, Locator
from .base_page import BasePage
from core.logger import get_logger

logger = get_logger(__name__)


class ProjectPage(BasePage):
    """Page object for the Kanban project board."""

    # Selectors
    SIDEBAR = 'aside, nav, [class*="sidebar"]'
    PROJECT_BUTTON = 'button'
    COLUMN_HEADER = 'h2'
    TASK_CARD = '[class*="bg-white"]'

    # Tag detection
    TAG_MAX_LENGTH = 20
    DATE_PATTERN = re.compile(r'\d{1,2}/\d{1,2}/\d{4}')

    @property
    def url_path(self) -> str:
        return "/"

    # --- Navigation ---

    def navigate_to_project(self, project_name: str) -> "ProjectPage":
        """
        Navigate to a specific project by clicking in sidebar.

        Args:
            project_name: Name of the project to navigate to

        Returns:
            Self for method chaining
        """
        logger.info(f"Navigating to project: {project_name}")

        # Find and click the project button in sidebar
        sidebar = self.page.locator(self.SIDEBAR).first
        project_button = sidebar.locator(self.PROJECT_BUTTON).filter(has_text=project_name).first
        project_button.click()

        # Wait for board to load
        self.page.wait_for_load_state("networkidle")

        return self

    def get_visible_projects(self) -> List[str]:
        """Get list of visible project names in sidebar."""
        sidebar = self.page.locator(self.SIDEBAR).first
        buttons = sidebar.locator(self.PROJECT_BUTTON).all()
        projects = []
        for button in buttons:
            # Extract the primary heading from the button
            heading = button.locator("h2, span, div").first
            if heading.count() > 0:
                text = heading.text_content()
            else:
                text = button.text_content()
            if text and text.strip():
                projects.append(text.strip())
        return projects

    def get_current_project_name(self) -> str:
        """Get the currently selected project name from header."""
        # Target the project header specifically (text-xl class), not the sidebar "Projects" h1
        header = self.page.locator('h1[class*="text-xl"]').first
        if header.is_visible():
            return header.text_content() or ""
        return ""

    # --- Column Operations ---

    def get_column(self, column_name: str) -> Locator:
        """
        Get a column locator by name.

        Args:
            column_name: Column name (To Do, In Progress, Review, Done)

        Returns:
            Locator for the column container
        """
        # Find column header, then locate the nearest container within main content
        column_header = self.page.locator(self.COLUMN_HEADER).filter(has_text=column_name).first
        main_content = self.page.locator("main, [class*='content'], [class*='board']").first

        return main_content.locator("div").filter(has=column_header).first

    def get_column_names(self) -> List[str]:
        """Get list of all column names."""
        headers = self.page.locator(self.COLUMN_HEADER).all()
        column_names = []
        for header in headers:
            text = header.text_content() or ""
            normalized = re.sub(r"\s*\(\d+\)\s*$", "", text).strip()
            # Filter out non-column headers (might match task titles)
            if normalized in ["To Do", "In Progress", "Review", "Done"]:
                column_names.append(normalized)
        return column_names

    def get_column_task_count(self, column_name: str) -> int:
        """
        Get task count from column header display.

        Column headers show format: "Column Name (N)" e.g., "To Do (2)".
        Reading the count from the header is more reliable than counting
        card elements which may match non-card containers.

        Args:
            column_name: Column name

        Returns:
            Number of tasks shown in the column header
        """
        column_header = self.page.locator(self.COLUMN_HEADER).filter(
            has_text=column_name
        ).first
        text = column_header.text_content() or ""
        match = re.search(r'\((\d+)\)', text)
        return int(match.group(1)) if match else -1

    # --- Task Operations ---

    def _get_task_card(self, task_name: str, column_name: str) -> Locator:
        """
        Get a task card locator within a specific column.

        Uses column scoping with exact task title text to find the card container.
        Note: The has= filter requires a page-scoped (not column-scoped) locator
        to work correctly as a relative match within each candidate element.
        """
        column = self.get_column(column_name)
        task_title = self.page.get_by_text(task_name, exact=True)

        return column.locator(self.TASK_CARD).filter(has=task_title).first

    def verify_task_in_column(self, task_name: str, column_name: str) -> "ProjectPage":
        """
        Verify a task exists in the specified column.

        Args:
            task_name: Name of the task
            column_name: Expected column name

        Returns:
            Self for method chaining

        Raises:
            AssertionError: If task not found in column
        """
        logger.info(f"Verifying task '{task_name}' in column '{column_name}'")

        column = self.get_column(column_name)
        task = column.get_by_text(task_name, exact=True)

        # Assert task is visible in the column
        task.wait_for(state="visible", timeout=self.config.default_timeout)

        return self

    def get_task_tags(self, task_name: str, column_name: str) -> List[str]:
        """
        Get tags for a specific task.

        Args:
            task_name: Name of the task
            column_name: Column containing the task

        Returns:
            List of tag names
        """
        card = self._get_task_card(task_name, column_name)

        # Tags are colored spans using Tailwind bg-* classes
        tag_selectors = [
            'span[class*="bg-"]',       # Tailwind background color (primary)
            'span[class*="tag"]',
            'span[class*="badge"]',
            'span[class*="rounded"]',
        ]

        tags = []
        for selector in tag_selectors:
            tag_elements = card.locator(selector).all()
            for tag in tag_elements:
                text = tag.text_content()
                if text and text.strip():
                    trimmed = text.strip()
                    # Filter: tags are short text, exclude dates
                    if (len(trimmed) < self.TAG_MAX_LENGTH
                            and not self.DATE_PATTERN.search(trimmed)
                            and '/' not in trimmed):
                        tags.append(trimmed)

        # Deduplicate while preserving order
        seen = set()
        unique_tags = []
        for tag in tags:
            if tag not in seen:
                seen.add(tag)
                unique_tags.append(tag)

        return unique_tags

    def verify_task_tags(
        self, task_name: str, expected_tags: List[str], column_name: str
    ) -> "ProjectPage":
        """
        Verify a task has the expected tags.

        Args:
            task_name: Name of the task
            expected_tags: List of expected tag names
            column_name: Column containing the task

        Returns:
            Self for method chaining

        Raises:
            AssertionError: If tags don't match
        """
        logger.info(f"Verifying tags for task '{task_name}': {expected_tags}")

        actual_tags = self.get_task_tags(task_name, column_name)

        for expected_tag in expected_tags:
            if expected_tag not in actual_tags:
                raise AssertionError(
                    f"Tag '{expected_tag}' not found for task '{task_name}'. "
                    f"Found tags: {actual_tags}"
                )

        return self

    # --- Sidebar Operations ---

    def is_sidebar_visible(self) -> bool:
        """Check if sidebar is visible."""
        return self.is_visible(self.SIDEBAR, timeout=5000)
