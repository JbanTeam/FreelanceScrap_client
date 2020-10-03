import axios from 'axios';
import moment from 'moment';

import { diff, newExists } from '../utils';

export default {
  state: {
    error: '',
    flhabrLoading: false,
    flhabrProjects: null,
    flhabrPrevProjects: null,
    flhabrNewProjects: {},
    flhabrUpdateTime: null,
    flhabrNextUpdate: null,
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
    getFlhabrUpdateTime(state) {
      return state.flhabrUpdateTime;
    },
    getFlhabrNextUpdate(state) {
      return state.flhabrNextUpdate;
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
    setFlhabrUpdateTime(state, payload) {
      state.flhabrUpdateTime = payload;
    },
    setFlhabrNextUpdate(state, payload) {
      state.flhabrNextUpdate = payload;
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
    async fetchFlhabrProjects({ dispatch, commit }) {
      commit('clearError');
      commit('setFlhabrLoading', true);
      try {
        let run = await axios.get('http://localhost:5000/api/flhabr-start');
        // console.log(run.data);
        if (run.data.start) {
          await dispatch('recursiveFlhabrLoad');
        }
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
    async recursiveFlhabrLoad({ dispatch }) {
      console.log('flhabr start projects read');
      try {
        await dispatch('readFlhabrProjects', { cnt: 0 }).then((date) => {
          dispatch('nextLoadFlhabr', { date });
        });
      } catch (error) {
        console.log(error);
      }
    },
    async nextLoadFlhabr({ dispatch, commit }, payload) {
      let start = moment('3:00', 'm:ss');
      let seconds = start.minutes() * 60;
      commit('setFlhabrUpdateTime', payload.date);
      commit('setFlhabrNextUpdate', start.format('m:ss'));
      let interval = setInterval(async () => {
        let timerDisplay = start.subtract(1, 'second').format('m:ss');
        commit('setFlhabrNextUpdate', timerDisplay);
        seconds--;
        if (seconds === 0) {
          clearInterval(interval);
          await dispatch('recursiveFlhabrLoad');
        }
      }, 1000);
    },
  },
};
