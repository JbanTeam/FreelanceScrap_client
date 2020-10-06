<template>
  <div class="freelance-section">
    <h4 class="bg-warning font-weight-bold mb-4 p-2">{{freelance}}</h4>
    <button class="load-btn mr-5" :class="{'disabled': loading || btnDisabled}" :disabled="loading || btnDisabled" @click="load">Load</button>
    <span v-if="updateTime !== null" class="text-danger font-weight-bold mr-5">Last Update: <span class="text-dark">{{updateTime}}</span></span>
    <span v-if="nextUpdate !== null" class="text-danger font-weight-bold">Next Update: <span class="text-dark">{{nextUpdate}}</span></span>
    <p v-if="loading">Loading...</p>
    <div class="sections" v-if="projects !== null">
      <Section v-for="(proj, section) in projects" :projects="proj" :newProjects="newProjects[section] !== undefined ? newProjects[section] : []" :section="section" :freelance="freelance" :key="section" />
    </div>
    <div v-else>
      Projects not loaded.
    </div>
  </div>

</template>

<script>
import moment from "moment";
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
      updateTime: null,
      nextUpdate: null,
      sound: null,
    };
  },
  computed: {
    loading() {
      return this.$store.getters[`is${this.freelance}Loading`];
    },
  },
  methods: {
    async load() {
      this.btnDisabled = true;
      let run = await this.$store.dispatch(`fetchProjects`, {
        freelance: this.freelance.toLowerCase(),
      });
      if (run.data.start) {
        await this.recursiveLoad(true);
      }
    },
    async recursiveLoad(firstTime) {
      console.log(`${this.freelance} start projects read`);
      try {
        let date = await this.$store.dispatch(`readProjects`, {
          cnt: 0,
          freelance: this.freelance.toLowerCase(),
          firstTime,
        });
        await this.nextLoad(date);
      } catch (error) {
        console.log(error);
      }
    },
    async nextLoad(date) {
      let start = moment("1:00", "m:ss");
      let seconds = start.minutes() * 60;
      this.updateTime = date;
      this.nextUpdate = start.format("m:ss");
      let interval = setInterval(async () => {
        this.nextUpdate = start.subtract(1, "second").format("m:ss");
        seconds--;
        if (seconds === 0) {
          clearInterval(interval);
          await this.recursiveLoad(false);
        }
      }, 1000);
    },
  },
};
</script>

<style>
</style>