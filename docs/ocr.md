# importing recipes with ocr

## notes
Using [tesseract.js](https://github.com/naptha/tesseract.js) for printed characters. Doesn't seem to work too well for handwritten characters.

Seems like PNG files work best at 300 px/inch resolution (or higher). At 72 px/inch misses a lot of characters. At 300 px/inch, gets to about 100% accuracy. Pictures of docs don't word nearly as well as PDF files converted to PNG. 