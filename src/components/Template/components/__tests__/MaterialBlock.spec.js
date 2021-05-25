import { shallowMount, createLocalVue } from '@vue/test-utils'
import MaterialBlock from '../MaterialBlock.vue'
import ImportImageDialog from '@/components/dialog/ImportImageDialog'
import * as mediaAPI from '@/apis/media'
import mockImage from './__mocks__/templateImage.json'
import Vuetify from 'vuetify'
mediaAPI.fetchList = jest.fn().mockResolvedValue({
  data: mockImage.image
})

const localVue = createLocalVue()
const VCol = {
  template: '<div v-bind="$attrs" v-on="$listeners"></div>'
}

const VImg = {
  template: '<div v-bind="$attrs" v-on="$listeners"></div>'
}

describe('Template page - MaterialBlock.vue', () => {
  let materialBlockWrapper
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify({
      theme: {
        dark: false
      }
    })
    materialBlockWrapper = shallowMount(MaterialBlock, {
      localVue,
      vuetify,
      mocks: {
        $t: jest.fn()
      },
      computed: {
        permission: () => 1
      },
      stubs: {
        'a-icon': true,
        VImg
      }
    })
  })

  it('Should contain down ImportImageDialog', async () => {
    expect(materialBlockWrapper.find(ImportImageDialog).exists()).toBeTruthy()
  })

  it('Mounted should call updateList 2 times', async () => {
    const updateList = jest.fn()
    const wrapper = shallowMount(MaterialBlock, {
      localVue,
      vuetify,
      computed: {
        permission: () => 1
      },
      mocks: {
        $t: jest.fn()
      },
      stubs: {
        'a-icon': true
      },
      methods: {
        updateList
      }
    })
    expect(updateList).toHaveBeenCalledTimes(2)
  })

  it('Click add-img col should show ImportDialog', async () => {
    const wrapper = shallowMount(MaterialBlock, {
      localVue,
      vuetify,
      computed: {
        permission: () => 1
      },
      mocks: {
        $t: jest.fn()
      },
      stubs: {
        'a-icon': true,
        VCol
      }
    })
    const addImgCol = wrapper.findAll('.add-img').wrappers[0]
    await addImgCol.trigger('click')
    expect(wrapper.vm.showImportImg.status).toBeTruthy()
  })

  it('Click image should emit addImage', async () => {
    const image = materialBlockWrapper.find(VImg)
    await image.trigger('click')
    expect(materialBlockWrapper.emitted().addImage).toBeTruthy()
  })

  it('Mousedown image should emit saveImage', async () => {
    const image = materialBlockWrapper.find(VImg)
    await image.trigger('mousedown')
    expect(materialBlockWrapper.emitted().saveImage).toBeTruthy()
  })

  it('Click layout-image should emit addLayout', async () => {
    const layout = materialBlockWrapper.find('.layout-image')
    await layout.trigger('click')
    expect(materialBlockWrapper.emitted().addLayout).toBeTruthy()
  })
})
