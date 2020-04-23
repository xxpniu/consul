import Oauth2CodeProvider from 'torii/providers/oauth2-code';
const OidcConsulProvider = Oauth2CodeProvider.extend({
  name: 'oauth2-consul',
  responseParams: ['state', 'code'],
  open: function(options) {
    const name = this.get('name'),
      url = this.buildUrl(),
      redirectUri = this.get('redirectUri'),
      responseParams = this.get('responseParams'),
      responseType = this.get('responseType'),
      state = this.get('state'),
      shouldCheckState = responseParams.indexOf('state') !== -1;

    return this.get('popup')
      .open(url, responseParams, options)
      .then(function(authData) {
        const missingResponseParams = [];

        responseParams.forEach(function(param) {
          if (authData[param] === undefined) {
            missingResponseParams.push(param);
          }
        });

        if (missingResponseParams.length) {
          throw new Error(
            'The response from the provider is missing ' +
              'these required response params: ' +
              missingResponseParams.join(', ')
          );
        }

        if (shouldCheckState && authData.state !== state) {
          throw new Error(
            'The response from the provider has an incorrect ' +
              'session state param: should be "' +
              state +
              '", ' +
              'but is "' +
              authData.state +
              '"'
          );
        }
        // the same as the parent class but with an authorizationState added
        return {
          authorizationState: authData.state,
          authorizationCode: decodeURIComponent(authData[responseType]),
          provider: name,
          redirectUri: redirectUri,
        };
      });
  },
  close: function() {
    const popup = this.get('popup.remove') || {};
    if (typeof popup.close === 'function') {
      return this.get('popup.remote').close();
    }
  },
});
// import Oauth2BearerProvider from 'torii/providers/oauth2-bearer';
// const Oauth2ConsulProvider = Oauth2BearerProvider.extend(
//   {
//     name: 'oauth2-consul',
//     responseParams: ['access_token'],
//   }
// );
export function initialize(application) {
  application.register('torii-provider:oidc-consul', OidcConsulProvider);
}

export default {
  initialize,
};
