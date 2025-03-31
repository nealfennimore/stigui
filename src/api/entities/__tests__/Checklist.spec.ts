import fs from 'fs';
import path from 'path';
import { Convert } from '../../generated/Stig';
import { CKLBConverter } from '../Checklist';


describe('CKLBConverter', () => {
    const schemaDir = path.join(__dirname, '../../../../public/data/stigs/schema');
    for (const schema of fs.readdirSync(schemaDir)) {
        it(`should match snapshot for ${schema}`, () => {
            if (schema === "null.json"){
                // Skip null.json as it is not a valid schema
                return;
            }
            const data = fs.readFileSync(path.join(schemaDir, schema), 'utf8');
            const stig = Convert.toStig(data);
            const checklist = CKLBConverter.fromStig(stig, stig.Benchmark.Profile);
            expect(checklist).toMatchSnapshot();
        });
    }
})