import Component from '@ember/component';
import chart from './chart.xstate';

export default Component.extend({
  tagName: '',
  onchange: function() {},
  onerror: function() {},
  init: function() {
    this._super(...arguments);
    this.chart = chart;
  },
  didReceiveAttrs: function() {
    if (typeof this.items !== 'undefined') {
      this.dispatch('SUCCESS');
    }
  },
});
