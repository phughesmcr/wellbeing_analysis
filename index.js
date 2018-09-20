/**
 * wellbeing_analysis
 * v4.0.0
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
 * (C) 2017-18 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const wba = require("wellbeing_analysis");
 * // These are the default options
 * const opts = {
 *  'encoding': 'binary',
 *  'lang': 'english',
 *  'locale': 'US',
 *  'logs': 3,
 *  'max': Number.POSITIVE_INFINITY,
 *  'min': Number.NEGATIVE_INFINITY,
 *  'nGrams': [2, 3],
 *  'noInt': false,
 *  'output': 'lex',
 *  'places': undefined,
 *  'sortBy': 'freq',
 *  'wcGrams': false,
 * };
 * const str = 'A big long string of text...';
 * const wellbeing = wba(str, opts);
 * console.log(wellbeing);
 *
 * See README.md for help.
 *
 * @param {string} str    input string
 * @param {Object} [opts] options object
 * @return {Object}       PERMA object
 */

(function() {
  'use strict';

  // Lexicon data
  const english = require('./data/english.json');
  const spanish = require('./data/spanish.json');

  // External modules
  const async = require('async');
  const trans = require('british_american_translate');
  const simplengrams = require('simplengrams');
  const tokenizer = require('happynodetokenizer');
  const lexHelpers = require('lex-helpers');
  const arr2string = lexHelpers.arr2string;
  const doLex = lexHelpers.doLex;
  const doMatches = lexHelpers.doMatches;
  const getMatches = lexHelpers.getMatches;
  const itemCount = lexHelpers.itemCount;

  /**
  * @function wellbeingAnalysis
  * @param {string} str     input string
  * @param {Object} [opts]  options object
  * @return {Object}        PERMA object
  */
  const wellbeingAnalysis = (str, opts = {}) => {
    // default options
    opts.encoding = (typeof opts.encoding === 'undefined') ? 'binary' : opts.encoding;
    opts.lang = (typeof opts.lang === 'undefined') ? 'english' : opts.lang;
    opts.locale = (typeof opts.locale === 'undefined') ? 'US' : opts.locale;
    opts.logs = (typeof opts.logs === 'undefined') ? 3 : opts.logs;
    if (opts.suppressLog) opts.logs = 0;
    opts.max = (typeof opts.max === 'undefined') ? Number.POSITIVE_INFINITY : opts.max;
    opts.min = (typeof opts.min === 'undefined') ? Number.NEGATIVE_INFINITY : opts.min;
    if (typeof opts.max !== 'number' || typeof opts.min !== 'number') {
      // try to convert to a number
      opts.min = Number(opts.min);
      opts.max = Number(opts.max);
      // check it worked, or else default to infinity
      opts.max = (typeof opts.max === 'number') ? opts.max : Number.POSITIVE_INFINITY;
      opts.min = (typeof opts.min === 'number') ? opts.min : Number.NEGATIVE_INFINITY;
    }
    opts.nGrams = (typeof opts.nGrams !== 'undefined') ? opts.nGrams : [2, 3];
    if (!Array.isArray(opts.nGrams)) {
      if (opts.nGrams == 0) {
        opts.nGrams = [0];
      } else {
        if (opts.logs > 1) {
          console.warn('wellbeingAnalysis: nGrams option must be an array! Defaulting to [2, 3].');
        }
        opts.nGrams = [2, 3];
      }
    }
    opts.noInt = (typeof opts.noInt === 'undefined') ? false : opts.noInt;
    opts.output = (typeof opts.output === 'undefined') ? 'lex' : opts.output;
    opts.sortBy = (typeof opts.sortBy === 'undefined') ? 'freq' : opts.sortBy;
    opts.wcGrams = (typeof opts.wcGrams === 'undefined') ? false : opts.wcGrams;
    // cache frequently used options
    const encoding = opts.encoding;
    const logs = opts.logs;
    const nGrams = opts.nGrams;
    const output = opts.output;
    const places = opts.places;
    const sortBy = opts.sortBy;
    // no string return null
    if (!str) {
      if (opts.logs > 1) console.warn('wellbeingAnalysis: no string found. Returning null.');
      return null;
    }
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString();
    // trim whitespace and convert to lowercase
    str = str.trim().toLowerCase();
    // translalte US English to UK English if selected
    if (opts.lang.match(/english/gi) && opts.locale.match(/gb/gi)) str = trans.uk2us(str);
    // convert our string to tokens
    let tokens = tokenizer(str, {logs: opts.logs});
    // if there are no tokens return null
    if (!tokens) {
      if (logs > 1) console.warn('wellbeingAnalysis: no tokens found. Returned null.');
      return null;
    }
    // get wordcount before we add ngrams
    let wordcount = tokens.length;
    // get n-grams
    if (nGrams && !nGrams.includes(0)) {
      async.each(nGrams, function(n, callback) {
        if (wordcount < n) {
          callback(`wordcount (${wordcount}) less than n-gram value (${n}). Ignoring.`);
        } else {
          tokens = [
            ...arr2string(simplengrams(str, n, {logs: logs})),
            ...tokens,
          ];
          callback();
        }
      }, function(err) {
        if (err && logs > 1) console.warn('wellbeingAnalysis: ', err);
      });
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams === true) wordcount = tokens.length;
    // set intercept value
    let lexicon = english;
    let ints = {
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
    if (output.match(/spanish/gi) || output.match(/espanol/gi)) {
      lexicon = spanish;
      if (opts.noInt == false) {
        ints = {
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
    }
    // get matches from array
    const matches = getMatches(itemCount(tokens), lexicon, opts.min, opts.max);
    // returns
    if (output.match(/matches/gi)) {
      // return requested output
      return doMatches(matches, encoding, wordcount, sortBy, places);
    } else if (output.match(/full/gi)) {
      // return matches and values in one object
      let results;
      async.parallel({
        matches: function(callback) {
          callback(null, doMatches(matches, encoding, wordcount, sortBy, places));
        },
        values: function(callback) {
          callback(null, doLex(matches, ints, encoding, wordcount, places));
        },
      }, function(err, res) {
        if (err && logs > 0) console.error(err);
        results = res;
      });
      return results;
    } else {
      if (!output.match(/lex/gi) && logs > 1) {
        console.warn('wellbeingAnalysis: output option ("' + output + '") is invalid, defaulting to "lex".');
      }
      // return just the values
      return doLex(matches, ints, encoding, wordcount, places);
    }
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = wellbeingAnalysis;
    }
    exports.wellbeingAnalysis = wellbeingAnalysis;
  } else {
    global.wellbeingAnalysis = wellbeingAnalysis;
  }
})();
