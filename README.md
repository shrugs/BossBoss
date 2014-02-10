#Boss'Boss
is a Course Discovery and Schedule Management tool for LA Tech students.


It has some nifty features that make it better than the existing <a href="http://boss.latech.edu">B.O.S.S.</a> website.

- Search Bar for course discovery
    - CourseCode ('ENGR-121')
    - Course Number ('121')
    - Course Name ('Statics')
    - Course Description ('cultural')
    - Teacher ('Swanbom')
    - Subject ('ENGR', 'biomed')
    - Call Number ('31531')
- No session Expiry
    - In fact, your session is saved automatically. Come back later and your schedule will still be here.
    - Like, seriously. If WWIII happens in the middle of your schedule creation, as long as your computer survives, you'll be able to finish your schedule.
- Helps you plan your schedule
    - Boss'Boss even gives you a calendar display so you can visualize your week.
- Is always available
    - Unlike Boss, Boss'Boss doesn't need lunch breaks.
- Was not made circa 1990

# The webapp

The webapp was made in angular with scaffolding by Yo. It's pretty nice. It's in the /templates folder, but flask doesn't serve the files.

The bossboss.tk domain is a simple apache virtualhost. The api.bossboss.tk domain is running on a gunicorn server on a different port. The vitualhost does a proxypass for that subdomain to redirect queries to the flask server.

The flask server and the db creation scripts use the peewee orm form database calls. I quite like it.