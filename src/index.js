import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import Register from './Register';
import Authenticate from './Authenticate';
import HomePage from './HomePage';
import App from './App';
import './index.css';
import { ApolloProvider, Query,} from "react-apollo";
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import {createUploadLink} from 'apollo-upload-client'
import * as R from 'ramda'

const cache = new InMemoryCache();


const link = createUploadLink({uri:'http://localhost:8000'})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
})

const Router = () => {
  const [user, setUser] = useState(null)
  const [pageKey, setPageKey] = useState('homePage')
  const isPageKey = R.equals(pageKey)
  // HOC for passing pageKey
  // `withSetPageKey` is a function
  const withSetPageKey = R.curry(
    // ... that takes arguments `setPageKey` and `WrappedComponent`
    (setPageKey, WrappedComponent) => (
      // ... and returns another component with `setPageKey` passed as a prop to `WrappedComponent`
      wrappedComponentProps => <WrappedComponent {...wrappedComponentProps} setPageKey={setPageKey}/>
    )
  )(setPageKey)

  const withUser = R.curry(
    (user, setUser, WrappedComponent) =>(
      wrappedComponentProps => <WrappedComponent {...wrappedComponentProps} user={user} setUser={setUser}/>
    )
  )(user, setUser)

  const CurrentComponent = R.compose(
    withUser,
    withSetPageKey,
  )(
    isPageKey('main') ? App
    : isPageKey('authenticate') ? Authenticate
    : isPageKey('register') ? Register
    : HomePage
  )

  return <CurrentComponent />
}

ReactDOM.render(
  <ApolloProvider client={client}>
  <Router />
  </ApolloProvider>,
  document.getElementById('root')
);
