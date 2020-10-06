import Vue from 'vue';
import Vuex from 'vuex';

import axios from 'axios';

import { diff, newExists } from '../utils';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    weblancerError: '',
    weblancerLoading: false,
    weblancerProjects: null,
    weblancerPrevProjects: null,
    weblancerNewProjects: {},
    flhuntError: '',
    flhuntLoading: false,
    flhuntProjects: null,
    flhuntPrevProjects: null,
    flhuntNewProjects: {},
    flhabrError: '',
    flhabrLoading: false,
    flhabrProjects: null,
    flhabrPrevProjects: null,
    flhabrNewProjects: {},
    freelanceruError: '',
    freelanceruLoading: false,
    freelanceruProjects: null,
    freelanceruPrevProjects: null,
    freelanceruNewProjects: {},
    flruError: '',
    flruLoading: false,
    flruProjects: null,
    flruPrevProjects: null,
    flruNewProjects: {},
  },
  getters: {
    getWeblancerProjects(state) {
      return state.weblancerProjects;
    },
    getWeblancerNewProjects(state) {
      return state.weblancerNewProjects;
    },
    isWeblancerLoading(state) {
      return state.weblancerLoading;
    },
    getFlhuntProjects(state) {
      return state.flhuntProjects;
    },
    getFlhuntNewProjects(state) {
      return state.flhuntNewProjects;
    },
    isFlhuntLoading(state) {
      return state.flhuntLoading;
    },
    getFlhabrProjects(state) {
      return state.flhabrProjects;
    },
    getFlhabrNewProjects(state) {
      return state.flhabrNewProjects;
    },
    isFlhabrLoading(state) {
      return state.flhabrLoading;
    },
    getFreelanceruProjects(state) {
      return state.freelanceruProjects;
    },
    getFreelanceruNewProjects(state) {
      return state.freelanceruNewProjects;
    },
    isFreelanceruLoading(state) {
      return state.freelanceruLoading;
    },
    getFlruProjects(state) {
      return state.flruProjects;
    },
    getFlruNewProjects(state) {
      return state.flruNewProjects;
    },
    isFlruLoading(state) {
      return state.flruLoading;
    },
  },
  mutations: {
    setError(state, payload) {
      state.weblancerError = payload;
    },
    clearError(state) {
      state.error = '';
    },
    setLoading(state, payload) {
      state[`${payload.freelance}Loading`] = payload.val;
    },
    setProjects(state, payload) {
      state[`${payload.freelance}Projects`] = payload.data;
    },
    setPrevProjects(state, payload) {
      // state[`${payload.freelance}PrevProjects`] = state[`${payload.freelance}Projects`];
      if (state[`${payload.freelance}PrevProjects`] === null) {
        state[`${payload.freelance}PrevProjects`] = {};
      }
      for (const proj in state[`${payload.freelance}Projects`]) {
        Vue.set(
          state[`${payload.freelance}PrevProjects`],
          '' + proj,
          state[`${payload.freelance}Projects`][proj].map((obj) => Object.assign({}, obj))
        );
      }
    },
    addNewProjects(state, payload) {
      let newProjects = state[`${payload.freelance}NewProjects`];
      for (const proj in payload.data) {
        newProjects[proj] === undefined
          ? Vue.set(
              newProjects,
              '' + proj,
              payload.data[proj].map((obj) => Object.assign({}, obj))
            )
          : Vue.set(newProjects, '' + proj, [
              ...newProjects[proj].map((obj) => Object.assign({}, obj)),
              ...payload.data[proj].map((obj) => Object.assign({}, obj)),
            ]);
      }
    },
    resetNewProjects(state, payload) {
      while (state[`${payload.freelance}NewProjects`][payload.section].length !== 0) {
        state[`${payload.freelance}NewProjects`][payload.section].splice(0, 1);
      }
    },
    addToProjects(state, payload) {
      if (state[`${payload.freelance}Projects`] === null) {
        state[`${payload.freelance}Projects`] = {};
      }
      for (const proj in payload.data) {
        Vue.set(
          state[`${payload.freelance}Projects`],
          '' + proj,
          payload.data[proj].map((obj) => Object.assign({}, obj))
        );
      }
    },
  },
  actions: {
    async fetchProjects({ commit }, payload) {
      let freelance = payload.freelance;
      let type;
      switch (freelance) {
        case 'weblancer':
          type = '?type=cheerio';
          break;
        case 'flhunt':
          type = '?type=cheerio';
          break;
        case 'flhabr':
          type = '';
          break;
        case 'freelanceru':
          type = '';
          break;
        case 'flru':
          type = '';
          break;
      }

      commit('clearError');
      commit(`setLoading`, { val: true, freelance });
      try {
        return await axios.get(`http://localhost:5000/api/${freelance}-start${type}`);
        // console.log(run.data);
      } catch (error) {
        console.log(error);
      }
    },
    async readProjects({ commit, state }, payload) {
      let freelance = payload.freelance;

      commit('clearError');
      commit(`setLoading`, { val: true, freelance });
      try {
        let response = await axios.get(`http://localhost:5000/api/${freelance}-projects?cnt=${payload.cnt}&first=${payload.firstTime}`);
        // console.log(projects.data);

        let cnt = response.data.cnt;
        let date = response.data.date;
        while (cnt !== 0) {
          let projects = await axios.get(`http://localhost:5000/api/${freelance}-projects?cnt=${cnt}&first=${payload.firstTime}`);
          cnt = projects.data.cnt;
          delete projects.data.cnt;
          console.log(projects.data);

          commit(`addToProjects`, { data: projects.data, freelance });
        }

        let prevProjects = state[`${freelance}PrevProjects`];
        let curProjects = state[`${freelance}Projects`];
        if (prevProjects !== null) {
          let newProjects = {};
          for (const proj in prevProjects) {
            let newProj = diff(prevProjects[proj], curProjects[proj]);
            newProjects[proj] = newProj;
            // console.log(newProj);
          }
          // console.log(newProjects);
          if (newExists(newProjects)) {
            let sound = new Audio(require('@/assets/sms.mp3'));
            sound.volume = 0.8;
            sound.play();
            commit(`addNewProjects`, { data: newProjects, freelance });
          }
        }
        commit(`setPrevProjects`, { freelance });
        commit(`setLoading`, { val: false, freelance });
        return date;
      } catch (error) {
        console.log(error);
        commit(`setLoading`, { val: false, freelance });
      }
    },
  },
});
