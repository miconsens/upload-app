import React, {useEffect} from 'react'
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Header, Image, Icon, Message, Segment } from 'semantic-ui-react'
// Authentication form and validation
import { withFormik } from 'formik';
import * as Yup from 'yup';

import * as R from 'ramda'
import gql from 'graphql-tag';
import {Mutation} from "react-apollo";



const AUTHENTICATE_MUTATION = gql`
  mutation Authenticate(
    $username: String!,
    $password: String!
  ) {
    authenticate(
      username: $username,
      password: $password
    ) {
      username
    }
  }
`;

// Yup form validation
const AuthenticationSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Please enter a username longer than 2 characters')
    .max(30, 'Please enter a username less than 30 characters')
    .required('Required'),
  password: Yup.string()
    .required('Required'),
})

const Authenticate = ({
   result, setPageKey, ...props}) => {
  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = props;

  // if the graphql query result has a username, change pages 
  //(as the graphql query will only return a user if the inputted username and password match a user in the db)
  useEffect(
    () => {
      R.compose(R.not, R.isNil, R.path(['data','authenticate','username']))(result)
      && setPageKey('main')
    },
    [result]
  )

  const isError = R.prop(R.__, errors)
  const isTouched = R.prop(R.__, touched)
  const isInvalid = R.both(isError, isTouched)
  const anyTruthy = R.reduce(R.or, false)
  
  const invalidUsername = isInvalid('username')
  const invalidPassword = isInvalid('password')

  return(
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header style={{color: '#82E0AA'}} as='h2'  textAlign='center'>
          <Icon name='angle double right' /> AUTHENTICATE TO ACCESS YOUR FILES
        </Header>
        <Form onSubmit={(values, data) => {handleSubmit(values, data) && setPageKey('main')}} size='large'>
          <Segment attached='top' >
            <Form.Input 
              type="text"
              onChange={handleChange}
              onBlur={handleBlur} 
              value={values.username}
              name="username"
              fluid
              icon='user' 
              iconPosition='left' 
              placeholder='USERNAME' 
              error={invalidUsername}
              label={invalidUsername ? isError('username') : null}
              />
            <Form.Input
              onChange={handleChange}
              onBlur={handleBlur} 
              value={values.password}
              name="password"
              fluid
              icon='lock'
              iconPosition='left'
              placeholder='PASSWORD'
              type='password'
              error={invalidPassword}
              label={invalidUsername ? isError('password') : null}
            />
            <Button type='submit' fluid size='large'
              content= 'AUTHENTICATE'
              style={{background: '#82E0AA', color: '#ffff'}}
              disabled={anyTruthy([
                invalidUsername,
                invalidPassword
              ])}  
              />
          </Segment>
        </Form>
        <Segment attached='bottom'>
        <Button fluid basic color='green' 
           content='New to us?' 
           onClick={() => setPageKey('register')}
        />
        </Segment>
      </Grid.Column>
    </Grid>
  )
}

const withMutation = (
  WrappedComponent => (
    props => (
      <Mutation mutation={AUTHENTICATE_MUTATION}>
      {
        (authenticate, result) => (
          <WrappedComponent {...props} authenticate={authenticate} result={result}/>
        )
      }
      </Mutation>      
    )
  )
)


export default R.compose(
  withMutation,
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: () => ({ username:'generic' , password:'user'}),

    // Custom sync validation
    validationSchema: AuthenticationSchema,

    handleSubmit: async ({username,password}, {props: {authenticate}}) => {
      console.log('Authentication submit', authenticate, username, password)
      const isValid = await AuthenticationSchema.isValid({
         username,
         password
      })
      //if the user has inputted a valid username and password try to find that username with that password in the db
      //using graphql query 'authenticate'
      if (isValid){
        await authenticate({variables:{username,password}})
      }
    },

    displayName: 'BasicForm',
  })
)(Authenticate);



