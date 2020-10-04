import axios from 'axios';
// import moment from 'moment';

import { diff, newExists } from '../utils';

export default {
  state: {
    error: '',
    flhabrLoading: false,
    flhabrProjects: null,
    flhabrPrevProjects: null,
    flhabrNewProjects: {},
  },
  getters: {
    getFlhabrProjects(state) {
      return state.flhabrProjects;
    },
    getFlhabrNewProjects(state) {
      return state.flhabrNewProjects;
    },
    isFlhabrLoading(state) {
      return state.flhabrLoading;
    },
  },
  mutations: {
    setError(state, payload) {
      state.error = payload;
    },
    clearError(state) {
      state.error = '';
    },
    setFlhabrLoading(state, payload) {
      state.flhabrLoading = payload;
    },
    setFlhabrProjects(state, payload) {
      state.flhabrProjects = payload;
    },
    setFlhabrPrevProjects(state, payload) {
      state.flhabrPrevProjects = payload;
    },
    addFlhabrNewProjects(state, payload) {
      for (const proj in payload) {
        state.flhabrNewProjects[proj] === undefined
          ? (state.flhabrNewProjects[proj] = [...payload[proj]])
          : (state.flhabrNewProjects[proj] = [...state.flhabrNewProjects[proj], ...payload[proj]]);
      }
    },
    resetNewFlhabrProjects(state, payload) {
      state.flhabrNewProjects[payload.section] = [];
    },
    addToFlhabrProjects(state, payload) {
      state.flhabrProjects = { ...state.flhabrProjects, ...payload };
    },
  },
  actions: {
    async fetchFlhabrProjects({ commit }) {
      commit('clearError');
      commit('setFlhabrLoading', true);
      try {
        return await axios.get('http://localhost:5000/api/flhabr-start');
        // console.log(run.data);
      } catch (error) {
        console.log(error);
      }
    },
    async readFlhabrProjects({ commit, state }, payload) {
      commit('clearError');
      commit('setFlhabrLoading', true);
      try {
        let projects = await axios.get(`http://localhost:5000/api/flhabr-projects?cnt=${payload.cnt}`);
        // console.log(projects.data);

        let cnt = projects.data.cnt;
        let date = projects.data.date;
        while (cnt !== 0) {
          projects = await axios.get(`http://localhost:5000/api/flhabr-projects?cnt=${cnt}`);
          cnt = projects.data.cnt;
          delete projects.data.cnt;
          commit('addToFlhabrProjects', projects.data);
        }

        if (state.flhabrPrevProjects !== null) {
          let newProjects = {};
          for (const proj in state.flhabrPrevProjects) {
            let newProj = diff(state.flhabrPrevProjects[proj], state.flhabrProjects[proj]);
            newProjects[proj] = newProj;
            // console.log(newProj);
          }
          // console.log(newProjects);
          if (newExists(newProjects)) {
            let sound = new Audio(require('@/assets/sms.mp3'));
            sound.volume = 0.8;
            sound.play();
            commit('addFlhabrNewProjects', newProjects);
          }
        }
        commit('setFlhabrPrevProjects', state.flhabrProjects);
        commit('setFlhabrLoading', false);
        return date;
      } catch (error) {
        console.log(error);
        commit('setFlhabrLoading', false);
      }
    },
  },
};
