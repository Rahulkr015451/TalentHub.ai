# Contributing to TalentHub AI

First off, thank you for considering contributing to TalentHub AI! It's people like you that make open-source projects thrive.

## How Can I Contribute?

*   **Reporting Bugs:** Open an issue if you encounter unexpected behavior or errors.
*   **Suggesting Enhancements:** Have an idea for a new feature? Open an issue and label it as an enhancement.
*   **Pull Requests:** Submit PRs to fix bugs, add features, or improve documentation.

## Development Workflow

1.  **Fork the Repository:** Start by forking the project to your own GitHub account.
2.  **Clone Locally:** `git clone https://github.com/your-username/TalentHub_AI.git`
3.  **Install Dependencies:** `npm ci`
4.  **Create a Branch:** Create a feature branch (`git checkout -b feature/amazing-feature` or `bugfix/issue-123`).
5.  **Make Changes:** Implement your feature or bug fix.
6.  **Run Quality Checks:** Ensure your code passes all checks before committing.
    ```bash
    npm run lint
    npm run type-check
    ```
7.  **Commit Your Changes:** Write clear, concise commit messages.
8.  **Push and PR:** Push your branch to your fork and open a Pull Request against the `main` branch of the original repository.

## Pull Request Guidelines

*   Provide a clear and descriptive title for your PR.
*   Include a detailed description of the changes made and the problem they solve.
*   Link to any relevant open issues.
*   Ensure the CI workflow passes successfully on your PR.
*   Keep PRs focused. If you are adding a feature and fixing an unrelated bug, please submit them as two separate PRs.

## Code Style

- We use **Prettier** and **ESLint** for code formatting and linting.
- The project strictly adheres to **TypeScript**; avoid using `any` types whenever possible.
- Use **Tailwind CSS** utility classes for styling. Try to extract highly reused class combinations into custom components or utilize `cva` (class-variance-authority).

Thank you for your contributions!
