import Service from '@ember/service';

export default Service.extend({
  execute: function(obj) {
    typeof obj.error !== 'undefined' ? console.error(obj.error) : console.log(obj);
  },
});
