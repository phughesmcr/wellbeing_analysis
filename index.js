/**
 * wellbeing_analysis
 * v0.4.0
 *
 * Analyse positive / negative wellbeing expression in English or Spanish strings
 *
 * DISCLAIMER
 * Wellbeing_Analysis is provided for educational and entertainment purposes only. It does not provide, and is not a substitute for, medical advice or diagnosis.
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
 * const wba = require("wellbeing_analysis");
 * const opts = {
 *  // options are case sensitive
 *  "lang": "english",    // "english" or "spanish" / "espanol"
 *  "encoding": "binary", // "binary" (default), or "frequency" - type of word encoding to use.
 *  "threshold": -0.38   // number between -0.38 (default) & 0.86 for English, and -0.86 (default) & 3.35 for Spanish
 * };
 * const str = "A big long string of text...";
 * const wellbeing = wba(str, opts);
 * console.log(wellbeing);
 *
 * @param {string} str  input string
 * @param {Object} opts options object
 * @return {Object} PERMA object
 */

'use strict'
;(function () {
  const root = this
  const previous = root.wellbeingAnalysis

  let tokenizer = root.tokenizer
  let english = root.english
  let spanish = root.spanish
  let simplengrams = root.simplengrams

  if (typeof tokenizer === 'undefined') {
    if (typeof require !== 'undefined') {
      tokenizer = require('happynodetokenizer')
      english = require('./data/english.json')
      spanish = require('./data/spanish.json')
      simplengrams = require('simplengrams')
    } else throw new Error('wellbeingAnalysis requires happynodetokenizer, simplengrams and associated lexica files.')
  }

  /**
   * Get the indexes of duplicate elements in an array
   * @function indexesOf
   * @param  {Array} arr input array
   * @param  {string} el element to test against
   * @return {Array} array of indexes
   */
  const indexesOf = (arr, el) => {
    const idxs = []
    let i = arr.length
    while (i--) {
      if (arr[i] === el) {
        idxs.unshift(i)
      }
    }
    return idxs
  }

  /**
   * Combines multidimensional array elements into strings
   * @function arr2string
   * @param  {Array} arr input array
   * @return {Array} output array
   */
  const arr2string = arr => {
    let i = 0
    const len = arr.length
    const result = []
    for (i; i < len; i++) {
      result.push(arr[i].join(' '))
    }
    return result
  }

  /**
  * Loop through lexicon and match against array
  * @function getMatches
  * @param {Array} arr token array
  * @param {Object} lexicon lexicon object
  * @param {number} threshold min. weight threshold
  * @return {Object} object of matches
  */
  const getMatches = (arr, lexicon, threshold) => {
    // error prevention
    if (arr == null) return null
    if (threshold == null) threshold = -999
    if (typeof threshold !== 'number') threshold = Number(threshold)
    // loop through categories in lexicon
    const matches = {}
    let category
    for (category in lexicon) {
      if (!lexicon.hasOwnProperty(category)) continue
      let match = []
      let word
      let data = lexicon[category]
      // loop through words in category
      for (word in data) {
        if (!data.hasOwnProperty(word)) continue
        let weight = data[word]
        // if word from input matches word from lexicon ...
        if (arr.indexOf(word) > -1 && weight > threshold) {
          let count = indexesOf(arr, word).length // number of times the word appears in the input text
          match.push([word, count, weight])
        }
      }
      matches[category] = match
    }
    return matches
  }

  /**
  * Calculate the total lexical value of matches
  * @function calcLex
  * @param {Object} obj matches object
  * @param {number} wc wordcount
  * @param {number} int intercept value
  * @param {string} enc encoding
  * @return {number} lexical value
  */
  const calcLex = (obj, wc, int, enc) => {
    // error prevention
    if (obj == null) return null
    if (wc != null && typeof wc !== 'number') wc = Number(wc)
    if (int != null && typeof int !== 'number') int = Number(int)
    // calculate lexical values
    let lex = 0
    let word
    for (word in obj) {
      if (!obj.hasOwnProperty(word)) continue
      if (enc === 'frequency' && wc != null) {
        // (frequency / wordcount) * weight
        lex += (Number(obj[word][1]) / wc) * Number(obj[word][2])
      } else {
        // weight + weight + weight etc
        lex += Number(obj[word][2])
      }
    }
    if (int != null) lex += int
    return lex
  }

  /**
  * @function analyse
  * @param {Array} arr array of tokens
  * @param {Object} opts options
  * @param {number} wc wordcound
  * @return {Object} wellbeing object
  */
  const analyse = (arr, opts, wc) => {
    // pick the right lexicon language
    const es = (opts.lang.match(/(spanish|espanol)/gi))
    let lexicon = english
    if (es) lexicon = spanish
    // get matches from array
    const matches = getMatches(arr, lexicon, opts.threshold)
    // set intercept value
    let int
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
    const enc = opts.encoding
    const wellbeing = {}
    wellbeing.POS_P = calcLex(matches.POS_P, wc, int.POS_P, enc)
    wellbeing.POS_E = calcLex(matches.POS_E, wc, int.POS_E, enc)
    wellbeing.POS_R = calcLex(matches.POS_R, wc, int.POS_R, enc)
    wellbeing.POS_M = calcLex(matches.POS_M, wc, int.POS_M, enc)
    wellbeing.POS_A = calcLex(matches.POS_A, wc, int.POS_A, enc)
    wellbeing.NEG_P = calcLex(matches.NEG_P, wc, int.NEG_P, enc)
    wellbeing.NEG_E = calcLex(matches.NEG_E, wc, int.NEG_E, enc)
    wellbeing.NEG_R = calcLex(matches.NEG_R, wc, int.NEG_R, enc)
    wellbeing.NEG_M = calcLex(matches.NEG_M, wc, int.NEG_M, enc)
    wellbeing.NEG_A = calcLex(matches.NEG_A, wc, int.NEG_A, enc)
    // return wellbeing object
    return wellbeing
  }

  /**
  * @function wellbeingAnalysis
  * @param {string} str  input string
  * @param {Object} opts options object
  * @return {Object} PERMA object
  */
  const wellbeingAnalysis = (str, opts) => {
    // return null if no string
    if (str == null) return null
    // make sure str is a string
    if (typeof str !== 'string') str = str.toString()
    // convert to lowercase and trim whitespace
    str = str.toLowerCase().trim()
    // option defaults
    if (opts == null) {
      opts = {
        'lang': 'english',    // lexicon to analyse against
        'encoding': 'binary', // word encoding
        'threshold': -0.38   // minimum weight threshold
      }
    }
    opts.encoding = opts.encoding || 'binary'
    opts.lang = opts.lang || 'english'
    if (opts.lang === 'spanish' || opts.lang === 'espanol') {
      opts.threshold = opts.threshold || -0.86 // default to -0.86 in order to include everything in the Spanish lexicon
    } else {
      opts.threshold = opts.threshold || -0.38 // default to -0.38 in order to include everything in the English lexicon
    }
    // convert our string to tokens
    let tokens = tokenizer(str)
    // return null on no tokens
    if (tokens == null) return null
    // get wordcount before we add n-grams
    const wordcount = tokens.length
    // get n-grams
    const ngrams = []
    ngrams.push(arr2string(simplengrams(str, 2)))
    ngrams.push(arr2string(simplengrams(str, 3)))
    const nLen = ngrams.length
    let i = 0
    for (i; i < nLen; i++) {
      tokens = tokens.concat(ngrams[i])
    }
    // predict and return
    return analyse(tokens, opts, wordcount)
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
