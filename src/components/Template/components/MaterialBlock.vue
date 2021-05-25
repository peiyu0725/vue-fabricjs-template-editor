<template>
  <div class="material-block">
    <v-tabs v-model="tab" class="a-tab" grow>
      <v-tab v-for="item in items" :key="item.value" :ripple="false">{{ item.title }}</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item key="1">
        <v-card class="a-card" flat tile>
          <v-card-text>
            <v-row>
              <v-col
                class="d-flex child-flex add-img pointer"
                cols="4"
                @click="showImportDialog(items[tab].name)"
              >
                <v-icon
                  :color="$vuetify.theme.dark ? '#fff' : '#31393e'"
                >mdi-plus</v-icon>
              </v-col>
              <v-col v-for="item in images" :key="item.name" class="d-flex child-flex" cols="4">
                <v-card flat tile class="d-flex">
                  <v-img
                    contain
                    :src="`/image/${item.name}/view`"
                    :lazy-src="`/image/${item.name}/view`"
                    aspect-ratio="1"
                    class="pointer"
                    :class="$vuetify.theme.dark ? '' : 'grey lighten-2'"
                    draggable
                    @click="addImage"
                    @mousedown="saveImage({ image: `/image/${item.name}/view`, type: 'image' })"
                  >
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item key="2">
        <v-card flat class="a-card">
          <v-card-text>
            <v-row>
              <v-col
                class="d-flex child-flex add-img pointer"
                cols="4"
                @click="showImportDialog(items[tab].name)"
              >
                <v-icon :color="$vuetify.theme.dark ? '#fff' : '#31393e'">mdi-plus</v-icon>
              </v-col>
              <v-col
                v-for="item in backgroundImages"
                :key="item.name"
                class="d-flex child-flex"
                cols="4"
              >
                <v-card flat tile class="d-flex">
                  <v-img
                    contain
                    :src="`/background/${item.name}/view`"
                    :lazy-src="`/background/${item.name}/view`"
                    aspect-ratio="1"
                    class="grey lighten-2 pointer"
                    draggable
                    @click="addImage"
                    @mousedown="saveImage({ image: `/background/${item.name}/view`, type: 'background' })"
                  >
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item key="3">
        <v-card flat class="a-card" tile>
          <v-card-text>
            <v-row>
              <v-col v-for="n in 9" :key="n" class="d-flex child-flex" cols="4">
                <v-card flat tile class="d-flex a-card">
                  <v-img
                    :src="`/img/layout/layout_0${n}.jpg`"
                    :lazy-src="`/img/layout/layout_0${n}.jpg`"
                    aspect-ratio="1"
                    class="grey lighten-2 pointer layout-image"
                    @click="addLayout(n)"
                  >
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
    <import-image-dialog
      :showImportImg="showImportImg.status"
      :dialogName="showImportImg.name"
      @close="cancelDialog"
      @save="upLoadImage"
    ></import-image-dialog>
  </div>
</template>
<script>
import ImportImageDialog from '@/components/Tools/ImportImageDialog'

export default {
  name: 'MaterialBlock',
  components: {
    ImportImageDialog
  },
  data () {
    return {
      tab: 0,
      items: [
        { value: 0, name: 'image', title: 'Image' },
        { value: 1, name: 'background', title: 'Background' },
        { value: 2, name: 'layout', title: 'Layout' }
      ],
      images: [],
      backgroundImages: [],
      showImportImg: {
        name: '',
        status: false
      }
    }
  },
  methods: {
    showImportDialog (name) {
      this.showImportImg.name = name
      this.showImportImg.status = true
    },
    cancelDialog () {
      this.showImportImg.status = false
    },
    addImage () {
      this.$emit('addImage')
    },
    saveImage (moveing) {
      this.$emit('saveImage', moveing)
    },
    addLayout (n) {
      this.$emit('addLayout', { num: n })
    },
    async upLoadImage () {

    }
  },
  mounted () {
  }
}
</script>
<style lang="sass" scoped>
.material-block
  height: calc(100vh - 350px - 56px - 48px - 24px - 48px)
  .v-tab
    padding: 0
  .v-tabs-items
    height: calc(100% - 50px)
    overflow-y: auto
    .v-card
      .v-card__text
        padding: 0
        .v-image
          background-color: var(--v-card-base) !important
        .add-img
          align-items: center
          min-height: 101.66px
        .row
          margin: 0
          > div
            padding: 0
.dialog-img-block
  height: 270px
  border: solid 1px #e6ecef
  display: flex
  align-items: center
  flex-direction: column
  justify-content: center
  background-position: center
  background-repeat: no-repeat
  position: relative
  &.bg-fill
    background-size: cover
  &.bg-contain
    background-size: contain
  font
    font-size: 12px
  .remove-icon
    right: 4px
    top: 4px
    position: absolute
.v-label
  font-size: 12px
  color: #292f34 !important
  .color-block
    height: 24px !important
    min-width: 56px !important
#canvas-wrapper
  width: 192px
  height: 108px
  position: absolute
  top: 0
  display: none
</style>
