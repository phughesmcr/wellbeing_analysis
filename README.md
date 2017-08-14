# wellbeing_analysis
![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)

Analyse positive / negative [PERMA](https://en.wikipedia.org/wiki/Martin_Seligman#PERMA) expressions in English or Spanish strings, using PERMA lexicon from the [WWBP](http://www.wwbp.org/lexica.html).


## Disclaimer

Wellbeing_Analysis is provided for educational and entertainment purposes only. It does not provide, and is not a substitute for, medical advice or diagnosis.

## Usage
```javascript
const wba = require("wellbeing_analysis");
const opts = {
  "lang": "english",      // "english" (default) or "spanish" / "espanol"
  "encoding": "binary",   // "binary" (default), or "frequency" - type of word encoding to use.
  "threshold": -0.38      // number between -0.38 (default) & 0.86 for English, and -0.86 (default) & 3.35 for Spanish
};
const str = "A string of text....";
const wellbeing = wba(str, opts);
console.log(wellbeing);
```

Errors return null

## Options
### "lang"
"english" (default), or "spanish" - language of the lexicon to use.

### "threshold"
A number - minimum token weight to match.

Each item in the lexicon data has an associated weight (number). A higher threshold results in fewer matches.

For English, -0.37 (default) will include everything from the lexicon, 0.85 will include nothing.

For Spanish, -0.85 (default) will include everything from the lexicon, 3.32 will include nothing.

If a threshold is not specified the module will default to -999 to ensure everything is included.

### "encoding"

A string - valid options: "binary" (default), or "frequency".

"binary" calculates the lexical value as simply a sum of weights, i.e. weight[1] + weight[2] + etc...

"frequency" calculates the lexical value as (word frequency / total wordcount) * word weight

Unless you have a specific need for frequency encoding, we recommend you use binary only.

## Output Example
wellbeing_analysis outputs an object containing the lexical usage values for each of the PERMA domains, both positive and negative.

```javascript
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
"POS_" / "NEG_" = positive / negative.

## Acknowledgements

### References
[Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L., Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell, D., Seligman, M. E., & Ungar, L. H. (2013). Personality, gender, and age in the language of social media: The Open-Vocabulary Approach. PLOS ONE, 8(9), . . e73791.](https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Na16PsUAAAAJ&citation_for_view=Na16PsUAAAAJ:u-x6o8ySG0sC)

### Lexicon
Using the PERMA lexicon data from the [WWBP](http://www.wwbp.org/lexica.html). Used under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/)

## Licence
(C) 2017 [P. Hughes](www.phugh.es).

[Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/).
