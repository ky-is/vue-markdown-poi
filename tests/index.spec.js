import Vue from 'vue'
import { mount } from '@vue/test-utils'

import MarkdownPoi from '@/index.vue'

const REGEX_LINES_WHITESPACE = /\n */g

async function expectInnerHtmlEquals (wrapper, raw, result) {
	wrapper.setProps({ raw: raw && raw.trim() })
	await Vue.nextTick()
	return expect(wrapper.html().replace(REGEX_LINES_WHITESPACE, '')).toEqual(`<div class="markdown-poi">${result.replace(REGEX_LINES_WHITESPACE, '')}</div>`)
}

describe('index.vue', () => {
	const wrapper = mount(MarkdownPoi)

	it('defaults to empty', async () => {
		await expectInnerHtmlEquals(wrapper, null, '')
	})


	it('combines everything', async () => {
		const raw = `
*/~Hello~/*

- a *bold* ~/claim~/
- 2nd bullet:
- It's like https://daringfireball.net/projects/markdown/
> But not

> after
		`
		await expectInnerHtmlEquals(wrapper, raw, `<p><strong><em><s>Hello</s></em></strong></p><p></p><ul><li>a <strong>bold</strong> <s><em>claim</em></s></li><li>2nd bullet:</li><li>It's like <a href=\"https://daringfireball.net/projects/markdown/\" target=\"_blank\" rel=\"noopener\">https://daringfireball.net/projects/markdown/</a></li></ul><blockquote>But not</blockquote><p></p><p></p><blockquote>after</blockquote><p></p>`)
	})

	describe('inline', () => {
		const inlineWrapper = mount(MarkdownPoi, {
			propsData: {
				inline: true,
			},
		})

		it('skips paragraph/list/quote blocks', async () => {
			const raw = `
- */inline/*
- ~bullet~
			`
			const result = `
- <strong><em>inline</em></strong>
- <s>bullet</s>
			`
			await expectInnerHtmlEquals(inlineWrapper, raw, result.trim())
		})
	})


	describe('sanitization', () => {
		it('does not allow arbitrary HTML', async () => {
			await expectInnerHtmlEquals(wrapper, '<script>window.alert(1)</script>', '<p>&lt;script&gt;window.alert(1)&lt;/script&gt;</p>')
		})

		it('does not allow escaping', async () => {
			await expectInnerHtmlEquals(wrapper, '\\<\\\<', '<p>\\&lt;\\\&lt;</p>')
		})

		it('parses special characters', async () => {
			await expectInnerHtmlEquals(wrapper, '>&<', '<p>&gt;&amp;&lt;</p>')
		})
	})

	describe('linkify', () => {
		it('renders http(s) in <a>', async () => {
			await expectInnerHtmlEquals(wrapper, 'https://vuejs.org or http://www.wikipedia.org', '<p><a href=\"https://vuejs.org\" target=\"_blank\" rel=\"noopener\">https://vuejs.org</a> or <a href=\"http://www.wikipedia.org\" target=\"_blank\" rel=\"noopener\">http://www.wikipedia.org</a></p>')
		})

		it('renders www.* with http href', async () => {
			await expectInnerHtmlEquals(wrapper, 'www.google.com', '<p><a href=\"http://www.google.com\" target=\"_blank\" rel=\"noopener\">www.google.com</a></p>')
		})

		it('ignores other protocols', async () => {
			await expectInnerHtmlEquals(wrapper, 'file:///etc/', '<p>file:///etc/</p>')
			await expectInnerHtmlEquals(wrapper, 'test@email.com mailto:test@email.com', '<p>test@email.com mailto:test@email.com</p>') //TODO?
		})
	})

	describe('newlines', () => {
		it('renders plain text in <p>', async () => {
			await expectInnerHtmlEquals(wrapper, 'hi', '<p>hi</p>')
		})

		it('renders 1 as <br> and 2 as <p>', async () => {
			let raw = `
a

b
c

d
			`
			await expectInnerHtmlEquals(wrapper, raw, '<p>a</p><p>b<br>c</p><p>d</p>')
		})
	})

	describe('text decoration', () => {
		it('renders *bold* as <strong>', async () => {
			await expectInnerHtmlEquals(wrapper, '*bold*', '<p><strong>bold</strong></p>')
		})

		it('renders /italic/ as <em>', async () => {
			await expectInnerHtmlEquals(wrapper, '/italic/', '<p><em>italic</em></p>')
		})

		it('renders ~strikethrough~ as <s>', async () => {
			await expectInnerHtmlEquals(wrapper, '~strikethrough~', '<p><s>strikethrough</s></p>')
		})

		it('renders all combinations of */~', async () => {
			await expectInnerHtmlEquals(wrapper, '*/~a~/*', '<p><strong><em><s>a</s></em></strong></p>')
			await expectInnerHtmlEquals(wrapper, '*/~a*/~', '<p><strong><em><s>a</s></em></strong></p>')
			await expectInnerHtmlEquals(wrapper, '/~*b*~/', '<p><em><s><strong>b</strong></s></em></p>')
		})

		it('ignores duplicates ', async () => {
			await expectInnerHtmlEquals(wrapper, '**a**', '<p><strong>*a</strong>*</p>')
		})
	})

	describe('blocks', () => {
		it('renders lists as <ul> with outer <p>', async () => {
			const raw = `
test
- a
- -
			`
			await expectInnerHtmlEquals(wrapper, raw, '<p>test<br></p><ul><li>a</li><li>-</li></ul><p></p>')
		})

		it('renders quotes as <blockquote> with outer <p>', async () => {
			const raw = `
quote
> a

> >
			`
			await expectInnerHtmlEquals(wrapper, raw, '<p>quote<br></p><blockquote>a</blockquote><p></p><p></p><blockquote>&gt;</blockquote><p></p>')
		})

		it('ignores nesting/invalid formatting', async () => {
			const raw = `
>no
-	no
	- no
- > no quote
			`
			await expectInnerHtmlEquals(wrapper, raw, '<p>&gt;no<br>- no<br> - no<br></p><ul><li>&gt; no quote</li></ul><p></p>')
		})
	})
})
