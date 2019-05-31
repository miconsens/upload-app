import React from 'react'
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Header, Image, Icon, Message, Segment } from 'semantic-ui-react'
// Authentication form and validation
import { withFormik } from 'formik'
import * as Yup from 'yup'

// Yup form validation
const AuthenticationSchema = Yup.object().shape({
  userName: Yup.string()
    .max(30, 'Please enter a username less than 30 characters')
    .required('Required'),
  password: Yup.string()
    .required('Required')
})

const Authenticate = ({setPageKey, ...props}) => {
  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = props;
  console.log(values)
  return(
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header style={{color: '#82E0AA'}} iconColor='teal' as='h2'  textAlign='center'>
          <Icon name='angle double right' /> AUTHENTICATE TO ACCESS YOUR FILES
        </Header>
        <Form onSubmit={(values, data) => {handleSubmit(values, data) && setPageKey('main')}} size='large'>
          <Segment stacked>
            <Form.Input 
              type="text"
              onChange={handleChange}
              onBlur={handleBlur} 
              value={values.name}
              name="username"
              fluid
              icon='user' 
              iconPosition='left' 
              placeholder='USERNAME' />
            <Form.Input
              onChange={handleChange}
              onBlur={handleBlur} 
              value={values.name}
              name="password"
              fluid
              icon='lock'
              iconPosition='left'
              placeholder='PASSWORD'
              type='password'
            />
             {errors.name && touched.name && <div id="feedback">{errors.name}</div>}
            <Button type='button' style={{background: '#82E0AA', color: '#ffff'}} fluid size='large' 
            onClick={() => setPageKey('main')}
            content= 'AUTHENTICATE' />
          </Segment>
        </Form>
        <Button basic color='green' attached='bottom' content="New to us?" onClick={() => setPageKey('register')} />
      </Grid.Column>
    </Grid>
  )
}

export default withFormik({
  mapPropsToValues: () => ({ username: '' , password:''}),

  // Custom sync validation
  validate: values => {
    const errors = {};

    if (!values.name) {
      errors.name = 'Required';
    }

    return errors;
  },

  handleSubmit: (values, { setSubmitting }) => {
    setTimeout(() => {
  
      setSubmitting(false);
    }, 1000);
  },

  displayName: 'BasicForm',
})(Authenticate);



