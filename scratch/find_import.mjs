import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
    input: fs.createReadStream('C:/Users/Renat/.gemini/antigravity/brain/befa1e62-90eb-4429-bea7-6560ccf27932/.system_generated/logs/transcript.jsonl')
});

rl.on('line', (line) => {
    if (line.includes("ExplorerUI.js") && line.includes("import { Instance }")) {
        const data = JSON.parse(line);
        console.log('MATCH STEP', data.step_index, data.type);
    }
});
