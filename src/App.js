import React, { Component } from 'react';
import { Container, Message, Icon, Button, Divider, Form, Dimmer, Loader, Segment } from 'semantic-ui-react';
import { getBucket, getBucketInfo } from './utils/getBucket';
import './App.css';
import axios from 'axios';

const WEBHOOK_API_ENDPOINT = 'https://cosmic-onesignal-api.herokuapp.com';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      id: "",
      slug: "",
      onesignalapiid: "",
      onesignalrestapikey: "",
      onesignalnotificationheading: "",
      onesignalnotificationcontent: "",
      addWebhookId: "",
      bucketSlug:"",
      isRemoveButtonEnabled: false,
      loading: false
    }
  }

  handleChanges = (evt) => {
    this.setState({
      [evt.target.name]: evt.target.value
    })
  }

  async componentDidMount() {
    const {bucket} = await getBucketInfo();
    axios.get(`${WEBHOOK_API_ENDPOINT}/api/getBucketSlug/${bucket._id}`)
      .then(response => {
        if (response.data.object) {
          this.setState({
            id: bucket._id,
            slug: bucket._id,
            onesignalapiid: response.data.object.metadata.onesignalapiid,
            onesignalrestapikey: response.data.object.metadata.onesignalrestapikey,
            onesignalnotificationheading: response.data.object.metadata.onesignalnotificationheading,
            onesignalnotificationcontent: response.data.object.metadata.onesignalnotificationcontent,
            addWebhookId: response.data.object.metadata.addWebhookId,
            isRemoveButtonEnabled: response.data.object.metadata.onesignalapiid !== "" ? true : false,
            bucketSlug: response.data.object.metadata.bucketSlug
          })
        }
      });
  }

  saveBucketData = async (evt) => {
    evt.preventDefault();
    const {bucket} = await getBucketInfo();
    const body = {
      id: this.state.id === "" ? bucket._id : this.state.id,
      slug: this.state.slug === "" ? bucket._id : this.state.slug,
      onesignalapiid: this.state.onesignalapiid,
      onesignalrestapikey: this.state.onesignalrestapikey,
      onesignalnotificationheading: this.state.onesignalnotificationheading,
      onesignalnotificationcontent: this.state.onesignalnotificationcontent,
      addWebhookId: this.state.addWebhookId,
      bucketSlug: this.state.bucketSlug === "" ? bucket.slug : this.state.bucketSlug
    }

    if (this.state.id === "") {
      this.showLoading();
      const createId = await this.addWebhooks();
      body.addWebhookId = createId;
      axios.post(`${WEBHOOK_API_ENDPOINT}/api/addBucketSlug`, body).then(
        res => {
          this.setState({
            isRemoveButtonEnabled: true,
            loading: false
          })
        }
      )
    }
    else {
      axios.post(`${WEBHOOK_API_ENDPOINT}/api/editBucketSlug`, body);
    }
  }

  addWebhooks = async () => {
    const bucket = getBucket();
    const webhookData = await bucket.addWebhook({
      endpoint: `${WEBHOOK_API_ENDPOINT}/api/create`,
      event: 'object.created.published',
    });
    return webhookData.webhook.id;
  }

  removeBucket = async () => {
    const {bucket} = await getBucketInfo();
    this.showLoading();
    axios.post(`${WEBHOOK_API_ENDPOINT}/api/removeBucketSlug/${bucket._id}`).then(
      res => {
        this.setState({
          id: "",
          slug: "",
          onesignalapiid: "",
          onesignalrestapikey: "",
          onesignalnotificationheading: "",
          onesignalnotificationcontent: "",
          isRemoveButtonEnabled: false,
          loading: false,
          bucketSlug: ""
        })
      }
    )
  }

  showLoading =() =>{
    this.setState({loading: true});
  }

  render() {
    return (
      <Container>
        <Segment>
          <Dimmer active={this.state.loading} inverted>
            <Loader inverted />
          </Dimmer>
          <h1>One Signal Push Notifications</h1>
          <div style={{ marginBottom: 20 }}>
            <img alt="OneSignal to Cosmic" style={{ width: 250, height: 116 }} src='https://cosmic-s3.imgix.net/da8a9680-ba01-11e9-9a38-63dd375eb6aa-onesignal-cosmic.png?w=400&h=300&q=70' />
            { /* Hidden images loaded in bg */}
          </div>
          <p>Follow the below steps to enable the push notifications:</p>
          <h2>Step 1:</h2>
          <Message>
            <Message.Header>Note</Message.Header>
            <p>If you don't have application which uses Comisc JS then first create it and then setup the One Signal for it.</p>
          </Message>
          <p>Go to <a href="https://onesignal.com/">OneSignal</a> and create an account.</p>
          <p>Follow below tutorial to set-up the One Signal for your application:</p>
          <p>Web push setup &nbsp;&nbsp;<a href="https://documentation.onesignal.com/docs/web-push-typical-setup" target="_blank" rel="noopener noreferrer"><Icon name="external" /></a></p>
          <p>Testing push notification from One Singal dashboard &nbsp;&nbsp;<a href="https://documentation.onesignal.com/docs/testing-web-push-notifications" target="_blank" rel="noopener noreferrer"><Icon name="external" /></a></p>
          <Divider />
          <h2>Step 2:</h2>
          <p>To enable push notification we require Authentication Key and REST API Key</p>
          <Message >
            <Message.Header>Requires Authentication Key</Message.Header>
            <p>Requires your OneSignal App's REST API Key, available in <a href="https://documentation.onesignal.com/docs/accounts-and-keys#section-keys-ids" target="_blank" rel="noopener noreferrer">Keys & IDs</a></p>
          </Message>

          <Form style={{ width: '50%' }} onSubmit={this.saveBucketData}>
            <Form.Field>
              <label>One Signal API Id</label>
              <input
                placeholder='one-signal-api-id'
                name='onesignalapiid'
                type="password"
                value={this.state.onesignalapiid}
                onChange={this.handleChanges}
              />
            </Form.Field>
            <Form.Field>
              <label>One Signal REST API Key</label>
              <input
                placeholder='one-signal-rest-api-key'
                name='onesignalrestapikey'
                type="password"
                value={this.state.onesignalrestapikey}
                onChange={this.handleChanges}
              />
            </Form.Field>
            <Form.Field>
              <label>Notification Heading</label>
              <input
                name='onesignalnotificationheading'
                value={this.state.onesignalnotificationheading}
                onChange={this.handleChanges}
              />
            </Form.Field>
            <Form.Field>
              <label>Notification Content</label>
              <input
                name='onesignalnotificationcontent'
                value={this.state.onesignalnotificationcontent}
                onChange={this.handleChanges}
              />
            </Form.Field>
            <Button type='submit' primary>Submit</Button>
          </Form>
          {
            this.state.isRemoveButtonEnabled &&
            <div>
              <Divider />
              <p>Remove all extension data before un-installing</p>
              <Button color='red' onClick={this.removeBucket}>Delete</Button>
            </div>
          }
        </Segment>
      </Container>
    );
  }
}

export default App;
