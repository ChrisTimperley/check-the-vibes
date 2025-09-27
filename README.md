# Check the Vibes

A web application that analyzes GitHub repositories to assess software engineering best practices and team collaboration. View detailed metrics about pull requests, issues, and contributor activity through an interactive dashboard.

## Features

- 📊 **Pull Request Analysis**: View PR metrics including lines changed, review activity, and merge patterns
- 🔗 **Issue Tracking**: Browse and analyze GitHub issues with sorting capabilities
- � **Team Collaboration**: Track contributor activity, commits, and participation metrics
- 🌐 **Interactive Dashboard**: Modern React UI with real-time GitHub API integration

## Installation

### Prerequisites

- **Node.js 22+** and **npm 10+**
- GitHub Personal Access Token (recommended for better rate limits)

### Setup

1. **Clone and install**:

   ```bash
   git clone https://github.com/ChrisTimperley/check-the-vibes.git
   cd check-the-vibes
   npm install
   ```

2. **Configure GitHub token** (optional but recommended):

   ```bash
   # Create environment file
   echo "GITHUB_TOKEN=your_github_token_here" > .env
   ```

3. **Start the application**:

   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

## Usage

1. **Enter a repository**: Type in any public GitHub repository (e.g., `microsoft/vscode`)
2. **View the analysis**: Browse through pull requests, issues, and contributor metrics
3. **Change repositories**: Use the "Change Repository" button in the header to analyze different repos

## GitHub Token Setup

For private repositories and higher rate limits, create a Personal Access Token:

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `public_repo` (or `repo` for private repositories)
4. Copy the token and add it to your `.env` file

## Development

### Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run lint` - Check code style

### DevContainer Support

This project includes VS Code DevContainer configuration for a complete development environment.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
