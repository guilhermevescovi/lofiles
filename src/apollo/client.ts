import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

const httpLink = createHttpLink({
  uri: `${BACKEND_URL}/graphql`,
  credentials: 'include', // Important: send cookies with requests
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          search: {
            merge: false, // Don't merge search results to avoid stale data
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
