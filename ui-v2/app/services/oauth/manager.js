import Service from '@ember/service';

export default class OauthProvidersService extends Service {
  open() {
    return Promise.resolve({
      authorizationCode: 'code',
      provider: 'oauth2-consul',
      redirectUri: 'http://localhost:4200/ui/torii/redirect.html',
    });
  }
}
