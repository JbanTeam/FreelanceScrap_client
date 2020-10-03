import axios from 'axios';
import moment from 'moment';

import { diff, newExists } from '../utils';

export default {
  state: {
    error: '',
    flhuntLoading: false,
    flhuntProjects: null,
    flhuntPrevProjects: null,
    flhuntNewProjects: {},
    flhuntUpdateTime: null,
    flhuntNextUpdate: null,
  },
  getters: {
    getFlhuntProjects(state) {
      return state.flhuntProjects;
    },
    getFlhuntNewProjects(state) {
      return state.flhuntNewProjects;
    },
    isFlhuntLoading(state) {
      return state.flhuntLoading;
    },
    getFlhuntUpdateTime(state) {
      return state.flhuntUpdateTime;
    },
    getFlhuntNextUpdate(state) {
      return state.flhuntNextUpdate;
    },
  },
  mutations: {
    setError(state, payload) {
      state.error = payload;
    },
    clearError(state) {
      state.error = '';
    },
    setFlhuntLoading(state, payload) {
      state.flhuntLoading = payload;
    },
    setFlhuntUpdateTime(state, payload) {
      state.flhuntUpdateTime = payload;
    },
    setFlhuntNextUpdate(state, payload) {
      state.flhuntNextUpdate = payload;
    },
    setFlhuntProjects(state, payload) {
      state.flhuntProjects = payload;
    },
    setFlhuntPrevProjects(state, payload) {
      state.flhuntPrevProjects = payload;
    },
    addFlhuntNewProjects(state, payload) {
      for (const proj in payload) {
        state.flhuntNewProjects[proj] === undefined
          ? (state.flhuntNewProjects[proj] = [...payload[proj]])
          : (state.flhuntNewProjects[proj] = [...state.flhuntNewProjects[proj], ...payload[proj]]);
      }
    },
    resetNewFlhuntProjects(state, payload) {
      state.flhuntNewProjects[payload.section] = [];
    },
    addToFlhuntProjects(state, payload) {
      state.flhuntProjects = { ...state.flhuntProjects, ...payload };
    },
  },
  actions: {
    async fetchFlhuntProjects({ dispatch, commit }) {
      commit('clearError');
      commit('setFlhuntLoading', true);
      try {
        let run = await axios.get('http://localhost:5000/api/flhunt-start?type=cheerio');
        // console.log(run.data);
        if (run.data.start) {
          await dispatch('recursiveFlhuntLoad');
        }
      } catch (error) {
        console.log(error);
      }
    },
    async readFlhuntProjects({ commit, state }, payload) {
      commit('clearError');
      commit('setFlhuntLoading', true);
      try {
        let projects = await axios.get(`http://localhost:5000/api/flhunt-projects?cnt=${payload.cnt}`);
        // console.log(projects.data);

        let cnt = projects.data.cnt;
        let date = projects.data.date;
        while (cnt !== 0) {
          projects = await axios.get(`http://localhost:5000/api/flhunt-projects?cnt=${cnt}`);
          cnt = projects.data.cnt;
          delete projects.data.cnt;
          commit('addToFlhuntProjects', projects.data);
        }

        if (state.flhuntPrevProjects !== null) {
          let newProjects = {};
          for (const proj in state.flhuntPrevProjects) {
            let newProj = diff(state.flhuntPrevProjects[proj], state.flhuntProjects[proj]);
            newProjects[proj] = newProj;
            // console.log(newProj);
          }
          // console.log(newProjects);
          if (newExists(newProjects)) {
            let sound = new Audio(require('@/assets/sms.mp3'));
            sound.volume = 0.8;
            sound.play();
            commit('addFlhuntNewProjects', newProjects);
          }
        }
        commit('setFlhuntPrevProjects', state.flhuntProjects);
        commit('setFlhuntLoading', false);
        return date;
      } catch (error) {
        console.log(error);
        commit('setFlhuntLoading', false);
      }
    },
    async recursiveFlhuntLoad({ dispatch }) {
      console.log('flhunt start projects read');
      try {
        await dispatch('readFlhuntProjects', { cnt: 0 }).then((date) => {
          dispatch('nextLoadFlhunt', { date });
        });
      } catch (error) {
        console.log(error);
      }
    },
    async nextLoadFlhunt({ dispatch, commit }, payload) {
      let start = moment('3:00', 'm:ss');
      let seconds = start.minutes() * 60;
      commit('setFlhuntUpdateTime', payload.date);
      commit('setFlhuntNextUpdate', start.format('m:ss'));
      let interval = setInterval(async () => {
        let timerDisplay = start.subtract(1, 'second').format('m:ss');
        commit('setFlhuntNextUpdate', timerDisplay);
        seconds--;
        if (seconds === 0) {
          clearInterval(interval);
          await dispatch('recursiveFlhuntLoad');
        }
      }, 1000);
    },
  },
};
