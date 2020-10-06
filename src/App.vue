<template>
  <div id="app">
    <h1 class="main-title">Freelance Scrap Projects</h1>
    <div class="tabs">
      <div class="tabs-triggers">
        <a :href="'#' + component.title" class="tabs-triggers__item font-weight-bold" :class="{'active': isActive(component.title)}" v-for="component in flComponents" :key="component.title" @click.prevent="setActive(component.title)">
          {{component.title}} <b-icon v-if="newProjectsExists(component.newProjects)" icon="exclamation-circle-fill" variant="danger"></b-icon>
        </a>
      </div>
      <div class="tabs-content">
        <div :id="component.title" class="tabs-content__item" :class="{'active': isActive(component.title)}" v-for="component in flComponents" :key="component.title">
          <component :is="'Freelance'" :freelance="component.component" :projects="component.projects" :newProjects="component.newProjects"></component>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import Freelance from "./components/Freelance";

// import flhuntJson from "./assets/flhuntProjects.json";
// import weblancerJson from "./assets/weblancerProjects.json";
// import flhabrJson from "./assets/flhabrProjects.json";
// import freelanceruJson from "./assets/freelanceruProjects.json";
// import flruJson from "./assets/flruProjects.json";

export default {
  name: "App",
  components: {
    Freelance,
  },
  mounted() {
    // this.$store.commit("setFlhuntProjects", flhuntJson);
    // this.$store.commit("setWeblancerProjects", weblancerJson);
    // this.$store.commit("setFlhabrProjects", flhabrJson);
    // this.$store.commit("setFreelanceruProjects", freelanceruJson);
    // this.$store.commit("setFlruProjects", flruJson);
  },
  data() {
    return {
      activeItem: "Fl.hunt",
    };
  },
  computed: {
    flComponents() {
      return [
        {
          title: "Fl.hunt",
          component: "Flhunt",
          projects: this.$store.getters.getFlhuntProjects,
          newProjects: this.$store.getters.getFlhuntNewProjects,
        },
        {
          title: "Weblancer",
          component: "Weblancer",
          projects: this.$store.getters.getWeblancerProjects,
          newProjects: this.$store.getters.getWeblancerNewProjects,
        },
        {
          title: "Fl.habr",
          component: "Flhabr",
          projects: this.$store.getters.getFlhabrProjects,
          newProjects: this.$store.getters.getFlhabrNewProjects,
        },
        {
          title: "Freelance.ru",
          component: "Freelanceru",
          projects: this.$store.getters.getFreelanceruProjects,
          newProjects: this.$store.getters.getFreelanceruNewProjects,
        },
        {
          title: "Fl.ru",
          component: "Flru",
          projects: this.$store.getters.getFlruProjects,
          newProjects: this.$store.getters.getFlruNewProjects,
        },
      ];
    },
    newProjectsExists() {
      return (projects) => {
        for (const proj in projects) {
          if (projects[proj].length) {
            return true;
          }
        }
        return false;
      };
    },
  },
  methods: {
    isActive(menuItem) {
      return this.activeItem === menuItem;
    },
    setActive(menuItem) {
      this.activeItem = menuItem;
    },
  },
};
</script>

<style>
#app {
  padding: 0px 20px;
}

.tabs-triggers {
  display: flex;
}
.tabs-triggers__item {
  color: #000;
  text-align: center;
  padding: 20px;
  text-decoration: none;
  flex-grow: 1;
  background-color: transparent;
  border: 1px solid #eee;
  outline: none;
}
.tabs-triggers__item.active {
  background-color: #eee;
  color: #000;
}
.tabs-triggers__item.active:hover {
  text-decoration: none;
}

.tabs-content__item {
  display: none;
  color: #000;
  padding: 20px;
  background-color: #eee;
}
.tabs-content__item.active {
  display: block;
}
</style>