'use strict';

var lcov_parse = require('lcov-parse');


/**
 * @private
 * Handler function for the simple.getMemory command.
 * @param {boolean} total If true, return total memory; if false, return free memory only.
 * @return {number} The amount of memory.
 */
function getLCov(path, errback) {
  lcov_parse(path, errback);
  return true;
}




/**
 * Initializes the coverage domain.
 * @param {DomainManager} domainManager The DomainManager for the server
 */
function init(domainManager) {
  if (!domainManager.hasDomain("Coverage")) {
    domainManager.registerDomain("Coverage", {
      major: 0,
      minor: 1
    });
  }
  domainManager.registerCommand(
    "Coverage", // domain name
    "parse", // command name
    getLCov, // command handler function
    true, // this command is synchronous in Node
    "Returns a json object representing an lcov", [{
      name: "path", // parameters
      type: "string",
      description: "Path to lcov file"
    }], [{
      name: "lcov", // return values
      type: "object",
      description: "lcov object"
    }]
  );
}

exports.init = init;
