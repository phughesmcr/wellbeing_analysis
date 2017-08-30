# wellbeing_analysis

Analyse positive / negative [PERMA](https://en.wikipedia.org/wiki/Martin_Seligman#PERMA) expressions in English or Spanish strings, using PERMA lexicon from the [WWBP](http://www.wwbp.org/lexica.html).

## Disclaimer

Wellbeing_Analysis is provided for educational and entertainment purposes only. It does not provide, and is not a substitute for, medical advice or diagnosis.

## Usage
```javascript
const wba = require('wellbeing_analysis');
const opts = {  // These are the default options
  'encoding': 'binary',
  'lang': 'english',
  'max': Number.POSITIVE_INFINITY,
  'min': Number.NEGATIVE_INFINITY,
  'nGrams': 'true',
  'output': 'lex',
  'places': 9,
  'sortBy': 'freq',
  'wcGrams': 'true',
};
const str = 'A string of text....';
const wellbeing = wba(str, opts);
console.log(wellbeing);
```

Errors return null

## Default Output Example
wellbeing_analysis outputs an object containing the lexical usage values for each of the PERMA domains, both positive and negative.

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

A string - valid options: "binary" (default), or "frequency".

"binary" calculates the lexical value as simply a sum of weights, i.e. weight[1] + weight[2] + etc...

"frequency" calculates the lexical value as (word frequency / total wordcount) * word weight

Unless you have a specific need for frequency encoding, we recommend you use binary only.

### 'lang'

**String - valid options: 'english' (default), or 'spanish'**

The language of the lexicon to use.

### 'max' and 'min'

**Float**

Each item in the lexicon data has an associated weight (number). Use these options to exclude words that have weights above the max threshold or below the min threshold.

By default these are set to infinity, ensuring that no words from the lexicon are excluded.

For English, -0.37 (default) will include everything from the lexicon, 0.85 will include nothing.

For Spanish, -0.85 (default) will include everything from the lexicon, 3.32 will include nothing.

### 'nGrams'

**String - valid options: 'true' (default) or 'false'**

n-Grams are contiguous pieces of text, bi-grams being chunks of 2, tri-grams being chunks of 3, etc.

Use the nGrams option to include (true) or exclude (false) n-grams. For accuracy it is recommended that n-grams are included, however including n-grams for very long strings can detrement performance.

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

**String - valid options: 'true' or 'false' (default)**

When set to true, the output from the nGrams option will be added to the word count.

For accuracy it is recommended that this is set to false.

## {output: 'matches'} Output Example

```javascript
{
  POS_P:
    [
      [ 'magnificent', 1, -192.0206116, -1.3914537072463768 ],
      [ 'capital', 1, -133.9311307, -0.9705154398550726 ],
      [ 'note', 3, -34.83417005, -0.7572645663043478 ],
      [ 'america', 2, -49.21227355, -0.7132213557971014 ],
      [ 'republic', 1, -75.5720402, -0.5476234797101449 ]
    ],
  POS_E:
    [
      ....
    ],
  ...
};
```

The items in each array represent: [0] - the word, [1] - number of appearances in string (frequency), [2] - the word's weight, [3] - its final lexical value.

## Acknowledgements

### References
[Schwartz, H.A., Sap, M., Kern, M.L., Eichstaedt, J.C., Kapelner, A., Agrawal, M., Blanco, E., Dziurzynski, L., Park, G., Stillwell, D. & Kosinski, M. (2016). Predicting individual well-being through the language of social media. In Biocomputing 2016: Proceedings of the Pacific Symposium (pp. 516-527).](http://wwbp.org/papers/2016_predicting_wellbeing.pdf)

### Lexicon
Using the PERMA lexicon data from the [WWBP](http://www.wwbp.org/lexica.html). Used under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/)

## Licence
(C) 2017 [P. Hughes](www.phugh.es).

[Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/).
