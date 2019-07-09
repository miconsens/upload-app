import React, { useState } from 'react'
import 'semantic-ui-css/semantic.min.css'
import { Button, Segment, Header, Icon, Grid, Divider } from 'semantic-ui-react'
import Dropzone from 'react-dropzone'

import * as R from 'ramda'

import { Query, Mutation } from 'react-apollo'

import gql from 'graphql-tag'

const USER_UPLOADS = gql`
  query userDetails($userID: ID) {
    user(userID: $userID) {
      username
      uploads {
        filename
        objectName
        bucketName
      }
    }
  }
`
const CREATE_UPLOAD_MUTATION = gql`
  mutation createUpload($file: Upload!, $userID: ID) {
    createUpload(file: $file, userID: $userID) {
      filename
    }
  }
`

const CREATE_PRESIGNED_LINK_MUTATION = gql`
  mutation createPresignedLink($bucketName: ID, $objectName: ID) {
    createPresignedLink(bucketName: $bucketName, objectName: $objectName)
  }
`

const DownloadButton = ({ bucketName, objectName, filename }) => (
  <Mutation mutation={CREATE_PRESIGNED_LINK_MUTATION}>
    {(createPresignedLink, { called, data, error, loading }) =>
      !console.log(data) && R.isNil(data) ? (
        <Button
          floated="right"
          size="mini"
          content="Create Presigned Link"
          onClick={() =>
            createPresignedLink({ variables: { bucketName, objectName } })
          }
        />
      ) : (
        <Button
          style={{ background: '#82E0AA', color: '#ffff' }}
          floated="right"
          content="Download"
          as="a"
          // target="_blank"
          download={'test.mov'}
          href={R.prop('createPresignedLink', data)}
        />
      )
    }
  </Mutation>
)

const UploadsList = ({ user }) => (
  <Query
    query={USER_UPLOADS}
    skip={R.isNil(user)}
    variables={{ userID: R.prop('userID', user) }}
  >
    {({ data: { user }, error, loading, refetch }) => (
      <Segment basic>
        <Button
          inverted
          color="green"
          as={'label'}
          content="REFRESH"
          fluid
          onClick={() => refetch()}
        />
        {!R.isNil(user) &&
          R.compose(
            R.map(({ bucketName, objectName, filename }) => (
              <Segment clearing key={objectName}>
                {filename}
                <DownloadButton
                  bucketName={bucketName}
                  objectName={objectName}
                  filename={filename}
                />
              </Segment>
            )),
            R.prop('uploads')
          )(user)}
      </Segment>
    )}
  </Query>
)

const App = ({ setPageKey, user, result, createUpload }) => {
  const [files, setFiles] = useState([])
  const { userID } = user
  return (
    <div style={{ background: '#82E0AA' }}>
      <Button
        size="massive"
        style={{ background: '#82E0AA', color: '#ffff' }}
        as={'label'}
        floated="right"
        animated="fade"
        onClick={() => setPageKey('homePage')}
      >
        <Button.Content content="LOG-OUT" hidden />
        <Button.Content
          content={`${R.prop('username', user)}... do you want to leave?`}
          visible
        />
      </Button>
      {/* <Divider hidden vertical centered='true'> */}
      {
        <Button
          size="massive"
          animated="fade"
          style={{ background: '#82E0AA', color: '#ffff' }}
          as={'label'}
        >
          <Button.Content hidden>
            <Dropzone
              onDrop={files =>
                createUpload({ variables: { userID, file: R.head(files) } })
              }
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()}>
                  <Icon name="upload"></Icon>
                  <input {...getInputProps()} />
                </div>
              )}
            </Dropzone>
          </Button.Content>
          <Button.Content visible>CLICK TO UPLOAD</Button.Content>
        </Button>
      }
      {/* </Divider> */}
      <Segment>
        <Grid
          columns={3}
          style={{ height: '200vh' }}
          stackable
          textAlign="center"
        >
          <Grid.Row verticalAlign="top">
            <Grid.Column>
              <Header style={{ color: '#82E0AA' }} icon>
                <br></br>
                <Icon
                  style={{ color: '#82E0AA' }}
                  name="file alternate outline"
                />
                <br></br>
                LIST OF UPLOADED FILES
                <UploadsList user={user} />
              </Header>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </div>
  )
}

const withMutation = WrappedComponent => props => (
  <Mutation mutation={CREATE_UPLOAD_MUTATION}>
    {(createUpload, result) => (
      <WrappedComponent
        {...props}
        createUpload={createUpload}
        result={result}
      />
    )}
  </Mutation>
)
export default withMutation(App)
