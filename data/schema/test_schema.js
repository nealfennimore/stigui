const fs = require('fs');
const path = require('path');

const Validator = require('jsonschema').Validator;
const v = new Validator();

const example = fs.readFileSync(path.join(__dirname, './examples/checklist.cklb.json'));
const schema = fs.readFileSync(path.join(__dirname, './SV3_CKLB_1_0_JSON_SCHEMA.json'));

console.log(v.validate(example, schema).valid);

