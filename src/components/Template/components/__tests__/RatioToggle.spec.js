import { shallowMount } from '@vue/test-utils'
import RatioToggle from '../RatioToggle.vue'

describe('Template page - RatioToggle.vue', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(RatioToggle, {
      stubs: {
        'a-icon': true
      }
    })
  })

  it('should have correct element', () => {
    expect(wrapper.find('.ratio-toggle').exists()).toBeTruthy()
    expect(wrapper.find('.ratio-toggle__item--vertical').exists()).toBeTruthy()
    expect(wrapper.find('.ratio-toggle__item--horizontal').exists()).toBeTruthy()
  })

  it(':value should control active', async () => {
    await wrapper.setProps({
      value: 'horizontal'
    })
    expect(wrapper.find('.ratio-toggle__item--horizontal').classes()).toContain('ratio-toggle__item--active')
    expect(wrapper.find('.ratio-toggle__item--vertical').classes()).not.toContain('ratio-toggle__item--active')

    await wrapper.setProps({
      value: 'vertical'
    })
    expect(wrapper.find('.ratio-toggle__item--vertical').classes()).toContain('ratio-toggle__item--active')
    expect(wrapper.find('.ratio-toggle__item--horizontal').classes()).not.toContain('ratio-toggle__item--active')
  })

  it('should send correct @input event and it value', async () => {
    const horizontal = wrapper.find('.ratio-toggle__item--horizontal')
    await horizontal.trigger('click')
    expect(wrapper.emitted().input[0]).toEqual(['horizontal'])
    const vertical = wrapper.find('.ratio-toggle__item--vertical')
    await vertical.trigger('click')
    expect(wrapper.emitted().input[1]).toEqual(['vertical'])
  })
})
