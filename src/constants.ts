const DOMAIN = 'https://nexx-domain.simpaltek.com';

export default class Constants {
  public static readonly TokenUrl = 'https://identity-api.simpaltek.com/token';
  public static readonly UserRegisteredDevice = `${DOMAIN}/api/Domain/NexxCore/UserRegisteredDevice`;
  public static readonly ActivateDevice = `${DOMAIN}/api/Domain/NexxGarage/ActivateDevice`;
}
