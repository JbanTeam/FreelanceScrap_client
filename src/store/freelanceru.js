import axios from 'axios';
// import moment from 'moment';

import { diff, newExists } from '../utils';

export default {
  state: {
    error: '',
    freelanceruLoading: false,
    freelanceruProjects: null,
    freelanceruPrevProjects: null,
    freelanceruNewProjects: {},
  },
  getters: {
    getFreelanceruProjects(state) {
      return state.freelanceruProjects;
    },
    getFreelanceruNewProjects(state) {
      return state.freelanceruNewProjects;
    },
    isFreelanceruLoading(state) {
      return state.freelanceruLoading;
    },
  },
  mutations: {
    setError(state, payload) {
      state.error = payload;
    },
    clearError(state) {
      state.error = '';
    },
    setFreelanceruLoading(state, payload) {
      state.freelanceruLoading = payload;
    },
    setFreelanceruProjects(state, payload) {
      state.freelanceruProjects = payload;
    },
    setFreelanceruPrevProjects(state, payload) {
      state.freelanceruPrevProjects = payload;
    },
    addFreelanceruNewProjects(state, payload) {
      for (const proj in payload) {
        state.freelanceruNewProjects[proj] === undefined
          ? (state.freelanceruNewProjects[proj] = [...payload[proj]])
          : (state.freelanceruNewProjects[proj] = [...state.freelanceruNewProjects[proj], ...payload[proj]]);
      }
    },
    resetNewFreelanceruProjects(state, payload) {
      state.freelanceruNewProjects[payload.section] = [];
    },
    addToFreelanceruProjects(state, payload) {
      state.freelanceruProjects = { ...state.freelanceruProjects, ...payload };
    },
  },
  actions: {
    async fetchFreelanceruProjects({ commit }) {
      commit('clearError');
      commit('setFreelanceruLoading', true);
      try {
        return await axios.get('http://localhost:5000/api/freelanceru-start');
        // console.log(run.data);
      } catch (error) {
        console.log(error);
      }
    },
    async readFreelanceruProjects({ commit, state }, payload) {
      commit('clearError');
      commit('setFreelanceruLoading', true);
      try {
        let projects = await axios.get(`http://localhost:5000/api/freelanceru-projects?cnt=${payload.cnt}`);
        // console.log(projects.data);

        let cnt = projects.data.cnt;
        let date = projects.data.date;
        while (cnt !== 0) {
          projects = await axios.get(`http://localhost:5000/api/freelanceru-projects?cnt=${cnt}`);
          cnt = projects.data.cnt;
          delete projects.data.cnt;
          commit('addToFreelanceruProjects', projects.data);
        }

        if (state.freelanceruPrevProjects !== null) {
          let newProjects = {};
          for (const proj in state.freelanceruPrevProjects) {
            let newProj = diff(state.freelanceruPrevProjects[proj], state.freelanceruProjects[proj]);
            newProjects[proj] = newProj;
            // console.log(newProj);
          }
          // console.log(newProjects);
          if (newExists(newProjects)) {
            let sound = new Audio(require('@/assets/sms.mp3'));
            sound.volume = 0.8;
            sound.play();
            commit('addFreelanceruNewProjects', newProjects);
          }
        }
        commit('setFreelanceruPrevProjects', state.freelanceruProjects);
        commit('setFreelanceruLoading', false);
        return date;
      } catch (error) {
        console.log(error);
        commit('setFreelanceruLoading', false);
      }
    },
  },
};
