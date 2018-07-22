# wellbeing_analysis

Analyse message-level positive / negative [PERMA](https://en.wikipedia.org/wiki/Martin_Seligman#PERMA) expressions in English or Spanish strings, using the weighted PERMA lexica from the [WWBP](http://www.wwbp.org/lexica.html).

## Disclaimer

Wellbeing_Analysis is provided for educational and entertainment purposes only. It does not provide, and is not a substitute for, medical or psychological advice or diagnosis.

## Usage
```javascript
const wba = require('wellbeing_analysis');
const opts = {  // These are the default and recommended options
  'encoding': 'binary',
  'lang': 'english',
  'locale': 'US',
  'logs': 2,
  'max': Number.POSITIVE_INFINITY,
  'min': Number.NEGATIVE_INFINITY,
  'nGrams': [2, 3],
  'output': 'lex',
  'places': 9,
  'sortBy': 'freq',
  'wcGrams': 'false',
};
const str = 'A string of text....';
const wellbeing = wba(str, opts);
console.log(wellbeing);
```

## Default Output Example
wellbeing_analysis outputs an object containing the lexical usage values for each of the PERMA domains, both positive and negative.

Errors return null

```javascript
{
  POS_P: 1.30630732,
  POS_E: 0.59588245,
  POS_R: 0.26751814,
  POS_M: 1.96652440,
  POS_A: 0.69693405,
  NEG_P: 0.82662816,
  NEG_E: -0.0122609,
  NEG_R: 0.31149285,
  NEG_M: -1.2306480,
  NEG_A: 0.24929312,
}
```
"POS_" / "NEG_" = positive / negative.

## The Options Object

The options object is optional and provides a number of controls to allow you to tailor the output to your needs. However, for general use it is recommended that all options are left to their defaults.

### "encoding"

**string - valid options: "binary" (default), "frequency", or "percent"**

"binary" calculates the lexical value as simply a sum of weights, i.e. weight[1] + weight[2] + etc...

"frequency" calculates the lexical value as (word frequency / total wordcount) * word weight

"percent" calculates the percentage of matched tokens in the string for each category, returned as a decimal (i.e. 0.48 = 48%)

Unless you have a specific need for other encoding types, we recommend you use binary only.

### 'lang'

**String - valid options: 'english' (default), or 'spanish'**

The language of the lexicon to use.

### 'locale'

**String - valid options: 'US' (default), 'GB'**

The English lexicon data is in American English (US), if the string(s) you want to analyse are in British English set the locale option to 'GB'.

This is ignored if 'lang' is set to 'spanish'.

### 'logs'
**Number - valid options: 0, 1, 2 (default), 3**
Used to control console.log, console.warn, and console.error outputs.
* 0 = suppress all logs
* 1 = print errors only
* 2 = print errors and warnings
* 3 = print all console logs

### 'max' and 'min'

**Float**

Each item in the lexicon data has an associated weight (number). Use these options to exclude words that have weights beyond a given maximum or minimum threshold.

By default these are set to infinity, ensuring that no words from the lexicon are excluded.

For English, -0.37 (default) will include everything from the lexicon, 0.85 will include nothing.

For Spanish, -0.85 (default) will include everything from the lexicon, 3.32 will include nothing.

### 'nGrams'

**Array - valid options: [ number, number, ...]**

n-Grams are contiguous pieces of text, bi-grams being chunks of 2, tri-grams being chunks of 3, etc.

Use the nGrams option to include n-gram chunks. For example if you want to include both bi-grams and tri-grams, use like so:

```javascript
{
  nGrams: [2, 3]
}
```

If you only want to include tri-grams:

```javascript
{
  nGrams: [3]
}
```

To disable n-gram inclusion, use the following:

```javascript
{
  nGrams: [0]
}
```

If the number of words in the string is less than the ngram number provided, the option will simply be ignored.

For accuracy it is recommended that n-grams are included, however including n-grams for very long strings can affect performance.

### 'noInt'

**Boolean - valid options: true or false (default)**

The lexica contain intercept values, set noInt to true to ignore these values.

Unless you have a specific need to ignore the intercepts, it is recommended you leave this set to false.

### 'output'

**String - valid options: 'lex' (default), 'matches', 'full'**

'lex' (default) returns an object of lexical values. See 'Defauly Output Example above.

'matches' returns an object with data about matched words. See 'matches output example' below.

'full' returns both of the above in one object with two keys, 'values' and 'matches'.

### 'places'

**Number - valid options between 0 and 20 inclusive.**

Number of decimal places to limit outputted values to.

The default is 9 decimal places.

### 'sortBy'

**String - valid options: 'freq' (default), 'weight', or 'lex'**

If 'output' = 'matches', this option can be used to control how the outputted array is sorted.

'lex' sorts by final lexical value, (N.B. when using binary encoding [see 'encoding' above] the lexical value and the weight are identical.)

'weight' sorts the array by the matched words initial weight.

'freq' (default) sorts by word frequency, i.e. the most used words appear first.

### 'wcGrams'

**boolean - valid options: true or false (default)**

When set to true, the output from the nGrams option will be added to the word count.

For accuracy it is strongly recommended that this is set to false.

## {output: 'matches'} Output Example

```javascript
{
  POS_P:
    matches: [
      [ 'magnificent', 1, -192.0206116, -1.3914537072463768 ],
      [ 'capital', 1, -133.9311307, -0.9705154398550726 ],
      [ 'note', 3, -34.83417005, -0.7572645663043478 ],
      [ 'america', 2, -49.21227355, -0.7132213557971014 ],
      [ 'republic', 1, -75.5720402, -0.5476234797101449 ],
    ],
    info: {
      total_matches: 100,
      total_tokens: 200,
      percent_matches: 50,
    },
  POS_E:
    matches: [
      ....
    ],
    info: {
      ....
    }
  ...
};
```

The items in each array represent: [0] - the word, [1] - number of appearances in string (frequency), [2] - the word's weight, [3] - its final lexical value.

## English Lexicon Weight Ranges

|Aspect | Min | Max |
| ------------- |:-------------:|:---------:|
POS_P| -0.366392522|  0.7654900333|
POS_E| -0.3007389199| 0.3406524774|
POS_R| -0.288835072|  0.7837603493|
POS_M| -0.1674776443| 0.7716732077|
POS_A| -0.1978446382| 0.5503079623|
NEG_P| -0.3273133959| 0.7069694553|
NEG_E| -0.1522958765| 0.8401683729|
NEG_R| -0.2864831665| 0.6203329277|
NEG_M| -0.1498686845| 0.3167416933|
NEG_A| -0.1536902119| 0.2475999626|

## Acknowledgements

### References
[Schwartz, H.A., Sap, M., Kern, M.L., Eichstaedt, J.C., Kapelner, A., Agrawal, M., Blanco, E., Dziurzynski, L., Park, G., Stillwell, D. & Kosinski, M. (2016). Predicting individual well-being through the language of social media. In Biocomputing 2016: Proceedings of the Pacific Symposium (pp. 516-527).](http://wwbp.org/papers/2016_predicting_wellbeing.pdf)

### Lexicon
Using the PERMA lexicon data from the [WWBP](http://www.wwbp.org/lexica.html). Used under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/) license.

## License
(C) 2017-18 [P. Hughes](https://www.phugh.es). All rights reserved.

The PERMAv3 lexicon was created by Penn's World Well-being Project [WWBP](http://www.wwbp.org/) and is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/) License.

Shared under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/) license.