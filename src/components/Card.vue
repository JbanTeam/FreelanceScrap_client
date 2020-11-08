<template>
  <!-- компонент одного проекта -->
  <div class="card bg-light" @click="cardOpen($event)">
    <h5 class="mb-1 font-weight-bold">{{proj.title}}
      <span v-if="proj.premium !== undefined && proj.premium" class="text-danger ml-2">"Premium"</span>
      <span v-if="proj.fast !== undefined && proj.fast" class="text-danger ml-2">"Fast"</span>
      <span v-if="proj.fixed !== undefined && proj.fixed" class="text-danger ml-2">"Fixed"</span>
      <span v-if="newProj" class="text-danger ml-2">"New"</span>
    </h5>
    <a class="mb-1" :href="proj.link" target="_blank" rel="noopener noreferrer">{{proj.link}}</a>
    <span class="mb-1 font-weight-bold">Bets: <span class="text-size" :class="betsClass">{{bets}}</span></span>
    <span class="mb-1 font-weight-bold">Time: <span class="text-primary">{{time}}</span></span>
    <div class="secondary-container" v-if="secondaryOpened">
      <div class="mb-1">Description: {{description}}</div>
      <div class="mb-1 font-weight-bold">Budget: <span :class="budget !== 'null' ? 'text-size text-success' : 'text-primary'">{{budget}}</span></div>
      <div class="mb-1">Skills: {{skills}}</div>
      <div class="mb-1">Published: {{published}}</div>
      <div class="mb-1" v-if="proj.fast !== undefined">Fast: {{proj.fast}}</div>
      <div class="mb-1" v-if="proj.fixed !== undefined">Fixed: {{proj.fixed}}</div>
      <div class="mb-1" v-if="proj.premium !== undefined">Premium: {{proj.premium}}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["proj", "newProjects", "section", "freelance"],
  data() {
    return {
      secondaryOpened: false,
    };
  },
  computed: {
    // цвет пункта "заявки"
    betsClass() {
      return parseInt(this.proj.bets) <= 5
        ? "text-success"
        : parseInt(this.proj.bets) <= 10
        ? "text-warning"
        : "text-danger";
    },
    // количество заявок на данном проекте
    bets() {
      return this.proj.bets;
    },
    // описание
    description() {
      return this.proj.description === null ? "null" : this.proj.description;
    },
    // бюджет данного проекта
    budget() {
      return this.proj.budget === null ? "null" : this.proj.budget;
    },
    // необходимые навыки
    skills() {
      return this.proj.skills === null ? "null" : this.proj.skills;
    },
    // время когда опубликован
    time() {
      return this.proj.time === null ? "null" : this.proj.time;
    },
    // когда опубликован в милисекундах
    published() {
      return this.proj.published === null ? "null" : this.proj.published;
    },
    // флаг "новый проект или нет"
    newProj() {
      if (this.newProjects !== undefined) {
        let arr = [];
        this.newProjects.forEach((obj1) => {
          arr.push(obj1.link);
        });
        return arr.indexOf(this.proj.link) !== -1;
      }
      return false;
    },
  },
  methods: {
    // флаг открытыя карточки проекта
    cardOpen(e) {
      if (e.target.tagName === "A") return;
      this.secondaryOpened = !this.secondaryOpened;
    },
  },
};
</script>

<style>
.card {
  padding: 10px;
  font-size: 14px;
  margin-bottom: 10px;
  cursor: help;
}
.text-size {
  font-size: 22px;
}
</style>