import React, {useState, useEffect} from 'react'
import 'semantic-ui-css/semantic.min.css'
import {Button, Segment, Header, Icon, Grid, Divider } from 'semantic-ui-react'


import * as R from 'ramda'


const App = ({setPageKey}) => {
    const [files, setFiles] = useState([])
    console.log(files);
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
        <Button size='medium' inverted floated='right' content='LOG-OUT' onClick={() => setPageKey('homePage')}/>
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
                            {R.map(
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
                                    // <Segment key={filename} as={Button}
                                    //     onClick={
                                    //         () => {
                                    //             console.log('test')
                                    //             const xhr = new XMLHttpRequest ()
                                    //             xhr.open('GET', `http://localhost:4000/upload/download/${objectName}`, true)
                                    //             xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
                                    //             xhr.send()
                                    //         }
                                    //     }
                                    //     content={filename}
                                    // />
                                ),
                                files
                            )}
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