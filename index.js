/**
 * wellbeing_analysis
 * v2.0.0
 *
 * Analyse positive / negative PERMA wellbeing expression
 * in English or Spanish strings.
 *
 * DISCLAIMER:
 * wellbeing_analysis is provided for educational and entertainment purposes
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
 *  'nGrams': 'true',
 *  'output': 'lex',
 *  'places': 9,
 *  'sortBy': 'freq',
 *  'wcGrams': 'false',
 * };
 * const str = 'A big long string of text...';
 * const wellbeing = wba(str, opts);
 * console.log(wellbeing);
 *
 * See README.md for help.
 *
 * @param {string} str  input string
 * @param {Object} opts options object
 * @return {Object}     PERMA object
 */

(function() {
  'use strict';
  const global = this;
  const previous = global.wellbeingAnalysis;

  let async = global.async;
  let english = global.english;
  let lexHelpers = global.lexHelpers;
  let simplengrams = global.simplengrams;
  let spanish = global.spanish;
  let tokenizer = global.tokenizer;

  if (typeof tokenizer === 'undefined') {
    if (typeof require !== 'undefined') {
      async = require('async');
      english = require('./data/english.json');
      lexHelpers = require('lex-helpers');
      simplengrams = require('simplengrams');
      spanish = require('./data/spanish.json');
      tokenizer = require('happynodetokenizer');
    } else throw new Error('wellbeing_analysis required modules not found!');
  }

  const arr2string = lexHelpers.arr2string;
  const calcLex = lexHelpers.calcLex;
  const getMatches = lexHelpers.getMatches;
  const prepareMatches = lexHelpers.prepareMatches;
  const itemCount = lexHelpers.itemCount;

  const doMatches = (matches, sortBy, wordcount, places, encoding) => {
    const match = {};
    async.each(Object.keys(matches), function(cat, callback) {
      match[cat] = prepareMatches(matches[cat], sortBy, wordcount, places,
          encoding);
      callback();
    }, function(err) {
      if (err) console.error(err);
    });
    return match;
  };

  const doLex = (matches, int, places, encoding, wordcount) => {
    const values = {};
    async.each(Object.keys(matches), function(cat, callback) {
      values[cat] = calcLex(matches[cat], int[cat], places, encoding,
          wordcount);
      callback();
    }, function(err) {
      if (err) console.error(err);
    });
    return values;
  };

  /**
  * @function wellbeingAnalysis
  * @param {string} str   input string
  * @param {Object} opts  options object
  * @return {Object}      PERMA object
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
    str = str.trim().toLowerCase();
    // options defaults
    if (!opts || typeof opts !== 'object') {
      opts = {
        'encoding': 'binary',
        'lang': 'english',
        'max': Number.POSITIVE_INFINITY,
        'min': Number.NEGATIVE_INFINITY,
        'nGrams': 'true',
        'output': 'lex',
        'places': 9,
        'sortBy': 'freq',
        'wcGrams': 'false',
      };
    }
    opts.encoding = opts.encoding || 'binary';
    opts.lang = opts.lang || 'english';
    opts.max = opts.max || Number.POSITIVE_INFINITY;
    opts.min = opts.min || Number.NEGATIVE_INFINITY;
    opts.nGrams = opts.nGrams || 'true';
    opts.output = opts.output || 'lex';
    opts.places = opts.places || 9;
    opts.sortBy = opts.sortBy || 'freq';
    opts.wcGrams = opts.wcGrams || 'false';
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
    if (opts.nGrams === 'true' && wordcount > 2) {
      async.parallel([
        function(callback) {
          callback(null, arr2string(simplengrams(str, 2)));
        },
        function(callback) {
          callback(null, arr2string(simplengrams(str, 3)));
        },
      ],
      function(err, res) {
        if (err) console.error(err);
        tokens = tokens.concat(res[0], res[1]);
      });
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams === 'true') wordcount = tokens.length;
    // reduce tokens to count item
    tokens = itemCount(tokens);
    // set intercept value
    let lexicon = english;
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
      NEG_A: 0,
    };
    // use spanish lexicon if selected
    if (opts.lang === 'spanish' || opts.lang === 'espanol') {
      lexicon = spanish;
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
    }
    // get matches from array
    const matches = getMatches(tokens, lexicon, opts.min, opts.max);
    if (output === 'matches') {
      // return requested output
      return doMatches(matches, sortBy, wordcount, places, encoding);
    } else if (output === 'full') {
      // return matches and values
      return {
        values: doLex(matches, int, places, encoding, wordcount),
        matches: doMatches(matches, sortBy, wordcount, places, encoding),
      };
    } else {
      if (output !== 'lex') {
        console.warn('wellbeing_analysis: output option ("' + output +
            '") is invalid, defaulting to "lex".');
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
