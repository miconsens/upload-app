import React from 'react'
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Header, Image, Icon, Message, Segment } from 'semantic-ui-react'

const SignUpForm = () => (
  <Grid textAlign='center' style={{ height: '90vh' }} verticalAlign='middle'>
    <Grid.Column style={{ maxWidth: 450 }}>
      <Header iconColor='teal' as='h2' color='teal' textAlign='center'>
         <Icon name='angle double right' /> SIGN-UP TO BEGIN
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
            SIGN UP
          </Button>
        </Segment>
      </Form>
    </Grid.Column>
  </Grid>
)

export default SignUpForm

