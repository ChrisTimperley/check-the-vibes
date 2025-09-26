#!/usr/bin/env node

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { GitHubService } from './services/github';
import { ReportGenerator } from './services/report';
import { ScanConfig } from './types';
import {
  parseDate,
  validateDateRange,
  writeReportToFile,
  getDefaultOutputPath,
  formatDuration,
} from './utils/helpers';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('check-the-vibes')
  .description('A GitHub repo scanner that assesses PR best practices')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan a GitHub repository for PR best practices')
  .requiredOption('-o, --owner <owner>', 'Repository owner (username or organization)')
  .requiredOption('-r, --repo <repo>', 'Repository name')
  .requiredOption('-s, --since <date>', 'Start date (YYYY-MM-DD format)')
  .option('-u, --until <date>', 'End date (YYYY-MM-DD format, defaults to now)')
  .option('-t, --token <token>', 'GitHub personal access token (can also use GITHUB_TOKEN env var)')
  .option('--output <file>', 'Output file path (defaults to reports/{owner}-{repo}-{date}.yaml)')
  .action(async (options) => {
    const startTime = new Date();
    
    try {
      console.log('🔍 Starting repository scan...');
      
      // Parse and validate dates
      const since = parseDate(options.since);
      const until = options.until ? parseDate(options.until) : undefined;
      validateDateRange(since, until);
      
      // Get GitHub token
      const token = options.token || process.env.GITHUB_TOKEN;
      if (!token) {
        console.warn('⚠️  No GitHub token provided. API rate limits will be very restrictive.');
        console.warn('   Set GITHUB_TOKEN environment variable or use --token option.');
      }
      
      // Create services
      const githubService = new GitHubService(token);
      const reportGenerator = new ReportGenerator();
      
      // Validate repository access
      console.log(`📋 Validating repository ${options.owner}/${options.repo}...`);
      const isValidRepo = await githubService.validateRepository(options.owner, options.repo);
      if (!isValidRepo) {
        throw new Error(`Repository ${options.owner}/${options.repo} not found or not accessible`);
      }
      
      // Scan pull requests
      console.log(`🔄 Scanning pull requests since ${options.since}...`);
      const pullRequests = await githubService.getPullRequestsSince(
        options.owner,
        options.repo,
        since,
        until
      );
      
      console.log(`📊 Found ${pullRequests.length} pull requests to analyze`);
      
      // Generate config object
      const config: ScanConfig = {
        owner: options.owner,
        repo: options.repo,
        token,
        since: options.since,
        until: options.until,
        outputFile: options.output,
      };
      
      // Generate report
      console.log('📈 Generating report...');
      const report = reportGenerator.generateReport(config, pullRequests);
      const yamlContent = reportGenerator.generateYaml(report);
      
      // Write to file
      const outputPath = options.output || getDefaultOutputPath(options.owner, options.repo);
      await writeReportToFile(yamlContent, outputPath);
      
      const endTime = new Date();
      const duration = formatDuration(startTime, endTime);
      
      // Print summary
      console.log('\n✅ Scan completed successfully!');
      console.log(`📄 Report saved to: ${outputPath}`);
      console.log(`⏱️  Duration: ${duration}`);
      console.log('\n📊 Summary:');
      console.log(`   • Total PRs analyzed: ${report.analysis.totalPullRequests}`);
      console.log(`   • Average lines changed: ${report.summary.averageLinesChanged}`);
      console.log(`   • Average files changed: ${report.summary.averageFilesChanged}`);
      console.log(`   • PRs with reviews: ${report.summary.pullRequestsWithReviews}`);
      console.log(`   • PRs with comments: ${report.summary.pullRequestsWithComments}`);
      if (report.summary.ciSuccessRate !== undefined) {
        console.log(`   • CI success rate: ${report.summary.ciSuccessRate}%`);
      }
      
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();