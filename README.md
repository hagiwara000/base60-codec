# 📦 base60-codec

A tiny, fast, and deterministic Base60 encoder/decoder for TypeScript.

- Fixed-length Base60 IDs for UUID / ULID / Int64
- BigInt-based (no precision loss)
- Stable alphabet (0–9 A–Z a–z without ambiguous characters)
- Brand types for type-safe Base60 strings
- Zero dependencies
- ESM ready (NodeNext)

Ideal for generating compact, URL-safe IDs with predictable ordering.

## 🚀 Installation

```
npm install base60-codec
```

## 🧩 Quick Usage

```
import { base60 } from "base60-codec";

const uuid = "550e8400-e29b-41d4-a716-446655440000";

// Encode as 22-char Base60
const encoded = base60.encodeUUID(uuid);
console.log(encoded); // e.g. "09EzBRW... (22 chars)"

// Decode back to UUID
console.log(base60.decodeUUID(encoded));
// → "550e8400-e29b-41d4-a716-446655440000"
```

## ✨ Features

### ✅ UUID (128-bit) → 22 chars

```
encodeUUID(uuid: string): string
decodeUUID(id: Base60String): string
```

### ✅ ULID (26 chars Base32) → 22 chars

```
encodeULID(ulid: string): Base60String
decodeULID(id: Base60String): string
```

### ✅ Int64 → 11 chars

```
encodeInt64(num: number | bigint): string
decodeInt64(id: Base60String): bigint
```

### ✅ BigInt encoding

```
encodeBigInt(value: bigint, padLength?: number): string
decodeToBigInt(text: Base60String): bigint
```

### ✅ Safe comparison

```
compareAsBigInt(a: Base60String, b: Base60String): -1 | 0 | 1
```

### ✅ Type-safe Base60 string guard

```
if (base60.isValidBase60(text)) {
// text is now typed as Base60String
}
```

## 📏 Alphabet

```
0123456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
```

- No visually ambiguous characters (0/O, I/l, etc.)
- Stable ordering
- URL-safe

## ⚠️ Notes

1. `encodeBytes()` / `decodeToBytes()` **is not fully reversible**

Leading zero bytes are dropped:

```
encodeBytes(Uint8Array([0,1,2]))
↓
decodeToBytes(...) → [1,2]
```

This is expected: Base60 → BigInt → bytes produces the minimal byte length.

UUID / ULID / Int64 are unaffected because they use fixed 16-byte / 8-byte decoding internally.

## 🧪 Testing

```
npm test
```

Uses Vitest.

## 📜 License

MIT

## 🎉 Summary

base60-codec gives you:

- deterministic, compact, comparable Base60 identifiers
- 22-char identifiers for both UUID & ULID
- 11-char identifiers for Int64
- safe brand-typed Base60 strings
- pure TypeScript implementation (no deps)

Perfect for generating short IDs in databases, URLs, logs, or distributed systems.
