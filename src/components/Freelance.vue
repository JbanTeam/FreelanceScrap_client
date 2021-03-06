<template>
  <div class="freelance-section">
    <h4 class="bg-warning font-weight-bold mb-4 p-2">{{freelance}}</h4>
    <button class="load-btn mr-5" :class="{'disabled': loading || btnDisabled}" :disabled="loading || btnDisabled" @click="load">Load</button>
    <button class="abort-btn mr-5" :class="{'disabled': loading || !btnDisabled || abortBtnDisabled}" :disabled="loading || !btnDisabled || abortBtnDisabled" @click="abortLoad">Abort</button>
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
      abortBtnDisabled: false,
      updateTime: null,
      nextUpdate: null,
      interval: null,
      sound: null,
      firstTime: true,
    };
  },
  computed: {
    loading() {
      return this.$store.getters[`is${this.freelance}Loading`];
    },
  },
  methods: {
    // начать загрузку
    async load() {
      this.btnDisabled = true;
      let run = await this.$store.dispatch(`fetchProjects`, {
        freelance: this.freelance.toLowerCase(),
      });
      if (run.data.start) {
        // повтор чтения проектов каждые 3 минуты
        await this.recursiveLoad(this.firstTime);
        this.firstTime = false;
      }
    },
    // рекурсивная функция чтения проектов
    async recursiveLoad(firstTime) {
      console.log(`${this.freelance} start projects read`);
      try {
        let date = await this.$store.dispatch(`readProjects`, {
          freelance: this.freelance.toLowerCase(),
          firstTime,
        });
        await this.nextLoad(date);
      } catch (error) {
        console.log(error);
      }
    },
    // следующая загрузка через 3 мин
    async nextLoad(date) {
      let start = moment("3:00", "m:ss");
      let seconds = start.minutes() * 60;
      this.updateTime = date;
      this.nextUpdate = start.format("m:ss");
      this.interval = setInterval(async () => {
        this.nextUpdate = start.subtract(1, "second").format("m:ss");
        seconds--;
        // при истечении 3 мин очищаем интервал и запускаем функцию поновой
        if (seconds === 0) {
          clearInterval(this.interval);
          await this.recursiveLoad(this.firstTime);
        }
      }, 1000);
    },
    // прервать загрузку
    async abortLoad() {
      this.abortBtnDisabled = true;
      let freelance = this.freelance.toLowerCase();
      let abort = await this.$store.dispatch(`abortLoad`, {
        freelance,
      });

      // сбрасываем интервал и переменные
      if (abort.data.aborted) {
        this.$store.commit(`setLoading`, { val: false, freelance });
        this.btnDisabled = false;
        clearInterval(this.interval);
        this.nextUpdate = "none";
        this.abortBtnDisabled = false;
      }
    },
  },
};
</script>

<style>
</style>