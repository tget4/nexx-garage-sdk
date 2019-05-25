import { expect } from 'chai';
import nock from 'nock';
import NexxApiClient from '../src/NexxApiClient';
// tslint:disable-next-line:max-line-length
import userRegisteredDeviceResponse from './../nexx-domain.simpaltek.com/api/Domain/NexxCore/UserRegisteredDevice.response.json';
import activateDeviceResponse from './../nexx-domain.simpaltek.com/api/Domain/NexxGarage/ActivateDevice.response.json';
import tokenResponse from './../nexx-domain.simpaltek.com/api/Domain/Token.response.json';
import config from './config.json';
import Constants from './../src/constants';

describe('generateToken', () => {
  const client: NexxApiClient = new NexxApiClient(config);
  // client.setLogger(console.log);

  beforeEach(() => {
    nock(Constants.TokenUrl)
      .post('')
      .reply(200, tokenResponse);
    nock(Constants.UserRegisteredDevice)
      .get('')
      .reply(200, userRegisteredDeviceResponse);
    nock(Constants.ActivateDevice)
      .post('')
      .reply(200, activateDeviceResponse);
  });
  it('should create the token', async () => {
    await client.generateToken();
    expect(Object.keys(client.auth)).to.eql(Object.keys(tokenResponse));
  });
  it('should get the devices', async () => {
    const devices: any = await client.getDevices();
    expect(devices.length).to.eql(1);
  });
  it('should open a device', async () => {
    const status: any = await client.open('df38432b971a350aef4f39e91432b97da845050');
    expect(status && status.StatusCode).to.eql(200);
  });
});
