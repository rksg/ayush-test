# Before start this script, please make sure you have copied the mapping files to dir.
dir="./libs/analytics/components/src/ConfigChange/Table/mapping"

for input_file in ${dir}/*.json; do
  filename=$(basename "$input_file" .json)
  output_file="$dir/$filename.tsx"
  input=$(cat "$input_file")

  # remove space
  input=$(echo "$input" | sed 's/"[ ]*\([,:]\)[ ]*"/"\1"/g')

  # key: double quote -> single quote
  input=$(echo "$input" | sed 's/"\([^"-]*\)":/\1:/g')
  input=$(echo "$input" | sed 's/"\([^"]*\)":/'\''\1'\'':/g') # ex:auth-failure'
  input=$(echo "$input" | sed 's/ttc:/'\''ttc'\'':/g') # special case: ttc

  # value: double quote -> single quote
  input=$(echo "$input" | sed 's/:"\([^"]*\)"/:'\''\1'\''/g')
  input=$(echo "$input" | sed 's/:""/:'\'\''/g')

  # normalize spacing
  input=$(echo "$input" | sed 's/,\([^$]\)/, \1/g')
  input=$(echo "$input" | sed 's/{\([^}]\)/{ \1/g')
  input=$(echo "$input" | sed 's/\([^{]\)}/\1 }/g')
  input=$(echo "$input" | sed 's/}}/} }/g')
  input=$(echo "$input" | sed 's/\([^ ]\):\([^ ]\)/\1: \2/g')

  # add defineMessage
  input=$(echo "$input" | awk 'BEGIN { FS = ","; OFS=","; };
    {
      if($3 != "" && substr($3,2,5) == "text:" && $3 != " text: '\''TBD'\''" && $3 != " text: '\''NA'\''" && $3 != " text: '\'''\''" ) {
        $3 = " text: defineMessage({ defaultMessage: "substr($3,8)" })"
      }

      if($4 != "" && substr($4,2,9) == "textAlto:" && $4 != " textAlto: '\''TBD'\''" && $4 != " textAlto: '\''NA'\''" && $4 != " textAlto: '\'''\''" ) {
        $4 = " textAlto: defineMessage({ defaultMessage: "substr($4,12)" })"
      }
      if(NR == 1){
        print "import { defineMessage } from '\''react-intl'\''"
        print ""
        print "/* eslint-disable max-len */"
        print "export const '$filename' = ["
      }
      else if($1 == "]") {
        print
      } else {
        print
      }
    };'
  )

  echo "$input" > "$output_file"
done
