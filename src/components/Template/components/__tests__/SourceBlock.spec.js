import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import SourceBlock from '../SourceBlock.vue'
import * as InputAPI from '@/apis/inputs'
import mockInputs from '../../../Devices/__tests__/__mocks__/deviceInputs.json'
import TooltipBtn from '@/components/button/TooltipBtn.vue'
import CustomBtn from '@/components/button/CustomBtn.vue'
import Vuetify from 'vuetify'

InputAPI.fetchList = jest.fn().mockResolvedValue({
  data: mockInputs.list
})
const VImg = {
  template: '<div v-bind="$attrs" v-on="$listeners"></div>'
}

const localVue = createLocalVue()
localVue.component('CustomBtn', CustomBtn)
localVue.component('TooltipBtn', TooltipBtn)

describe('Template page - SourceBlock.vue', () => {
  let sourceBlockWrapper
  let sourceCards
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify({
      theme: {
        dark: false
      }
    })
    sourceBlockWrapper = shallowMount(SourceBlock, {
      localVue,
      vuetify,
      mocks: {
        $t: jest.fn()
      },
      propsData: {
        screenForm: [0, 0, 0, 0]
      },
      stubs: {
        VImg
      }
    })
    sourceCards = sourceBlockWrapper.findAll('.source-card').wrappers
  })

  it('Mounted should call updateList', async () => {
    const updateList = jest.fn()
    const wrapper = shallowMount(SourceBlock, {
      localVue,
      vuetify,
      mocks: {
        $t: jest.fn()
      },
      methods: {
        updateList
      }
    })
    expect(updateList).toHaveBeenCalled()
  })

  it('Should contain down 4 sourceCards', async () => {
    expect(sourceCards).toHaveLength(4)
  })

  it('Mousedown sourceCards should emit saveImage', async () => {
    const sourceImage = sourceBlockWrapper.find(VImg)
    await sourceImage.trigger('mousedown')
    expect(sourceBlockWrapper.emitted().saveImage).toBeTruthy()
  })

  it('Click sourceCards should emit addImage', async () => {
    const sourceImage = sourceBlockWrapper.find(VImg)
    await sourceImage.trigger('click')
    expect(sourceBlockWrapper.emitted().addImage).toBeTruthy()
  })

  it('sourceCards Onerror should show no_signal image', async () => {
    const sourceImage = sourceBlockWrapper.find(VImg)
    sourceImage.vm.$emit('error')
    await flushPromises()
    expect(sourceBlockWrapper.vm.screenSnapshot[0].url).toBe('/img/source/no_signal.jpg')
  })

  it('Click refresh icon should emit updateScreenImage', async () => {
    const tooltipBtns = sourceBlockWrapper.findAll(TooltipBtn)
    tooltipBtns.wrappers[0].vm.$emit('click')
    await flushPromises()
    expect(sourceBlockWrapper.emitted().updateScreenImage).toBeTruthy()
  })

  it('Click edit icon should show edit dialog', async () => {
    const tooltipBtns = sourceBlockWrapper.findAll(TooltipBtn)
    tooltipBtns.wrappers[1].vm.$emit('click')
    await flushPromises()
    expect(sourceBlockWrapper.vm.showEditSource).toBeTruthy()
  })

  it('Click dialog cancel should emit onChangeScreen display edit dialog', async () => {
    const customBtns = sourceBlockWrapper.findAll(CustomBtn)
    customBtns.wrappers[0].vm.$emit('click')
    await flushPromises()
    expect(sourceBlockWrapper.emitted().onChangeScreen).toBeTruthy()
    expect(sourceBlockWrapper.vm.showEditSource).toBeFalsy()
  })

  it('Click dialog cancel should emit onChangeScreen display edit dialog', async () => {
    sourceBlockWrapper.vm.updateScreen = jest.fn()
    const customBtns = sourceBlockWrapper.findAll(CustomBtn)
    customBtns.wrappers[1].vm.$emit('click')
    await flushPromises()
    expect(sourceBlockWrapper.vm.updateScreen).toHaveBeenCalled()
    expect(sourceBlockWrapper.vm.showEditSource).toBeFalsy()
  })
})
