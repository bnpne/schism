# Schism

A simple text splitter. Allows for splitting text into lines, words, and even characters for use of animating or
manipulating. Schism neatly splits each word (or char, or line) into an outer span with a hidden overflow, with each child wrapped in
seperate spans. Allowing for easy targeting.

```js
npm install @bnpne/schism
```

## Basic Example

```js
import schism from '@bnpne/schism'

const target = document.querySelector('.class')
target.innerHTML = 'Hello this is a string split into individual words'

const splitWords = new schism({target: target, mutation: 'words'}) // 'chars', 'words', 'lines'

console.log(splitWords.wordArray) // returns an array of each word wrapped in an inner span, perfect for animating

// animate using gsap
gsap.fromTo(
  splitWords.wordArray,
  {
    percentY: 100,
  },
  {
    percentY: 0,
    duration: 1,
    stagger: 0.25,
    ease: 'linear',
  },
)
```

<br />

Schism returns a class that allows the user to easily target the elements created.

## Instance Props

| Property          | Type          | Description                                                                  |
| ----------------- | ------------- | ---------------------------------------------------------------------------- |
| `target`          | `HTMLElement` | the target to be split                                                       |
| `original`        | `HTMLElement` | A copy of the target before manipulation                                     |
| `mutation`        | `string`      | The type of mutation ('lines', 'words', 'chars')                             |
| `overflow`        | `string`      | Whether the overflow of inner span is hidden or visible (default = 'hidden') |
| `wordArray`       | `Array`       | Array of Inner Spans for each word                                           |
| `wordParentArray` | `Array`       | Array of Outer Spans for each word                                           |
| `charArray`       | `Array`       | Array of Inner Spans for each char                                           |
| `charParentArray` | `Array`       | Array or outer spans for each char, containing each char for that word       |
| `lineArray`       | `Array`       | Array of Inner Spans for each line                                           |
| `lineParentArray` | `Array`       | Array or outer spans for each line, containing each word for that line       |
