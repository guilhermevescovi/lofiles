export interface User {
  login: string;
  name?: string;
  avatarUrl: string;
}

export interface Repository {
  nameWithOwner: string;
  url: string;
  name?: string;
}

export interface Label {
  name: string;
  color: string;
}

export interface Comment {
  author: User;
  createdAt: string;
  body: string;
}

export interface Review {
  id: string;
  author: User;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'PENDING' | 'COMMENTED';
  submittedAt: string;
  createdAt: string;
}

export interface Team {
  name: string;
  slug: string;
}

export interface ReviewRequest {
  requestedReviewer: User | Team;
}

export interface Commit {
  commit: {
    statusCheckRollup?: {
      state: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'ERROR';
    };
    oid: string;
  };
}

export interface PullRequest {
  id: string;
  title: string;
  url: string;
  number: number;
  createdAt: string;
  updatedAt: string;
  mergeable: 'MERGEABLE' | 'CONFLICTING' | 'UNKNOWN';
  isDraft: boolean;
  repository: Repository;
  author: User;
  commits: {
    nodes: Commit[];
  };
  reviews: {
    nodes: Review[];
  };
  reviewRequests: {
    nodes: ReviewRequest[];
  };
  comments: {
    nodes: Comment[];
  };
  labels: {
    nodes: Label[];
  };
}

export interface Issue {
  id: string;
  title: string;
  url: string;
  number: number;
  createdAt: string;
  updatedAt: string;
  repository: Repository;
  author: User;
  labels: {
    nodes: Label[];
  };
  comments: {
    totalCount: number;
  };
}

export interface WorkdayDashboardData {
  viewer: User;
  prsToReview: {
    nodes: PullRequest[];
  };
  myOpenPRs: {
    nodes: PullRequest[];
  };
  involvedPRs: {
    nodes: PullRequest[];
  };
  assignedIssues: {
    nodes: Issue[];
  };
}

export interface FocusItem {
  id: string;
  title: string;
  url: string;
  type: 'pr' | 'issue';
  repository: string;
  addedAt: string;
}
