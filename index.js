/* jshint node: true, esversion:6 */
/**
 * wellbeing_analysis
 * v0.0.1
 *
 * Analyse positive / negative wellbeing expressions in English or Spanish Strings
 *
 * Help me make this better:
 * https://github.com/phugh/wellbeing_analysis
 *
 * Based on this paper:
 * Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L., Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell, D., Seligman, M. E., & Ungar, L. H. (2013). Personality, gender, and age in the language of social media: The Open-Vocabulary Approach. PLOS ONE, 8(9), . . e73791.
 *
 * Using the permaV3_dd and dd_spermaV3 lexicon data from http://www.wwbp.org/lexica.html
 * Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence
 *
 * (C) 2017 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const wba = require('wellbeing_analysis);
 * const opts = {
 *  "lang": "english",
 *  "threshold": -0.05,
 *  "encoding": "binary"
 * }
 * const text = "A big long string of text...";
 * let wellbeing = wba(text, opts);
 * console.log(wellbeing)
 *
 * @param {string} str  {input string}
 * @param {object} opts {options}
 * @return {object} {predicted gender}
 */

'use strict'
;(function () {
  const root = this
  const previous = root.wellbeing_analysis

  const hasRequire = typeof require !== 'undefined'

  let tokenizer = root.tokenizer
  let english = root.english
  let spanish = root.spanish

  if (typeof _ === 'undefined') {
    if (hasRequire) {
      tokenizer = require('happynodetokenizer')
      english = require('./data/english.json')
      spanish = require('./data/spanish.json')
    } else throw new Error('wellbeing_analysis required happynodetokenizer and lexica.')
  }

  // get multiple indexes helper
  Array.prototype.indexesOf = function (el) {
    var idxs = []
    for (var i = this.length - 1; i >= 0; i--) {
      if (this[i] === el) {
        idxs.unshift(i)
      }
    }
    return idxs
  }

  const getMatches = (arr, lexicon, threshold) => {
    let matches = {}
    for (let cat in lexicon) {
      if (!lexicon.hasOwnProperty(cat)) continue
      let match = []
      for (let key in lexicon[cat]) {
        if (!lexicon[cat].hasOwnProperty(key)) continue
        let word = key
        let weight = lexicon[cat][key]
        if (arr.indexOf(word) > -1 && weight > threshold) {
          let item
          let reps = arr.indexesOf(word).length
          if (reps > 1) {
            let words = []
            for (let i = 0; i < reps; i++) {
              words.push(word)
            }
            item = [words, weight]
          } else {
            item = [word, weight]
          }
          match.push(item)
        }
      }
      matches[cat] = match
    }
    return matches
  }

  const calcLex = (obj, wc, encoding, int) => {
    let counts = []
    let weights = []
    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) continue
      if (Array.isArray(obj[key][0])) {
        counts.push(obj[key][0].length)
      } else {
        counts.push(1)
      }
      weights.push(obj[key][1])
    }
    let sums = []
    counts.forEach(function (a, b) {
      let sum
      if (encoding === 'frequency') {
        sum = (a / wc) * weights[b]
      } else {
        sum = weights[b]
      }
      sums.push(sum)
    })
    let lex
    lex = sums.reduce(function (a, b) { return a + b }, 0)
    lex = Number(lex) + Number(int)
    return lex
  }

  const analyse = (arr, opts) => {
    let lexicon
    if (opts.lang === 'spanish') {
      lexicon = spanish
    } else {
      lexicon = english
    }
    // get matches from array
    const matches = getMatches(arr, lexicon, opts.threshold)

    // get wordcount
    const wordcount = arr.length

    // set intercept value
    let int
    if (opts.lang === 'spanish') {
      int = {
        POS_P: 2.675173871,
        POS_E: 2.055179283,
        POS_R: 1.977389757,
        POS_M: 1.738298902,
        POS_A: 3.414517804,
        NEG_P: 2.50468297,
        NEG_E: 1.673629622,
        NEG_R: 1.782788984,
        NEG_M: 1.52890284,
        NEG_A: 2.482131179
      }
    } else {
      int = {
        POS_P: 0,
        POS_E: 0,
        POS_R: 0,
        POS_M: 0,
        POS_A: 0,
        NEG_P: 0,
        NEG_E: 0,
        NEG_R: 0,
        NEG_M: 0,
        NEG_A: 0
      }
    }

    // calculate lexical useage
    let wellbeing = {}
    wellbeing['POS_P'] = calcLex(matches['POS_P'], wordcount, opts.encoding, int['POS_P'])
    wellbeing['POS_E'] = calcLex(matches['POS_E'], wordcount, opts.encoding, int['POS_E'])
    wellbeing['POS_R'] = calcLex(matches['POS_R'], wordcount, opts.encoding, int['POS_R'])
    wellbeing['POS_M'] = calcLex(matches['POS_M'], wordcount, opts.encoding, int['POS_M'])
    wellbeing['POS_A'] = calcLex(matches['POS_A'], wordcount, opts.encoding, int['POS_A'])
    wellbeing['NEG_P'] = calcLex(matches['NEG_P'], wordcount, opts.encoding, int['NEG_P'])
    wellbeing['NEG_E'] = calcLex(matches['NEG_E'], wordcount, opts.encoding, int['NEG_E'])
    wellbeing['NEG_R'] = calcLex(matches['NEG_R'], wordcount, opts.encoding, int['NEG_R'])
    wellbeing['NEG_M'] = calcLex(matches['NEG_M'], wordcount, opts.encoding, int['NEG_M'])
    wellbeing['NEG_A'] = calcLex(matches['NEG_A'], wordcount, opts.encoding, int['NEG_A'])

    return wellbeing
  }

  const wellbeing_analysis = (str, opts) => {
    // option defaults
    if (opts == null) {
      opts = {
        'lang': 'english',    // lexicon to analyse against
        'threshold': -999,    // minimum weight threshold
        'encoding': 'binary'  // binary or frequency encoding
      }
    }
    opts.lang = opts.lang || 'english'
    opts.threshold = opts.threshold || -999
    opts.encoding = opts.encoding || 'binary'

    // make sure there is input before proceeding
    if (str == null) throw new Error('Whoops! No input string found!')

    // convert our string to tokens
    const tokens = tokenizer(str)

    // predict and return
    return analyse(tokens, opts)
  }

  wellbeing_analysis.noConflict = function () {
    root.wellbeing_analysis = previous
    return wellbeing_analysis
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = wellbeing_analysis
    }
    exports.wellbeing_analysis = wellbeing_analysis
  } else {
    root.wellbeing_analysis = wellbeing_analysis
  }
}).call(this)
