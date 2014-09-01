// __Dependencies__
var express = require('express');

// __Module Definition__
var decorator = module.exports = function (options, protect) {
  var controller = this;
  var initial = express.Router();
  var controllerForStage = protect.controllerForStage = {
    initial: initial,
    request: express.Router(),
    query: express.Router(),
    finalize: express.Router()
  };
  // __Stage Controllers__
  controller.use(initial);
  controller.use(controllerForStage.request);
  controller.use(controllerForStage.query);
  controller.use(controllerForStage.finalize);
  // Expose the original `use` function as a protected method.
  protect.use = controller.use.bind(controller);
  // Pass the method calls through to the "initial" stage middleware controller,
  // so that it precedes all other stages and middleware that might have been
  // already added.
  controller.use = initial.use.bind(initial);
  controller.all = initial.all.bind(initial);
  controller.head = initial.head.bind(initial);
  controller.get = initial.get.bind(initial);
  controller.post = initial.post.bind(initial);
  controller.put = initial.put.bind(initial);
  controller.delete = initial.delete.bind(initial);
};
