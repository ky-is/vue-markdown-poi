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


	it('combines everything', () => {
		const raw = `
*/~Hello~/*

- a *bold* ~/claim~/
- 2nd bullet:
- It's like https://daringfireball.net/projects/markdown/
> But not

> after
		`
		expectInnerHtmlEquals(wrapper, raw, `<p><strong><em><s>Hello</s></em></strong></p><p></p><ul><li>a <strong>bold</strong> <s><em>claim</em></s></li><li>2nd bullet:</li><li>It's like <a href=\"https://daringfireball.net/projects/markdown/\" target=\"_blank\" rel=\"noopener\">https://daringfireball.net/projects/markdown/</a></li></ul><blockquote>But not</blockquote><p></p><p></p><blockquote>after</blockquote><p></p>`)
	})

	describe('inline', () => {
		const inlineWrapper = mount(MarkdownPoi, {
			propsData: {
				inline: true,
			},
		})

		it('skips paragraph/list/quote blocks', () => {
			const raw = `
- */inline/*
- ~bullet~
			`
			const result = `
- <strong><em>inline</em></strong>
- <s>bullet</s>
			`
			expectInnerHtmlEquals(inlineWrapper, raw, result.trim())
		})
	})


	describe('sanitization', () => {
		it('does not allow arbitrary HTML', () => {
			expectInnerHtmlEquals(wrapper, '<script>window.alert(1)</script>', '<p>&lt;script&gt;window.alert(1)&lt;/script&gt;</p>')
		})

		it('does not allow escaping', () => {
			expectInnerHtmlEquals(wrapper, '\\<\\\<', '<p>\\&lt;\\\&lt;</p>')
		})

		it('parses special characters', () => {
			expectInnerHtmlEquals(wrapper, '>&<', '<p>&gt;&amp;&lt;</p>')
		})
	})

	describe('linkify', () => {
		it('renders http(s) in <a>', () => {
			expectInnerHtmlEquals(wrapper, 'https://vuejs.org or http://www.wikipedia.org', '<p><a href=\"https://vuejs.org\" target=\"_blank\" rel=\"noopener\">https://vuejs.org</a> or <a href=\"http://www.wikipedia.org\" target=\"_blank\" rel=\"noopener\">http://www.wikipedia.org</a></p>')
		})

		it('renders www.* with http href', () => {
			expectInnerHtmlEquals(wrapper, 'www.google.com', '<p><a href=\"http://www.google.com\" target=\"_blank\" rel=\"noopener\">www.google.com</a></p>')
		})

		it('ignores other protocols', () => {
			expectInnerHtmlEquals(wrapper, 'file:///etc/', '<p>file:///etc/</p>')
			expectInnerHtmlEquals(wrapper, 'test@email.com mailto:test@email.com', '<p>test@email.com mailto:test@email.com</p>') //TODO?
		})
	})

	describe('newlines', () => {
		it('renders plain text in <p>', () => {
			expectInnerHtmlEquals(wrapper, 'hi', '<p>hi</p>')
		})

		it('renders 1 as <br> and 2 as <p>', () => {
			let raw = `
a

b
c

d
			`
			expectInnerHtmlEquals(wrapper, raw, '<p>a</p><p>b<br>c</p><p>d</p>')
		})
	})

	describe('text decoration', () => {
		it('renders *bold* as <strong>', () => {
			expectInnerHtmlEquals(wrapper, '*bold*', '<p><strong>bold</strong></p>')
		})

		it('renders /italic/ as <em>', () => {
			expectInnerHtmlEquals(wrapper, '/italic/', '<p><em>italic</em></p>')
		})

		it('renders ~strikethrough~ as <s>', () => {
			expectInnerHtmlEquals(wrapper, '~strikethrough~', '<p><s>strikethrough</s></p>')
		})

		it('renders all combinations of */~', () => {
			expectInnerHtmlEquals(wrapper, '*/~a~/*', '<p><strong><em><s>a</s></em></strong></p>')
			expectInnerHtmlEquals(wrapper, '*/~a*/~', '<p><strong><em><s>a</s></em></strong></p>')
			expectInnerHtmlEquals(wrapper, '/~*b*~/', '<p><em><s><strong>b</strong></s></em></p>')
		})

		it('ignores duplicates ', () => {
			expectInnerHtmlEquals(wrapper, '**a**', '<p><strong>*a</strong>*</p>')
		})
	})

	describe('blocks', () => {
		it('renders lists as <ul> with outer <p>', () => {
			const raw = `
test
- a
- -
			`
			expectInnerHtmlEquals(wrapper, raw, '<p>test<br></p><ul><li>a</li><li>-</li></ul><p></p>')
		})

		it('renders quotes as <blockquote> with outer <p>', () => {
			const raw = `
quote
> a

> >
			`
			expectInnerHtmlEquals(wrapper, raw, '<p>quote<br></p><blockquote>a</blockquote><p></p><p></p><blockquote>&gt;</blockquote><p></p>')
		})

		it('ignores nesting/invalid formatting', () => {
			const raw = `
>no
-	no
	- no
- > no quote
			`
			expectInnerHtmlEquals(wrapper, raw, '<p>&gt;no<br>-	no<br>	- no<br></p><ul><li>&gt; no quote</li></ul><p></p>')
		})
	})
})
