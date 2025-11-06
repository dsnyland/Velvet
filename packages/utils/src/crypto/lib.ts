export class fileHash {
  #IV = new Uint32Array ([ 0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19]);
  #bytes = new Uint8Array([]);
  #CHUNK_START = 1 << 0; 
  #CHUNK_END = 1 << 1;
  #PARENT = 1 << 2;
  #ROOT = 1 << 3;
 
  // FIRST LAYER OF CHUNCKS
  #CHUNK_LENGTH = 1024;
  // SECOND LAYER OF BLOCKS (64 bytes  1024 / 64 = 16 so 16 blocks total)
  #BLOCK_LEN = 64;


  constructor(private readonly seed: string) {}

  public hash() {
    this.#bytes = new TextEncoder().encode(this.seed); 
    let lastCv = this.#IV.slice() as Uint32Array;


    for(let offset = 0; offset < this.#bytes.length; offset += this.#CHUNK_LENGTH) {
      const chunk = this.#bytes.subarray(offset, offset + this.#CHUNK_LENGTH);
      let cv = this.#IV.slice() as Uint32Array;
      cv = this.#processChuncksIntoBlocks(chunk, cv);
      // for now, assume one chunk or just keep last
      lastCv = cv; 
    }  

    const out = new Uint8Array(32);
    const view = new DataView(out.buffer);
    for (let i = 0; i < 8; i++) view.setUint32(i * 4, lastCv[i], true);
    return out;
  }

  #processChuncksIntoBlocks(chunk: Uint8Array, cv: Uint32Array): Uint32Array{
    for (let blockOffset = 0; blockOffset < chunk.length; blockOffset += this.#BLOCK_LEN) {
      const block = chunk.subarray(blockOffset, blockOffset + this.#BLOCK_LEN);
      const blockLen = block.length;
      const counter  = blockOffset;

      const isFirst = blockOffset == 0;
      const isLast = blockOffset + this.#BLOCK_LEN >= chunk.length;

      let blockFlags = 0;
      if (isFirst) blockFlags |= this.#CHUNK_START;
      if (isLast)  blockFlags |= this.#CHUNK_END;
      
      // second compression
      cv = this.#compress(cv, block, counter, blockLen, blockFlags);
    }    
    return cv; 
  }   

  #compress(cv: Uint32Array, block: Uint8Array, counter: number, blockLen: number, flags: number) {
    
    const m = new Uint32Array(16);
    for (let i = 0; i < 16; i++) {
      m[i] =
        block[i*4] |
        (block[i*4+1] << 8) |
        (block[i*4+2] << 16) |
        (block[i*4+3] << 24);
    }

    const v = new Uint32Array(16);

    // vector 0 - 7 -> current chaining value
    v.set(cv, 0);

    // vector 8 - 11 -> = IV constants
    v.set(this.#IV, 8);

    // vector 12 = counter low (lower 32 bits)
    v[12] = counter >>> 0;

    // vector 13 = counter high (upper 32 bits, usually 0)
    v[13] = 0;

    // vector 14 = blockLen
    v[14] = blockLen;

    // vector 15 = flags
    v[15] = flags;


    this.G(v, 0, 4,  8, 12, m[0],  m[1]);
    this.G(v, 1, 5,  9, 13, m[2],  m[3]);
    this.G(v, 2, 6, 10, 14, m[4],  m[5]);
    this.G(v, 3, 7, 11, 15, m[6],  m[7]);
    this.G(v, 0, 5, 10, 15, m[8],  m[9]);
    this.G(v, 1, 6, 11, 12, m[10], m[11]);
    this.G(v, 2, 7,  8, 13, m[12], m[13]);
    this.G(v, 3, 4,  9, 14, m[14], m[15]);

    const out = new Uint32Array(8);
    for (let i = 0; i < 8; i++) out[i] = (v[i] ^ v[i + 8]) >>> 0;
    return out;
  }
  

  /* okay so lemme break it down for you mark, this right here.... it does the laundry
      it mixes thing up more than a progressive couple 
      it shakes stuff around like an industrial meat grinder with puppy guts
      it....... does stuff 
      its... EUROPEAN!
  */ 
  private G(v: Uint32Array, a: number, b: number, c: number, d: number, x: number, y: number) {
    v[a] = (v[a] + v[b] + x) >>> 0;
    v[d] = ((v[d] ^ v[a]) >>> 16) | ((v[d] ^ v[a]) << (32 - 16));
    v[c] = (v[c] + v[d]) >>> 0;
    v[b] = ((v[b] ^ v[c]) >>> 12) | ((v[b] ^ v[c]) << (32 - 12));
    v[a] = (v[a] + v[b] + y) >>> 0;
    v[d] = ((v[d] ^ v[a]) >>> 8)  | ((v[d] ^ v[a]) << (32 - 8));
    v[c] = (v[c] + v[d]) >>> 0;
    v[b] = ((v[b] ^ v[c]) >>> 7)  | ((v[b] ^ v[c]) << (32 - 7));
  }

}

