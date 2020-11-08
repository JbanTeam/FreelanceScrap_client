import Vue from 'vue';
import Vuex from 'vuex';

import axios from 'axios';

// import { diff, newExists } from '../utils';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    url: 'http://localhost:5000',
    weblancerError: '',
    weblancerLoading: false,
    weblancerProjects: null,
    weblancerNewProjects: {},
    weblancerNewProjectsAll: {},
    flhuntError: '',
    flhuntLoading: false,
    flhuntProjects: null,
    flhuntNewProjects: {},
    flhuntNewProjectsAll: {},
    flhabrError: '',
    flhabrLoading: false,
    flhabrProjects: null,
    flhabrNewProjects: {},
    flhabrNewProjectsAll: {},
    freelanceruError: '',
    freelanceruLoading: false,
    freelanceruProjects: null,
    freelanceruNewProjects: {},
    freelanceruNewProjectsAll: {},
    flruError: '',
    flruLoading: false,
    flruProjects: null,
    flruNewProjects: {},
    flruNewProjectsAll: {},
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
    // обновляем все проекты
    updateProjects(state, payload) {
      let { freelance, arrName, projects, deleted } = payload;

      if (state[`${freelance}Projects`] === null) {
        state[`${freelance}Projects`] = {};
      }

      if (deleted && deleted.length) {
        state[`${freelance}Projects`][arrName] = state[`${freelance}Projects`][arrName].filter((proj) => {
          return deleted.indexOf(proj.link) === -1;
        });
      }

      if (projects && projects.length) {
        if (state[`${freelance}Projects`][arrName] === undefined) {
          Vue.set(
            state[`${freelance}Projects`],
            '' + arrName,
            projects.map((obj) => Object.assign({}, obj))
          );
        } else {
          state[`${freelance}Projects`][arrName].unshift(...projects.map((obj) => Object.assign({}, obj)));
        }
      }
    },
    // сбрасываем новые проекты
    resetNewProjects(state, payload) {
      while (state[`${payload.freelance}NewProjects`][payload.section].length !== 0) {
        state[`${payload.freelance}NewProjects`][payload.section].splice(0, 1);
      }
    },
    // сбрасываем все неовые проекты (ссылки на них), если newProjects.len === 0, то newProjectsAll = [], если нет то оставляем в newProjectsAll только ссылки на проекты, которые есть в newProjects
    resetNewProjectsAll(state, payload) {
      let freelance = payload.freelance;
      let arrName = payload.data.arrName;
      let newProjects = state[`${freelance}NewProjects`];
      let newProjectsAll = state[`${freelance}NewProjectsAll`];

      if (newProjects[arrName] !== undefined) {
        newProjects[arrName].length ? (newProjectsAll[arrName] = newProjects[arrName].map((proj) => proj.link)) : (newProjectsAll[arrName] = []);
      }
    },
  },
  actions: {
    // прервать загрузку
    // eslint-disable-next-line no-unused-vars
    async abortLoad({ state, commit }, payload) {
      try {
        return await axios.get(`${state.url}/api/${payload.freelance}-abort`);
        // console.log(run.data);
      } catch (error) {
        console.log(error);
      }
    },
    // записываем проекты при первичном прочтении их с сервера
    async setProjects({ state, commit }, payload) {
      let { arrName, deleted } = payload.data;
      let newPrjcts = payload.data.newProjects;
      let projects = payload.data[arrName];
      let freelance = payload.freelance;
      let newExists = false;

      if (state[`${freelance}Projects`] === null) {
        state[`${freelance}Projects`] = {};
      }
      Vue.set(
        state[`${freelance}Projects`],
        '' + arrName,
        projects.map((obj) => Object.assign({}, obj))
      );

      // если есть новые(проиходит если на сервере нет db/*.json или он пуст)
      if (newPrjcts !== null) {
        let newProjects = state[`${freelance}NewProjects`];
        let newProjectsAll = state[`${freelance}NewProjectsAll`];

        newProjectsAll[arrName] = newPrjcts.map((proj) => proj.link);
        Vue.set(
          newProjects,
          '' + arrName,
          newPrjcts.map((obj) => Object.assign({}, obj))
        );
        newExists = true;
      }

      // обновляем все проекты(добавляем новые, удаляем те, которых уже нет)
      commit('updateProjects', { freelance, arrName, projects: newPrjcts, deleted });

      // возвращаем флаг "есть ли новые проекты"
      return newExists;
    },
    // добавляем новые проекты
    async addNewProjects({ state, commit }, payload) {
      let freelance = payload.freelance;
      let arrName = payload.data.arrName;
      let newProjects = state[`${freelance}NewProjects`];
      let newProjectsAll = state[`${freelance}NewProjectsAll`];
      let projects = payload.data[arrName];
      let deleted = payload.data.deleted;
      let newExists = false;

      if (projects.length) {
        // если массив соответствующего раздела еще не существует
        if (newProjects[arrName] === undefined) {
          Vue.set(
            newProjects,
            '' + arrName,
            projects.map((obj) => Object.assign({}, obj))
          );
          newProjectsAll[arrName] = projects.map((proj) => proj.link);
          newExists = true;
        } else {
          // если существует
          projects = projects.filter((proj) => newProjectsAll[arrName].indexOf(proj.link) === -1);
          if (projects.length) {
            console.log(arrName, projects.length);

            newProjectsAll[arrName] = [...projects.map((proj) => proj.link), ...newProjectsAll[arrName]];
            Vue.set(newProjects, '' + arrName, [
              ...projects.map((obj) => Object.assign({}, obj)),
              ...newProjects[arrName].map((obj) => Object.assign({}, obj)),
            ]);
            newExists = true;
          }
        }
      }

      // обновляем все проекты(добавляем новые, удаляем те, которых уже нет)
      commit('updateProjects', { freelance, arrName, projects, deleted });
      // возвращаем флаг "есть ли новые проекты"
      return newExists;
    },
    // начинаем загрузку
    async fetchProjects({ state, commit }, payload) {
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
        return await axios.get(`${state.url}/api/${freelance}-start${type}`);
        // console.log(run.data);
      } catch (error) {
        console.log(error);
      }
    },
    // читаем проекты
    async readProjects({ state, dispatch, commit }, payload) {
      let freelance = payload.freelance;
      let firstTime = payload.firstTime;

      commit('clearError');
      commit(`setLoading`, { val: true, freelance });
      try {
        // первый запрос возвращает нам количество разделов(массивов)
        let response = await axios.get(`${state.url}/api/${freelance}-projects?cnt=0&firstTime=${firstTime}`);
        // console.log(projects.data);

        let cnt = response.data.cnt;
        let date = response.data.date;
        let newExists = false;
        // пока количество непрочитанных разделов не равно 0, то посылаем запрос на чтение раздела
        while (cnt !== 0) {
          let projects = await axios.get(`${state.url}/api/${freelance}-projects?cnt=${cnt}&firstTime=${firstTime}`);
          cnt = projects.data.cnt;
          let arrName = projects.data.arrName;
          delete projects.data.cnt;

          // если читаем первый раз
          if (firstTime) {
            let res = await dispatch(`setProjects`, { data: projects.data, freelance });
            // если есть новые
            if (!newExists) newExists = res;
          } else {
            // если не первый раз
            if (projects.data[arrName].length || projects.data.deleted.length) {
              // если в ответе длина массива раздела или массива "удаленные" не равна 0
              let res = await dispatch(`addNewProjects`, { data: projects.data, freelance });
              if (!newExists) newExists = res;
            } else {
              // если равна 0, смотрим на флаг были ли очищены новые проекты на сервере, если да то чистим их и на клиенте
              if (projects.data.newProjectsCleaned) commit('resetNewProjectsAll', { data: projects.data, freelance });
            }
          }
        }

        // если есть новые то проигрываем звук уведомления
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
