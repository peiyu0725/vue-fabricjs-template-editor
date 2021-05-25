<template>
  <v-tooltip
    :top="top"
    :bottom="bottom"
    :left="left"
    :right="right"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        :color="btnColor"
        :icon="icon"
        v-bind="attrs"
        v-on="on"
        @click="$emit('click')"
        :class="contentClass"
        :disabled="disabled"
      >
        <v-icon v-if="icon" :color="iconColor">{{ iconName }}</v-icon>
        <span v-else>{{ btnText }}</span>
      </v-btn>
    </template>
    <span>{{ tooltipText }}</span>
  </v-tooltip>
</template>
<script>
export default {
  name: "TooltipBtn",
  props: {
    tooltipText: String,
    icon: {
      type: Boolean,
      default: false,
    },
    iconName: String,
    iconColor: String,
    btnText: String,
    btnColor: String,
    top: {
      type: Boolean,
      default: false,
    },
    bottom: {
      type: Boolean,
      default: false,
    },
    left: {
      type: Boolean,
      default: false,
    },
    right: {
      type: Boolean,
      default: false,
    },
    contentClass: String,
    disabled: Boolean
  },
};
</script>