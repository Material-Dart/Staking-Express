const fs = require('fs');
const path = require('path');

const IDL_PATH = path.join(__dirname, '../target/idl/staking_express.json');
const TYPES_PATH = path.join(__dirname, '../target/types/staking_express.ts');
const FE_IDL_DIR = path.join(__dirname, '../../frontend/src/idl');
const FE_IDL_TYPES_PATH = path.join(FE_IDL_DIR, 'staking_express.ts');
const FE_IDL_JSON_PATH = path.join(FE_IDL_DIR, 'staking_express.json');

function toCamelCase(str) {
    // 1. Lowercase the first character (handles PascalCase)
    // 2. Replace snake_case and kebab-case
    return (str.charAt(0).toLowerCase() + str.slice(1))
        .replace(/([-_][a-z])/ig, ($1) => {
            return $1.toUpperCase()
                .replace('-', '')
                .replace('_', '');
        });
}

function transform(obj, parentPath = []) {
    if (Array.isArray(obj)) {
        return obj.map((v, i) => transform(v, [...parentPath, i]));
    } else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                let newVal = obj[key];
                const currentPath = [...parentPath, key];

                // Transform values based on key and context
                if (typeof newVal === 'string') {
                    // 1. pda -> seeds -> path (snake_case -> camelCase)
                    // Context ends with ['seeds', index, 'path']
                    if (key === 'path') {
                        if (parentPath.length >= 2 && parentPath[parentPath.length - 2] === 'seeds') {
                            newVal = toCamelCase(newVal);
                        }
                    }

                    // 2. Name conversions (PascalCase/snake_case -> camelCase)
                    if (key === 'name') {
                        // Metadata: ['metadata', 'name']
                        if (parentPath.length === 1 && parentPath[0] === 'metadata') {
                            newVal = toCamelCase(newVal);
                        }

                        // Top-level arrays: instructions, accounts, types, events, errors
                        // Context: ['instructions', index, 'name']
                        if (parentPath.length === 2) {
                            const section = parentPath[0];
                            if (['instructions', 'accounts', 'types', 'events', 'errors'].includes(section)) {
                                newVal = toCamelCase(newVal);
                            }
                        }

                        // Instructions -> accounts/args
                        // Context: ['instructions', index, 'accounts'|'args', index, 'name']
                        if (parentPath.length === 4 && parentPath[0] === 'instructions') {
                            const subSection = parentPath[2];
                            if (['accounts', 'args'].includes(subSection)) {
                                newVal = toCamelCase(newVal);
                            }
                        }

                        // Types/Events fields
                        // Context: ['types'|'events', index, 'type', 'fields', index, 'name']
                        // Also handles nested defined types e.g. fields -> type -> array -> defined -> name
                        // Check if we are anywhere inside 'types' or 'events' and looking at a 'name'
                        if (parentPath[0] === 'types' || parentPath[0] === 'events') {
                            // Check if it's a field name (already covered) OR a defined type name
                            // e.g. parentPath = ['types', 0, 'type', 'array', 0, 'defined']
                            const isDefinedType = parentPath[parentPath.length - 1] === 'defined';
                            const isField = parentPath[parentPath.length - 2] === 'fields';

                            if (isField || isDefinedType) {
                                newVal = toCamelCase(newVal);
                            }
                        }
                    }
                }

                // Recursively transform
                newObj[key] = transform(newVal, currentPath);
            }
        }
        return newObj;
    }
    return obj;
}

function sync() {
    console.log('🔄 Starting IDL synchronization and transformation...');

    if (!fs.existsSync(IDL_PATH)) {
        console.error(`❌ IDL file not found at ${IDL_PATH}. Run 'anchor build' first.`);
        process.exit(1);
    }

    // 1. Read and transform the IDL JSON
    const idlJson = JSON.parse(fs.readFileSync(IDL_PATH, 'utf8'));
    const transformedIdl = transform(idlJson);

    // 2. Read the generated types
    const typesContent = fs.readFileSync(TYPES_PATH, 'utf8');

    // 3. Ensure frontend directory exists
    if (!fs.existsSync(FE_IDL_DIR)) {
        fs.mkdirSync(FE_IDL_DIR, { recursive: true });
    }

    // 4. Write FE JSON (for reference or dynamic loading)
    fs.writeFileSync(FE_IDL_JSON_PATH, JSON.stringify(transformedIdl, null, 2));
    console.log(`✅ Transformed JSON IDL written to ${FE_IDL_JSON_PATH}`);

    // 5. Generate FE TS file combining types and IDL object
    // We export the IDL with the exact same structure as the type
    let tsOutput = typesContent.replace('export type StakingExpress =', 'export type StakingExpress =');

    // Add the IDL constant at the end
    tsOutput += `\nexport const IDL: StakingExpress = ${JSON.stringify(transformedIdl, null, 2)};\n`;

    fs.writeFileSync(FE_IDL_TYPES_PATH, tsOutput);
    console.log(`✅ Type-safe IDL TS file written to ${FE_IDL_TYPES_PATH}`);

    console.log('✨ IDL sync complete!');
}

sync();
