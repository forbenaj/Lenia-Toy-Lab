"use strict";

(function exposeLeniaMapFormat(root) {
  const TYPE = "leniency-map";
  const VERSION = 2;

  function bytesToBase64(bytes) {
    const chunks = [];
    const chunkSize = 32768;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      chunks.push(String.fromCharCode.apply(null, bytes.subarray(index, index + chunkSize)));
    }
    return btoa(chunks.join(""));
  }

  function base64ToBytes(text) {
    const binary = atob(String(text || ""));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function encodeField(channelId, sourceValues) {
    const values = sourceValues instanceof Float32Array ? sourceValues : new Float32Array(sourceValues || 0);
    const bytes = new Uint8Array(values.length * Float32Array.BYTES_PER_ELEMENT);
    const view = new DataView(bytes.buffer);
    for (let index = 0; index < values.length; index += 1) {
      view.setFloat32(index * Float32Array.BYTES_PER_ELEMENT, values[index], true);
    }
    return {
      channelId,
      encoding: "float32-base64",
      littleEndian: true,
      length: values.length,
      data: bytesToBase64(bytes),
    };
  }

  function decodeField(field, expectedLength) {
    if (!field || field.encoding !== "float32-base64") throw new Error("Unsupported map field encoding.");
    const length = Number(expectedLength || field.length || 0);
    if (!Number.isSafeInteger(length) || length < 0) throw new Error("Invalid map field length.");
    const bytes = base64ToBytes(field.data);
    if (bytes.byteLength !== length * Float32Array.BYTES_PER_ELEMENT) {
      throw new Error("Map field data does not match its dimensions.");
    }
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const values = new Float32Array(length);
    const littleEndian = field.littleEndian !== false;
    for (let index = 0; index < length; index += 1) {
      values[index] = view.getFloat32(index * Float32Array.BYTES_PER_ELEMENT, littleEndian);
    }
    return values;
  }

  const api = Object.freeze({ TYPE, VERSION, encodeField, decodeField });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LeniaMapFormat = api;
})(typeof window !== "undefined" ? window : globalThis);
