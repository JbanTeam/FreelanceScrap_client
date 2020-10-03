import axios from 'axios';
import moment from 'moment';

import { diff, newExists } from '../utils';

export default {
  state: {
    error: '',
    weblancerLoading: false,
    weblancerProjects: null,
    weblancerPrevProjects: null,
    weblancerNewProjects: {},
    weblancerUpdateTime: null,
    weblancerNextUpdate: null,
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
    getWeblancerUpdateTime(state) {
      return state.weblancerUpdateTime;
    },
    getWeblancerNextUpdate(state) {
      return state.weblancerNextUpdate;
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
    setWeblancerUpdateTime(state, payload) {
      state.weblancerUpdateTime = payload;
    },
    setWeblancerNextUpdate(state, payload) {
      state.weblancerNextUpdate = payload;
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
      state.weblancerNewProjects[payload.section] = [];
    },
    addToWeblancerProjects(state, payload) {
      state.weblancerProjects = { ...state.weblancerProjects, ...payload };
    },
  },
  actions: {
    async fetchWeblancerProjects({ dispatch, commit }) {
      commit('clearError');
      commit('setWeblancerLoading', true);
      try {
        let run = await axios.get('http://localhost:5000/api/weblancer-start?type=cheerio');
        // console.log(run.data);
        if (run.data.start) {
          await dispatch('recursiveWeblancerLoad');
        }
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
    async recursiveWeblancerLoad({ dispatch }) {
      console.log('weblancer start projects read');
      try {
        await dispatch('readWeblancerProjects', { cnt: 0 }).then((date) => {
          dispatch('nextLoadWeblancer', { date });
        });
      } catch (error) {
        console.log(error);
      }
    },
    async nextLoadWeblancer({ dispatch, commit }, payload) {
      let start = moment('3:00', 'm:ss');
      let seconds = start.minutes() * 60;
      commit('setWeblancerUpdateTime', payload.date);
      commit('setWeblancerNextUpdate', start.format('m:ss'));
      let interval = setInterval(async () => {
        let timerDisplay = start.subtract(1, 'second').format('m:ss');
        commit('setWeblancerNextUpdate', timerDisplay);
        seconds--;
        if (seconds === 0) {
          clearInterval(interval);
          await dispatch('recursiveWeblancerLoad');
        }
      }, 1000);
    },
    // общая функция сброса, подставляется только название
    resetNewProjects({ commit }, payload) {
      commit(`resetNew${payload.freelance}Projects`, payload);
    },
  },
};
