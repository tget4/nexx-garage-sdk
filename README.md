# Nexx Garage SDK

This is a javascript sdk for interacting with Nexx Garage API's.

*Nexx Garage does not provide an official API. The results of this project are merely from reverse engineering. This project does not have any official relationship or support by https://getnexx.com/. Use it at your own risk.*

Nexx Garage Official Site: https://getnexx.com/

## Usage:

```
npm i nexx-garage-sdk
```


```
import { NexxApiClient } from 'nexx-garage-sdk';

const client = new NexxApiClient({
  "password": "your_password",
  "username": "your_username",
  "clientId": client_id, // see instructions below
  "deviceToken": device_token, // see instructions below
});

// get array of all devices
const [ firstDevice ] = await client.getDevices();

// open the first device
const result = await client.open(firstDevice.DeviceId);
```

## How to find the client_id and device_token?

You will need to use an HTTP Proxy like https://www.charlesproxy.com/ to find your
`client_id` and `device_token`. Follow the instructions [here](https://www.charlesproxy.com/documentation/using-charles/ssl-certificates/) for whatever device you are using.

When you log in, there is a POST request to identity-api.simpaltek.com/token. This will have the `client_id` and `device_token` in the request body.


