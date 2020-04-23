import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Service.extend({
  datacenters: service('repository/dc'),
  namespaces: service('repository/nspace'),
  token: service('repository/token'),
  oidc: service('repository/oidc-provider'),
  type: service('data-source/protocols/http/blocking'),
  source: function(src, configuration) {
    const [, nspace, dc, model, ...rest] = src.split('/');
    let find;
    const repo = this[model];
    if (typeof repo.reconcile === 'function') {
      configuration.createEvent = function(result = {}, configuration) {
        const event = {
          type: 'message',
          data: result,
        };
        if (repo.reconcile === 'function') {
          repo.reconcile(get(event, 'data.meta') || {});
        }
        return event;
      };
    }
    switch (model) {
      case 'datacenters':
        find = configuration => repo.findAll(configuration);
        break;
      case 'namespaces':
        find = configuration => repo.findAll(configuration);
        break;
      case 'token':
        find = configuration => repo.self(rest[1], dc);
        break;
      case 'oidc':
        const [method, ...slug] = rest;
        switch (method) {
          case 'providers':
            find = configuration => repo.findAllByDatacenter(dc, nspace, configuration);
            break;
          case 'provider':
            find = configuration => {
              return repo.findBySlug(slug[0], dc, nspace);
            };
            break;
          case 'authorize':
            find = configuration => repo.authorize(slug[0], slug[1], slug[2], dc, nspace);
            break;
        }
        break;
    }
    return this.type.source(find, configuration);
  },
});
