import React from 'react'
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Header, Image, Icon, Message, Segment } from 'semantic-ui-react'

const LoginForm = () => (
  <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
    <Grid.Column style={{ maxWidth: 450 }}>
      <Header iconColor='teal' as='h2' color='teal' textAlign='center'>
         <Icon name='angle double right' /> LOG-IN TO ACCESS YOUR FILES
      </Header>
      <Form size='large'>
        <Segment stacked>
          <Form.Input fluid icon='user' iconPosition='left' placeholder='USERNAME' />
          <Form.Input
            fluid
            icon='lock'
            iconPosition='left'
            placeholder='PASSWORD'
            type='password'
          />

          <Button color='teal' fluid size='large'>
            LOGIN
          </Button>
        </Segment>
      </Form>
      <Message color='teal'>
        New to us? <a href='#'>Sign Up</a>
      </Message>
    </Grid.Column>
  </Grid>
)

export default LoginForm

