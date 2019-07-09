import React from 'react'
import ReactDOM from 'react-dom'
import Register from './Register'
import Authenticate from './Authenticate'
import 'semantic-ui-css/semantic.min.css'
import { Grid, Header, Icon, Reveal, Button, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const HomePage = ({ mobile, setPageKey }) => {
  return (
    <Grid textAlign="center" style={{ height: '90vh' }} verticalAlign="middle">
      <Grid.Column style={{ background: '#82E0AA', height: '30vh' }}>
        <Reveal animated="move">
          <Reveal.Content visible>
            <Segment color="#82E0AA" inverted style={{ background: '#82E0AA' }}>
              <Header
                as="h2"
                color="#ffffff "
                style={{
                  background: '#82E0AA',
                  fontSize: mobile ? '2em' : '4em',
                  fontWeight: 'normal',
                  marginBottom: 0,
                  marginLeft: mobile ? '4.3em' : '4.3em',
                  marginTop: mobile ? '0.8em' : '0.8em'
                }}
              >
                <Icon name="upload" />
                <Header.Content>
                  UPLOAD/DOWNLOAD APP
                  <Header as="h4" inverted color="#ffffff">
                    Authenticate or register to begin
                  </Header>
                </Header.Content>
                <Icon name="download" />
              </Header>
            </Segment>
          </Reveal.Content>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <Reveal.Content hidden>
            <Button
              color="#82E0AA"
              inverted
              centered
              size="massive"
              onClick={() => setPageKey('register')}
              content="REGISTER"
            />
            <Button
              color="#82E0AA"
              inverted
              centered
              size="massive"
              onClick={() => setPageKey('authenticate')}
              content="AUTHENTICATE"
            />
          </Reveal.Content>
        </Reveal>
      </Grid.Column>
    </Grid>
  )
}

HomePage.propTypes = {
  mobile: PropTypes.bool
}

export default HomePage
