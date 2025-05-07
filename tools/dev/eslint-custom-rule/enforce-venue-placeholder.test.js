"use strict";

// How to run this test:
// $ cd acx-ui
// $ node tools/dev/eslint-custom-rule/enforce-venue-placeholder.test.js

const {RuleTester} = require("eslint");
const rule = require("./enforce-venue-placeholder");

const ruleTester = new RuleTester({
  // Must use at least ecmaVersion 2015 because
  // that's when `const` variables were introduced.
  parserOptions: { ecmaVersion: 2015 }
});

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
  "enforce-venue-placeholder", rule, {
    // 'valid' checks cases that should pass
    valid: [{
      code: "$t({ defaultMessage: 'vvenue foobar' })",
    }, {
      code: "$t({ defaultMessage: '<venueSingular></venueSingular>' })",
    }, {
      code: "defineMessage({ defaultMessage: '<VenuePlural></VenuePlural>' })",
    }, {
      code: "$t({ defaultMessage: '<VenueSingular></VenueSingular>' })",
    }, {
      code: "defineMessage({ defaultMessage: '<venuePlural></venuePlural>' })",
    }],
    // 'invalid' checks cases that should not pass
    invalid: [{
      code: "$t({ defaultMessage: 'venue foobar' })",
      output: "$t({ defaultMessage: '<venueSingular></venueSingular> foobar' })",
      errors: 1,
    }, {
      code: "defineMessage({ defaultMessage: 'ooxx venues foobar' })",
      output: "defineMessage({ defaultMessage: 'ooxx <venuePlural></venuePlural> foobar' })",
      errors: 1,
    }, {
      code: "$t({ defaultMessage: `${ooxx} Venue foobar` })",
      errors: 1,
    }, {
      code: "defineMessage({ defaultMessage: 'Venues foobar' })",
      output: "defineMessage({ defaultMessage: '<VenuePlural></VenuePlural> foobar' })",
      errors: 1,
    }, {
      code: "intl.$t({ defaultMessage: 'venue' })",
      output: "intl.$t({ defaultMessage: '<venueSingular></venueSingular>' })",
      errors: 1,
    }, {
      code: "intl.$t({ defaultMessage: 'Cannot delete Resident Portal while Venues' + ' are in use.' })",
      errors: 1,
    }],
  }
);

console.log("All tests passed!");
