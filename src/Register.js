import React, {useEffect} from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Button, Form, Grid, Header, Icon, Segment, Message } from 'semantic-ui-react';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import * as R from 'ramda'
import gql from 'graphql-tag';
import {Mutation} from "react-apollo";



const REGISTER_MUTATION = gql`
  mutation Register(
    $username: String!,
    $password: String!
  ) {
    register(
      username: $username,
      password: $password
    ) {
      username
      userID
    }
  }
`;


// Yup form validation
const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Please enter a username longer than 2 characters')
    .max(30, 'Please enter a username less than 30 characters')
    .required('Required'),
  password: Yup.string()
    .required('Required'),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Password mismatch')
    .required('Required')
})

const Register = ({result, setPageKey, setUser, user, ...props}) => {
  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = props;
  const isError = R.prop(R.__, errors)
  const isTouched = R.prop(R.__, touched)
  const isInvalid = R.both(isError, isTouched)
  const anyTruthy = R.reduce(R.or, false)
  
  const invalidUsername = isInvalid('username')
  const invalidPassword = isInvalid('password')
  const invalidPasswordConfirmation = isInvalid('passwordConfirm')

  // Curried function to get user from graphql
  const userFromResult = R.path(['data','register'])
  // if the graphql query result is not null, change pages 
  //(as the graphql query will only return a user if a new user has been successfully created
  useEffect(
    () => {
      if (R.compose(R.not, R.isNil, userFromResult)(result)) {
        setUser(userFromResult(result))
        setPageKey('main')
      }
    },
    [result]
  )
  return (

          <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header style={{color: '#82E0AA'}}  as='h2' textAlign='center'>
              <Icon name='angle double right' /> REGISTER TO BEGIN
            </Header>
            <Form onSubmit={(values, data) => handleSubmit(values, data)} size='large'>
              <Segment attached='top'>
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
                  label={invalidUsername ? isError('username'): null}
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
                  label={invalidPassword  ? isError('password'): null}
                />
                <Form.Input
                  onChange={handleChange}
                  onBlur={handleBlur} 
                  value={values.passwordConfirm}
                  name="passwordConfirm"
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='CONFIRM PASSWORD'
                  type='password'
                  error={invalidPasswordConfirmation }
                  label={invalidPasswordConfirmation? isError('passwordConfirm') : null}
                />
                <Button type='submit' fluid size='large' 
                  content='REGISTER' 
                  style={{background:'#82E0AA', color:'#ffff'}} 
                  disabled={anyTruthy([
                    invalidUsername,
                    invalidPassword,
                    invalidPasswordConfirmation,
                  ])}
                 />
              </Segment>
            </Form>
            <Segment attached='bottom'>
            <Button fluid basic color='green' 
               content='Have an acount?' 
               onClick={() => setPageKey('authenticate')}
            />
            </Segment>
            {
              R.prop('called', result) && R.prop('error', result) &&
              <Message negative>
                User already exists
              </Message>
            }
          </Grid.Column> 
        </Grid>          
  )
}

const withMutation = (
  WrappedComponent => (
    props => (
      <Mutation mutation={REGISTER_MUTATION}>
      {
        (register, result) => (
          <WrappedComponent {...props} register={register}  result={result}/>
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
    //defaults to generic user so that the first time you run the app you make generic user and can
    //then authenticate with them each time (set values to '' to remove)
    mapPropsToValues: () => ({ username: 'generic' , password:'user', passwordConfirm:'user'}),
    // Custom sync validation
    validationSchema: RegisterSchema,
  
    handleSubmit: async ({username,password, passwordConfirm}, {props: {register}}) => {
      const isValid = await RegisterSchema.isValid({
        username,
        password,
        passwordConfirm
      })
      //if the user has inputted a valid username and password try to find that username with that password in the db
      //using graphql query 'authenticate'
      if (isValid){
        await register({variables:{username,password}})
        if (register.data){
        }
      }
    },
  
    displayName: 'BasicForm',
  })
)(Register);
