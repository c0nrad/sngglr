'use strict';

var app = angular.module('sngglr', ['ui.router', 'ngResource', 'angularFileUpload', 'googlechart']);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'partials/home.html'
    })

    .state('login', {
      url: '/login',
      templateUrl: 'partials/login.html',
      controller: 'LoginController'
    })

    .state('new', {
      url: '/new',
      templateUrl: 'partials/new.html',
      abstract: true
    })

    .state('new.account', {
      url: '/account',
      controller: 'NewAccountController',
      templateUrl: 'partials/new.account.html',
    })

    .state('new.verify', {
      url: '/verify',
      templateUrl: 'partials/new.verify.html',
      controller: 'NewVerifyController'
    })

    .state('new.profile', {
      url: '/profile',
      templateUrl: 'partials/new.profile.html',
      controller: 'ProfileController'
    })

    .state('profile', {
      url: '/profile',
      templateUrl: 'partials/profile.html',
      controller: 'ProfileController'
    })

    .state('play', {
      url: '/play',
      templateUrl: 'partials/play.html',
      controller: 'PlayController'
    })

    .state('matches', {
      url: '/matches',
      templateUrl: 'partials/matches.html',
      controller: 'MatchesController'
    })

    .state('match', {
      url: '/matches/:match',
      templateUrl: 'partials/match.html',
      controller: 'MatchController'
    })

    .state('forgot', {
      url: '/forgot',
      templateUrl: 'partials/forgot.html',
      controller: 'ForgotController'
    })

    .state('reset', {
      url: '/reset/:reset',
      templateUrl: 'partials/reset.html',
      controller: 'ResetController'
    })

    .state('confirmation', {
      url: '/confirmation/:token',
      controller: 'ConfirmationController'
    })

    .state('about', {
      url: '/about',
      templateUrl: 'partials/about.html'
    })

    .state('contact', {
      url: '/contact',
      templateUrl: 'partials/contact.html'
    })

    .state('stats', {
      url: '/stats',
      templateUrl: 'partials/stats.html',
      controller: 'StatsController'
    });
 });

app.service('User', function($resource) {
  return $resource('/api/users/:id', {id: '@_id'}, {login: {url: '/api/login'}, me: {url: '/api/users/me', method: 'GET'}, like: {method: 'POST', url:'/api/users/:id/like'}, addPicture: {method: 'POST', url: '/api/users/:id/pictures'}, update: {method: 'PUT'}, logout: {method: 'DELETE', url: '/api/logout'}});
});

app.service('Picture', function($resource){
  return $resource('/api/users/:user/pictures/:id', {id: '@_id', user: '@user'}, {first: {method: 'PUT', url: '/api/users/:user/pictures/:id/first'}});
});

app.service('Play', function($resource) {
  return $resource('/api/play');
});

app.service('Match', function($resource) {
  return $resource('/api/users/:user/matches/:id', {id: '@_id', user: '@me._id'}, {seen: {method: 'PUT', url: '/api/users/:user/matches/:id/seen'}});
});

app.service('Chat', function($resource) {
  return $resource('/api/users/:user/matches/:match/chats/:id', {id: '@_id', user: '@user', match: '@match'}, {unseen: {url: '/api/users/:user/matches/:match/chats/unseen', method: 'GET'}}, {seen: {url: '/api/users/:user/matches/:match/chats/seen', method: 'PUT'}});
});

app.service('Stats', function($resource){
  return $resource('/api/stats');
});

app.controller('StatsController', function($scope, Stats) {
  $scope.stats = Stats.get(function(stats) {
    console.log(arguments);

    $scope.mtuCountChartObject = {
      data: {
        'cols': [
          {id: 't', label: 'Gender Type', type: 'string'},
          {id: 's', label: 'Count', type: 'number'}
        ],
        'rows': [
          { c: [ { v: 'Male'}, {v: stats.maleCount.mtu}, ] },
          {c: [ {v: 'Female'}, {v: stats.femaleCount.mtu}]}
        ]
      },
      type: 'PieChart',
      options: {
        'pieSliceText': 'value',
        chartArea:{left:0,top:0,width:'100%',height:'100%'}

      }
    };

    $scope.fuCountChartObject = {
      data: {
        'cols': [
          {id: 't', label: 'Gender Type', type: 'string'},
          {id: 's', label: 'Count', type: 'number'}
        ],
        'rows': [
          { c: [ { v: 'Male'}, {v: stats.maleCount.fu}, ] },
          {c: [ {v: 'Female'}, {v: stats.femaleCount.fu}]}
        ]
      },
      type: 'PieChart',
      options: {
        'pieSliceText': 'value',
        chartArea:{left:0,top:0,width:'100%',height:'100%'}
      }
    };


    var joinDateRows = [];
    for (var i = 1; i <= stats.joinDates.length; ++i) {
      var out = { c: [ {v: new Date(stats.joinDates[i]) }, {v:i} ] };
      joinDateRows.push(out);
    }

    $scope.joinDateChartObject = {
      data: {"cols": [
          {id: "t", label: "Date", type: "date"},
          {id: "s", label: "Number of Members", type: "number"}
        ], "rows": joinDateRows
      },
      type: 'LineChart',
      options: {
          'title': 'New User Growth',
          'legend': 'none',
      }
    };


    var lastActivityRows = [];
    for (i = 1; i <= stats.lastActivity.length; ++i) {
      var laOut = { c: [ {v: new Date(stats.lastActivity[i])}, {v: i} ] };
      lastActivityRows.push(laOut);
    }

    $scope.lastActivityChartObject = {
      data: {"cols": [
          {id: "t", label: "Date Last Activity", type: "date"},
          {id: "s", label: "Member Number", type: "number"}
        ], "rows": lastActivityRows
      },
      type: 'LineChart',
      options: {
          'title': 'Date of last activity',
          'legend': 'none',
      }
    };

    $scope.likeTypeChartObject = {
      data: {
        'cols': [
          {id: 't', label: 'Gender Type', type: 'string'},
          {id: 's', label: 'Count', type: 'number'}
        ],
        'rows': [
          { c: [ { v: 'Yes'}, {v: stats.likes.yes}, ] },
          { c: [ { v: 'Maybe'}, {v: stats.likes.maybe}, ] },
          { c: [ {v: 'No'}, {v: stats.likes.no}]}
        ]
      },
      type: 'PieChart',
      options: {
        'pieSliceText': 'value',
        chartArea:{left:0,top:0,width:'100%',height:'100%'}
      }
    };

    $scope.matchTypeChartObject = {
      data: {
        'cols': [
          {id: 't', label: 'Gender Type', type: 'string'},
          {id: 's', label: 'Count', type: 'number'}
        ],
        'rows': [
          { c: [ { v: 'Yes'}, {v: stats.matches.yes}, ] },
          { c: [ { v: 'Maybe'}, {v: stats.matches.maybe}, ] },
        ]
      },
      type: 'PieChart',
      options: {
        'pieSliceText': 'value',
        chartArea:{left:0,top:0,width:'100%',height:'100%'}
      }
    };

  });
});

app.controller('ConfirmationController', function($scope, $http, $stateParams, $state) {
  console.log($stateParams.token);

  var token = $stateParams.token;
  $http.post('/api/confirmation/' + token)
  .success(function() {
    $state.go('new.verify');
    console.log('wahoo! confirmed');
  })
  .error(function(err) {
    $scope.err = err;
    console.log('fail');
  });
});

app.controller('ResetController', function($scope, $http, $stateParams, $state) {
  console.log($stateParams);

  $scope.reset = function() {
    var token = $stateParams.reset;
    var password = $scope.password;
    $http.post('/api/reset/' + token, {password: password})
    .success(function() {
      $state.go('login');
    })
    .error(function(err) {
      $scope.err = err;
      console.log('fail');
    });
  };
});

app.controller('ForgotController', function(User, $scope, $http) {
  $scope.reset = function() {
    var email = $scope.email;

    $http.post('/api/reset', {email: email})
    .success(function() {
      $scope.msg = 'Please check your email to reset password.';
    })
    .error(function(err) {
      $scope.err = err;
      console.log('FAIL');
    });
  };
});

app.controller('MatchController', function(User, $rootScope, Match, Picture, Chat, $http, $scope, $state, $stateParams) {
  $scope.me = User.me(function(me) {
    $scope.me.pictures = Picture.query({user: me._id});
    $scope.match = Match.get({user: me._id, id: $stateParams.match}, function(match) {
      $scope.other = User.get({id: match.other.user});
      $scope.pictures = Picture.query({user: match.other.user});
      $scope.chats = Chat.query({match: match._id, user: me._id});
      $http.put('/api/users/' + me._id + '/matches/' + $stateParams.match + '/seen')
      .success(function() {
        $rootScope.me = User.me();
      });
    });
  });

  $scope.send = function() {
    var c = new Chat({message: $scope.message, user: $scope.me._id, match: $stateParams.match});
    c.$save(function() {
      $scope.chats = Chat.query({match: $stateParams.match, user: $scope.me._id});
    });
    $scope.message = '';
  };

  $scope.unmatch = function() {
    $scope.match.$delete(function() {
      $state.go('matches');
    });
  };

  $scope.imgIndex = 0;
  $scope.nextPicture = function() {
    $scope.imgIndex += 1;
    $scope.imgIndex %= $scope.pictures.length;
  };

  $scope.prevPicture = function() {
    $scope.imgIndex -= 1;
    $scope.imgIndex += $scope.pictures.length;
    $scope.imgIndex %= $scope.pictures.length;
  };

});

app.controller('MatchesController', function(User, Match, Picture, Chat, $scope, $state) {
  $scope.me = User.me(function(me) {
    Match.query({user: me._id}, function(matches) {
      for (var i = 0; i < matches.length; ++i) {
        var id = matches[i].other.user;
        matches[i].other = User.get({id: id });
        matches[i].pictures = Picture.query({user: id });
        matches[i].chats = Chat.unseen({match: matches[i]._id, user: me._id});
      }
      $scope.matches = matches;
    });
  });

  $scope.gotoMatch = function(id) {
    $state.go('match', {match: id});
  };
});

app.controller('PlayController', function(User, Play, $scope, $http, $rootScope) {
  $scope.me = User.me();
  $scope.other = Play.get(function() { $scope.err = ''; }, function(err) { $scope.err = err.data; });

  $scope.like = function(likeType, other) {
    $scope.me.$like({id: $scope.me._id, likeType: likeType, other: other}, function() {
      $rootScope.me = User.me();
      $scope.other = Play.get();
      $scope.imgIndex = 0;
      $scope.err = '';
    }, function(response) { console.log(response); $scope.err = response.data; });
  };

  $scope.imgIndex = 0;
  $scope.nextPicture = function() {
    $scope.imgIndex += 1;
    $scope.imgIndex %= $scope.other.pictures.length;
  };

  $scope.prevPicture = function() {
    $scope.imgIndex -= 1;
    $scope.imgIndex += $scope.other.pictures.length;
    $scope.imgIndex %= $scope.other.pictures.length;
  };

  $scope.invite = function() {
    console.log($scope.email);

    $http.post('/invite', {email: $scope.email})
    .success(function(a) {
      $scope.msg = a;
      $scope.inviteErr = '';
    })
    .error(function(err) {
      $scope.msg = '';
      $scope.inviteErr = err;
    });
  };

});

app.controller('HeaderController', function(User, Match, $scope, $rootScope, $state) {
  $rootScope.me = User.me();

  $scope.logout = function() {
    $rootScope.me.$logout(function() {
      $rootScope.me = User.me(function() {
        $state.go('home');
      });
    });
  };
});

app.controller('ProfileController', function(User, Picture, $scope, $upload) {
  $scope.imgIndex = 0;

  $scope.me = User.me(function(me) {
    $scope.pictures = Picture.query({user: me._id}, function() {
      console.log(arguments);
    });
  });

  $scope.progress = 0;
  $scope.setProgress = function(p) {
    $scope.$apply(function() {
      $scope.progress = p;
    });
  };

  $scope.addPicture = function(url) {
    $scope.progress = 0;
    User.addPicture({_id: $scope.me._id, url: url}, function() {
      $scope.pictures = Picture.query({user: $scope.me._id}, function(pictures) {
        $scope.imgIndex = $scope.pictures.length - 1;
      });
    });
  };

  $scope.deletePicture = function(picture) {
    picture.$delete();
    $scope.pictures = Picture.query({user: $scope.me._id});
    $scope.imgIndex = 0;
  };

  $scope.makeFirst = function(picture) {
    picture.$first();
    $scope.pictures = Picture.query({user: $scope.me._id});
    $scope.imgIndex = 0;
  };

  $scope.nextPicture = function() {
    $scope.imgIndex += 1;
    $scope.imgIndex %= $scope.pictures.length;
  };

  $scope.prevPicture = function() {
    $scope.imgIndex -= 1;
    $scope.imgIndex += $scope.pictures.length;
    $scope.imgIndex %= $scope.pictures.length;
  };

  $scope.onFileSelect = function($files) {
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      $scope.upload = $upload.upload({
        url: '/api/users/' + $scope.me._id + '/pictures/upload',
        method: 'POST',
        file: file, // or list of files ($files) for html5 only
      }).success(function(data, status, headers, config) {
        console.log(data);
        $scope.addPicture(data);
      });
      //.error(...)
    }
  };
});


app.controller('NewAccountController', function(User, $scope, $rootScope, $state) {
  $scope.create = function() {
    var user = _.pick($scope, 'name', 'email', 'password');
    console.log(user);
    user = new User(user);
    user.$save(function() {
      $state.go('new.verify');
      $rootScope.me = User.me();
    }, function(response) {
      $scope.err = response.data;
    });
  };

  $scope.check = function() {
    $rootScope.me = User.me();
  };
});

app.controller('NewVerifyController', function(User, $scope) {
  $scope.me = User.me();

  $scope.check = function() {
    $scope.me = User.me();
  };
});

app.controller('LoginController', function($http, $scope, $state, User, $rootScope) {
  $scope.login = function() {
    var email = $scope.email;
    var password = $scope.password;
    $http.post('/api/login', {email: email, password: password})
    .success(function() {
      $rootScope.me = User.me();
      $state.go('home');
    })
    .error(function(err) {
      $scope.err = err;
    });
  };
});

app.filter('fromNow', function() {
  return function(date) {
    return moment(date).fromNow();
  };
});
