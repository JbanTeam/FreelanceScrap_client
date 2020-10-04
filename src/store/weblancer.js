import axios from 'axios';
// import moment from 'moment';
import Vue from 'vue';

import { diff, newExists } from '../utils';

export default {
  state: {
    error: '',
    weblancerLoading: false,
    weblancerProjects: null,
    weblancerPrevProjects: null,
    weblancerNewProjects: {},
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
  },
  mutations: {
    setError(state, payload) {
      state.error = payload;
    },
    clearError(state) {
      state.error = '';
    },
    setWeblancerLoading(state, payload) {
      state.weblancerLoading = payload;
    },
    setWeblancerProjects(state, payload) {
      state.weblancerProjects = payload;
    },
    setWeblancerPrevProjects(state, payload) {
      state.weblancerPrevProjects = payload;
    },
    addWeblancerNewProjects(state, payload) {
      for (const proj in payload) {
        state.weblancerNewProjects[proj] === undefined
          ? (state.weblancerNewProjects[proj] = [...payload[proj]])
          : (state.weblancerNewProjects[proj] = [...state.weblancerNewProjects[proj], ...payload[proj]]);
      }
    },
    resetNewWeblancerProjects(state, payload) {
      Vue.set(state.weblancerNewProjects, '' + payload.section, []);
      // state.weblancerNewProjects[payload.section] = [];
    },
    addToWeblancerProjects(state, payload) {
      state.weblancerProjects = { ...state.weblancerProjects, ...payload };
    },
  },
  actions: {
    async fetchWeblancerProjects({ commit }) {
      commit('clearError');
      commit('setWeblancerLoading', true);
      try {
        return await axios.get('http://localhost:5000/api/weblancer-start?type=cheerio');
        // console.log(run.data);
      } catch (error) {
        console.log(error);
      }
    },
    async readWeblancerProjects({ commit, state }, payload) {
      commit('clearError');
      commit('setWeblancerLoading', true);
      try {
        let projects = await axios.get(`http://localhost:5000/api/weblancer-projects?cnt=${payload.cnt}`);
        // console.log(projects.data);

        let cnt = projects.data.cnt;
        let date = projects.data.date;
        while (cnt !== 0) {
          projects = await axios.get(`http://localhost:5000/api/weblancer-projects?cnt=${cnt}`);
          cnt = projects.data.cnt;
          delete projects.data.cnt;
          commit('addToWeblancerProjects', projects.data);
        }

        if (state.weblancerPrevProjects !== null) {
          let newProjects = {};
          for (const proj in state.weblancerPrevProjects) {
            let newProj = diff(state.weblancerPrevProjects[proj], state.weblancerProjects[proj]);
            newProjects[proj] = newProj;
            // console.log(newProj);
          }
          // console.log(newProjects);
          if (newExists(newProjects)) {
            let sound = new Audio(require('@/assets/sms.mp3'));
            sound.volume = 0.8;
            sound.play();
            commit('addWeblancerNewProjects', newProjects);
          }
        }
        commit('setWeblancerPrevProjects', state.weblancerProjects);
        commit('setWeblancerLoading', false);
        return date;
      } catch (error) {
        console.log(error);
        commit('setWeblancerLoading', false);
      }
    },
    // общая функция сброса, подставляется только название
    resetNewProjects({ commit }, payload) {
      commit(`resetNew${payload.freelance}Projects`, payload);
    },
  },
};
