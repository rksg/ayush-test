APP=${1:-'main'}
JSON_FILE="apps/$APP/src/locales/compiled/en-US.json"

awk '{ \
  sub(/[,]*$/,",")
  for (i=2; i<=NF; i++) \
    if(i == 2 && i == NF) { \
      printf("%s\n", substr($i, 2, length($i)-3)) \
    } \
    else if(i == 2) { \
      printf("%s ", substr($i, 2)) \
    } \
    else if(i == NF) { \
      printf("%s\n", substr($i, 1, length($i)-2)) \
    } \
    else { \
      printf("%s ",$i) } \
}' $JSON_FILE > ./tmp

UNIQUE_STRINGS=$(wc -l ./tmp | awk '{print $1}')
echo -e 'Unique Strings:\t\t'"${UNIQUE_STRINGS}"

WORD_COUNT=$(wc -w ./tmp | awk '{print $1}')
echo -e 'Word Count:\t\t'"${WORD_COUNT}"

UNIQUE_WORD_COUNT=$(tr ' ' '\n' < ./tmp | sort | uniq -c | wc -l | awk '{print $1}')
echo -e 'Unique Word Count:\t'"${UNIQUE_WORD_COUNT}"
