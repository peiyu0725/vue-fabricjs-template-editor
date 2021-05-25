<template>
    <div class="layer-block" ref="layerBlock">
      <div class="layer-head px-4 py-3">
        <div class="layer-head__title">Layer</div>
        <div class="layer-head__setting">
          <v-icon
            color="#898989"
            class="pointer"
            @click="setLock"
          >mdi-lock</v-icon>
        </div>
      </div>
      <div class="layer-body">
        <v-list
          :color="$vuetify.theme.dark ? '#31393e' : 'white'"
          :max-height="blockHeight"
          subheader
          flat
        >
          <!-- 可拖曳圖層 -->
          <draggable
            :list="reverseItems"
            animation="200"
            draggable=".layer-item"
            :move="onFixedMove"
            @change="move"
          >
            <v-list-group
              v-for="(item, index) in reverseItems"
              :key="index"
              v-model="item.active"
              no-action
              :class="{'dragItem--active': isActive(index, item.name)}"
              class="layer-item"
              :ripple="false"
              @click="setFObjToActive(index, item)"
            >
              <template #prependIcon>
                <v-icon
                  :color="getColor(item)"
                >{{ nameItems[item.name].icon }}</v-icon>
              </template>

              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title>
                    {{detectName(item)}}
                  </v-list-item-title>
                </v-list-item-content>
              </template>

              <template #appendIcon>
                <v-icon
                  class="lock-icon"
                  :color="item.selectable?'#e0e0e0':'#898989'"
                  @click="onLock(arguments, item, index)"
                  v-if="!item.selectable"
                >{{ showLock(item) }}</v-icon>
                <v-icon
                  v-else
                ></v-icon>
              </template>
            </v-list-group>
          </draggable>

          <!-- 鎖定拖曳圖層 -->
          <v-list-group
            v-for="(item, index) in fixedItem"
            :key="index"
            v-model="item.active"
            no-action
            class="layer-item disabled"
            :ripple="false"
          >
            <template #prependIcon>
              <v-icon
                color="#e0e0e0"
              >{{ nameItems[item.name].icon }}</v-icon>
            </template>

            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>
                  {{ detectName(item) }}
                </v-list-item-title>
              </v-list-item-content>
            </template>

            <template #appendIcon>
              <v-icon></v-icon>
            </template>

            <draggable
              :list="item.items"
              animation="200"
              draggable=".dragItem"
              @change="move"
            >
              <v-list-item
                v-for="(subItem,subIndex) in item.items"
                :key="subIndex"
                v-model="subItem.active"
                :class="{'dragItem--active': isActive(subIndex, subItem.name), 'dragItem': subItem.name === 'source'}"
                class="sub-item"
                :ripple="false"
                @click="setFObjToActive(subIndex, subItem)"
              >
                <v-list-item-content>
                  <div class="content-title">
                    <v-list-item-icon>
                      <v-icon class="pointer" color="#898989">{{ nameItems[subItem.name].icon }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>{{ detectName(subItem) }}</v-list-item-title>
                  </div>
                  <v-list-item-icon>
                    <div class="pr-1" v-if="subItem.name === 'backgroundColor'">
                      <color-button :useCanvas="false" :color="bgColor" @changeColor="changeColor"></color-button>
                    </div>
                    <div v-else-if="subItem.name === 'backgroundImage'">
                      <v-icon
                        class="pointer"
                        color="#898989"
                        @click="removeBgImage"
                      >mdi-trash-can-outline</v-icon>
                    </div>
                    <div v-else>
                      <v-icon
                        class="pointer lock-icon"
                        :color="subItem.selectable?'#e0e0e0':'#898989'"
                        @click="onLock(arguments, subItem, subIndex)"
                        v-if="!subItem.selectable"
                      >{{ showLock(subItem) }}</v-icon>
                      <v-icon v-else></v-icon>
                    </div>
                  </v-list-item-icon>
                </v-list-item-content>
              </v-list-item>
            </draggable>
          </v-list-group>
        </v-list>
      </div>
    </div>
</template>
<script>
import draggable from 'vuedraggable'
import { LAYER_NAME } from '../FabricVariable'
import ColorButton from '@/components/Tools/ColorButton'

export default {
  name: 'LayerBlock',
  components: {
    draggable,
    ColorButton
  },
  props: {
    canvas: Object,
    items: Array,
    activeObj: Object,
    fixedItem: Array,
    bgColor: String
  },
  data () {
    return {
      blockHeight: 0,
      nameItems: LAYER_NAME,
      color: '#fff'
    }
  },
  computed: {
    activeIndex () {
      if (!this.activeObj) return
      const index = this.canvas.getObjects().indexOf(this.activeObj)
      return index
    },
    reverseItems () {
      if (!this.items || this.items.length < 1) return []
      var reverseArray = [...this.items].filter(item => item.name !== 'crop' && item.name !== 'source').reverse()
      return reverseArray
    },
    reverseSubItems () {
      if (this.canvas.getItemsByName('source').length < 1) return []
      const reverseArray = [...this.canvas.getItemsByName('source')].reverse()
      return reverseArray
    }
  },
  methods: {
    getColor (item) {
      const type = item.name || item.type
      return type === 'source'
        ? '#e0e0e0'
        : type === 'image'
          ? this.$vuetify.theme.dark
            ? '#fff'
            : '#31393e'
          : item.fill.indexOf('00', 6) !== -1
            ? '#898989'
            : item.fill
    },
    detectName (item) {
      let title = item.text || this.nameItems[item.name].title
      if (item.name === 'source') {
        title = title + ' ' + item.sourceNum
      }
      return title
    },
    setFObjToActive (idx, item) {
      if (!item.selectable) return
      idx = this.reveseIdx(idx, item.name)
      this.$emit('setFObjToActive', idx)
    },
    reveseIdx (idx, name) {
      var itemsLength
      if (name !== 'source') {
        itemsLength = this.reverseItems.length - 1
        return itemsLength - idx + this.reverseSubItems.length
      } else {
        itemsLength = this.reverseSubItems.length - 1
        return itemsLength - idx
      }
    },
    isActive (idx, name) {
      if (name === 'backgroundColor' || name === 'backgroundImage') return
      idx = this.reveseIdx(idx, name)
      return idx === this.activeIndex
    },
    onFixedMove ({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element
      const draggedElement = draggedContext.element
      return (
        (!relatedElement || !(relatedElement.name === 'source')) && !(draggedElement.name === 'source')
      )
    },
    move ({ moved }) {
      if (moved.element.name === 'backgroundColor' || moved.element.name === 'backgroundImage') {
        return false
      }
      if (moved.element.name !== 'source') {
        const itemsLength = this.reverseItems.length - 1
        moved.newIndex = itemsLength - moved.newIndex + this.reverseSubItems.length
        moved.oldIndex = itemsLength - moved.oldIndex + this.reverseSubItems.length
      } else {
        const itemsLength = this.reverseSubItems.length - 1
        moved.newIndex = itemsLength - moved.newIndex
        moved.oldIndex = itemsLength - moved.oldIndex
      }
      this.$emit('changeZIndex', moved)
    },
    showLock (item) {
      if (item.selectable || item.name === 'backgroundColor' || item.name === 'backgroundImage') {
        return ''
      } else {
        return 'mdi-lock'
      }
    },
    setLock () {
      if (this.activeObj) {
        this.$emit('setLockState', {
          item: this.activeObj
        })
      }
    },
    onLock (args, item, index) {
      const event = args[0]
      event.stopPropagation()
      this.$emit('setLockState', {
        item: item,
        idx: this.reveseIdx(index, item.name)
      })
    },
    changeColor (val) {
      this.color = val.hex8
      this.$emit('setColorBg', this.color)
    },
    removeBgImage () {
      this.$emit('removeBgImage')
    }
  },
  mounted () {
    this.blockHeight = this.$refs.layerBlock.clientHeight - 56
  }
}
</script>
<style lang="sass" scoped>
.layer-block
  height: calc(100vh - 306px - 56px - 48px - 24px - 48px)
  .theme--light.v-list-item__title
    color: #31393e!important
  .layer-head
    display: flex
    align-items: center
    justify-content: space-between
    &__title
      font-size: 16px
    &__setting
      display: inline-flex
  .layer-body
    border-top: 1px solid #e6ecef
    height: calc(100% - 56px)
    overflow-x: hidden
    overflow-y: auto
    .dragItem--active
      background-color: rgba(#eaeaea, 0.7)
    .v-list-group
      &:first-child
        .v-list-item::before
          opacity: 0 !important
      &.disabled > .v-list-item
        .v-list-item__content
          color: #b9b9b9
      .lock-icon
        font-size: 16px
      &::before
        opacity: 1
        height: 1px
        bottom: initial
        left: 55px
        background-color: #e6ecef
    .v-list-item
      .v-list-item__icon:first-child
        margin-right: 20px
      &--active:not(:hover):not(:focus):before
        opacity: 1
      &--active
        .v-list-item__title
          color: var(--v-outlineBtn-base) !important
      &::hover
        opacity: 1
      &__content
        .v-list-item__title
          font-size: 14px
    .sub-item
      cursor: grab
      padding-left: 45px !important
      .v-list-item--active
        color: #31393e
      .v-list-item__content
        padding: 0
        justify-content: space-between
        &.disabled
          color: #b9b9b9
        .v-list-item__icon
          margin-right: 20px
        & > div
          display: contents
          flex: initial
        .content-title
          display: flex
    .color-block
      min-width: 24px
      height: 24px
      border-radius: 20px
      padding: 0
      border: 1px solid #848484 !important
</style>
