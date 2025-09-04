import { gql } from '@apollo/client';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    viewer {
      login
      name
      avatarUrl
    }
  }
`;

export const GET_WORKDAY_DASHBOARD = gql`
  query GetWorkdayDashboard {
    viewer {
      login
      name
      avatarUrl
    }
    
    # PRs awaiting my review
    prsToReview: search(
      query: "is:open is:pr review-requested:@me -author:@me"
      type: ISSUE
      first: 20
    ) {
      nodes {
        ... on PullRequest {
          ...PullRequestFragment
        }
      }
    }
    
    # My open PRs
    myOpenPRs: search(
      query: "is:open is:pr author:@me"
      type: ISSUE
      first: 20
    ) {
      nodes {
        ... on PullRequest {
          ...PullRequestFragment
        }
      }
    }
    
    # PRs I'm involved in (commented, reviewed, etc.)
    involvedPRs: search(
      query: "is:open is:pr involves:@me -author:@me"
      type: ISSUE
      first: 30
    ) {
      nodes {
        ... on PullRequest {
          ...PullRequestFragment
        }
      }
    }
    
    # Issues assigned to me
    assignedIssues: search(
      query: "is:open is:issue assignee:@me"
      type: ISSUE
      first: 10
    ) {
      nodes {
        ... on Issue {
          ...IssueFragment
        }
      }
    }
  }
  
  fragment PullRequestFragment on PullRequest {
    id
    title
    url
    number
    createdAt
    updatedAt
    mergeable
    isDraft
    repository {
      nameWithOwner
      url
    }
    author {
      login
      avatarUrl
    }
    # Get the latest commit status
    commits(last: 1) {
      nodes {
        commit {
          statusCheckRollup {
            state
          }
          oid
        }
      }
    }
    # Get review information
    reviews(first: 10, states: [APPROVED, CHANGES_REQUESTED, PENDING]) {
      nodes {
        id
        author {
          login
        }
        state
        submittedAt
        createdAt
      }
    }
    # Get review requests
    reviewRequests(first: 10) {
      nodes {
        requestedReviewer {
          ... on User {
            login
          }
          ... on Team {
            name
            slug
          }
        }
      }
    }
    # Get recent comments
    comments(last: 5) {
      nodes {
        author {
          login
        }
        createdAt
        body
      }
    }
    # Labels
    labels(first: 5) {
      nodes {
        name
        color
      }
    }
  }
  
  fragment IssueFragment on Issue {
    id
    title
    url
    number
    createdAt
    updatedAt
    repository {
      nameWithOwner
      url
    }
    author {
      login
      avatarUrl
    }
    labels(first: 5) {
      nodes {
        name
        color
      }
    }
    comments {
      totalCount
    }
  }
`;

export const PULL_REQUEST_FRAGMENT = gql`
  fragment PullRequestFragment on PullRequest {
    id
    title
    url
    number
    createdAt
    updatedAt
    mergeable
    isDraft
    repository {
      nameWithOwner
      url
    }
    author {
      login
      avatarUrl
    }
    # Get the latest commit status
    commits(last: 1) {
      nodes {
        commit {
          statusCheckRollup {
            state
          }
          oid
        }
      }
    }
    # Get review information
    reviews(first: 10, states: [APPROVED, CHANGES_REQUESTED, PENDING]) {
      nodes {
        id
        author {
          login
        }
        state
        submittedAt
        createdAt
      }
    }
    # Get review requests
    reviewRequests(first: 10) {
      nodes {
        requestedReviewer {
          ... on User {
            login
          }
          ... on Team {
            name
            slug
          }
        }
      }
    }
    # Get recent comments
    comments(last: 5) {
      nodes {
        author {
          login
        }
        createdAt
        body
      }
    }
    # Labels
    labels(first: 5) {
      nodes {
        name
        color
      }
    }
  }
`;

export const ISSUE_FRAGMENT = gql`
  fragment IssueFragment on Issue {
    id
    title
    url
    number
    createdAt
    updatedAt
    repository {
      nameWithOwner
      url
    }
    author {
      login
      avatarUrl
    }
    labels(first: 5) {
      nodes {
        name
        color
      }
    }
    comments {
      totalCount
    }
  }
`;

export const SEARCH_REPOSITORIES = gql`
  query SearchRepositories($query: String!) {
    search(query: $query, type: REPOSITORY, first: 10) {
      nodes {
        ... on Repository {
          id
          name
          nameWithOwner
          url
        }
      }
    }
  }
`;

export const SEARCH_PULL_REQUESTS = gql`
  query SearchPullRequests($query: String!) {
    search(query: $query, type: ISSUE, first: 10) {
      nodes {
        ... on PullRequest {
          id
          title
          number
          url
          repository {
            nameWithOwner
          }
        }
      }
    }
  }
`;

export const SEARCH_ISSUES = gql`
  query SearchIssues($query: String!) {
    search(query: $query, type: ISSUE, first: 10) {
      nodes {
        ... on Issue {
          id
          title
          number
          url
          repository {
            nameWithOwner
          }
        }
      }
    }
  }
`;
