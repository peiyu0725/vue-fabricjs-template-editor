import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import mockCanvas from './__mocks__/templateCanvas.json'
import Tools from '../Tools.vue'
import Editer from '../../Editer.vue'
import AIcon from '@/components/AIcon.vue'
import CustomBtn from '@/components/button/CustomBtn.vue'
import TooltipBtn from '@/components/button/TooltipBtn.vue'
import VueRouter from 'vue-router'
import router from '@/router'
import Vuetify from 'vuetify'
import * as templateAPI from '@/apis/template'

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
      router,
      vuetify,
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
  })

  describe('Template page - Tools.vue', () => {
    let toolsWrapper
    let tooltipBtns
    beforeEach(() => {
      const vuetify = new Vuetify({
        theme: {
          dark: false
        }
      })
      toolsWrapper = shallowMount(Tools, {
        localVue,
        vuetify,
        propsData: {
          canvas: mockCanvas.canvas,
          showLayerTools: false
        },
        mocks: {
          $t: jest.fn()
        }
      })
      tooltipBtns = toolsWrapper.findAll(TooltipBtn)
    })

    it('Should contain down icons', () => {
      expect(tooltipBtns.wrappers).toHaveLength(7)
    })

    it.each([
      [0, 'addTextBox'],
      [1, 'addRectangle'],
      [2, 'addTime'],
      [3, 'onCrop'],
      [4, 'onClickLayer'],
      [5, 'copyItems'],
      [6, 'deleteItem']
    ])(
      'click icons should emit correct fn', async (index, item) => {
        const icon = tooltipBtns.wrappers[index]
        icon.vm.$emit('click')
        await flushPromises()
        expect(toolsWrapper.emitted(item)).toBeTruthy()
      })

    it('showLayerTools should show layerTool card', async () => {
      toolsWrapper.vm.canvas.getActiveObject = jest.fn().mockReturnValue(mockCanvas.activeObj)
      await toolsWrapper.setProps({
        showLayerTools: true
      })
      expect(toolsWrapper.find('.layer-tools').exists()).toBeTruthy()
    })

    it.each([
      [0, 'bringToFront'],
      [1, 'sendToBack'],
      [2, 'bringForward'],
      [3, 'sendBackwards']
    ])(
      'select not source obj click layerTools should call correct fn', async (index, item) => {
        const toolsSpy = jest.spyOn(toolsWrapper.vm, item)
        toolsWrapper.vm.canvas[item] = jest.fn()
        toolsWrapper.vm.canvas.getItemsByName = jest.fn().mockReturnValue([])
        toolsWrapper.vm.canvas.moveTo = jest.fn()
        toolsWrapper.vm.canvas.getObjects = jest.fn().mockReturnValue(mockCanvas.activeObj)
        toolsWrapper.vm.canvas.getObjects().indexOf = jest.fn().mockReturnValue(1)
        await toolsWrapper.setProps({
          showLayerTools: true
        })
        expect(toolsWrapper.find('.layer-tools').exists()).toBeTruthy()
        const layerToolCard = toolsWrapper.find('.layer-tools')
        const tools = layerToolCard.findAll('.layer-tools-row__item')
        await tools.wrappers[index].trigger('click')
        expect(toolsSpy).toHaveBeenCalled()
        if (item !== 'sendToBack') {
          expect(toolsWrapper.vm.canvas[item]).toHaveBeenCalledWith(mockCanvas.activeObj)
        } else {
          expect(toolsWrapper.vm.canvas.moveTo).toHaveBeenCalled()
        }
        expect(toolsWrapper.emitted().updateObjects).toBeTruthy()
      })

    it.each([
      [0, 'bringToFront'],
      [1, 'sendToBack'],
      [2, 'bringForward'],
      [3, 'sendBackwards']
    ])(
      'select source obj click layerTools should call correct fn', async (index, item) => {
        toolsWrapper.vm.canvas.getActiveObject = jest.fn().mockReturnValue(mockCanvas.source)
        await flushPromises()
        const toolsSpy = jest.spyOn(toolsWrapper.vm, item)
        await toolsWrapper.setProps({
          showLayerTools: true
        })
        expect(toolsWrapper.find('.layer-tools').exists()).toBeTruthy()
        const layerToolCard = toolsWrapper.find('.layer-tools')
        const tools = layerToolCard.findAll('.layer-tools-row__item')
        await tools.wrappers[index].trigger('click')
        expect(toolsSpy).toHaveBeenCalled()
        if (item !== 'bringToFront') {
          expect(toolsWrapper.vm.canvas[item]).toHaveBeenCalledWith(mockCanvas.source)
        }
      })
  })
})
