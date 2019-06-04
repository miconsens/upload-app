import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import Register from './Register';
import Authenticate from './Authenticate';
import HomePage from './HomePage';
import App from './App';
import './index.css';
import { ApolloProvider, Query,} from "react-apollo";
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import * as R from 'ramda'

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: 'http://localhost:8000/'
})

const client = new ApolloClient({
  cache,
  link
})

const USER_QUERY = gql`
  {
    uploads (userID:"5ced58bc6ac1cfab2a84b89a"){
      filename
    }
  }
`;

//Running our query outside of React
client.query({
  query: USER_QUERY
}).then(res => console.log(res))

const Router = () => {
  const [pageKey, setPageKey] = useState('homePage')
  const isPageKey = R.equals(pageKey)
  // HOC for passing pageKey
  // `withSetPageKey` is a function
  const withSetPageKey = R.curry(
    // ... that takes arguments `setPageKey` and `WrappedComponent`
    (setPageKey, WrappedComponent) => (
      // ... and returns another component with `setPageKey` passed as a prop to `WrappedComponent`
      wrappedComponentProps => <WrappedComponent {...wrappedComponentProps} setPageKey={setPageKey} />
    )
  )(setPageKey)

  return (
    isPageKey('main') ? withSetPageKey(App)
    : isPageKey('authenticate') ? withSetPageKey(Authenticate)
    : isPageKey('register') ? withSetPageKey(Register)
    : withSetPageKey(HomePage)
  )()
}

ReactDOM.render(
  <ApolloProvider client={client}>
  <Router/>
  </ApolloProvider>,
  document.getElementById('root')
);
