<template>
  <section class="section">
    <h4 class="section-title font-weight-bold d-flex align-items-center bg-primary p-1 mb-2" @click="opened = !opened">
      <span>{{title}} - <span class="projects-count text-warning mr-5">{{projects.length}}</span></span>
      <span class="new-count bg-light text-danger" v-if="newProjects.length">{{newProjects.length}}</span>
    </h4>
    <div class="wrap" v-if="opened">
      <div class="pagination">
        <button class="pagination-btn" :class="currentPage === 0 ? 'disabled' : ''" :disabled="currentPage === 0" @click="prevPage">prev</button>
        <button class="pagination-btn" :class="currentPage === pageCnt - 1 ? 'disabled' : ''" :disabled="currentPage === pageCnt-1" @click="nextPage">next</button>
        <span class="page-count font-weight-bold"><span>{{currentPage+1}}</span> / <span>{{pageCnt}}</span></span>
        <button class="pagination-btn all-btn" :class="allOpened ? 'disabled' : ''" :disabled="allOpened" @click="cardsOpen">all</button>
        <button class="pagination-btn new-btn" :class="!newProjects.length || !allOpened ? 'disabled' : ''" :disabled="!newProjects.length || !allOpened" @click="cardsOpen">new</button>
        <button class="pagination-btn reset-btn" :class="!newProjects.length ? 'disabled' : ''" :disabled="!newProjects.length" @click="resetNew">reset new</button>
      </div>
      <!-- TODO: если проект является новым, то во вкладке all пометить его как new -->
      <div class="cards">
        <Card v-for="(item) in projectsPerPage" :key="item.link" :proj="item" :section="title" :freelance="freelance" />
      </div>
      <div class="pagination">
        <button class="pagination-btn" :class="currentPage === 0 ? 'disabled' : ''" :disabled="currentPage === 0" @click="prevPage">prev</button>
        <button class="pagination-btn" :class="currentPage === pageCnt - 1 ? 'disabled' : ''" :disabled="currentPage === pageCnt" @click="nextPage">next</button>
        <span class="page-count font-weight-bold"><span>{{currentPage+1}}</span> / <span>{{pageCnt}}</span></span>
        <button class="pagination-btn all-btn" :class="allOpened ? 'disabled' : ''" :disabled="allOpened" @click="cardsOpen">all</button>
        <button class="pagination-btn new-btn" :class="!newProjects.length || !allOpened ? 'disabled' : ''" :disabled="!newProjects.length || !allOpened" @click="cardsOpen">new</button>
        <button class="pagination-btn reset-btn" :class="!newProjects.length ? 'disabled' : ''" :disabled="!newProjects.length" @click="resetNew">reset new</button>
      </div>
    </div>
  </section>
</template>

<script>
import Card from "./Card";
export default {
  props: ["projects", "newProjects", "title", "freelance"],
  components: {
    Card,
  },
  data() {
    return {
      opened: false,
      allOpened: true,
      currentPage: 0,
      allPage: 0,
      newPage: 0,
      cardsPerPage: 6,
    };
  },
  computed: {
    pageCnt() {
      let curProjLen = this.allOpened
        ? this.projects.length
        : this.newProjects.length;
      return Math.ceil(curProjLen / this.cardsPerPage);
    },
    projectsPerPage() {
      const start = this.currentPage * this.cardsPerPage;
      const end = start + this.cardsPerPage;
      return this.allOpened
        ? this.projects.slice(start, end)
        : this.newProjects.slice(start, end);
    },
  },
  methods: {
    nextPage() {
      if (this.currentPage === this.pageCnt - 1 || !this.opened) return;
      this.allOpened ? this.allPage++ : this.newPage++;
      this.currentPage++;
    },
    prevPage() {
      if (this.currentPage === 0 || !this.opened) return;
      this.allOpened ? this.allPage-- : this.newPage--;
      this.currentPage--;
    },
    cardsOpen() {
      this.allOpened = !this.allOpened;
      this.currentPage = this.allOpened ? this.allPage : this.newPage;
    },
    resetNew() {
      this.allOpened = true;
      this.$store.dispatch("resetNewProjects", {
        freelance: this.freelance,
        section: this.title,
      });
    },
  },
};
</script>

<style>
.section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #000;
}
.section-title {
  color: #fff;
  cursor: pointer;
}
</style>