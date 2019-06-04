import React, {useState, useEffect} from 'react'
import 'semantic-ui-css/semantic.min.css'
import {Button, Segment, Header, Icon, Grid, Divider } from 'semantic-ui-react'


import * as R from 'ramda'

import {Query} from 'react-apollo'

import gql from 'graphql-tag'

const USER_UPLOADS = gql`{
    user (userID:"5cf69f0c3d57a51cba9aece3"){
        username
        uploads{
            filename
            objectName
            bucketName
        }
    }   
}
`

const UploadsList = ({
    user
}) => (
    <Query query={USER_UPLOADS} skip={R.isNil(user)}>
    {
        ({data: {user}, error, loading}) => (
            !R.isNil(user) &&
            R.compose(
                R.map(
                    ({objectName, filename}) => (
                        <Segment clearing key={objectName}>
                            {filename}
                            <Button style={{background:'#82E0AA', color:'#ffff'}} floated='right' content='Download'
                                as='a'
                                target="_blank"
                                download
                                href={`http://localhost:4000/upload/download/${objectName}`}
                            />
                        </Segment>
                    )
                ),            
                R.prop('uploads')
            )(user)
        )
    }
    </Query>
)

const App = ({setPageKey, user}) => {
    const [files, setFiles] = useState([])
    useEffect(
         () => {
            const fetchUploads = async () => {
                const uploads = await fetch('/upload/all')
                const data = await uploads.json()
                setFiles(data)
            }
            fetchUploads()
        }, 
        []
    )
    return (
        <div style={{background: '#82E0AA'}}>
        <Button
            size='medium' inverted floated='right'
            animated='fade'
            onClick={() => setPageKey('homePage')}
        >
            <Button.Content content='LOG-OUT' hidden/>
            <Button.Content content={`${R.prop('username', user)}... do you want to leave?`} visible/>
        </Button>
        <Segment  attached='bottom' size='massive' placeholder>
            <Grid columns={2} style={{ height: '90vh' }} stackable textAlign='center'>
                <Divider hidden vertical centered='true'>
                {<Button size='massive' animated='fade' style={{background:'#82E0AA', color:'#ffff'}} as={'label'} htmlFor={'upload'}>
                    <Button.Content visible>
                        CLICK TO UPLOAD
                    </Button.Content>
                    <Button.Content hidden>
                        <Icon name='upload' />
                    </Button.Content>
                </Button>}
                </Divider>
                <Grid.Row verticalAlign='top'>
                    <Grid.Column>
                        <Header style={{color:'#82E0AA'}} icon>
                            <br></br>
                            <Icon style={{color:'#82E0AA'}} name='circle outline' />
                            <br></br>
                            NUMBER OF UPLOADED FILES
                            <br></br><br></br>
                            {R.length(files)}
                        </Header>
                    </Grid.Column>
                    <Grid.Column>
                        <Header style={{color:'#82E0AA'}} icon>
                            <br></br>
                            <Icon style={{color:'#82E0AA'}} name='circle' />
                            <br></br>
                            LIST OF UPLOADED FILES
                            <UploadsList user={user} />
                            {/* {R.map(
                                ({objectName, filename}) => (
                                    <Segment clearing key={objectName}>
                                        {filename}
                                        <Button style={{background:'#82E0AA', color:'#ffff'}} floated='right' content='Download'
                                            as='a'
                                            target="_blank"
                                            download
                                            href={`http://localhost:4000/upload/download/${objectName}`}
                                        />
                                    </Segment>
                                ),
                                files
                            )} */}
                        </Header>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <input hidden id={'upload'} type={'file'} 
                onChange={(event) => {
                    const file = R.head(event.target.files)
                    // Send file to minio
                   const xhr = new XMLHttpRequest ()
                   xhr.open('PUT', 'http://localhost:4000/upload', true)
                   xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
                //    xhr.withCredentials = true
                   const formData = new FormData()
                   formData.append('uploadedFile', file)
                   xhr.send(formData)
                   xhr.onload = () => {
                    //    if (xhr.status == 200) {

                    //    }
                   }
                   //console.log(event.target.files)
                }}
                />
        </Segment>
        </div>
        )
    }

export default App