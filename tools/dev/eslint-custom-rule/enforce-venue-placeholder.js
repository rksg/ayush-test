module.exports = {
  meta: {
    type: 'problem', // Type of rule: 'problem', 'suggestion', or 'layout'
    docs: {
      description: 'Flag usage of "venue" or "venues" in defaultMessage',
      category: 'Possible Errors',
      recommended: false
    },
    fixable: 'code',
    schema: []
  },
  create(context) {

    const placeHolderMap = {
      venue: '<venueSingular></venueSingular>',
      Venue: '<VenueSingular></VenueSingular>',
      venues: '<venuePlural></venuePlural>',
      Venues: '<VenuePlural></VenuePlural>'
    };

    return {
      CallExpression(node) {
        const callee = (node.callee.type === 'MemberExpression') ? node.callee.property : node.callee;

        // Check if the function called is either $t or defineMessage
        if (callee.type === 'Identifier' && (callee.name === '$t' || callee.name === 'defineMessage')) {
          const firstArg = node.arguments[0];

          // Check if the first argument is an object and has a property defaultMessage
          if (firstArg && firstArg.type === 'ObjectExpression') {
            const defaultMessageProperty = firstArg.properties.find(
              prop => prop.key.name === 'defaultMessage'
            );

            if (defaultMessageProperty) {
              let messageValue = null
              if (defaultMessageProperty.value.type === 'Literal') {
                messageValue = defaultMessageProperty.value.value;
              } else if (defaultMessageProperty.value.type === 'TemplateLiteral') {
                // Collect the raw text from the template elements
                messageValue = defaultMessageProperty.value.quasis.map(quasi => quasi.value.raw).join('');
              }

              // Regular expression to match "venue" or "venues"
              const invalidVenueRegex = /\b(venue|Venue|venues|Venues)\b/;
              const matchArray = messageValue && messageValue.match(invalidVenueRegex);

              // Check if the message contains "venue" or "venues"
              if (Array.isArray(matchArray) && matchArray.length > 0) {
                const venueWord = matchArray[0];
                context.report({
                  node: defaultMessageProperty,
                  message: 'Use placeholder "{{ placeHolder }}" instead of "{{ venueWord }}" in defaultMessage.',
                  data: {
                    venueWord: venueWord,
                    placeHolder: placeHolderMap[venueWord]
                  },
                  fix: function (fixer) {
                    // Handle 'Literal' type
                    if (defaultMessageProperty.value.type === 'Literal') {
                      const fixedMessage = defaultMessageProperty.value.value.replace(invalidVenueRegex, match => placeHolderMap[match]);
                      return fixer.replaceText( defaultMessageProperty.value, `'${fixedMessage}'`);
                    }
                  }
                });
              }
            }
          }
        }
      }
    };
  }
};
