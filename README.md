# Nexx Garage SDK

This is a javascript sdk for interacting with Nexx Garage API's.

## Usage:

```
npm i nexx-garage-sdk
```


```
import { NexxApiClient } from 'nexx-garage-sdk';

const client = new NexxApiClient({
  "password": "your_password",
  "username": "your_username",
  "clientId": client_id, // see instructions <a href="#">here</a>
  "deviceToken": device_token, // see instructions <a href="#">here</a>
});

// get array of all devices
const [ firstDevice ] = await client.getDevices();

// open the first device
const result = await client.open(firstDevice.DeviceId);
```

## How to find the client_id and device_token?

You will need to use an HTTP Proxy like https://www.charlesproxy.com/ to find your
`client_id` and `device_token`. Follow the instructions [here](https://www.charlesproxy.com/documentation/using-charles/ssl-certificates/) for whatever device you are using.

When you log in, there is a POST request ot identity-api.simpaltek.com/token. This will have the `client_id` and `device_token` in the request body.


