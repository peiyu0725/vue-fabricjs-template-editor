import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import SettingBlock from '../SettingBlock.vue'
import Editer from '../../Editer.vue'
import TooltipBtn from '@/components/button/TooltipBtn.vue'
import mockCanvas from './__mocks__/templateCanvas.json'
import CustomBtn from '@/components/button/CustomBtn.vue'
import VueRouter from 'vue-router'
import router from '@/router'
import RatioToggle from '../RatioToggle.vue'
import AInput from '@/components/AInput'
import ASelect from '@/components/select/ASelect'
import ColorButton from '@/components/ColorButton'
import AIcon from '@/components/AIcon.vue'
import * as templateAPI from '@/apis/template'
import Vuetify from 'vuetify'
templateAPI.fetch = jest.fn().mockResolvedValue({
  data: mockCanvas.template
})

jest.mock('fabric')
const localVue = createLocalVue()
localVue.component('CustomBtn', CustomBtn)
localVue.component('TooltipBtn', TooltipBtn)
localVue.component('RatioToggle', RatioToggle)
localVue.component('AInput', AInput)
localVue.component('ASelect', ASelect)
localVue.component('ColorButton', ColorButton)
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
          canvas: mockCanvas.canvas,
          activeObj: mockCanvas.activeObj,
          originX: 62,
          originY: 27
        }
      },
      computed: {
        permission: () => 1
      },
      mocks: {
        $t: jest.fn()
      }
    })
    wrapper.vm.activeObj.getRealWidth = jest.fn().mockReturnValue(295)
    wrapper.vm.activeObj.getRealHeight = jest.fn().mockReturnValue(401)
    wrapper.vm.canvas.getActiveObject = jest.fn().mockReturnValue(mockCanvas.activeObj)
    wrapper.vm.canvas.renderAll = jest.fn()
  })

  describe('Template page - SettingBlock.vue', () => {
    let settingBlockWrapper
    let AInputs
    beforeEach(() => {
      const vuetify = new Vuetify({
        theme: {
          dark: false
        }
      })
      settingBlockWrapper = shallowMount(SettingBlock, {
        localVue,
        vuetify,
        propsData: {
          canvas: mockCanvas.canvas,
          activeObj: mockCanvas.activeObj,
          originX: 62,
          originY: 27,
          canvasWidth: 1115,
          canvasHeight: 627,
          lockScale: true
        },
        mocks: {
          $t: jest.fn()
        }
      })

      AInputs = settingBlockWrapper.findAll(AInput)
      settingBlockWrapper.vm.setObj = jest.fn()
    })

    it.each([[0, 'left'], [1, 'center'], [2, 'right'], [3, 'top'], [4, 'middle'], [5, 'bottom']])(
      'click align items should call correct align case', async (index, item) => {
        const alignSpy = jest.spyOn(settingBlockWrapper.vm, 'align')
        const tooltipBtns = settingBlockWrapper.findAll(TooltipBtn)
        tooltipBtns.wrappers[index].vm.$emit('click')
        await flushPromises()
        expect(alignSpy).toHaveBeenCalledWith(item)
        expect(settingBlockWrapper.vm.setObj).toHaveBeenCalled()
      })

    it.each([0, 1, 2, 3])('input @input event', async (i) => {
      AInputs.wrappers[i].vm.$emit('input')
      await flushPromises()
      expect(settingBlockWrapper.vm.setObj).toHaveBeenCalled()
    })

    it.each([0, 1, 2, 3])('input disabled', async (i) => {
      await settingBlockWrapper.setProps({ activeObj: null })
      expect(AInputs.wrappers[i].is('[disabled]')).toBeTruthy()
    })

    it('ActiveObj is text should show text input and color picker', async () => {
      settingBlockWrapper.vm.activeObj.exitEditing = jest.fn()
      await settingBlockWrapper.setProps({
        textSetting: {
          show: true
        },
        colorSetting: {
          show: true
        }
      })
      expect(settingBlockWrapper.findAll(AInput).wrappers).toHaveLength(5)
      expect(settingBlockWrapper.find(ColorButton).exists()).toBeTruthy()
      const textInput = settingBlockWrapper.findAll(AInput).wrappers[4]
      textInput.vm.$emit('input')
      await flushPromises()
      expect(settingBlockWrapper.vm.setObj).toHaveBeenCalled()
      textInput.vm.$emit('focus')
      await flushPromises()
      expect(settingBlockWrapper.vm.activeObj.exitEditing).toHaveBeenCalled()
    })

    it('ActiveObj is rect should show border input and color picker', async () => {
      await settingBlockWrapper.setProps({
        borderSetting: {
          show: true
        },
        colorSetting: {
          show: true
        }
      })
      expect(settingBlockWrapper.findAll(AInput).wrappers).toHaveLength(5)
      expect(settingBlockWrapper.findAll(ColorButton).wrappers).toHaveLength(2)
      const textInput = settingBlockWrapper.findAll(AInput).wrappers[4]
      textInput.vm.$emit('input')
      await flushPromises()
      expect(settingBlockWrapper.vm.setObj).toHaveBeenCalled()
    })

    it('ActiveObj is time should show formatSelecter、ampm checkbox、fontSize input and color picker', async () => {
      settingBlockWrapper.vm.transformFormat = jest.fn()
      settingBlockWrapper.vm.editTimeFormat = jest.fn()
      await settingBlockWrapper.setProps({
        fontSizeSetting: {
          show: true
        },
        formatSetting: {
          show: true
        },
        colorSetting: {
          show: true
        }
      })
      expect(settingBlockWrapper.findAll(AInput).wrappers).toHaveLength(5)
      expect(settingBlockWrapper.find(ColorButton).exists()).toBeTruthy()
      expect(settingBlockWrapper.find(ASelect).exists()).toBeTruthy()

      const textInput = settingBlockWrapper.findAll(AInput).wrappers[4]
      textInput.vm.$emit('input', 16)
      await flushPromises()
      expect(settingBlockWrapper.vm.setObj).toHaveBeenCalledWith({
        fontSize: parseInt(16, 10)
      })

      const formatSelect = settingBlockWrapper.findAll(ASelect).wrappers[0]
      formatSelect.vm.$emit('change')
      await flushPromises()
      expect(settingBlockWrapper.vm.transformFormat).toHaveBeenCalled()
      expect(settingBlockWrapper.vm.editTimeFormat).toHaveBeenCalled()

      const ampmCheckbox = settingBlockWrapper.find({ ref: 'ampmCheckbox' })
      ampmCheckbox.vm.$emit('change')
      await flushPromises()
      expect(settingBlockWrapper.vm.transformFormat).toHaveBeenCalled()
      expect(settingBlockWrapper.vm.editTimeFormat).toHaveBeenCalled()
    })

    it('click lock icon should emit onLockObjScale', async () => {
      const lockIcon = settingBlockWrapper.findAll(AIcon).wrappers[0]
      lockIcon.vm.$emit('click')
      await flushPromises()
      expect(settingBlockWrapper.emitted().onLockObjScale).toBeTruthy()
    })
  })
})
