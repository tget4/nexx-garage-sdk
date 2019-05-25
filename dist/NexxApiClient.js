"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importDefault(require("request"));
const constants_1 = __importDefault(require("./constants"));
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); // tslint:disable-line
        return v.toString(16);
    });
};
class NexxApiClient {
    constructor(config = {}) {
        this.config = config;
    }
    open(deviceId, device = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log({ action: 'open', deviceId });
            return yield this.activateDevice('OPEN', deviceId, device);
        });
    }
    close(deviceId, device = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log({ action: 'close', deviceId });
            return yield this.activateDevice('CLOSE', deviceId, device);
        });
    }
    /**
     * activate a device
     * @param activationType
     * @param deviceId
     * @param device
     */
    activateDevice(activationType, deviceId, device = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log({ action: 'activateDevice', activationType });
            if (!this.auth) {
                yield this.generateToken();
            }
            return new Promise((resolve, reject) => {
                if (!this.devices || Object.keys(this.devices).length === 0) {
                    reject('No devices to activate');
                    return;
                }
                if (!this.devices[deviceId]) {
                    reject('No device found for this id');
                    return;
                }
                const req = request_1.default.defaults({
                    headers: {
                        'Authorization': `${this.auth.token_type} ${this.auth.access_token}`,
                        'User-Agent': 'NexxHome/1.12 (com.simpaltek.nexxhome; build:8; iOS 12.2.0) Alamofire/4.7.3',
                    },
                });
                const defaults = {
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
                const json = Object.assign({}, defaults, device);
                req.post(constants_1.default.ActivateDevice, { json }, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res.body);
                    }
                });
            });
        });
    }
    getDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log({ action: 'getDevices' });
            if (!this.auth) {
                yield this.generateToken();
            }
            const req = request_1.default.defaults({
                headers: {
                    'Authorization': `${this.auth.token_type} ${this.auth.access_token}`,
                    'User-Agent': 'NexxHome/1.12 (com.simpaltek.nexxhome; build:8; iOS 12.2.0) Alamofire/4.7.3',
                },
            });
            return new Promise((resolve, reject) => {
                req.get(constants_1.default.UserRegisteredDevice, (err, res) => {
                    if (err) {
                        try {
                            reject(JSON.parse(err.body));
                        }
                        catch (e) {
                            reject(err);
                        }
                    }
                    else {
                        try {
                            this.devices = JSON.parse(res.body).Result.reduce((acc, value) => {
                                acc[value.DeviceId] = value;
                                return acc;
                            }, {});
                            resolve(this.devices);
                        }
                        catch (e) {
                            reject(`Unable to parse response. ${res.body}`);
                        }
                    }
                });
            });
        });
    }
    generateToken() {
        this.log({ action: 'generateToken' });
        const formData = {
            client_id: this.config.clientId,
            device_token: this.config.deviceToken,
            grant_type: this.config.grantType,
            password: this.config.password,
            username: this.config.username,
        };
        return new Promise((resolve, reject) => {
            const req = request_1.default.defaults({
                headers: {
                    'User-Agent': 'NexxHome/1.12 (com.simpaltek.nexxhome; build:8; iOS 12.2.0) Alamofire/4.7.3',
                },
            });
            req.post({ form: formData, url: constants_1.default.TokenUrl }, (err, res) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.auth = JSON.parse(res.body);
                    resolve(JSON.parse(res.body));
                }
            });
        });
    }
    log(data) {
        const fn = typeof this.logger === 'function' ? this.logger : () => { }; // tslint:disable-line
        fn(data);
    }
}
exports.default = NexxApiClient;
//# sourceMappingURL=NexxApiClient.js.map