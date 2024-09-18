// enforce-foo-bar.test.js
const {RuleTester} = require("eslint");
const rule = require("./enforce-venue-placeholder");

const ruleTester = new RuleTester({
  // Must use at least ecmaVersion 2015 because
  // that's when `const` variables were introduced.
  parserOptions: { ecmaVersion: 2015 }
});

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
  "enforce-venue-placeholder", // rule name
  rule, // rule code
  { // checks
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
      errors: 1,
    }, {
      code: "defineMessage({ defaultMessage: 'ooxx venues foobar' })",
      errors: 1,
    }, {
      code: "$t({ defaultMessage: 'ooxx Venue foobar' })",
      errors: 1,
    }, {
      code: "defineMessage({ defaultMessage: 'Venues foobar' })",
      errors: 1,
    }, {
      code: "intl.$t({ defaultMessage: 'venue' })",
      errors: 1,
    }],
  }
);

console.log("All tests passed!");
