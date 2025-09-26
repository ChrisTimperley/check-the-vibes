# check-the-vibes

A simple GitHub repo scanner that assesses for SWE best practices and good teamwork. This tool scans GitHub repositories and generates detailed YAML reports analyzing pull request patterns, code review practices, and CI/CD health.

## Features

- 📊 **PR Analysis**: Analyze pull requests for lines changed, files modified, commit count, and review activity
- 🔍 **Date Range Filtering**: Scan PRs within specific date ranges
- 📈 **CI/CD Monitoring**: Track continuous integration success rates
- 📝 **YAML Reports**: Generate comprehensive reports in YAML format
- 🐳 **DevContainer Ready**: Full development environment setup with VS Code

## Documentation

- 📋 **[Design Document](docs/DESIGN.md)** - Comprehensive design specification for the TA Dashboard MVP, including architecture, metrics, and implementation details

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- GitHub Personal Access Token (optional but recommended for private repos and higher rate limits)

### Installation

```bash
# Clone the repository
git clone https://github.com/ChrisTimperley/check-the-vibes.git
cd check-the-vibes

# Install dependencies
npm install

# Build the project
npm run build
```

### Basic Usage

```bash
# Scan a repository for PRs since a specific date
npm run dev -- scan --owner microsoft --repo vscode --since 2024-01-01

# With GitHub token for private repos and higher rate limits
GITHUB_TOKEN=your_token_here npm run dev -- scan --owner your-org --repo your-repo --since 2024-01-01

# Custom output file and date range
npm run dev -- scan \
  --owner microsoft \
  --repo vscode \
  --since 2024-01-01 \
  --until 2024-02-01 \
  --output my-report.yaml
```

### Configuration

Create a `.env` file in the project root:

```bash
# Copy the example environment file
cp .env.example .env

# Edit with your GitHub token
GITHUB_TOKEN=ghp_your_personal_access_token_here
```

### GitHub Token Setup

1. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (for private repositories)
   - `public_repo` (for public repositories only)
4. Copy the token and add it to your `.env` file

## Development

### DevContainer

This project includes a complete DevContainer setup for VS Code:

1. Install the "Dev Containers" extension in VS Code
2. Open the project in VS Code
3. Click "Reopen in Container" when prompted
4. The container will automatically install dependencies

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Report Format

The tool generates YAML reports with the following structure:

```yaml
repository:
  owner: microsoft
  name: vscode
  url: https://github.com/microsoft/vscode
analysis:
  dateRange:
    from: '2024-01-01'
    to: '2024-02-01'
  totalPullRequests: 42
  analyzedAt: '2024-01-15T10:30:00.000Z'
pullRequests:
  - number: 1234
    title: 'Add new feature'
    author: developer123
    createdAt: '2024-01-05T14:20:00Z'
    state: merged
    linesChanged:
      additions: 150
      deletions: 25
      total: 175
    filesChanged: 8
    commits: 3
    reviewCount: 2
    commentCount: 5
    hasReviews: true
    hasComments: true
    ciStatus: success
    url: https://github.com/microsoft/vscode/pull/1234
summary:
  averageLinesChanged: 175
  averageFilesChanged: 8
  averageCommits: 3
  pullRequestsWithReviews: 35
  pullRequestsWithComments: 40
  ciSuccessRate: 85.5
```

## CLI Options

```
check-the-vibes scan [options]

Options:
  -o, --owner <owner>     Repository owner (username or organization)
  -r, --repo <repo>       Repository name  
  -s, --since <date>      Start date (YYYY-MM-DD format)
  -u, --until <date>      End date (YYYY-MM-DD format, defaults to now)
  -t, --token <token>     GitHub personal access token
  --output <file>         Output file path (defaults to reports/{owner}-{repo}-{date}.yaml)
  -h, --help              Show help
```

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.