import Service, { inject as service } from '@ember/service';
import { Machine, interpret } from 'xstate';
import flat from 'flat';

export default Service.extend({
  logger: service('logger'),
  matches: function(state, matches) {
    if (typeof state === 'undefined') {
      return false;
    }
    const values = Array.isArray(matches) ? matches : [matches];
    return values.some(item => {
      return state.matches(item);
    });
  },
  state: function(cb) {
    return {
      matches: cb,
    };
  },
  interpret: function(chart, options) {
    return interpret(this.machine(chart, options)).onTransition(state => {
      this.logger.execute(`${chart.id}:${state.event.type} > ${state.toStrings().pop()}`);
      if (state.changed) {
        options.onTransition(state);
      }
    });
  },
  machine: function(chart, options) {
    options.guards = this.guards(chart).reduce(function(prev, guard) {
      prev[guard] = function() {
        return !!options.onGuard(...[guard, ...arguments]);
      };
      return prev;
    }, {});
    return Machine(chart, options);
  },
  guards: function(chart) {
    return Object.entries(flat(chart))
      .filter(([key]) => key.endsWith('.cond'))
      .map(([key, value]) => value);
  },
});
