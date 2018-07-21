/**
 * wellbeing_analysis
 * v3.0.1
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
 *  'locale': 'US',
 *  'logs': 3,
 *  'max': Number.POSITIVE_INFINITY,
 *  'min': Number.NEGATIVE_INFINITY,
 *  'nGrams': [2, 3],
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
  * @param {string} str   input string
  * @param {Object} opts  options object
  * @return {Object}      PERMA object
  */
  const wellbeingAnalysis = (str, opts = {}) => {
    // default options
    opts.encoding = (typeof opts.encoding !== 'undefined') ? opts.encoding : 'binary';
    opts.lang = (typeof opts.lang !== 'undefined') ? opts.lang : 'english';
    opts.locale = (typeof opts.locale !== 'undefined') ? opts.locale : 'US';
    opts.logs = (typeof opts.logs !== 'undefined') ? opts.logs : 3;
    if (opts.suppressLog) opts.logs = 0;
    opts.max = (typeof opts.max !== 'undefined') ? opts.max : Number.POSITIVE_INFINITY;
    opts.min = (typeof opts.min !== 'undefined') ? opts.min : Number.NEGATIVE_INFINITY;
    if (typeof opts.max !== 'number' || typeof opts.min !== 'number') {
      // try to convert to a number
      opts.min = Number(opts.min);
      opts.max = Number(opts.max);
      // check it worked, or else default to infinity
      opts.max = (typeof opts.max !== 'number') ? opts.max : Number.POSITIVE_INFINITY;
      opts.min = (typeof opts.min !== 'number') ? opts.min : Number.NEGATIVE_INFINITY;
    }
    opts.nGrams = (typeof opts.nGrams !== 'undefined') ? opts.nGrams : [2, 3];
    if (!Array.isArray(opts.nGrams)) {
      if (opts.logs > 1) {
        console.warn('wellbeingAnalysis: nGrams option must be an array! ' + 
            'Defaulting to [2, 3].');
      }
      opts.nGrams = [2, 3];
    }
    opts.output = (typeof opts.output !== 'undefined') ? opts.output : 'lex';
    opts.places = (typeof opts.places !== 'undefined') ? opts.places : 9;
    opts.sortBy = (typeof opts.sortBy !== 'undefined') ? opts.sortBy : 'freq';
    opts.wcGrams = (typeof opts.wcGrams !== 'undefined') ? opts.wcGrams : false;
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
    if (opts.locale === 'GB') str = trans.uk2us(str);
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
    if (nGrams) {
      async.each(nGrams, function(n, callback) {
        if (wordcount < n) {
          callback(`wellbeingAnalysis: wordcount (${wordcount}) less than n-gram value (${n}). Ignoring.`);
        } else {
          tokens = [...arr2string(simplengrams(str, n, {logs: logs})), ...tokens];
          callback();
        }
      }, function(err) {
        if (err && logs > 0) console.error('wellbeingAnalysis: nGram error: ', err);        
      });
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams) wordcount = tokens.length;
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
    // get matches from array
    const matches = getMatches(itemCount(tokens), lexicon, opts.min, opts.max);
    // returns
    if (output.match(/matches/gi)) {
      // return requested output
      return doMatches(matches, sortBy, wordcount, places, encoding);
    } else if (output.match(/full/gi)) {
      // return matches and values in one object
      async.parallel({
        matches: function(callback) {
          callback(null, doMatches(matches, sortBy, wordcount, places, encoding));
        },
        values: function(callback) {
          callback(null, doLex(matches, ints, places, encoding, wordcount));
        },
      }, function(err, results) {
        if (err && logs > 0) console.error(err);
        return results;
      });
    } else {
      if (!output.match(/lex/gi) && logs > 1) {
        console.warn('wellbeingAnalysis: output option ("' + output +
            '") is invalid, defaulting to "lex".');
      }
      // return just the values
      return doLex(matches, ints, places, encoding, wordcount);
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
