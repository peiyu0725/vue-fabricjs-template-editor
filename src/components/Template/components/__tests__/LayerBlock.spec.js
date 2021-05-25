import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import LayerBlock from '../LayerBlock.vue'
import Editer from '../../Editer.vue'
import TooltipBtn from '@/components/button/TooltipBtn.vue'
import mockCanvas from './__mocks__/templateCanvas.json'
import CustomBtn from '@/components/button/CustomBtn.vue'
import VueRouter from 'vue-router'
import router from '@/router'
import ColorButton from '@/components/ColorButton'
import AIcon from '@/components/AIcon.vue'
import draggable from 'vuedraggable'
import { LAYER_NAME } from '../../FabricVariable'
import * as templateAPI from '@/apis/template'
import Vuetify from 'vuetify'

templateAPI.fetch = jest.fn().mockResolvedValue({
  data: mockCanvas.template
})

jest.mock('fabric')
const localVue = createLocalVue()
localVue.component('CustomBtn', CustomBtn)
localVue.component('TooltipBtn', TooltipBtn)
localVue.component('ColorButton', ColorButton)
localVue.component('AIcon', AIcon)
localVue.use(VueRouter)
router.push({ name: 'TemplateEditer', params: { id: 1 } })

const VListGroup = {
  template: '<div v-bind="$attrs" v-on="$listeners"></div>'
}

describe('Template page', () => {
  let wrapper
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify({
      theme: {
        dark: false
      }
    })
    wrapper = shallowMount(Editer, {
      localVue,
      vuetify,
      router,
      data: () => {
        return {
          canvas: mockCanvas.canvas,
          activeObj: mockCanvas.activeObj
        }
      },
      computed: {
        permission: () => 1
      },
      mocks: {
        $t: jest.fn()
      }
    })
    wrapper.vm.canvas.getItemsByName = jest.fn().mockReturnValue([])
    wrapper.vm.canvas.getObjects = jest.fn().mockReturnValue(mockCanvas.activeObj)
    wrapper.vm.canvas.getObjects().indexOf = jest.fn().mockReturnValue(1)
  })

  describe('Template page - LayerBlock.vue', () => {
    let layerBlockWrapper
    const isActive = jest.fn()
    const detectName = jest.fn()
    beforeEach(() => {
      layerBlockWrapper = shallowMount(LayerBlock, {
        localVue,
        vuetify,
        propsData: {
          canvas: mockCanvas.canvas,
          activeObj: mockCanvas.activeObj,
          items: mockCanvas.layers,
          fixedItem: mockCanvas.fixedItem
        },
        data: () => {
          return {
            nameItems: LAYER_NAME
          }
        },
        methods: {
          isActive,
          detectName
        },
        mocks: {
          $t: jest.fn()
        }
      })
    })
    it('Check fn should be called', async () => {
      expect(isActive).toHaveBeenCalled()
      expect(detectName).toHaveBeenCalled()
    })

    it('Should contain down draggable', async () => {
      expect(layerBlockWrapper.find(draggable).exists()).toBeTruthy()
    })

    it('Has activeObj click header lock setting should emit setLockState', async () => {
      const lockBtn = layerBlockWrapper.findAll(AIcon).wrappers[0]
      lockBtn.vm.$emit('click')
      await flushPromises()
      expect(layerBlockWrapper.emitted().setLockState).toBeTruthy()
    })

    it('ActiveObj = null click header lock setting should not emit setLockState', async () => {
      layerBlockWrapper.setProps({ activeObj: null })
      const lockBtn = layerBlockWrapper.findAll(AIcon).wrappers[0]
      lockBtn.vm.$emit('click')
      await flushPromises()
      expect(layerBlockWrapper.emitted().setLockState).toBeFalsy()
    })

    it('ActiveObj = null click header lock setting should not emit setLockState', async () => {
      const wrapper = shallowMount(LayerBlock, {
        localVue,
        vuetify,
        propsData: {
          canvas: mockCanvas.canvas,
          activeObj: mockCanvas.activeObj,
          items: mockCanvas.layers,
          fixedItem: mockCanvas.fixedItem
        },
        stubs: {
          'a-icon': true,
          VListGroup
        },
        mocks: {
          $t: jest.fn()
        }
      })
      const layerItem = wrapper.find(VListGroup)
      await layerItem.trigger('click')
      expect(wrapper.emitted().setFObjToActive).toBeTruthy()
    })

    it('Click lock-icon should emit setLockState', async () => {
      const lockBtn = layerBlockWrapper.findAll('.lock-icon').wrappers[0]
      lockBtn.vm.$emit('click', new Event('click'))
      await flushPromises()
      expect(layerBlockWrapper.emitted().setLockState).toBeTruthy()
    })
  })
})
