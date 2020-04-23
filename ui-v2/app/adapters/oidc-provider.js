import Adapter from './application';

import { env } from 'consul-ui/env';
import nonEmptySet from 'consul-ui/utils/non-empty-set';

let Namespace;
if (env('CONSUL_NSPACES_ENABLED')) {
  Namespace = nonEmptySet('Namespace');
} else {
  Namespace = () => ({});
}
export default Adapter.extend({
  requestForQuery: function(request, { dc, ns, index }) {
    return request`
      GET /v1/internal/ui/oidc-auth-methods?${{ dc }}

      ${{
        index,
        ...this.formatNspace(ns),
      }}
    `;
  },
  requestForQueryRecord: function(request, { dc, ns, id }) {
    if (typeof id === 'undefined') {
      throw new Error('You must specify an id');
    }
    return request`
      POST /v1/acl/oidc/auth-url?${{ dc }}

      ${{
        ...Namespace(ns),
        AuthMethod: id,
        // FIXME: Make this dynamic
        RedirectURI: 'http://localhost:4200/ui/torii/redirect.html',
      }}
    `;
  },
  requestForAuthorize: function(request, { dc, ns, id, code, state }) {
    if (typeof id === 'undefined') {
      throw new Error('You must specify an id');
    }
    if (typeof code === 'undefined') {
      throw new Error('You must specify an code');
    }
    if (typeof state === 'undefined') {
      throw new Error('You must specify an state');
    }
    return request`
      POST /v1/acl/oidc/callback?${{ dc }}

      ${{
        ...Namespace(ns),
        AuthMethod: id,
        Code: code,
        State: state,
      }}
    `;
  },
  authorize: function(store, type, id, snapshot) {
    return this.request(
      function(adapter, request, serialized, unserialized) {
        return adapter.requestForAuthorize(request, serialized, unserialized);
      },
      function(serializer, respond, serialized, unserialized) {
        // Completely skip the serializer here
        return respond(function(headers, body) {
          return body;
        });
      },
      snapshot,
      type.modelName
    );
  },
});
