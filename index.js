/**
 * wellbeing_analysis
 * v0.1.3
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
 * @param {Object} opts {options}
 * @return {Object} {predicted gender}
 */

'use strict'
;(function () {
  const root = this
  const previous = root.wellbeingAnalysis

  const hasRequire = typeof require !== 'undefined'

  let tokenizer = root.tokenizer
  let english = root.english
  let spanish = root.spanish

  if (typeof _ === 'undefined') {
    if (hasRequire) {
      tokenizer = require('happynodetokenizer')
      english = require('./data/english.json')
      spanish = require('./data/spanish.json')
    } else throw new Error('wellbeingAnalysis required happynodetokenizer and lexica.')
  }

  // get number of times el appears in an array
  Array.prototype.indexesOf = function (el) {
    const idxs = []
    let i = this.length - 1
    for (i; i >= 0; i--) {
      if (this[i] === el) {
        idxs.unshift(i)
      }
    }
    return idxs
  }

  /**
  * @function getMatches
  * @param  {Array} arr         token array
  * @param  {Object} lexicon    lexicon object
  * @param  {number} threshold  min. weight threshold
  * @return {Object}  object of matches
  */
  const getMatches = (arr, lexicon, threshold) => {
    const matches = {}
    // loop through the lexicon categories
    let cat
    for (cat in lexicon) {
      if (!lexicon.hasOwnProperty(cat)) continue
      let match = []
      // loop through words in category
      let data = lexicon[cat]
      let key
      for (key in data) {
        if (!data.hasOwnProperty(key)) continue
        let weight = data[key]
        // if word from input matches word from lexicon ...
        if (arr.indexOf(key) > -1 && weight > threshold) {
          let item
          let reps = arr.indexesOf(key).length // numbder of times the word appears in the input text
          if (reps > 1) { // if the word appears more than once, group all appearances in one array
            let words = []
            let i
            for (i = 0; i < reps; i++) {
              words.push(key)
            }
            item = [words, weight]
          } else {
            item = [key, weight]
          }
          match.push(item)
        }
      }
      matches[cat] = match
    }
    // return matches object
    return matches
  }

  /**
  * @function calcLex
  * @param  {Object} obj      matches object
  * @param  {number} wc       word count
  * @param  {string} encoding word encoding: 'binary' or 'frequency'
  * @param  {number} int      intercept value
  * @return {number}  lexical value
  */
  const calcLex = (obj, wc, encoding, int) => {
    const counts = []   // number of matched objects
    const weights = []  // weights of matched objects
    // loop through the matches and get the word frequency (counts) and weights
    let key
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) continue
      if (Array.isArray(obj[key][0])) { // if the first item in the match is an array, the item is a duplicate
        counts.push(obj[key][0].length) // for duplicate matches
      } else {
        counts.push(1)                  // for non-duplicates
      }
      weights.push(obj[key][1])         // corresponding weight
    }
    // calculate lexical usage value
    let lex = 0
    let i
    const len = counts.length
    const words = Number(wc)
    for (i = 0; i < len; i++) {
      let weight = Number(weights[i])
      if (encoding === 'frequency') {
        let count = Number(counts[i])
        // (word frequency / total word count) * weight
        lex += (count / words) * weight
      } else {
        // weight + weight + weight etc
        lex += weight
      }
    }
    // add intercept value
    lex += Number(int)
    // return final lexical value + intercept
    return Number(lex)
  }

  /**
  * @function analyse
  * @param  {Array} arr   array of tokens
  * @param  {Object} opts options
  * @return {Object}  wellbeing object
  */
  const analyse = (arr, opts) => {
    // pick the right lexicon language
    let lexicon = english
    let es = (opts.lang.match(/(spanish|espanol)/gi))
    if (es) lexicon = spanish
    // get matches from array
    const matches = getMatches(arr, lexicon, opts.threshold)
    // get wordcount
    const wordcount = arr.length
    // get encoding
    const enc = opts.encoding
    // set intercept value
    let int = {
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
    if (es) {
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
    }
    // calculate lexical useage
    const wellbeing = {}
    wellbeing.POS_P = calcLex(matches.POS_P, wordcount, enc, int.POS_P)
    wellbeing.POS_E = calcLex(matches.POS_E, wordcount, enc, int.POS_E)
    wellbeing.POS_R = calcLex(matches.POS_R, wordcount, enc, int.POS_R)
    wellbeing.POS_M = calcLex(matches.POS_M, wordcount, enc, int.POS_M)
    wellbeing.POS_A = calcLex(matches.POS_A, wordcount, enc, int.POS_A)
    wellbeing.NEG_P = calcLex(matches.NEG_P, wordcount, enc, int.NEG_P)
    wellbeing.NEG_E = calcLex(matches.NEG_E, wordcount, enc, int.NEG_E)
    wellbeing.NEG_R = calcLex(matches.NEG_R, wordcount, enc, int.NEG_R)
    wellbeing.NEG_M = calcLex(matches.NEG_M, wordcount, enc, int.NEG_M)
    wellbeing.NEG_A = calcLex(matches.NEG_A, wordcount, enc, int.NEG_A)
    // return wellbeing object
    return wellbeing
  }

  const wellbeingAnalysis = (str, opts) => {
    // return null if no string
    if (str == null) return null
    // make sure str is a string
    if (typeof str !== 'string') str = str.toString()
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim()
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
    // convert our string to tokens
    const tokens = tokenizer(str)
    // return null on no tokens
    if (tokens == null) return null
    // predict and return
    return analyse(tokens, opts)
  }

  wellbeingAnalysis.noConflict = function () {
    root.wellbeingAnalysis = previous
    return wellbeingAnalysis
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = wellbeingAnalysis
    }
    exports.wellbeingAnalysis = wellbeingAnalysis
  } else {
    root.wellbeingAnalysis = wellbeingAnalysis
  }
}).call(this)
