import axios from 'axios';
import moment from 'moment';

import { diff, newExists } from '../utils';

export default {
  state: {
    error: '',
    freelanceruLoading: false,
    freelanceruProjects: null,
    freelanceruPrevProjects: null,
    freelanceruNewProjects: {},
    freelanceruUpdateTime: null,
    freelanceruNextUpdate: null,
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
    getFreelanceruUpdateTime(state) {
      return state.freelanceruUpdateTime;
    },
    getFreelanceruNextUpdate(state) {
      return state.freelanceruNextUpdate;
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
    setFreelanceruUpdateTime(state, payload) {
      state.freelanceruUpdateTime = payload;
    },
    setFreelanceruNextUpdate(state, payload) {
      state.freelanceruNextUpdate = payload;
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
    async fetchFreelanceruProjects({ dispatch, commit }) {
      commit('clearError');
      commit('setFreelanceruLoading', true);
      try {
        let run = await axios.get('http://localhost:5000/api/freelanceru-start');
        // console.log(run.data);
        if (run.data.start) {
          await dispatch('recursiveFreelaceruLoad');
        }
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
    async recursiveFreelaceruLoad({ dispatch }) {
      console.log('freelanceru start projects read');
      try {
        await dispatch('readFreelanceruProjects', { cnt: 0 }).then((date) => {
          dispatch('nextLoadFreelanceru', { date });
        });
      } catch (error) {
        console.log(error);
      }
    },
    async nextLoadFreelanceru({ dispatch, commit }, payload) {
      let start = moment('3:00', 'm:ss');
      let seconds = start.minutes() * 60;
      commit('setFreelanceruUpdateTime', payload.date);
      commit('setFreelanceruNextUpdate', start.format('m:ss'));
      let interval = setInterval(async () => {
        let timerDisplay = start.subtract(1, 'second').format('m:ss');
        commit('setFreelanceruNextUpdate', timerDisplay);
        seconds--;
        if (seconds === 0) {
          clearInterval(interval);
          await dispatch('recursiveFreelaceruLoad');
        }
      }, 1000);
    },
  },
};
