import Component from '@ember/component';
import chart from './chart.xstate';
import { scheduleOnce } from '@ember/runloop';
export default Component.extend({
  init: function() {
    this._super(...arguments);
    this.chart = chart;
  },
  actions: {
    isSecret: function() {
      return this.type === 'secret';
    },
  },
});
