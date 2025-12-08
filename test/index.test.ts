import { describe, it, expect } from "vitest";
import { base60 } from "../src/index.js";
import type { Base60String } from "../src/index.js";

describe("Base60Codec", () => {
  // ---------------------------------------------
  // encodeBigInt / decodeBigInt
  // ---------------------------------------------
  it("encodes and decodes BigInt round-trip", () => {
    const values = [0n, 1n, 123456789n, (1n << 64n) - 1n, (1n << 127n) - 1n];

    for (const v of values) {
      const encoded = base60.encodeBigInt(v);
      const decoded = base60.decodeToBigInt(encoded as Base60String);
      expect(decoded).toBe(v);
    }
  });

  // ---------------------------------------------
  // Int64
  // ---------------------------------------------
  it("encodes Int64 into fixed 11 chars", () => {
    const v = 123456789n;
    const encoded = base60.encodeInt64(v);
    expect(encoded.length).toBe(11);

    const decoded = base60.decodeInt64(encoded);
    expect(decoded).toBe(v);
  });

  it("encodes zero Int64 correctly", () => {
    const encoded = base60.encodeInt64(0);
    expect(encoded.length).toBe(11);
    // leading pads only
    expect(base60.isValidBase60(encoded)).toBe(true);

    const decoded = base60.decodeInt64(encoded);
    expect(decoded).toBe(0n);
  });

  // ---------------------------------------------
  // UUID
  // ---------------------------------------------
  it("encodes and decodes UUID", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const encoded = base60.encodeUUID(uuid);
    expect(encoded.length).toBe(22);

    const decoded = base60.decodeUUID(encoded as Base60String);
    expect(decoded).toBe(uuid);
  });

  // ---------------------------------------------
  // Bytes
  // ---------------------------------------------
  it("encodes and decodes Uint8Array", () => {
    const bytes = new Uint8Array([0, 1, 2, 100, 255]);
    const encoded = base60.encodeBytes(bytes);
    const decoded = base60.decodeToBytes(encoded as Base60String);
    // 先頭の0は復元できない(仕様)
    expect([...decoded]).toEqual([...bytes].slice(1));
  });

  // ---------------------------------------------
  // ULID
  // ---------------------------------------------
  it("encodes and decodes ULID", () => {
    const ulid = "01H8J5N3Z9V8XK8E2X5PWSQ4M0";

    const encoded = base60.encodeULID(ulid);
    expect(encoded.length).toBe(22);
    expect(base60.isValidBase60(encoded)).toBe(true);

    const decoded = base60.decodeULID(encoded as Base60String);
    expect(decoded).toBe(ulid);
  });

  // ---------------------------------------------
  // compareAsBigInt
  // ---------------------------------------------
  it("compareAsBigInt compares correctly", () => {
    const a = base60.encodeBigInt(123n) as Base60String;
    const b = base60.encodeBigInt(999n) as Base60String;

    expect(base60.compareAsBigInt(a, b)).toBe(-1);
    expect(base60.compareAsBigInt(b, a)).toBe(1);
    expect(base60.compareAsBigInt(a, a)).toBe(0);
  });

  // ---------------------------------------------
  // isValidBase60
  // ---------------------------------------------
  it("isValidBase60 detects valid/invalid strings", () => {
    const valid = base60.encodeBigInt(99999n);
    expect(base60.isValidBase60(valid)).toBe(true);

    expect(base60.isValidBase60("invalid!")).toBe(false);
    expect(base60.isValidBase60("０１２３")).toBe(false); // 全角数字
  });

  // ---------------------------------------------
  // Edge cases
  // ---------------------------------------------
  it("handles very large BigInt values", () => {
    const big = (1n << 200n) - 1n; // 200bit
    const encoded = base60.encodeBigInt(big);
    const decoded = base60.decodeToBigInt(encoded as Base60String);
    expect(decoded).toBe(big);
  });

  it("fails on invalid UUID", () => {
    expect(() => base60.encodeUUID("not-a-uuid")).toThrow();
  });

  it("fails on invalid ULID", () => {
    expect(() => base60.encodeULID("too-short")).toThrow();
  });
});
