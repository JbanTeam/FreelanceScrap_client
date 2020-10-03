import axios from 'axios';
import moment from 'moment';

import { diff, newExists } from '../utils';

export default {
  state: {
    error: '',
    flruLoading: false,
    flruProjects: null,
    flruPrevProjects: null,
    flruNewProjects: {},
    flruUpdateTime: null,
    flruNextUpdate: null,
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
    getFlruUpdateTime(state) {
      return state.flruUpdateTime;
    },
    getFlruNextUpdate(state) {
      return state.flruNextUpdate;
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
    setFlruUpdateTime(state, payload) {
      state.flruUpdateTime = payload;
    },
    setFlruNextUpdate(state, payload) {
      state.flruNextUpdate = payload;
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
      state.flruNewProjects[payload.section] = [];
    },
    addToFlruProjects(state, payload) {
      state.flruProjects = { ...state.flruProjects, ...payload };
    },
  },
  actions: {
    async fetchFlruProjects({ dispatch, commit }) {
      commit('clearError');
      commit('setFlruLoading', true);
      try {
        let run = await axios.get('http://localhost:5000/api/flru-start');
        // console.log(run.data);
        if (run.data.start) {
          await dispatch('recursiveFlruLoad');
        }
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
    async recursiveFlruLoad({ dispatch }) {
      console.log('flru start projects read');
      try {
        await dispatch('readFlruProjects', { cnt: 0 }).then((date) => {
          dispatch('nextLoadFlru', { date });
        });
      } catch (error) {
        console.log(error);
      }
    },
    async nextLoadFlru({ dispatch, commit }, payload) {
      let start = moment('3:00', 'm:ss');
      let seconds = start.minutes() * 60;
      commit('setFlruUpdateTime', payload.date);
      commit('setFlruNextUpdate', start.format('m:ss'));
      let interval = setInterval(async () => {
        let timerDisplay = start.subtract(1, 'second').format('m:ss');
        commit('setFlruNextUpdate', timerDisplay);
        seconds--;
        if (seconds === 0) {
          clearInterval(interval);
          await dispatch('recursiveFlruLoad');
        }
      }, 1000);
    },
  },
};
