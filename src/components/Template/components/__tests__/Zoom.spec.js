import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import mockCanvas from './__mocks__/templateCanvas.json'
import Zoom from '../Zoom.vue'
import Editer from '../../Editer.vue'
import AIcon from '@/components/AIcon.vue'
import CustomBtn from '@/components/button/CustomBtn.vue'
import TooltipBtn from '@/components/button/TooltipBtn.vue'
import VueRouter from 'vue-router'
import router from '@/router'
import * as templateAPI from '@/apis/template'
import Vuetify from 'vuetify'
templateAPI.fetch = jest.fn().mockResolvedValue({
  data: mockCanvas.template
})

const localVue = createLocalVue()
localVue.component('CustomBtn', CustomBtn)
localVue.component('TooltipBtn', TooltipBtn)
localVue.component('AIcon', AIcon)
localVue.use(VueRouter)
router.push({ name: 'TemplateEditer', params: { id: 1 } })

describe('Template page', () => {
  let wrapper
  beforeEach(() => {
    const vuetify = new Vuetify({
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
          canvas: mockCanvas.canvas
        }
      },
      computed: {
        permission: () => 1
      },
      mocks: {
        $t: jest.fn()
      }
    })
    wrapper.vm.canvas.getZoom = jest.fn().mockReturnValue(0.5)
  })

  describe('Template page - Zoom.vue', () => {
    let zoomWrapper
    const vuetify = new Vuetify({
      theme: {
        dark: false
      }
    })
    beforeEach(() => {
      zoomWrapper = shallowMount(Zoom, {
        localVue,
        vuetify,
        propsData: {
          canvas: mockCanvas.canvas
        }
      })
    })

    it('click zoomOut icon should emit setZoom -0.05', async () => {
      const zoomOutIcon = zoomWrapper.findAll(AIcon).wrappers[0]
      zoomOutIcon.vm.$emit('click')
      await flushPromises()
      expect(zoomWrapper.emitted().setZoom[0]).toEqual([-0.05])
    })

    it('click zoomIn icon should emit setZoom +0.05', async () => {
      const zoomInIcon = zoomWrapper.findAll(AIcon).wrappers[1]
      zoomInIcon.vm.$emit('click')
      await flushPromises()
      expect(zoomWrapper.emitted().setZoom[0]).toEqual([0.05])
    })

    it('canvas = null getZoom should return 100', async () => {
      await zoomWrapper.setProps({
        canvas: null
      })
      expect(zoomWrapper.vm.getZoom).toBe(100)
    })

    it('getZoom should return', async () => {
      expect(zoomWrapper.vm.getZoom).toBe(50)
    })
  })
})
