db = db.getSiblingDB('heroku_app29928161')
db.users.find({}).forEach(function(user) {
  print(user.email, ' ');
})
