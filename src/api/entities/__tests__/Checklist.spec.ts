import fs from 'fs';
import { Validator } from 'jsonschema';
import path from 'path';
import { Convert } from '../../generated/Stig';
import { CKLBConverter } from '../Checklist';


describe('CKLBConverter', () => {
    const schemaDir = path.join(__dirname, '../../../../public/data/stigs/schema');

    const jsonSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../data/schema/SV3_CKLB_1_0_JSON_SCHEMA.json'), 'utf-8'));
    const validator = new Validator();

    for (const schema of fs.readdirSync(schemaDir)) {
        it(`should match snapshot for ${schema}`, () => {
            const data = fs.readFileSync(path.join(schemaDir, schema), 'utf8');
            const stig = Convert.toStig(data);
            const checklist = CKLBConverter.fromStig(stig, stig.Benchmark.Profile);
            expect(checklist).toMatchSnapshot();
        });


        it(`should validate ${schema}`, ()=>{
            const data = fs.readFileSync(path.join(schemaDir, schema), 'utf8');
            expect(validator.validate(data, jsonSchema).valid).toBe(true);
        });
    }
})