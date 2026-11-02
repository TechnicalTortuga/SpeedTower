import { describe, it, expect } from 'vitest';
import { generateStage } from '../generator';
import { BlockType } from '../block_types';

describe('Raw Data Export (What the Graphics & Physics Engines actually see)', () => {
  it('should print the raw Uint8Array and Entities list for the other engines', () => {
    // Generate a mini-stage just for this test so we don't overwhelm the console
    const stage = generateStage(4860, { width: 48, height: 16, depth: 4 });

    console.log('\n==================================================');
    console.log('📦 DATA HANDOFF PAYLOAD (Graphics & Physics)');
    console.log('==================================================');

    // 1. The Metadata
    console.log('\n1️⃣ METADATA:');
    console.log(`Width (X): ${stage.width}`);
    console.log(`Height (Y): ${stage.height}`);
    console.log(`Depth (Z): ${stage.depth}`);
    console.log(`Total Bytes: ${stage.voxels.length} bytes (~${(stage.voxels.length / 1024).toFixed(2)} KB)`);

    // 2. The Raw Voxel Array (The actual Uint8Array buffer)
    console.log('\n2️⃣ RAW VOXEL ARRAY (First 150 blocks of Z=1):');
    // We slice the first 150 blocks just to show what the raw memory looks like
    // 0 = Air, 1 = Solid, 12 = Portal Start, etc.
    const rawSlice = Array.from(stage.voxels.slice(48 * 48, 48 * 48 + 150)); 
    console.log(JSON.stringify(rawSlice));

    // 3. The Entities Array (What your teammate mentioned: type, position, etc.)
    console.log('\n3️⃣ DYNAMIC ENTITIES (Portals, Chests):');
    console.log(JSON.stringify(stage.entities, null, 2));

    // 4. Example of how Physics reads this flat array:
    console.log('\n4️⃣ HOW PHYSICS READS THIS DATA:');
    const testX = 5;
    const testY = 1;
    const testZ = 1;
    // Formula: index = x + Width * (y + Height * z)
    const index = testX + stage.width * (testY + stage.height * testZ);
    const blockID = stage.voxels[index];
    
    console.log(`Physics Engine asking for Block at (X:${testX}, Y:${testY}, Z:${testZ})`);
    console.log(`Calculated flat array index: ${index}`);
    console.log(`Returned BlockType ID: ${blockID} ${blockID === BlockType.AIR ? '(Air)' : ''}`);
    console.log('==================================================\n');

    // Simple assertions to ensure the data is intact
    expect(stage.voxels).toBeInstanceOf(Uint8Array);
    expect(stage.entities.length).toBeGreaterThan(0);
  });
});