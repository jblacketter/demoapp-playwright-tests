# Project Requirements

> **Note:** Technical evaluations will not pass if they are not data-driven and written in JS/TS.

## Important Reminder: Accuracy is Key

We fully encourage the use of AI tools like ChatGPT, Cursor, Claude Code to assist in completing the evaluation. However, it's essential that you double-check your work for accuracy before submitting. While AI can be a helpful resource, errors can slip through if not carefully reviewed. As part of the role, attention to detail and quality assurance is a must—just like it would be in the position you're applying for.

Please take the extra step to ensure everything is correct before submission. This will help save valuable time for both you and our team as we review your work. Thanks for your understanding, and good luck!

---

## Acceptance Criteria

**Objective:** Create a Playwright-driven test suite that leverages data-driven techniques to minimize code duplication and improve scalability. By driving test scenarios from a JSON object, we can dynamically adapt each test case without repeating code, ensuring a clean and maintainable structure as new cases are added. Please only use JavaScript/TypeScript.

---

## Setup and Preparation

- Set up a new project or workspace dedicated to this task
- Ensure Playwright and its necessary dependencies are installed and configured

---

## Login Automation

*(Updated 12/2/24)*

Implement login automation for the demo app using the following credentials:

| Property | Value |
|----------|-------|
| Demo App | https://animated-gingersnap-8cf7f2.netlify.app/ |
| Email | admin |
| Password | password123 |

The script should input these credentials into the login form and submit it successfully.

---

## Test Cases

### Test Case 1
| Step | Action |
|------|--------|
| 1 | Login to Demo App |
| 2 | Navigate to "Web Application" |
| 3 | Verify "Implement user authentication" is in the "To Do" column |
| 4 | Confirm tags: **Feature**, **High Priority** |

### Test Case 2
| Step | Action |
|------|--------|
| 1 | Login to Demo App |
| 2 | Navigate to "Web Application" |
| 3 | Verify "Fix navigation bug" is in the "To Do" column |
| 4 | Confirm tags: **Bug** |

### Test Case 3
| Step | Action |
|------|--------|
| 1 | Login to Demo App |
| 2 | Navigate to "Web Application" |
| 3 | Verify "Design system updates" is in the "In Progress" column |
| 4 | Confirm tags: **Design** |

### Test Case 4
| Step | Action |
|------|--------|
| 1 | Login to Demo App |
| 2 | Navigate to "Mobile Application" |
| 3 | Verify "Push notification system" is in the "To Do" column |
| 4 | Confirm tags: **Feature** |

### Test Case 5
| Step | Action |
|------|--------|
| 1 | Login to Demo App |
| 2 | Navigate to "Mobile Application" |
| 3 | Verify "Offline mode" is in the "In Progress" column |
| 4 | Confirm tags: **Feature**, **High Priority** |

### Test Case 6
| Step | Action |
|------|--------|
| 1 | Login to Demo App |
| 2 | Navigate to "Mobile Application" |
| 3 | Verify "App icon design" is in the "Done" column |
| 4 | Confirm tags: **Design** |

---

## Test Case Summary

| ID | Project | Task | Column | Tags |
|----|---------|------|--------|------|
| TC1 | Web Application | Implement user authentication | To Do | Feature, High Priority |
| TC2 | Web Application | Fix navigation bug | To Do | Bug |
| TC3 | Web Application | Design system updates | In Progress | Design |
| TC4 | Mobile Application | Push notification system | To Do | Feature |
| TC5 | Mobile Application | Offline mode | In Progress | Feature, High Priority |
| TC6 | Mobile Application | App icon design | Done | Design |

---

## Submission Instructions

1. Publish your code to a public GitHub repository and provide the link in the Google form
2. Provide a short, 2-3 minute video walking through your code to share your solution and your thought process behind it
   - This is similar to how we share our work with clients and is designed to give us a glimpse into your communication style
3. Upload the video into the Google Form
