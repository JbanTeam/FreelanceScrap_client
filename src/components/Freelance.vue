<template>
  <div class="freelance-section">
    <h4 class="bg-warning font-weight-bold mb-4 p-2">{{freelance}}</h4>
    <button class="load-btn mr-5" :class="{'disabled': loading || btnDisabled}" :disabled="loading || btnDisabled" @click="load">Load</button>
    <span v-if="updateTime !== null" class="text-danger font-weight-bold mr-5">Last Update: <span class="text-dark">{{updateTime}}</span></span>
    <span v-if="nextUpdate !== null" class="text-danger font-weight-bold">Next Update: <span class="text-dark">{{nextUpdate}}</span></span>
    <p v-if="loading">Loading...</p>
    <div class="sections" v-if="projects !== null">
      <Section v-for="(proj, section) in projects" :projects="proj" :newProjects="newProjects[section] !== undefined ? newProjects[section] : []" :title="section" :freelance="freelance" :key="section" />
    </div>
    <div v-else>
      Projects not loaded.
    </div>
  </div>

</template>

<script>
// import moment from 'moment';
import Section from "./Section";
export default {
  props: ["projects", "newProjects", "freelance"],
  components: {
    Section,
  },
  created() {},
  data() {
    return {
      btnDisabled: false,
      // nextUpdate: null,
    };
  },
  computed: {
    loading() {
      return this.$store.getters[`is${this.freelance}Loading`];
    },
    updateTime() {
      return this.$store.getters[`get${this.freelance}UpdateTime`];
    },
    nextUpdate() {
      return this.$store.getters[`get${this.freelance}NextUpdate`];
    },
  },
  methods: {
    async load() {
      this.btnDisabled = true;
      await this.$store.dispatch(`fetch${this.freelance}Projects`);
    },
  },
};
</script>

<style>
</style>