/**
 * wellbeing_analysis
 * v0.2.1
 *
 * Analyse positive / negative wellbeing expression in English or Spanish strings
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
 *  "lang": "english",    // "english" or "spanish" / "espanol"
 *  "threshold": -0.38,   // value between -0.38 (default) & 0.86 for English, and -0.86 (default) & 3.35 for Spanish
 *  "bigrams": true,      // match against bigrams in lexicon (not recommended for large strings)
 *  "trigrams": true      // match against trigrams in lexicon (not recommended for large strings)
 * }
 * const text = "A big long string of text...";
 * const wellbeing = wba(text, opts);
 * console.log(wellbeing)
 *
 * @param {string} str  {input string}
 * @param {Object} opts {options}
 * @return {Object} {PERMA object}
 */

'use strict'
;(function () {
  const root = this
  const previous = root.wellbeingAnalysis

  let tokenizer = root.tokenizer
  let english = root.english
  let spanish = root.spanish
  let natural = root.natural

  if (typeof tokenizer === 'undefined') {
    const hasRequire = typeof require !== 'undefined'
    if (hasRequire) {
      tokenizer = require('happynodetokenizer')
      english = require('./data/english.json')
      spanish = require('./data/spanish.json')
      natural = require('natural')
    } else throw new Error('wellbeingAnalysis requires happynodetokenizer, natural and associated lexica files.')
  }

  /**
  * @function getBigrams
  * @param  {string} str input string
  * @return {Array} array of bigram strings
  */
  const getBigrams = str => {
    const NGrams = natural.NGrams
    const bigrams = NGrams.bigrams(str)
    const result = []
    const len = bigrams.length
    let i = 0
    for (i; i < len; i++) {
      result.push(bigrams[i].join(' '))
    }
    return result
  }

  /**
  * @function getTrigrams
  * @param  {string} str input string
  * @return {Array} array of trigram strings
  */
  const getTrigrams = str => {
    const NGrams = natural.NGrams
    const trigrams = NGrams.trigrams(str)
    const result = []
    const len = trigrams.length
    let i = 0
    for (i; i < len; i++) {
      result.push(trigrams[i].join(' '))
    }
    return result
  }

  /**
  * Get lexicon matches from array. Return object of matches and weights.
  * @function getMatches
  * @param  {Array} arr         token array
  * @param  {Object} lexicon    lexicon object
  * @param  {number} threshold  min. weight threshold
  * @return {Object}  object of matches
  */
  const getMatches = (arr, lexicon, threshold) => {
    const matches = {}
    // loop through the lexicon categories
    let category
    for (category in lexicon) {
      if (!lexicon.hasOwnProperty(category)) continue
      let match = []
      // loop through words in category
      let data = lexicon[category]
      let key
      for (key in data) {
        if (!data.hasOwnProperty(key)) continue
        let weight = data[key]
        // if word from input matches word from lexicon ...
        if (arr.indexOf(key) > -1 && weight > threshold) {
          match.push([key, weight])
        }
      }
      matches[category] = match
    }
    return matches
  }

  /**
  * Loop through object and add up lexical weights
  * @function calcLex
  * @param  {Object} obj      matches object
  * @param  {number} int      intercept value
  * @return {number}  lexical value
  */
  const calcLex = (obj, int) => {
    let lex = 0
    // add weights
    let key
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) continue
      lex += Number(obj[key][1])  // weight
    }
    // add intercept value
    lex += int
    // return final lexical value
    return lex
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
    const wellbeing = {}
    wellbeing.POS_P = calcLex(matches.POS_P, int.POS_P)
    wellbeing.POS_E = calcLex(matches.POS_E, int.POS_E)
    wellbeing.POS_R = calcLex(matches.POS_R, int.POS_R)
    wellbeing.POS_M = calcLex(matches.POS_M, int.POS_M)
    wellbeing.POS_A = calcLex(matches.POS_A, int.POS_A)
    wellbeing.NEG_P = calcLex(matches.NEG_P, int.NEG_P)
    wellbeing.NEG_E = calcLex(matches.NEG_E, int.NEG_E)
    wellbeing.NEG_R = calcLex(matches.NEG_R, int.NEG_R)
    wellbeing.NEG_M = calcLex(matches.NEG_M, int.NEG_M)
    wellbeing.NEG_A = calcLex(matches.NEG_A, int.NEG_A)
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
        'bigrams': true,      // match bigrams?
        'trigrams': true      // match trigrams?
      }
    }
    opts.lang = opts.lang || 'english'
    opts.threshold = opts.threshold || -999 // default to -999 in order to include everything
    // convert our string to tokens
    let tokens = tokenizer(str)
    // return null on no tokens
    if (tokens == null) return null
    // handle bigrams if wanted
    if (opts.bigrams) {
      const bigrams = getBigrams(str)
      tokens = tokens.concat(bigrams)
    }
    // handle trigrams if wanted
    if (opts.trigrams) {
      const trigrams = getTrigrams(str)
      tokens = tokens.concat(trigrams)
    }
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
