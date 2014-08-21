# Boss'Boss



## Development

### Scraping
Run the scraping scripts from `/lib` with `python -m tasks.latech.courses 2014f` and `python -m tasks.latech.classes 2014f`


### @TODO

run this: `select * FROM class WHERE seats_available=0 AND seats_status LIKE "%open%"`, question results

Question why q='', subjects=Accounting and campuses=Main Campus
Filtering by main campus shouldn't do anything.

Additionally, filtering by term makes the result smaller when it shouldn't.

Need to devise a way to default to the most recent term. maybe just parse the dates (Fall 2014) with chronic and get a time


### Use-cases

> I want a class from Trivette this quarter, let's see what he's teaching.

> I'd prefer a class that's in Carson-Taylor so I don't have to run from Davison to GTM.

> I need three more credit-hours, let's see what's still available.