import Vue from 'vue';
import Vuex from 'vuex';

import flhunt from './flhunt';
import weblancer from './weblancer';
import flhabr from './flhabr';
import freelanceru from './freelanceru';
import flru from './flru';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    flhunt,
    weblancer,
    flhabr,
    freelanceru,
    flru,
  },
});
