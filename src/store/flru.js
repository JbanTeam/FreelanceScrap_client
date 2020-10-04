import axios from 'axios';
// import moment from 'moment';
import Vue from 'vue';

import { diff, newExists } from '../utils';

export default {
  state: {
    error: '',
    flruLoading: false,
    flruProjects: null,
    flruPrevProjects: null,
    flruNewProjects: {},
  },
  getters: {
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
      state.error = payload;
    },
    clearError(state) {
      state.error = '';
    },
    setFlruLoading(state, payload) {
      state.flruLoading = payload;
    },
    setFlruProjects(state, payload) {
      state.flruProjects = payload;
    },
    setFlruPrevProjects(state, payload) {
      state.flruPrevProjects = payload;
    },
    addFlruNewProjects(state, payload) {
      for (const proj in payload) {
        state.flruNewProjects[proj] === undefined
          ? (state.flruNewProjects[proj] = [...payload[proj]])
          : (state.flruNewProjects[proj] = [...state.flruNewProjects[proj], ...payload[proj]]);
      }
    },
    resetNewFlruProjects(state, payload) {
      Vue.set(state.flruNewProjects, '' + payload.section, []);
      // state.flruNewProjects[payload.section] = [];
    },
    addToFlruProjects(state, payload) {
      state.flruProjects = { ...state.flruProjects, ...payload };
    },
  },
  actions: {
    async fetchFlruProjects({ commit }) {
      commit('clearError');
      commit('setFlruLoading', true);
      try {
        return await axios.get('http://localhost:5000/api/flru-start');
        // console.log(run.data);
      } catch (error) {
        console.log(error);
      }
    },
    async readFlruProjects({ commit, state }, payload) {
      commit('clearError');
      commit('setFlruLoading', true);
      try {
        let projects = await axios.get(`http://localhost:5000/api/flru-projects?cnt=${payload.cnt}`);
        // console.log(projects.data);

        let cnt = projects.data.cnt;
        let date = projects.data.date;
        while (cnt !== 0) {
          projects = await axios.get(`http://localhost:5000/api/flru-projects?cnt=${cnt}`);
          cnt = projects.data.cnt;
          delete projects.data.cnt;
          commit('addToFlruProjects', projects.data);
        }

        if (state.flruPrevProjects !== null) {
          let newProjects = {};
          for (const proj in state.flruPrevProjects) {
            let newProj = diff(state.flruPrevProjects[proj], state.flruProjects[proj]);
            newProjects[proj] = newProj;
            // console.log(newProj);
          }
          // console.log(newProjects);
          if (newExists(newProjects)) {
            let sound = new Audio(require('@/assets/sms.mp3'));
            sound.volume = 0.8;
            sound.play();
            commit('addFlruNewProjects', newProjects);
          }
        }
        commit('setFlruPrevProjects', state.flruProjects);
        commit('setFlruLoading', false);
        return date;
      } catch (error) {
        console.log(error);
        commit('setFlruLoading', false);
      }
    },
  },
};
