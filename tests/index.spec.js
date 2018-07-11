import { mount } from '@vue/test-utils'

import MarkdownPoi from '@/index.vue'

function expectInnerHtmlEquals (wrapper, raw, result) {
	wrapper.setProps({ raw: raw && raw.trim() })
	return expect(wrapper.html()).toEqual(`<div class="markdown-poi">${result}</div>`)
}

describe('index.vue', () => {
	const wrapper = mount(MarkdownPoi)

	it('defaults to empty', () => {
		expectInnerHtmlEquals(wrapper, null, '')
	})
})
