import Vue from 'vue';
import Vuex from 'vuex';

import axios from 'axios';

// import { diff, newExists } from '../utils';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    weblancerError: '',
    weblancerLoading: false,
    weblancerProjects: null,
    weblancerNewProjects: {},
    flhuntError: '',
    flhuntLoading: false,
    flhuntProjects: null,
    flhuntNewProjects: {},
    flhabrError: '',
    flhabrLoading: false,
    flhabrProjects: null,
    flhabrNewProjects: {},
    freelanceruError: '',
    freelanceruLoading: false,
    freelanceruProjects: null,
    freelanceruNewProjects: {},
    flruError: '',
    flruLoading: false,
    flruProjects: null,
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
      // console.log(payload.data);
      let arrName = payload.data.arrName;
      let freelance = payload.freelance;
      if (state[`${freelance}Projects`] === null) {
        state[`${freelance}Projects`] = {};
      }
      Vue.set(
        state[`${freelance}Projects`],
        '' + arrName,
        payload.data[arrName].map((obj) => Object.assign({}, obj))
      );
    },
    addToProjects(state, payload) {
      console.log(payload.data);
      let arrName = payload.data.arrName;
      let freelance = payload.freelance;

      if (payload.data.deleted.length) {
        state[`${freelance}Projects`][arrName] = state[`${freelance}Projects`][arrName].filter((proj) => {
          return payload.data.deleted.indexOf(proj.link) === -1;
        });
      }

      if (payload.data[arrName].length) {
        state[`${freelance}Projects`][arrName].unshift(...payload.data[arrName].map((obj) => Object.assign({}, obj)));
      }
    },
    addNewProjects(state, payload) {
      let newProjects = state[`${payload.freelance}NewProjects`];
      let arrName = payload.data.arrName;
      newProjects[arrName] === undefined
        ? Vue.set(
            newProjects,
            '' + arrName,
            payload.data[arrName].map((obj) => Object.assign({}, obj))
          )
        : Vue.set(newProjects, '' + arrName, [
            ...newProjects[arrName].map((obj) => Object.assign({}, obj)),
            ...payload.data[arrName].map((obj) => Object.assign({}, obj)),
          ]);
    },
    resetNewProjects(state, payload) {
      while (state[`${payload.freelance}NewProjects`][payload.section].length !== 0) {
        state[`${payload.freelance}NewProjects`][payload.section].splice(0, 1);
      }
    },
  },
  actions: {
    // eslint-disable-next-line no-unused-vars
    async abortLoad({ commit }, payload) {
      try {
        return await axios.get(`http://localhost:5000/api/${payload.freelance}-abort`);
        // console.log(run.data);
      } catch (error) {
        console.log(error);
      }
    },
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
    async readProjects({ commit }, payload) {
      let freelance = payload.freelance;
      let firstTime = payload.firstTime;

      commit('clearError');
      commit(`setLoading`, { val: true, freelance });
      try {
        let response = await axios.get(`http://localhost:5000/api/${freelance}-projects?cnt=0&firstTime=${firstTime}`);
        // console.log(projects.data);

        let cnt = response.data.cnt;
        let date = response.data.date;
        let newExists = false;
        while (cnt !== 0) {
          let projects = await axios.get(`http://localhost:5000/api/${freelance}-projects?cnt=${cnt}&firstTime=${firstTime}`);
          cnt = projects.data.cnt;
          delete projects.data.cnt;

          if (firstTime) {
            commit(`setProjects`, { data: projects.data, freelance });
          } else {
            if (projects.data[projects.data.arrName].length) newExists = true;
            if (projects.data[projects.data.arrName].length || projects.data.deleted.length) {
              commit(`addNewProjects`, { data: projects.data, freelance });
              commit(`addToProjects`, { data: projects.data, freelance });
            }
          }
        }

        if (newExists) {
          let sound = new Audio(require('@/assets/sms.mp3'));
          sound.volume = 0.8;
          sound.play();
        }
        commit(`setLoading`, { val: false, freelance });
        return date;
      } catch (error) {
        console.log(error);
        commit(`setLoading`, { val: false, freelance });
      }
    },
  },
});
