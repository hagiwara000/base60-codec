export type Base60String = string & { __brand_base60: true };

export interface Base60Codec {
  alphabet: Base60String;

  encodeBytes(bytes: Uint8Array): string;
  decodeToBytes(text: Base60String): Uint8Array;

  encodeBigInt(value: bigint, padLength?: number): Base60String;
  decodeToBigInt(text: Base60String): bigint;

  encodeInt64(value: number | bigint): Base60String;
  decodeInt64(text: Base60String): bigint;

  encodeUUID(uuid: string): Base60String;
  decodeUUID(text: Base60String): string;

  encodeULID(ulid: string): Base60String;
  decodeULID(text: Base60String): string;

  compareAsBigInt(a: Base60String, b: Base60String): number;

  isValidBase60(text: string): text is Base60String;
}

const FIXED_LEN_UUID = 22;
const FIXED_LEN_ULID = 22;
const FIXED_LEN_INT64 = 11;

const alphabet =
  "0123456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" as Base60String;

// ULID base32
const crockford = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function createBase60Codec(): Base60Codec {
  const base = BigInt(alphabet.length);
  const charToValue = new Map<string, bigint>();
  for (let i = 0; i < alphabet.length; i++) {
    charToValue.set(alphabet[i]!!, BigInt(i));
  }

  function leftPad(text: Base60String, length: number): Base60String {
    if (text.length > length) {
      throw new Error(
        `Encoded value length (${text.length}) exceeds fixed length ${length}`
      );
    }
    return text.padStart(length, alphabet[0]) as Base60String;
  }

  // ---------------------------------------------
  // Uint8Array → BigInt
  // ---------------------------------------------
  function bytesToBigInt(bytes: Uint8Array): bigint {
    let result = 0n;
    for (const b of bytes) {
      result = (result << 8n) + BigInt(b);
    }
    return result;
  }

  // ---------------------------------------------
  // BigInt → Uint8Array
  // ---------------------------------------------
  function bigIntToBytes(value: bigint, fixedLength?: number): Uint8Array {
    if (value < 0n) {
      throw new Error("negative bigint is not supported");
    }

    let hex = value.toString(16);
    if (hex.length % 2 === 1) hex = "0" + hex;

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }

    if (fixedLength !== undefined) {
      if (bytes.length > fixedLength) {
        throw new Error("decoded bytes exceed fixed length");
      }
      const padded = new Uint8Array(fixedLength);
      padded.set(bytes, fixedLength - bytes.length);
      return padded;
    }

    return bytes;
  }

  // ---------------------------------------------
  // BigInt → BaseN
  // ---------------------------------------------
  function encodeBigInt(value: bigint, padLength?: number): Base60String {
    if (value === 0n) {
      return padLength != null
        ? leftPad(alphabet[0]!! as Base60String, padLength)
        : (alphabet[0]!! as Base60String);
    }

    let v = value;
    let out = "";
    while (v > 0n) {
      const mod = v % base;
      v = v / base;
      out = alphabet[Number(mod)] + out;
    }
    return padLength != null
      ? leftPad(out as Base60String, padLength)
      : (out as Base60String);
  }

  // ---------------------------------------------
  // BaseN → BigInt
  // ---------------------------------------------
  function decodeToBigInt(text: Base60String): bigint {
    let v = 0n;
    for (const ch of text) {
      const d = charToValue.get(ch);
      if (d === undefined) {
        throw new Error(`invalid character "${ch}"`);
      }
      v = v * base + d;
    }
    return v;
  }

  // ---------------------------------------------
  // Public API
  // ---------------------------------------------
  return {
    alphabet,

    encodeBytes(bytes: Uint8Array): Base60String {
      return encodeBigInt(bytesToBigInt(bytes)) as Base60String;
    },

    decodeToBytes(text: Base60String): Uint8Array {
      return bigIntToBytes(decodeToBigInt(text));
    },

    encodeBigInt,
    decodeToBigInt,

    encodeInt64(value: number | bigint): Base60String {
      return leftPad(
        encodeBigInt(BigInt(value)) as Base60String,
        FIXED_LEN_INT64
      );
    },

    decodeInt64(text: Base60String): bigint {
      if (text.length !== FIXED_LEN_INT64) {
        throw new Error(`Expected ${FIXED_LEN_INT64} chars for Base60 Int64`);
      }
      return decodeToBigInt(text);
    },

    encodeUUID(uuid: string): Base60String {
      const hex = uuid.replace(/-/g, "");
      if (hex.length !== 32) throw new Error("invalid UUID");
      const bytes = new Uint8Array(16);
      for (let i = 0; i < 16; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
      }
      return leftPad(
        encodeBigInt(bytesToBigInt(bytes)) as Base60String,
        FIXED_LEN_UUID
      );
    },

    decodeUUID(text: Base60String): string {
      const bytes = bigIntToBytes(decodeToBigInt(text), 16); // UUIDは常に16バイト
      const hex = [...bytes]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return (
        hex.slice(0, 8) +
        "-" +
        hex.slice(8, 12) +
        "-" +
        hex.slice(12, 16) +
        "-" +
        hex.slice(16, 20) +
        "-" +
        hex.slice(20)
      );
    },

    encodeULID(ulid: string): Base60String {
      // ULID は 26 文字の Crockford Base32
      if (!/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(ulid)) {
        throw new Error("Invalid ULID format");
      }

      // ULID base32 → 16 bytes へデコードする
      const map32 = new Map<string, number>();
      for (let i = 0; i < crockford.length; i++) {
        map32.set(crockford[i]!!, i);
      }

      // ULID は 128bit なので BigInt に変換してしまうのが楽
      let value = 0n;
      for (const ch of ulid.toUpperCase()) {
        const v = map32.get(ch);
        if (v === undefined) throw new Error(`Invalid ULID char: ${ch}`);
        value = (value << 5n) + BigInt(v);
      }

      // 128bit を Base60 で22文字に固定
      const raw = encodeBigInt(value);

      return leftPad(raw, FIXED_LEN_ULID) as Base60String;
    },

    decodeULID(text: Base60String): string {
      // ULID は UUID と同じ 128bit → Base60 は 22 chars 固定
      if (text.length !== 22) {
        throw new Error("Expected 22-char Base60 ULID");
      }

      // 1. Base60 → BigInt
      const value = decodeToBigInt(text);

      // 2. BigInt → 16 bytes
      const bytes = bigIntToBytes(value, 16); // 128bit fixed

      // 3. bytes → Crockford Base32 (ULID)
      let bits = "";

      for (const b of bytes) {
        bits += b.toString(2).padStart(8, "0");
      }

      // ULID は 128bit → 26×5bit = 130bit
      // 先頭に 2bit のゼロパディングが来る設計
      const padded = bits.padStart(130, "0");

      let ulid = "";
      for (let i = 0; i < 26; i++) {
        const chunk = padded.slice(i * 5, i * 5 + 5);
        ulid += crockford[parseInt(chunk, 2)];
      }

      return ulid;
    },

    compareAsBigInt(a: Base60String, b: Base60String): number {
      const ai = decodeToBigInt(a);
      const bi = decodeToBigInt(b);

      if (ai < bi) return -1;
      if (ai > bi) return 1;
      return 0;
    },

    isValidBase60: (text: string): text is Base60String => {
      for (const ch of text) {
        if (!alphabet.includes(ch)) return false;
      }
      return true;
    },
  };
}

const base60 = createBase60Codec();
export { base60 };
export default base60;
