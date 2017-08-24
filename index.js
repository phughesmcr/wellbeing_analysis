/**
 * wellbeing_analysis
 * v1.0.0-rc.1
 *
 * Analyse positive / negative PERMA wellbeing expression
 * in English or Spanish strings.
 *
 * DISCLAIMER
 * Wellbeing_Analysis is provided for educational and entertainment purposes
 * only. It does not provide, and is not a substitute for, medical advice
 * or diagnosis.
 *
 * Help me make this better:
 * https://github.com/phugh/wellbeing_analysis
 *
 * Based on this paper:
 * Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L.,
 * Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell, D.,
 * Seligman, M. E., & Ungar, L. H. (2013).
 * Personality, gender, and age in the language of social media:
 * The Open-Vocabulary Approach. PLOS ONE, 8(9), . . e73791.
 *
 * Using the permaV3_dd and dd_spermaV3 lexicon data from
 * http://www.wwbp.org/lexica.html. Used under the Creative Commons
 * Attribution-NonCommercial-ShareAlike 3.0 Unported licence
 *
 * (C) 2017 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const wba = require("wellbeing_analysis");
 * const opts = {  // These are the default options
 *  'encoding': 'binary',
 *  'lang': 'english',
 *  'max': Number.POSITIVE_INFINITY,
 *  'min': Number.NEGATIVE_INFINITY,
 *  'nGrams': true,
 *  'output': 'perma',
 *  'places': 16,
 *  'sortBy': 'freq',
 *  'wcGrams': false,
 * };
 * const str = 'A big long string of text...';
 * const wellbeing = wba(str, opts);
 * console.log(wellbeing);
 *
 * See README.md for help.
 *
 * @param {string} str  input string
 * @param {Object} opts options object
 * @return {Object} PERMA object
 */

'use strict'
;(function() {
  const global = this;
  const previous = global.wellbeingAnalysis;

  let tokenizer = global.tokenizer;
  let english = global.english;
  let spanish = global.spanish;
  let simplengrams = global.simplengrams;
  let lexHelpers = global.lexHelpers;

  if (typeof tokenizer === 'undefined') {
    if (typeof require !== 'undefined') {
      english = require('./data/english.json');
      spanish = require('./data/spanish.json');
      tokenizer = require('happynodetokenizer');
      simplengrams = require('simplengrams');
      lexHelpers = require('lex-helpers');
    } else throw new Error('wellbeing_analysis required modules not found!');
  }

  const arr2string = lexHelpers.arr2string;
  const prepareMatches = lexHelpers.prepareMatches;
  const getMatches = lexHelpers.getMatches;
  const calcLex = lexHelpers.calcLex;

  const doMatches = (matches, sortBy, wordcount, places, encoding) => {
    let match = {};
    match.POS_P = prepareMatches(matches.POS_P, sortBy, wordcount, places,
        encoding);
    match.POS_E = prepareMatches(matches.POS_E, sortBy, wordcount, places,
        encoding);
    match.POS_R = prepareMatches(matches.POS_R, sortBy, wordcount, places,
        encoding);
    match.POS_M = prepareMatches(matches.POS_M, sortBy, wordcount, places,
        encoding);
    match.POS_A = prepareMatches(matches.POS_A, sortBy, wordcount, places,
        encoding);
    match.NEG_P = prepareMatches(matches.NEG_P, sortBy, wordcount, places,
        encoding);
    match.NEG_E = prepareMatches(matches.NEG_E, sortBy, wordcount, places,
        encoding);
    match.NEG_R = prepareMatches(matches.NEG_R, sortBy, wordcount, places,
        encoding);
    match.NEG_M = prepareMatches(matches.NEG_M, sortBy, wordcount, places,
        encoding);
    match.NEG_A = prepareMatches(matches.NEG_A, sortBy, wordcount, places,
        encoding);
    return match;
  };

  const doLex = (matches, int, places, encoding, wordcount) => {
    const values = {};
    values.POS_P = calcLex(matches.POS_P, int.POS_P, places, encoding,
        wordcount);
    values.POS_E = calcLex(matches.POS_E, int.POS_E, places, encoding,
        wordcount);
    values.POS_R = calcLex(matches.POS_R, int.POS_R, places, encoding,
        wordcount);
    values.POS_M = calcLex(matches.POS_M, int.POS_M, places, encoding,
        wordcount);
    values.POS_A = calcLex(matches.POS_A, int.POS_A, places, encoding,
        wordcount);
    values.NEG_P = calcLex(matches.NEG_P, int.NEG_P, places, encoding,
        wordcount);
    values.NEG_E = calcLex(matches.NEG_E, int.NEG_E, places, encoding,
        wordcount);
    values.NEG_R = calcLex(matches.NEG_R, int.NEG_R, places, encoding,
        wordcount);
    values.NEG_M = calcLex(matches.NEG_M, int.NEG_M, places, encoding,
        wordcount);
    values.NEG_A = calcLex(matches.NEG_A, int.NEG_A, places, encoding,
        wordcount);
    return values;
  };

  /**
  * @function wellbeingAnalysis
  * @param {string} str  input string
  * @param {Object} opts options object
  * @return {Object} PERMA object
  */
  const wellbeingAnalysis = (str, opts) => {
    // no string return null
    if (!str) {
      console.error('wellbeing_analysis: no string found. Returning null.');
      return null;
    }
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString();
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim();
    // options defaults
    if (!opts || typeof opts !== 'object') {
      opts = {
        'encoding': 'binary',
        'lang': 'english',
        'max': Number.POSITIVE_INFINITY,
        'min': Number.NEGATIVE_INFINITY,
        'nGrams': true,
        'output': 'perma',
        'places': 16,
        'sortBy': 'freq',
        'wcGrams': false,
      };
    }
    opts.encoding = opts.encoding || 'binary';
    opts.lang = opts.lang || 'english';
    opts.max = opts.max || Number.POSITIVE_INFINITY;
    opts.min = opts.min || Number.NEGATIVE_INFINITY;
    opts.nGrams = opts.nGrams || true;
    opts.output = opts.output || 'perma';
    opts.places = opts.places || 16;
    opts.sortBy = opts.sortBy || 'freq';
    opts.wcGrams = opts.wcGrams || false;
    const encoding = opts.encoding;
    const output = opts.output;
    const places = opts.places;
    const sortBy = opts.sortBy;
    // convert our string to tokens
    let tokens = tokenizer(str);
    // if there are no tokens return null
    if (!tokens) {
      console.warn('wellbeing_analysis: no tokens found. Returned null.');
      return null;
    }
    // get wordcount before we add ngrams
    let wordcount = tokens.length;
    // get n-grams
    if (opts.nGrams) {
      const bigrams = arr2string(simplengrams(str, 2));
      const trigrams = arr2string(simplengrams(str, 3));
      tokens = tokens.concat(bigrams, trigrams);
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams) wordcount = tokens.length;
    // pick the right lexicon language
    const es = (opts.lang.match(/(spanish|espanol)/gi));
    let lexicon = english;
    if (es) lexicon = spanish;
    // set intercept value
    let int;
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
        NEG_A: 2.482131179,
      };
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
        NEG_A: 0,
      };
    }
    // get matches from array
    const matches = getMatches(tokens, lexicon, opts.min, opts.max);
    if (output === 'matches') {
      // return requested output
      return doMatches(matches, sortBy, wordcount, places, encoding);
    } else if (output === 'full') {
      // return matches and values
      const wellbeing = {};
      wellbeing.values = doLex(matches, int, places, encoding, wordcount);
      wellbeing.matches = doMatches(matches, sortBy, wordcount, places,
          encoding);
      return wellbeing;
    } else {
      if (output !== 'perma') {
        console.warn('wellbeing_analysis: output option ("' + output +
            '") is invalid, defaulting to "perma".');
      }
      // return just the values
      return doLex(matches, int, places, encoding, wordcount);
    }
  };

  wellbeingAnalysis.noConflict = function() {
    global.wellbeingAnalysis = previous;
    return wellbeingAnalysis;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = wellbeingAnalysis;
    }
    exports.wellbeingAnalysis = wellbeingAnalysis;
  } else {
    global.wellbeingAnalysis = wellbeingAnalysis;
  }
}).call(this);
