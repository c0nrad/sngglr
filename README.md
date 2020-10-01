sngglr - An amazing project
======

Open source dating website ♥

The idea is to be able to quickly launch a dating website for a small circle of people.

## Deploy


[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/c0nrad/sngglr)

1. Click that button
1. Setup a public amazon S3 bucket (then set the CORS like https://devcenter.heroku.com/articles/s3-upload-node#s3-setup)
1. Make a twilio account
3. Add a bunch of heroku config variables

```yaml
AWS_ACCESS_KEY=asdasdasdasd
AWS_SECRET_KEY=asdasdasdasdasdasdasdasd
S3_BUCKET=sngglr

twilioSid=aqdwiojqwiodjqwiodjqwiodjqwiod
twilioAuth=qwdij10jdqiowjdioqwjdoiqwjdqiowj
twilioNumber=+11111111111

gmailEmail=admin@account.com
gmailPassword=youradminpassword

smsOn=true
emailOn=true

HOSTNAME=DOMAIN.sngglr.com

EMAIL_DOMAINS=DOMAIN.com,SECONDARY.com
```

And then it should work...

## Contact

😀

c0nrad@c0nrad.io
