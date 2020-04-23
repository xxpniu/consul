import RepositoryService from 'consul-ui/services/repository';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { set } from '@ember/object';

const modelName = 'oidc-provider';
const OAUTH_PROVIDER = 'oidc-consul';
export default RepositoryService.extend({
  manager: service('torii'),
  init: function() {
    this._super(...arguments);
    this.provider = getOwner(this).lookup(`torii-provider:${OAUTH_PROVIDER}`);
  },
  getModelName: function() {
    return modelName;
  },
  authorize: function(id, code, state, dc, nspace, configuration = {}) {
    return this.store.authorize(this.getModelName(), {
      id,
      code,
      state,
      dc,
      nspace,
    });
  },
  close: function() {
    this.manager.close(OAUTH_PROVIDER);
  },
  findCode: function(src) {
    const url = new URL(src);
    // TODO: Maybe move this to the provider itself
    set(this.provider, 'baseUrl', `${url.protocol}//${url.host}${url.pathname}`);
    [...url.searchParams.entries()].forEach(([param, value]) => {
      let key;
      switch (param) {
        case 'client_id':
          key = 'clientId';
          break;
        case 'redirect_uri':
          key = 'redirectUri';
          break;
        case 'state':
          key = 'state';
          break;
        default:
          key = param;
      }
      set(this.provider, key, value);
    });
    return this.manager.open(OAUTH_PROVIDER, {}).catch(e => {
      let err;
      switch (true) {
        case e.message.startsWith('remote was closed'):
          err = new Error('Remote was closed');
          err.statusCode = 499;
          break;
      }
      return this.store.adapterFor(this.getModelName()).error(err);
    });
  },
});
