import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Button, Form, Grid, Header, Icon, Segment } from 'semantic-ui-react';
import { withFormik } from 'formik';

const Register = ({setPageKey, ...props}) => {
  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = props;
  console.log(values)
  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header style={{color: '#82E0AA'}}  as='h2' textAlign='center'>
          <Icon name='angle double right' /> REGISTER TO BEGIN
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
              type="text"
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
            <Form.Input
              type="text"
              onChange={handleChange}
              onBlur={handleBlur} 
              value={values.name}
              name="passwordConfirm"
              fluid
              icon='lock'
              iconPosition='left'
              placeholder='CONFIRM PASSWORD'
              type='password'
            />
            {errors.name && touched.name && <div id="feedback">{errors.name}</div>}
            <Button type='button' style={{background:'#82E0AA', color:'#ffff'}} fluid size='large' content='REGISTER' onClick={() => setPageKey('main')}/>
          </Segment>
        </Form>
        <Button basic color='green' attached='bottom' content='Have an acount?' onClick={() => setPageKey('authenticate')} />
      </Grid.Column> 
    </Grid>
  )
}

export default withFormik({
  mapPropsToValues: () => ({ username: '' , password:'', passwordConfirm:''}),

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
})(Register);

