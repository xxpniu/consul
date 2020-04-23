import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  didInsertElement: function() {
    const o = this;
    this.chart.addGuard(this.name, function() {
      if (typeof o.cond === 'function') {
        return o.cond(...arguments);
      } else {
        return o.cond;
      }
    });
  },
  willDestroy: function() {
    this.chart.removeGuard(this.name);
  },
});
