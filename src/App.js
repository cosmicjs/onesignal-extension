import React, { Component } from 'react';
import { Container, Message, Icon, Divider, Dimmer, Loader, Segment } from 'semantic-ui-react';
import { getBucket, getBucketInfo } from './utils/getBucket';
import './App.css';
import axios from 'axios';
import queryString from 'query-string';

const WEBHOOK_API_ENDPOINT = 'https://cosmic-onesignal-api.herokuapp.com';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      id: "",
      onesignalapiid: "",
      onesignalrestapikey: "",
      onesignalnotificationheading: "",
      onesignalnotificationcontent: "",
      notificationurl: "",
      bucketSlug: "",
      isRemoveButtonEnabled: false,
      loading: false,
      webhookLink: ""
    }
  }

  async componentDidMount() {
    const { one_signal_api_id, one_signal_rest_api_key, notification_heading, notification_content, write_key, notification_url } = queryString.parse(window.location.search);
    this.setState({
      onesignalapiid: one_signal_api_id !== "undefined" ? one_signal_api_id : "",
      onesignalrestapikey: one_signal_rest_api_key !== "undefined" ? one_signal_rest_api_key : "",
      onesignalnotificationheading: notification_heading !== "undefined" ? notification_heading : "",
      onesignalnotificationcontent: notification_content !== "undefined" ? notification_content : "",
      notificationurl: notification_url !== "undefined" ? notification_url : ""
    });
    const { bucket } = await getBucketInfo();
    const isPresent = await this.isWebhookAdded();
    if (!isPresent) {
      if ((one_signal_api_id !== "" && one_signal_api_id !== "undefined") &&
        (one_signal_rest_api_key !== "" && one_signal_rest_api_key !== "undefined") &&
        (notification_heading !== "" && notification_heading !== "undefined") &&
        (notification_content !== "" && notification_content !== "undefined") &&
        (notification_url !== "" && notification_url !== "undefined")) {
        this.showLoading();
        const createId = await this.addWebhooks(this.state.onesignalapiid, this.state.onesignalrestapikey, this.state.onesignalnotificationheading,
          this.state.onesignalnotificationcontent, this.state.notificationurl);
        if (createId) {
          await this.addWebHookParameterIntoExtension(write_key, bucket.slug, this.state.onesignalapiid, this.state.onesignalrestapikey, this.state.onesignalnotificationheading,
            this.state.onesignalnotificationcontent, this.state.notificationurl);
          this.setState({
            webhookLink: `https://cosmicjs.com/${bucket.slug}/webhooks`,
            isRemoveButtonEnabled: true,
            loading: false
          });
        }
      }
    }
    else{
      console.log("Webhook is already added!!!!!");
      this.setState({
        webhookLink: `https://cosmicjs.com/${bucket.slug}/webhooks`,
        isRemoveButtonEnabled: true,
        loading: false
      });
    }
  }

  addWebhooks = async (apiid, restapikey, notificationheading, notificationcontent, notificationurl) => {
    const bucket = getBucket();
    const webhookData = await bucket.addWebhook({
      endpoint: `${WEBHOOK_API_ENDPOINT}/api/create?apiid=${apiid}&restapikey=${restapikey}&notificationheading=${notificationheading}&notificationcontent=${notificationcontent}&notificationurl=${notificationurl}`,
      event: 'object.created.published',
    });
    return webhookData.webhook.id;
  }

  addWebHookParameterIntoExtension = async (write_key, bucket_slug, apiid, restapikey, notificationheading, notificationcontent, notificationurl) => {
    const extensionId = await this.getOneSignalExtensionId();
    if (extensionId !== null) {
      const data = {
        "write_key": write_key,
        "query_params": [
          {
            "key": "one_signal_api_id",
            "value": apiid
          },
          {
            "key": "one_signal_rest_api_key",
            "value": restapikey
          },
          {
            "key": "notification_heading",
            "value": notificationheading
          },
          {
            "key": "notification_content",
            "value": notificationcontent
          },
          {
            "key": "notification_url",
            "value": notificationurl
          },
          {
            "key": "added_webhook",
            "value": "true"
          }
        ]
      }
      const url = `https://api.cosmicjs.com/v1/${bucket_slug}/extensions/${extensionId}`;
      axios.put(url, data)
        .then(response => {
          console.log("response" + response);
        })
        .catch(error => {
          console.log(error);
        })
    }
  }

  getOneSignalExtensionId = async () => {
    const { bucket } = await getBucketInfo();
    const { extensions } = bucket;
    let oneSignalExtension = null;
    if (extensions.length > 0) {
      oneSignalExtension = extensions.find(x => x.title === "One Signal Notifications");
    }
    if (oneSignalExtension != null) {
      return oneSignalExtension.id;
    }
    return oneSignalExtension;
  }

  isWebhookAdded = async () => {
    const { added_webhook } = queryString.parse(window.location.search);
    if(added_webhook){      
      return true;
    }
    return false;
  }

  showLoading = () => {
    this.setState({ loading: true });
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
          {
            (this.state.onesignalapiid === '' || this.state.onesignalapiid === undefined) &&
            <Message negative>
              <Icon name='info circle' size='big' />
              Please add the <b>one_signal_api_id</b> into Extension Query Parameters section
            </Message>
          }
          {
            (this.state.onesignalrestapikey === '' || this.state.onesignalrestapikey === undefined) &&
            <Message negative>
              <Icon name='info circle' size='big' />
              Please add the <b>one_signal_rest_api_key</b> into Extension Query Parameters section
            </Message>
          }
          {
            (this.state.onesignalnotificationheading === '' || this.state.onesignalnotificationheading === undefined) &&
            <Message negative>
              <Icon name='info circle' size='big' />
              Please add the <b>notification_heading</b> into Extension Query Parameters section
            </Message>
          }
          {
            (this.state.onesignalnotificationcontent === '' || this.state.onesignalnotificationcontent === undefined) &&
            <Message negative>
              <Icon name='info circle' size='big' />
              Please add the <b>notification_content</b> into Extension Query Parameters section
            </Message>
          }
          {
            (this.state.notificationurl === '' || this.state.notificationurl === undefined) &&
            <Message negative>
              <Icon name='info circle' size='big' />
              Please add the <b>notification_url</b> into Extension Query Parameters section
            </Message>
          }
          {
            this.state.isRemoveButtonEnabled &&
            <Message negative>
              <Message.Header>Want to Remove Push Notification</Message.Header>
              <p> Delete the webhook <a href={this.state.webhookLink} target="_blank" rel="noopener noreferrer"><Icon name="external" /></a></p>
              <p>Delete <b>added_webhook</b> parameter from Extension Query Parameters section.</p>
            </Message>
          }
        </Segment>
      </Container>
    );
  }
}

export default App;
