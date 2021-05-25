import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Editer from '../../Editer.vue'
import SettingBlock from '../SettingBlock.vue'
import MaterialBlock from '../MaterialBlock.vue'
import SourceBlock from '../SourceBlock.vue'
import LayerBlock from '../LayerBlock.vue'
import Tools from '../Tools.vue'
import Zoom from '../Zoom.vue'
import mockCanvas from './__mocks__/templateCanvas.json'
import CustomBtn from '@/components/button/CustomBtn.vue'
import TooltipBtn from '@/components/button/TooltipBtn.vue'
import VueRouter from 'vue-router'
import router from '@/router'
import ADialog from '@/components/dialog/ADialog'
import * as templateAPI from '@/apis/template'
import Vuetify from 'vuetify'
// import { VTooltip } from 'vuetify/lib'

templateAPI.fetch = jest.fn().mockResolvedValue({
  data: mockCanvas.template
})

jest.mock('@/utils/tool')
jest.mock('fabric')
const localVue = createLocalVue()
localVue.component('CustomBtn', CustomBtn)
localVue.component('TooltipBtn', TooltipBtn)
localVue.use(VueRouter)
router.push({ name: 'TemplateEditer', params: { id: 1 } })

describe('Template page', () => {
  let wrapper
  const goBack = jest.fn()
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
          activeObj: mockCanvas.activeObj,
          originX: 62,
          originY: 27,
          canvasWidth: 1115,
          canvasHeight: 627,
          workSpaceWidth: 1239,
          workSpaceHeight: 682,
          fixedCanvas: false,
          templateName: 'test'
        }
      },
      methods: {
        goBack
      },
      computed: {
        permission: () => 1
      },
      mocks: {
        $t: jest.fn(),
        $loading: {
          show: jest.fn(),
          hide: jest.fn()
        },
        $toast: {
          success: jest.fn(),
          error: jest.fn()
        }
      },
      stubs: {
        'a-icon': true
      }
    })
    wrapper.vm.$toast.success.mockReset()
    wrapper.vm.$toast.error.mockReset()
    wrapper.vm.$loading.show.mockReset()
    wrapper.vm.$loading.hide.mockReset()
  })

  it('Should contain down components', async () => {
    expect(wrapper.find(SettingBlock).exists()).toBeTruthy()
    expect(wrapper.find(MaterialBlock).exists()).toBeTruthy()
    expect(wrapper.find(SourceBlock).exists()).toBeTruthy()
    expect(wrapper.find(LayerBlock).exists()).toBeTruthy()
    expect(wrapper.find(Tools).exists()).toBeTruthy()
    expect(wrapper.find(Zoom).exists()).toBeTruthy()
  })

  // it('Click goBackBtn Should call goBack', async () => {
  //   const goBackBtn = wrapper.findAll(VTooltip).wrappers[0]
  //   goBackBtn.vm.$emit('click')
  //   await flushPromises()
  //   expect(goBack).toHaveBeenCalled()
  // })

  it('Click clearAllBtn Should show dialog', async () => {
    const clearAllBtn = wrapper.findAll(TooltipBtn).wrappers[0]
    clearAllBtn.vm.$emit('click')
    await flushPromises()
    expect(wrapper.vm.showDialog).toBeTruthy()
    expect(wrapper.find(ADialog).attributes().show).toBe('true')
  })

  it('Canvas object length 0 click saveBtn Should show error toast', async () => {
    wrapper.vm.canvas.toJSON = jest.fn().mockReturnValue(mockCanvas.canvas)
    const saveBtn = wrapper.findAll(TooltipBtn).wrappers[1]
    saveBtn.vm.$emit('click')
    await flushPromises()
    expect(wrapper.vm.$toast.error).toHaveBeenCalled()
  })

  it('FixedCanvas click saveBtn Should show error toast', async () => {
    wrapper.vm.canvas.toJSON = jest.fn().mockReturnValue(mockCanvas.canvasJson)
    wrapper.vm.fixedCanvas = true
    const saveBtn = wrapper.findAll(TooltipBtn).wrappers[1]
    saveBtn.vm.$emit('click')
    await flushPromises()
    expect(wrapper.vm.$toast.error).toHaveBeenCalled()
  })

  it('Empty template name click saveBtn Should show error toast', async () => {
    wrapper.vm.canvas.toJSON = jest.fn().mockReturnValue(mockCanvas.canvasJson)
    wrapper.vm.templateName = ''
    const saveBtn = wrapper.findAll(TooltipBtn).wrappers[1]
    saveBtn.vm.$emit('click')
    await flushPromises()
    expect(wrapper.vm.$toast.error).toHaveBeenCalled()
  })

  it('Click saveBtn Should show loading and success goback', async () => {
    wrapper.vm.canvas.toJSON = jest.fn().mockReturnValue(mockCanvas.canvasJson)
    wrapper.vm.canvas.discardActiveObject = jest.fn().mockReturnValue({})
    wrapper.vm.canvas.discardActiveObject().renderAll = jest.fn()
    wrapper.vm.canvas.getObjects = jest.fn().mockReturnValue(mockCanvas.canvasJson.objects)
    wrapper.vm.canvas.toDatalessJSON = jest.fn().mockReturnValue(mockCanvas.canvasJson)
    const getScreensSpy = jest.spyOn(wrapper.vm, 'getScreens')
    const addTemplateSpy = jest.spyOn(wrapper.vm, 'addTemplate')
    const saveBtn = wrapper.findAll(TooltipBtn).wrappers[1]
    saveBtn.vm.$emit('click')
    await flushPromises()
    expect(wrapper.vm.$loading.show).toHaveBeenCalled()
    expect(getScreensSpy).toHaveBeenCalled()
    expect(addTemplateSpy).toHaveBeenCalled()
    // expect(goBack).toHaveBeenCalled()
  })
})
