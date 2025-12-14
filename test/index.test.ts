import { describe, it, expect } from "vitest";
import { base60 } from "../src/index.js";
import type { Base60String } from "../src/index.js";

describe("Base60Codec", () => {
  // ---------------------------------------------
  // encodeBigInt / decodeBigInt
  // ---------------------------------------------
  it("encodes and decodes BigInt round-trip", () => {
    const values = [0n, 1n, 123456789n, (1n << 64n) - 1n, (1n << 127n) - 1n];

    const { encodeBigInt, decodeToBigInt } = base60;

    for (const v of values) {
      const encoded = encodeBigInt(v);
      const decoded = decodeToBigInt(encoded as Base60String);
      expect(decoded).toBe(v);
    }
  });

  // ---------------------------------------------
  // Int64
  // ---------------------------------------------
  it("encodes Int64 into fixed 11 chars", () => {
    const v = 123456789n;

    const { encodeInt64, decodeInt64 } = base60;

    const encoded = encodeInt64(v);
    expect(encoded.length).toBe(11);

    const decoded = decodeInt64(encoded);
    expect(decoded).toBe(v);
  });

  it("encodes zero Int64 correctly", () => {
    const { encodeInt64, isValidBase60, decodeInt64 } = base60;

    const encoded = encodeInt64(0);
    expect(encoded.length).toBe(11);
    // leading pads only
    expect(isValidBase60(encoded)).toBe(true);

    const decoded = decodeInt64(encoded);
    expect(decoded).toBe(0n);
  });

  // ---------------------------------------------
  // UUID
  // ---------------------------------------------
  it("encodes and decodes UUID", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const { encodeUUID, decodeUUID } = base60;
    const encoded = encodeUUID(uuid);
    expect(encoded.length).toBe(22);

    const decoded = decodeUUID(encoded as Base60String);
    expect(decoded).toBe(uuid);
  });

  // ---------------------------------------------
  // Bytes
  // ---------------------------------------------
  it("encodes and decodes Uint8Array", () => {
    const bytes = new Uint8Array([0, 1, 2, 100, 255]);
    const { encodeBytes, decodeToBytes } = base60;
    const encoded = encodeBytes(bytes);
    const decoded = decodeToBytes(encoded as Base60String);
    // 先頭の0は復元できない(仕様)
    expect([...decoded]).toEqual([...bytes].slice(1));
  });

  // ---------------------------------------------
  // ULID
  // ---------------------------------------------
  it("encodes and decodes ULID", () => {
    const ulid = "01H8J5N3Z9V8XK8E2X5PWSQ4M0";

    const { encodeULID, isValidBase60, decodeULID } = base60;

    const encoded = encodeULID(ulid);
    expect(encoded.length).toBe(22);
    expect(isValidBase60(encoded)).toBe(true);

    const decoded = decodeULID(encoded as Base60String);
    expect(decoded).toBe(ulid);
  });

  // ---------------------------------------------
  // compareAsBigInt
  // ---------------------------------------------
  it("compareAsBigInt compares correctly", () => {
    const { encodeBigInt, compareAsBigInt } = base60;

    const a = encodeBigInt(123n) as Base60String;
    const b = encodeBigInt(999n) as Base60String;

    expect(compareAsBigInt(a, b)).toBe(-1);
    expect(compareAsBigInt(b, a)).toBe(1);
    expect(compareAsBigInt(a, a)).toBe(0);
  });

  // ---------------------------------------------
  // isValidBase60
  // ---------------------------------------------
  it("isValidBase60 detects valid/invalid strings", () => {
    const { encodeBigInt, isValidBase60 } = base60;

    const valid = encodeBigInt(99999n);
    expect(isValidBase60(valid)).toBe(true);

    expect(isValidBase60("invalid!")).toBe(false);
    expect(isValidBase60("０１２３")).toBe(false); // 全角数字
  });

  // ---------------------------------------------
  // Edge cases
  // ---------------------------------------------
  it("handles very large BigInt values", () => {
    const { encodeBigInt, decodeToBigInt } = base60;

    const big = (1n << 200n) - 1n; // 200bit
    const encoded = encodeBigInt(big);
    const decoded = decodeToBigInt(encoded as Base60String);
    expect(decoded).toBe(big);
  });

  it("fails on invalid UUID", () => {
    const { encodeUUID } = base60;
    expect(() => encodeUUID("not-a-uuid")).toThrow();
  });

  it("fails on invalid ULID", () => {
    const { encodeULID } = base60;
    expect(() => encodeULID("too-short")).toThrow();
  });
});
