# vue-markdown-poi

A lightweight Vue component for rendering content with a [Markdown](https://daringfireball.net/projects/markdown/)-like syntax subset. It's designed for my personal projects, but you may find it useful.

## Install

Note: This module is not currently available pre-built. As such, your project will need a build step to use it. Or just copy the code directly into your project.

```console
npm install --save-dev @ky-is/vue-markdown-poi
```

## Usage

```html
<template>
  <markdown-poi :raw="sourceString" inline />
</template>
```
```js
import MarkdownPoi from 'vue-markdown-poi'
// ...
  components: {
    MarkdownPoi
  },

  data () {
    return {
      sourceString: `
~strikeout~*bold*/italic/ ~*/sbi/*~ /*~ibs~*/
- Bullet
> Quote
      `
    }
  },
// ...
```

## Props

- **raw** _String_: Text to be parsed and rendered.
- **inline** _Boolean_: If text should be rendered without multiline tags (only renders strikeout/bold/italics in this mode). Useful if you want a summary preview of content.
- **tag** _String_: The tag name to wrap rendered markdown in. Defaults to `div`.

## Syntax

Style (any combination of):
- `*bold*` **bold**
- `/italics/` _italics_
- `~strikethrough~` ~~strikethrough~~

Blocks (must start on a new line, no nesting):

- `- Bullets`

> `> Quotes`

Paragraphs: Delineated by multiple consecutive newlines.

Links: Parses urls starting with http(s)* or www.*
