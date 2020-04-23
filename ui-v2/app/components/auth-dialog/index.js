import Component from '@ember/component';
import Slotted from 'block-slots';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { getOwner } from '@ember/application';
import chart from './chart.xstate';

export default Component.extend(Slotted, {
  tagName: '',
  env: service('env'),
  feedback: service('feedback'),
  router: service('router'),
  http: service('repository/type/event-source'),
  client: service('client/http'),
  store: service('store'),
  settings: service('settings'),
  init: function() {
    this._super(...arguments);
    this.chart = chart;
  },
  actions: {
    hasToken: function() {
      return typeof this.token.AccessorID !== 'undefined';
    },
    login: function() {
      this.feedback.execute(
        this.actions.reauthorize.bind(this),
        'authorize',
        function(type, e) {
          return type;
        },
        {}
      );
    },
    logout: function() {
      this.feedback.execute(
        this.actions.reauthorize.bind(this),
        'logout',
        function(type, e) {
          return type;
        },
        {}
      );
    },
    reauthorize: function(e) {
      this.client.abort();
      this.http.resetCache();
      this.store.init();

      let routeName = this.router.currentRouteName;
      const route = getOwner(this).lookup(`route:${routeName}`);
      return route.refresh();
    },
  },
});
