<template>
  <div class="ratio-toggle">
    <div
      class="ratio-toggle__item ratio-toggle__item--horizontal"
      :class="{
        'ratio-toggle__item--active': !isVertical
        }"
      @click="$emit('input', 'horizontal')"
    >
      <a-icon
        v-show="!isVertical"
        color="orange"
        :size="18"
        name="icon_checkmark"></a-icon>
    </div>
    <div
      class="ratio-toggle__item ratio-toggle__item--vertical"
      :class="{
        'ratio-toggle__item--active': isVertical
      }"
      @click="$emit('input', 'vertical')"
    >
      <a-icon
        v-show="isVertical"
        :size="18"
        color="orange"
        name="icon_checkmark"></a-icon>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RatioToggle',
  props: {
    value: {
      type: String,
      required: false
    }
  },
  computed: {
    isVertical () {
      return this.value === 'vertical'
    }
  }

}
</script>

<style lang="sass" scoped>
$primary: var(--v-primary-base)
.ratio-toggle
  display: flex
  justify-content: center
  align-items: center
  &__item
    cursor: pointer
    border-radius: 3px
    border: 1px solid $primary
    margin: 4px
    transition: .3s
    &:hover
      background-color: var(--v-primary-lighten5)
  &__item--active
    background-color: var(--v-primary-lighten5)
  &__item--horizontal
    width: 30px
    height: 20px
    padding-left: 5px
  &__item--vertical
    padding-top: 5px
    width: 20px
    height: 30px
</style>
