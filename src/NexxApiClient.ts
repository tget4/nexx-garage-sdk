import request from 'request';
import Constants from './constants';

const DEFAULT_USER_AGENT = 'NexxHome/1.12 (com.simpaltek.nexxhome; build:8; iOS 12.2.0) Alamofire/4.7.3';
const DEFAULT_GRANT_TYPE = 'password';

interface NexxApiClientConfig {
  username?: string;
  password?: string;
  clientId?: string;
  deviceToken?: string;
  grantType?: string;
  userAgent?: string;
}

interface NexxDevice {
  Activation?: string;
  ActivationType?: string;
  AdditionalData?: object;
  AppVersion?: string;
  DeviceId?: string;
  Latitude?: string;
  Longitude?: string;
  MobileDeviceUUID?: string;
  ProductCode?: string;
  SentDateTime?: string;
  SentDateTimeOffSet?: string;
  SentLocalDateTime?: string;
}

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); // tslint:disable-line
    return v.toString(16);
  });
};

export default class NexxApiClient {
  public auth: any;
  public devices: any;
  public logger: any;
  private config: NexxApiClientConfig;

  /**
   *
   * @param NexxApiClientConfig config
   */
  constructor(config: NexxApiClientConfig = {}) {
    this.config = config;
    if (!this.config.userAgent) {
      this.config.userAgent = DEFAULT_USER_AGENT;
    }
    if (!this.config.grantType) {
      this.config.grantType = DEFAULT_GRANT_TYPE;
    }
  }

  /**
   * Perform the open activate command
   * @param deviceId
   * @param device
   */
  public async open(deviceId: string, device: NexxDevice = {}) {
    this.log({ action: 'open', deviceId });
    return await this.activateDevice('OPEN', deviceId, device);
  }

  /**
   * Perform the open activate command
   * @param deviceId
   * @param device
   */
  public async close(deviceId: string, device: NexxDevice = {}) {
    this.log({ action: 'close', deviceId });
    return await this.activateDevice('CLOSE', deviceId, device);
  }

  /**
   * activate a device
   * @param activationType
   * @param deviceId
   * @param device
   */
  public async activateDevice(activationType: string, deviceId: string, device: NexxDevice = {}): Promise<any> {
    this.log({ payload: 'activateDevice', activationType });

    const model = {
      Activation: activationType,
      ActivationType: 'MANUAL',
      AdditionalData: {
        deviceType: 'iOS',
      },
      AppVersion: '1.12',
      DeviceId: deviceId,
      Latitude: 0,
      Longitude: 0,
      MobileDeviceUUID: uuidv4(),
      ProductCode: 'NGX-100',
      SentDateTime: new Date().toJSON().slice(0, 19).replace('T', ' '),
      SentDateTimeOffSet: '',
      SentLocalDateTime: new Date().toJSON().slice(0, 19).replace('T', ' '),
    };

    return await this.makeRequest(
      'POST',
      Constants.ActivateDevice,
      Object.assign({}, model, device),
    );
  }

  /**
   * get all the devices
   *
   * @return Promise<Devices>
   */
  public async getDevices(): Promise<object> {
    this.log({ payload: 'getDevices' });

    try {
      const result = await this.makeRequest('GET', Constants.UserRegisteredDevice);
      this.devices = result.Result;
      return this.devices;
    } catch (e) {
      this.log({ error: e });
      return null;
    }
  }

  /**
   * Generate the token
   * @return Promise<object>
   */
  public generateToken(): Promise<object> {
    this.log({ action: 'generateToken' });

    const formData = {
      client_id: this.config.clientId,
      device_token: this.config.deviceToken,
      grant_type: this.config.grantType,
      password: this.config.password,
      username: this.config.username,
    };

    return new Promise((resolve, reject) => {
      const req = request.defaults({
        headers: {
          'User-Agent': this.config.userAgent,
        },
      });

      req.post({ form: formData, url: Constants.TokenUrl }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          const result = JSON.parse(res.body);
          if (result.error) {
            reject(result);
            return;
          }
          this.auth = result;
          resolve(this.auth);
      }});
    });
  }

  /**
   * Set the logging function
   * @param logFn function
   */
  public setLogger(logFn: () => void) {
    this.logger = logFn;
  }
  private async makeRequest(type: string, url: string, body?: object): Promise<any> {
    if (!this.auth) {
      await this.generateToken();
    }
    const headers  = {
      'Authorization': `${this.auth.token_type} ${this.auth.access_token}`,
      'User-Agent': this.config.userAgent,
    };

    return new Promise((resolve, reject) => {
      const req = request.defaults({ headers });

      if (type === 'GET') {
        req.get(url, (err, getResult) => {
          if (err) {
            try {
              reject(JSON.parse(err.body));
            } catch (e) {
              reject(err);
            }
          } else {
            resolve(JSON.parse(getResult.body));
          }
        });
        return;
      }

      if (type === 'POST') {
        req.post(url, { json: body }, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res.body);
        }});
        return;
      }

    });
  }
  private log(data: any): void {
    const fn = typeof this.logger === 'function' ? this.logger : () => { }; // tslint:disable-line
    fn(data);
  }
}
