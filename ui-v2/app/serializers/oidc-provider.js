import { inject as service } from '@ember/service';
import Serializer from './application';
import { PRIMARY_KEY, SLUG_KEY } from 'consul-ui/models/oidc-provider';

export default Serializer.extend({
  primaryKey: PRIMARY_KEY,
  slugKey: SLUG_KEY,
  respondForQueryRecord: function(respond, query) {
    // add the name and nspace here so we can merge this
    // TODO: Look to see if we always want the merging functionality
    return this._super(
      cb =>
        respond((headers, body) =>
          cb(
            {
              ['Cache-Control']: 'no-store',
              ...headers,
            },
            {
              Name: query.id,
              Namespace: query.ns,
              ...body,
            }
          )
        ),
      query
    );
  },
});
