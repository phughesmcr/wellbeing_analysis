# wellbeing_analysis

Analyse positive / negative [PERMA](https://en.wikipedia.org/wiki/Martin_Seligman#PERMA) expressions in English or Spanish Strings

## Usage
```Javascript
const wba = require('wellbeing_analysis')
const opts = {
       "lang": "english", // "english" or "spanish" / "espanol"
  "threshold": -0.38,     // value between -0.38 (default) & 0.86 for English, and -0.86 (default) & 3.35 for Spanish
    "bigrams": true,      // match against bigrams too?
   "trigrams": true       // match against trigrams too?
}
let text = "A long string of text...."
let wellbeing = wba(text, opts)
```

Errors return null

## Options
#### "lang"
"english" (default), or "spanish" - language of the lexicon to use.

#### "threshold"
A Number - minimum token weight to match.

Each item in the lexicon data has an associated weight (number). A higher threshold results in fewer matches.

For English, -0.37 (default) will include everything from the lexicon, 0.85 will include nothing.

For Spanish, -0.85 (default) will include everything from the lexicon, 3.32 will include nothing.

If a threshold is not specified the module will default to -999 to ensure everything is included.

### "bigrams" and "trigrams"
boolean - true / false

The PERMA lexicon contains bigrams and trigrams, matching against these gives more accurate results but requires more processing time.

Enabled by default, but we recommend you disable them for very long strings.

## Output Example
wellbeing_analysis outputs an object containing the lexical usage values for each of the PERMA domains, both positive and negative.

```Javascript
{
  POS_P: 1.30630732799999993,
  POS_E: 0.5958824519999999,
  POS_R: 0.2675181425,
  POS_M: 1.9665244059,
  POS_A: 0.6969340592000001,
  NEG_P: 0.826628165,
  NEG_E: -0.012260966700000014,
  NEG_R: 0.31149285169999996,
  NEG_M: -1.23064807439999996,
  NEG_A: 0.24929312429999995
}
```

## Acknowledgements

### References
Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L., Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell, D., Seligman, M. E., & Ungar, L. H. (2013). Personality, gender, and age in the language of social media: The Open-Vocabulary Approach. PLOS ONE, 8(9), . . e73791.

### Lexicon
Using the gender lexicon data from http://www.wwbp.org/lexica.html

Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence

## Licence
(C) 2017 P. Hughes
[Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/)
