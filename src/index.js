import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import Register from './Register';
import Authenticate from './Authenticate';
import HomePage from './HomePage';
import App from './App';
import './index.css';
import { ApolloProvider } from "react-apollo";
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import * as R from 'ramda'

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
  <Router/>,
  document.getElementById('root')
);
