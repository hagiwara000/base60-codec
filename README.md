<p align="center">
  <a href="https://www.npmjs.com/package/base60-codec">
    <img src="https://img.shields.io/npm/v/base60-codec?color=blue&label=npm" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/base60-codec">
    <img src="https://img.shields.io/npm/dm/base60-codec?color=brightgreen" alt="npm downloads">
  </a>
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license">
  <a href="https://github.com/hagiwara000/base60-codec/actions/workflows/ci.yml">
    <img src="https://github.com/hagiwara000/base60-codec/actions/workflows/ci.yml/badge.svg" alt="CI Status">
  </a>
</p>

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

```shell
npm install base60-codec
```

## 🧩 Quick Usage

```javascript
import { encodeUUID, decodeUUID } from "base60-codec";

const uuid = "550e8400-e29b-41d4-a716-446655440000";

// Encode as 22-char Base60
const encoded = encodeUUID(uuid);
console.log(encoded); // e.g. "09EzBRW... (22 chars)"

// Decode back to UUID
console.log(decodeUUID(encoded));
// → "550e8400-e29b-41d4-a716-446655440000"
```

💡 Tip
If you prefer grouped APIs, you can also import the base60 namespace:

```javascript
import base60 from "base60-codec";

base60.encodeUUID(uuid);
```

## ✨ Features

### ✅ UUID (128-bit) → 22 chars

```javascript
encodeUUID(uuid: string): string
decodeUUID(id: Base60String): string
```

### ✅ ULID (26 chars Base32) → 22 chars

```javascript
encodeULID(ulid: string): Base60String
decodeULID(id: Base60String): string
```

### ✅ Int64 → 11 chars

```javascript
encodeInt64(num: number | bigint): string
decodeInt64(id: Base60String): bigint
```

### ✅ BigInt encoding

```javascript
encodeBigInt(value: bigint, padLength?: number): string
decodeToBigInt(text: Base60String): bigint
```

### ✅ Safe comparison

```javascript
compareAsBigInt(a: Base60String, b: Base60String): -1 | 0 | 1
```

### ✅ Type-safe Base60 string guard

```javascript
if (isValidBase60(text)) {
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

```javascript
encodeBytes(Uint8Array([0,1,2]))
↓
decodeToBytes(...) → [1,2]
```

This is expected: Base60 → BigInt → bytes produces the minimal byte length.

UUID / ULID / Int64 are unaffected because they use fixed 16-byte / 8-byte decoding internally.

## 🧪 Testing

```shell
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
