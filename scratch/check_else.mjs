import fs from 'fs';

async function main() {
    const { parseRbxm } = await import('file:///C:/Users/Renat/Desktop/Conblox/app/js/studio/RbxmImporter.js');
    const buf = fs.readFileSync('C:/Users/Renat/Desktop/Conblox/app/Animate.rbxm');
    const parsed = parseRbxm(new Uint8Array(buf));
    const src = parsed.roots[0].Source;
    const runIdx = src.indexOf('pose = "Running"');
    const str = src.slice(runIdx, runIdx + 30);
    console.log(JSON.stringify(str));
    for (let i = 0; i < str.length; i++) {
        console.log(i, JSON.stringify(str[i]), str.charCodeAt(i));
    }
}
main();
