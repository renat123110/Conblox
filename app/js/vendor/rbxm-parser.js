var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    var i;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
        );
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
        );
      }
      return parts.join("");
    }
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/ieee754/index.js
var require_ieee754 = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/ieee754/index.js"(exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer[offset + i - d] |= s * 128;
    };
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/buffer/index.js
var require_buffer = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/buffer/index.js"(exports) {
    "use strict";
    var base64 = require_base64_js();
    var ieee754 = require_ieee754();
    var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer2;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    var K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (!Buffer2.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
      console.error(
        "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
      );
    }
    function typedArraySupport() {
      try {
        const arr = new Uint8Array(1);
        const proto = { foo: function() {
          return 42;
        } };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
      } catch (e) {
        return false;
      }
    }
    Object.defineProperty(Buffer2.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer2.isBuffer(this)) return void 0;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer2.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer2.isBuffer(this)) return void 0;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
      }
      const buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer2.prototype);
      return buf;
    }
    function Buffer2(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    Buffer2.poolSize = 8192;
    function from(value, encodingOrOffset, length) {
      if (typeof value === "string") {
        return fromString(value, encodingOrOffset);
      }
      if (ArrayBuffer.isView(value)) {
        return fromArrayView(value);
      }
      if (value == null) {
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof value === "number") {
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      }
      const valueOf = value.valueOf && value.valueOf();
      if (valueOf != null && valueOf !== value) {
        return Buffer2.from(valueOf, encodingOrOffset, length);
      }
      const b = fromObject(value);
      if (b) return b;
      if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
        return Buffer2.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
      }
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
      );
    }
    Buffer2.from = function(value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer2, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }
    function alloc(size, fill2, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill2 !== void 0) {
        return typeof encoding === "string" ? createBuffer(size).fill(fill2, encoding) : createBuffer(size).fill(fill2);
      }
      return createBuffer(size);
    }
    Buffer2.alloc = function(size, fill2, encoding) {
      return alloc(size, fill2, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    Buffer2.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer2.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer2.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      const length = byteLength(string, encoding) | 0;
      let buf = createBuffer(length);
      const actual = buf.write(string, encoding);
      if (actual !== length) {
        buf = buf.slice(0, actual);
      }
      return buf;
    }
    function fromArrayLike(array) {
      const length = array.length < 0 ? 0 : checked(array.length) | 0;
      const buf = createBuffer(length);
      for (let i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255;
      }
      return buf;
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
      }
      return fromArrayLike(arrayView);
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }
      let buf;
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array);
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }
      Object.setPrototypeOf(buf, Buffer2.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer2.isBuffer(obj)) {
        const len = checked(obj.length) | 0;
        const buf = createBuffer(len);
        if (buf.length === 0) {
          return buf;
        }
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      }
      return length | 0;
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0;
      }
      return Buffer2.alloc(+length);
    }
    Buffer2.isBuffer = function isBuffer(b) {
      return b != null && b._isBuffer === true && b !== Buffer2.prototype;
    };
    Buffer2.compare = function compare(a, b) {
      if (isInstance(a, Uint8Array)) a = Buffer2.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array)) b = Buffer2.from(b, b.offset, b.byteLength);
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      }
      if (a === b) return 0;
      let x = a.length;
      let y = b.length;
      for (let i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    Buffer2.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer2.concat = function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer2.alloc(0);
      }
      let i;
      if (length === void 0) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }
      const buffer = Buffer2.allocUnsafe(length);
      let pos = 0;
      for (i = 0; i < list.length; ++i) {
        let buf = list[i];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer.length) {
            if (!Buffer2.isBuffer(buf)) buf = Buffer2.from(buf);
            buf.copy(buffer, pos);
          } else {
            Uint8Array.prototype.set.call(
              buffer,
              buf,
              pos
            );
          }
        } else if (!Buffer2.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer, pos);
        }
        pos += buf.length;
      }
      return buffer;
    };
    function byteLength(string, encoding) {
      if (Buffer2.isBuffer(string)) {
        return string.length;
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
      }
      if (typeof string !== "string") {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
        );
      }
      const len = string.length;
      const mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len === 0) return 0;
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len;
          case "utf8":
          case "utf-8":
            return utf8ToBytes(string).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len * 2;
          case "hex":
            return len >>> 1;
          case "base64":
            return base64ToBytes(string).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length;
            }
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer2.byteLength = byteLength;
    function slowToString(encoding, start, end) {
      let loweredCase = false;
      if (start === void 0 || start < 0) {
        start = 0;
      }
      if (start > this.length) {
        return "";
      }
      if (end === void 0 || end > this.length) {
        end = this.length;
      }
      if (end <= 0) {
        return "";
      }
      end >>>= 0;
      start >>>= 0;
      if (end <= start) {
        return "";
      }
      if (!encoding) encoding = "utf8";
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end);
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end);
          case "ascii":
            return asciiSlice(this, start, end);
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end);
          case "base64":
            return base64Slice(this, start, end);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer2.prototype._isBuffer = true;
    function swap(b, n, m) {
      const i = b[n];
      b[n] = b[m];
      b[m] = i;
    }
    Buffer2.prototype.swap16 = function swap16() {
      const len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (let i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this;
    };
    Buffer2.prototype.swap32 = function swap32() {
      const len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (let i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    };
    Buffer2.prototype.swap64 = function swap64() {
      const len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (let i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this;
    };
    Buffer2.prototype.toString = function toString() {
      const length = this.length;
      if (length === 0) return "";
      if (arguments.length === 0) return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
    Buffer2.prototype.equals = function equals(b) {
      if (!Buffer2.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
      if (this === b) return true;
      return Buffer2.compare(this, b) === 0;
    };
    Buffer2.prototype.inspect = function inspect() {
      let str = "";
      const max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      if (this.length > max) str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol) {
      Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
    }
    Buffer2.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer2.from(target, target.offset, target.byteLength);
      }
      if (!Buffer2.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
        );
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target) return 0;
      let x = thisEnd - thisStart;
      let y = end - start;
      const len = Math.min(x, y);
      const thisCopy = this.slice(thisStart, thisEnd);
      const targetCopy = target.slice(start, end);
      for (let i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      if (buffer.length === 0) return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
      }
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
      }
      if (typeof val === "string") {
        val = Buffer2.from(val, encoding);
      }
      if (Buffer2.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      let indexSize = 1;
      let arrLength = arr.length;
      let valLength = val.length;
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i2) {
        if (indexSize === 1) {
          return buf[i2];
        } else {
          return buf.readUInt16BE(i2 * indexSize);
        }
      }
      let i;
      if (dir) {
        let foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          let found = true;
          for (let j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
          }
          if (found) return i;
        }
      }
      return -1;
    }
    Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      const remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }
      const strLen = string.length;
      if (length > strLen / 2) {
        length = strLen / 2;
      }
      let i;
      for (i = 0; i < length; ++i) {
        const parsed = parseInt(string.substr(i * 2, 2), 16);
        if (numberIsNaN(parsed)) return i;
        buf[offset + i] = parsed;
      }
      return i;
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }
    Buffer2.prototype.write = function write(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === void 0) encoding = "utf8";
        } else {
          encoding = length;
          length = void 0;
        }
      } else {
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      }
      const remaining = this.length - offset;
      if (length === void 0 || length > remaining) length = remaining;
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding) encoding = "utf8";
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };
    Buffer2.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      const res = [];
      let i = start;
      while (i < end) {
        const firstByte = buf[i];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i + bytesPerSequence <= end) {
          let secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 192) === 128) {
                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    var MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      const len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
      }
      let res = "";
      let i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res;
    }
    function asciiSlice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 127);
      }
      return ret;
    }
    function latin1Slice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret;
    }
    function hexSlice(buf, start, end) {
      const len = buf.length;
      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;
      let out = "";
      for (let i = start; i < end; ++i) {
        out += hexSliceLookupTable[buf[i]];
      }
      return out;
    }
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end);
      let res = "";
      for (let i = 0; i < bytes.length - 1; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res;
    }
    Buffer2.prototype.slice = function slice(start, end) {
      const len = this.length;
      start = ~~start;
      end = end === void 0 ? len : ~~end;
      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }
      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }
      if (end < start) end = start;
      const newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer2.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
      if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      return val;
    };
    Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength2, this.length);
      }
      let val = this[offset + --byteLength2];
      let mul = 1;
      while (byteLength2 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength2] * mul;
      }
      return val;
    };
    Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer2.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
      const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
      return BigInt(lo) + (BigInt(hi) << BigInt(32));
    });
    Buffer2.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
      return (BigInt(hi) << BigInt(32)) + BigInt(lo);
    });
    Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let i = byteLength2;
      let mul = 1;
      let val = this[offset + --i];
      while (i > 0 && (mul *= 256)) {
        val += this[offset + --i] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128)) return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer2.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
      return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
    });
    Buffer2.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = (first << 24) + // Overflow
      this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
    });
    Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    };
    Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    };
    Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    };
    Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer2.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
    }
    Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let mul = 1;
      let i = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset + 3] = value >>> 24;
      this[offset + 2] = value >>> 16;
      this[offset + 1] = value >>> 8;
      this[offset] = value & 255;
      return offset + 4;
    };
    Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    function wrtBigUInt64LE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      return offset;
    }
    function wrtBigUInt64BE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset + 7] = lo;
      lo = lo >> 8;
      buf[offset + 6] = lo;
      lo = lo >> 8;
      buf[offset + 5] = lo;
      lo = lo >> 8;
      buf[offset + 4] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset + 3] = hi;
      hi = hi >> 8;
      buf[offset + 2] = hi;
      hi = hi >> 8;
      buf[offset + 1] = hi;
      hi = hi >> 8;
      buf[offset] = hi;
      return offset + 8;
    }
    Buffer2.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer2.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i = 0;
      let mul = 1;
      let sub = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      let sub = 0;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
      if (value < 0) value = 255 + value + 1;
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    };
    Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
      if (value < 0) value = 4294967295 + value + 1;
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    Buffer2.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    Buffer2.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
      if (offset < 0) throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    };
    Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    };
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    };
    Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    };
    Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer2.isBuffer(target)) throw new TypeError("argument should be a Buffer");
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;
      if (end === start) return 0;
      if (target.length === 0 || this.length === 0) return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
      if (end < 0) throw new RangeError("sourceEnd out of bounds");
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      const len = end - start;
      if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, end),
          targetStart
        );
      }
      return len;
    };
    Buffer2.prototype.fill = function fill2(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
          const code = val.charCodeAt(0);
          if (encoding === "utf8" && code < 128 || encoding === "latin1") {
            val = code;
          }
        }
      } else if (typeof val === "number") {
        val = val & 255;
      } else if (typeof val === "boolean") {
        val = Number(val);
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val) val = 0;
      let i;
      if (typeof val === "number") {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        const bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
        const len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }
      return this;
    };
    var errors = {};
    function E(sym, getMessage, Base) {
      errors[sym] = class NodeError extends Base {
        constructor() {
          super();
          Object.defineProperty(this, "message", {
            value: getMessage.apply(this, arguments),
            writable: true,
            configurable: true
          });
          this.name = `${this.name} [${sym}]`;
          this.stack;
          delete this.name;
        }
        get code() {
          return sym;
        }
        set code(value) {
          Object.defineProperty(this, "code", {
            configurable: true,
            enumerable: true,
            value,
            writable: true
          });
        }
        toString() {
          return `${this.name} [${sym}]: ${this.message}`;
        }
      };
    }
    E(
      "ERR_BUFFER_OUT_OF_BOUNDS",
      function(name) {
        if (name) {
          return `${name} is outside of buffer bounds`;
        }
        return "Attempt to access memory outside buffer bounds";
      },
      RangeError
    );
    E(
      "ERR_INVALID_ARG_TYPE",
      function(name, actual) {
        return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
      },
      TypeError
    );
    E(
      "ERR_OUT_OF_RANGE",
      function(str, range, input) {
        let msg = `The value of "${str}" is out of range.`;
        let received = input;
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input));
        } else if (typeof input === "bigint") {
          received = String(input);
          if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
            received = addNumericalSeparator(received);
          }
          received += "n";
        }
        msg += ` It must be ${range}. Received ${received}`;
        return msg;
      },
      RangeError
    );
    function addNumericalSeparator(val) {
      let res = "";
      let i = val.length;
      const start = val[0] === "-" ? 1 : 0;
      for (; i >= start + 4; i -= 3) {
        res = `_${val.slice(i - 3, i)}${res}`;
      }
      return `${val.slice(0, i)}${res}`;
    }
    function checkBounds(buf, offset, byteLength2) {
      validateNumber(offset, "offset");
      if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
        boundsError(offset, buf.length - (byteLength2 + 1));
      }
    }
    function checkIntBI(value, min, max, buf, offset, byteLength2) {
      if (value > max || value < min) {
        const n = typeof min === "bigint" ? "n" : "";
        let range;
        if (byteLength2 > 3) {
          if (min === 0 || min === BigInt(0)) {
            range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
          } else {
            range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
          }
        } else {
          range = `>= ${min}${n} and <= ${max}${n}`;
        }
        throw new errors.ERR_OUT_OF_RANGE("value", range, value);
      }
      checkBounds(buf, offset, byteLength2);
    }
    function validateNumber(value, name) {
      if (typeof value !== "number") {
        throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
      }
    }
    function boundsError(value, length, type) {
      if (Math.floor(value) !== value) {
        validateNumber(value, type);
        throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
      }
      if (length < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
      }
      throw new errors.ERR_OUT_OF_RANGE(
        type || "offset",
        `>= ${type ? 1 : 0} and <= ${length}`,
        value
      );
    }
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2) return "";
      while (str.length % 4 !== 0) {
        str = str + "=";
      }
      return str;
    }
    function utf8ToBytes(string, units) {
      units = units || Infinity;
      let codePoint;
      const length = string.length;
      let leadSurrogate = null;
      const bytes = [];
      for (let i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            } else if (i + 1 === length) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0) break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0) break;
          bytes.push(
            codePoint >> 6 | 192,
            codePoint & 63 | 128
          );
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0) break;
          bytes.push(
            codePoint >> 12 | 224,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0) break;
          bytes.push(
            codePoint >> 18 | 240,
            codePoint >> 12 & 63 | 128,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else {
          throw new Error("Invalid code point");
        }
      }
      return bytes;
    }
    function asciiToBytes(str) {
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 255);
      }
      return byteArray;
    }
    function utf16leToBytes(str, units) {
      let c, hi, lo;
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src, dst, offset, length) {
      let i;
      for (i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length) break;
        dst[i + offset] = src[i];
      }
      return i;
    }
    function isInstance(obj, type) {
      return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    var hexSliceLookupTable = (function() {
      const alphabet = "0123456789abcdef";
      const table = new Array(256);
      for (let i = 0; i < 16; ++i) {
        const i162 = i * 16;
        for (let j = 0; j < 16; ++j) {
          table[i162 + j] = alphabet[i] + alphabet[j];
        }
      }
      return table;
    })();
    function defineBigIntMethod(fn) {
      return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
    }
    function BufferBigIntNotDefined() {
      throw new Error("BigInt not supported");
    }
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/nanoassert/index.js
var require_nanoassert = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/nanoassert/index.js"(exports, module) {
    module.exports = assert;
    var AssertionError = class extends Error {
    };
    AssertionError.prototype.name = "AssertionError";
    function assert(t, m) {
      if (!t) {
        var err2 = new AssertionError(m);
        if (Error.captureStackTrace) Error.captureStackTrace(err2, assert);
        throw err2;
      }
    }
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/lib/ascii.js
var require_ascii = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/lib/ascii.js"(exports, module) {
    function byteLength(string) {
      return string.length;
    }
    function toString(buffer) {
      const len = buffer.byteLength;
      let result = "";
      for (let i = 0; i < len; i++) {
        result += String.fromCharCode(buffer[i] & 127);
      }
      return result;
    }
    function write(buffer, string) {
      const len = buffer.byteLength;
      for (let i = 0; i < len; i++) {
        buffer[i] = string.charCodeAt(i);
      }
      return len;
    }
    module.exports = {
      byteLength,
      toString,
      write
    };
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/lib/base64.js
var require_base64 = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/lib/base64.js"(exports, module) {
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var codes = new Uint8Array(256);
    for (let i = 0; i < alphabet.length; i++) {
      codes[alphabet.charCodeAt(i)] = i;
    }
    codes[
      /* - */
      45
    ] = 62;
    codes[
      /* _ */
      95
    ] = 63;
    function byteLength(string) {
      let len = string.length;
      if (string.charCodeAt(len - 1) === 61) len--;
      if (len > 1 && string.charCodeAt(len - 1) === 61) len--;
      return len * 3 >>> 2;
    }
    function toString(buffer) {
      const len = buffer.byteLength;
      let result = "";
      for (let i = 0; i < len; i += 3) {
        result += alphabet[buffer[i] >> 2] + alphabet[(buffer[i] & 3) << 4 | buffer[i + 1] >> 4] + alphabet[(buffer[i + 1] & 15) << 2 | buffer[i + 2] >> 6] + alphabet[buffer[i + 2] & 63];
      }
      if (len % 3 === 2) {
        result = result.substring(0, result.length - 1) + "=";
      } else if (len % 3 === 1) {
        result = result.substring(0, result.length - 2) + "==";
      }
      return result;
    }
    function write(buffer, string) {
      const len = buffer.byteLength;
      for (let i = 0, j = 0; j < len; i += 4) {
        const a = codes[string.charCodeAt(i)];
        const b = codes[string.charCodeAt(i + 1)];
        const c = codes[string.charCodeAt(i + 2)];
        const d = codes[string.charCodeAt(i + 3)];
        buffer[j++] = a << 2 | b >> 4;
        buffer[j++] = (b & 15) << 4 | c >> 2;
        buffer[j++] = (c & 3) << 6 | d & 63;
      }
      return len;
    }
    module.exports = {
      byteLength,
      toString,
      write
    };
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/lib/hex.js
var require_hex = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/lib/hex.js"(exports, module) {
    function byteLength(string) {
      return string.length >>> 1;
    }
    function toString(buffer) {
      const len = buffer.byteLength;
      buffer = new DataView(buffer.buffer, buffer.byteOffset, len);
      let result = "";
      let i = 0;
      for (let n = len - len % 4; i < n; i += 4) {
        result += buffer.getUint32(i).toString(16).padStart(8, "0");
      }
      for (; i < len; i++) {
        result += buffer.getUint8(i).toString(16).padStart(2, "0");
      }
      return result;
    }
    function write(buffer, string) {
      const len = buffer.byteLength;
      for (let i = 0; i < len; i++) {
        const a = hexValue(string.charCodeAt(i * 2));
        const b = hexValue(string.charCodeAt(i * 2 + 1));
        if (a === void 0 || b === void 0) {
          return i;
        }
        buffer[i] = a << 4 | b;
      }
      return len;
    }
    module.exports = {
      byteLength,
      toString,
      write
    };
    function hexValue(char) {
      if (char >= 48 && char <= 57) return char - 48;
      if (char >= 65 && char <= 70) return char - 65 + 10;
      if (char >= 97 && char <= 102) return char - 97 + 10;
    }
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/lib/latin1.js
var require_latin1 = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/lib/latin1.js"(exports, module) {
    function byteLength(string) {
      return string.length;
    }
    function toString(buffer) {
      const len = buffer.byteLength;
      let result = "";
      for (let i = 0; i < len; i++) {
        result += String.fromCharCode(buffer[i]);
      }
      return result;
    }
    function write(buffer, string) {
      const len = buffer.byteLength;
      for (let i = 0; i < len; i++) {
        buffer[i] = string.charCodeAt(i);
      }
      return len;
    }
    module.exports = {
      byteLength,
      toString,
      write
    };
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/lib/utf8.js
var require_utf8 = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/lib/utf8.js"(exports, module) {
    function byteLength(string) {
      let length = 0;
      for (let i = 0, n = string.length; i < n; i++) {
        const code = string.charCodeAt(i);
        if (code >= 55296 && code <= 56319 && i + 1 < n) {
          const code2 = string.charCodeAt(i + 1);
          if (code2 >= 56320 && code2 <= 57343) {
            length += 4;
            i++;
            continue;
          }
        }
        if (code <= 127) length += 1;
        else if (code <= 2047) length += 2;
        else length += 3;
      }
      return length;
    }
    var toString;
    if (typeof TextDecoder !== "undefined") {
      const decoder = new TextDecoder();
      toString = function toString2(buffer) {
        return decoder.decode(buffer);
      };
    } else {
      toString = function toString2(buffer) {
        const len = buffer.byteLength;
        let output = "";
        let i = 0;
        while (i < len) {
          let byte = buffer[i];
          if (byte <= 127) {
            output += String.fromCharCode(byte);
            i++;
            continue;
          }
          let bytesNeeded = 0;
          let codePoint = 0;
          if (byte <= 223) {
            bytesNeeded = 1;
            codePoint = byte & 31;
          } else if (byte <= 239) {
            bytesNeeded = 2;
            codePoint = byte & 15;
          } else if (byte <= 244) {
            bytesNeeded = 3;
            codePoint = byte & 7;
          }
          if (len - i - bytesNeeded > 0) {
            let k = 0;
            while (k < bytesNeeded) {
              byte = buffer[i + k + 1];
              codePoint = codePoint << 6 | byte & 63;
              k += 1;
            }
          } else {
            codePoint = 65533;
            bytesNeeded = len - i;
          }
          output += String.fromCodePoint(codePoint);
          i += bytesNeeded + 1;
        }
        return output;
      };
    }
    var write;
    if (typeof TextEncoder !== "undefined") {
      const encoder = new TextEncoder();
      write = function write2(buffer, string) {
        return encoder.encodeInto(string, buffer).written;
      };
    } else {
      write = function write2(buffer, string) {
        const len = buffer.byteLength;
        let i = 0;
        let j = 0;
        while (i < string.length) {
          const code = string.codePointAt(i);
          if (code <= 127) {
            if (j + 1 > len) break;
            buffer[j++] = code;
            i++;
            continue;
          }
          let count = 0;
          let bits = 0;
          if (code <= 2047) {
            count = 6;
            bits = 192;
          } else if (code <= 65535) {
            count = 12;
            bits = 224;
          } else if (code <= 2097151) {
            count = 18;
            bits = 240;
          }
          if (j + count / 6 + 1 > len) break;
          buffer[j++] = bits | code >> count;
          count -= 6;
          while (count >= 0) {
            buffer[j++] = 128 | code >> count & 63;
            count -= 6;
          }
          i += code >= 65536 ? 2 : 1;
        }
        return j;
      };
    }
    module.exports = {
      byteLength,
      toString,
      write
    };
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/lib/utf16le.js
var require_utf16le = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/lib/utf16le.js"(exports, module) {
    function byteLength(string) {
      return string.length * 2;
    }
    function toString(buffer) {
      const len = buffer.byteLength;
      let result = "";
      for (let i = 0; i < len - 1; i += 2) {
        result += String.fromCharCode(buffer[i] + buffer[i + 1] * 256);
      }
      return result;
    }
    function write(buffer, string) {
      const len = buffer.byteLength;
      let units = len;
      for (let i = 0; i < string.length; ++i) {
        if ((units -= 2) < 0) break;
        const c = string.charCodeAt(i);
        const hi = c >> 8;
        const lo = c % 256;
        buffer[i * 2] = lo;
        buffer[i * 2 + 1] = hi;
      }
      return len;
    }
    module.exports = {
      byteLength,
      toString,
      write
    };
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/browser.js
var require_browser = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/b4a/browser.js"(exports, module) {
    var ascii = require_ascii();
    var base64 = require_base64();
    var hex = require_hex();
    var latin1 = require_latin1();
    var utf8 = require_utf8();
    var utf16le = require_utf16le();
    var LE = new Uint8Array(Uint16Array.of(255).buffer)[0] === 255;
    function codecFor(encoding) {
      switch (encoding) {
        case "ascii":
          return ascii;
        case "base64":
          return base64;
        case "hex":
          return hex;
        case "binary":
        case "latin1":
          return latin1;
        case "utf8":
        case "utf-8":
        case void 0:
        case null:
          return utf8;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return utf16le;
        default:
          throw new Error(`Unknown encoding '${encoding}'`);
      }
    }
    function isBuffer(value) {
      return value instanceof Uint8Array;
    }
    function isEncoding(encoding) {
      try {
        codecFor(encoding);
        return true;
      } catch {
        return false;
      }
    }
    function alloc(size, fill3, encoding) {
      const buffer = new Uint8Array(size);
      if (fill3 !== void 0) {
        exports.fill(buffer, fill3, 0, buffer.byteLength, encoding);
      }
      return buffer;
    }
    function allocUnsafe(size) {
      return new Uint8Array(size);
    }
    function allocUnsafeSlow(size) {
      return new Uint8Array(size);
    }
    function byteLength(string, encoding) {
      return codecFor(encoding).byteLength(string);
    }
    function compare(a, b) {
      if (a === b) return 0;
      const len = Math.min(a.byteLength, b.byteLength);
      a = new DataView(a.buffer, a.byteOffset, a.byteLength);
      b = new DataView(b.buffer, b.byteOffset, b.byteLength);
      let i = 0;
      for (let n = len - len % 4; i < n; i += 4) {
        const x = a.getUint32(i, LE);
        const y = b.getUint32(i, LE);
        if (x !== y) break;
      }
      for (; i < len; i++) {
        const x = a.getUint8(i);
        const y = b.getUint8(i);
        if (x < y) return -1;
        if (x > y) return 1;
      }
      return a.byteLength > b.byteLength ? 1 : a.byteLength < b.byteLength ? -1 : 0;
    }
    function concat(buffers, length) {
      if (length === void 0) {
        length = buffers.reduce((len, buffer) => len + buffer.byteLength, 0);
      }
      const result = new Uint8Array(length);
      let offset = 0;
      for (const buffer of buffers) {
        if (offset + buffer.byteLength > result.byteLength) {
          result.set(buffer.subarray(0, result.byteLength - offset), offset);
          return result;
        }
        result.set(buffer, offset);
        offset += buffer.byteLength;
      }
      return result;
    }
    function copy(source, target, targetStart = 0, sourceStart = 0, sourceEnd = source.byteLength) {
      if (targetStart < 0) targetStart = 0;
      if (targetStart >= target.byteLength) return 0;
      const targetLength = target.byteLength - targetStart;
      if (sourceStart < 0) sourceStart = 0;
      if (sourceStart >= source.byteLength) return 0;
      if (sourceEnd <= sourceStart) return 0;
      if (sourceEnd > source.byteLength) sourceEnd = source.byteLength;
      if (sourceEnd - sourceStart > targetLength) {
        sourceEnd = sourceStart + targetLength;
      }
      const sourceLength = sourceEnd - sourceStart;
      if (source === target) {
        target.copyWithin(targetStart, sourceStart, sourceEnd);
      } else {
        if (sourceStart !== 0 || sourceEnd !== source.byteLength) {
          source = source.subarray(sourceStart, sourceEnd);
        }
        target.set(source, targetStart);
      }
      return sourceLength;
    }
    function equals(a, b) {
      if (a === b) return true;
      if (a.byteLength !== b.byteLength) return false;
      return compare(a, b) === 0;
    }
    function fill2(buffer, value, offset = 0, end = buffer.byteLength, encoding = "utf8") {
      if (typeof value === "string") {
        if (typeof offset === "string") {
          encoding = offset;
          offset = 0;
          end = buffer.byteLength;
        } else if (typeof end === "string") {
          encoding = end;
          end = buffer.byteLength;
        }
      } else if (typeof value === "number") {
        value = value & 255;
      } else if (typeof value === "boolean") {
        value = +value;
      }
      if (offset < 0) offset = 0;
      if (offset >= buffer.byteLength) return buffer;
      if (end <= offset) return buffer;
      if (end > buffer.byteLength) end = buffer.byteLength;
      if (typeof value === "number") return buffer.fill(value, offset, end);
      if (typeof value === "string") value = exports.from(value, encoding);
      const len = value.byteLength;
      for (let i = 0, n = end - offset; i < n; ++i) {
        buffer[i + offset] = value[i % len];
      }
      return buffer;
    }
    function from(value, encodingOrOffset, length) {
      if (typeof value === "string") return fromString(value, encodingOrOffset);
      if (Array.isArray(value)) return fromArray(value);
      if (ArrayBuffer.isView(value)) return fromBuffer(value);
      return fromArrayBuffer(value, encodingOrOffset, length);
    }
    function fromString(string, encoding) {
      const codec = codecFor(encoding);
      const buffer = new Uint8Array(codec.byteLength(string));
      codec.write(buffer, string);
      return buffer;
    }
    function fromArray(array) {
      const buffer = new Uint8Array(array.length);
      buffer.set(array);
      return buffer;
    }
    function fromBuffer(buffer) {
      const copy2 = new Uint8Array(buffer.byteLength);
      copy2.set(buffer);
      return copy2;
    }
    function fromArrayBuffer(arrayBuffer, byteOffset, length) {
      return new Uint8Array(arrayBuffer, byteOffset, length);
    }
    function includes(buffer, value, byteOffset, encoding) {
      return indexOf(buffer, value, byteOffset, encoding) !== -1;
    }
    function indexOf(buffer, value, byteOffset, encoding) {
      return bidirectionalIndexOf(
        buffer,
        value,
        byteOffset,
        encoding,
        true
        /* first */
      );
    }
    function lastIndexOf(buffer, value, byteOffset, encoding) {
      return bidirectionalIndexOf(
        buffer,
        value,
        byteOffset,
        encoding,
        false
        /* last */
      );
    }
    function bidirectionalIndexOf(buffer, value, byteOffset, encoding, first) {
      if (buffer.byteLength === 0) return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset === void 0) {
        byteOffset = first ? 0 : buffer.length - 1;
      } else if (byteOffset < 0) {
        byteOffset += buffer.byteLength;
      }
      if (byteOffset >= buffer.byteLength) {
        if (first) return -1;
        else byteOffset = buffer.byteLength - 1;
      } else if (byteOffset < 0) {
        if (first) byteOffset = 0;
        else return -1;
      }
      if (typeof value === "string") {
        value = from(value, encoding);
      } else if (typeof value === "number") {
        value = value & 255;
        if (first) {
          return buffer.indexOf(value, byteOffset);
        } else {
          return buffer.lastIndexOf(value, byteOffset);
        }
      }
      if (value.byteLength === 0) return -1;
      if (first) {
        let foundIndex = -1;
        for (let i = byteOffset; i < buffer.byteLength; i++) {
          if (buffer[i] === value[foundIndex === -1 ? 0 : i - foundIndex]) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === value.byteLength) return foundIndex;
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + value.byteLength > buffer.byteLength) {
          byteOffset = buffer.byteLength - value.byteLength;
        }
        for (let i = byteOffset; i >= 0; i--) {
          let found = true;
          for (let j = 0; j < value.byteLength; j++) {
            if (buffer[i + j] !== value[j]) {
              found = false;
              break;
            }
          }
          if (found) return i;
        }
      }
      return -1;
    }
    function swap(buffer, n, m) {
      const i = buffer[n];
      buffer[n] = buffer[m];
      buffer[m] = i;
    }
    function swap16(buffer) {
      const len = buffer.byteLength;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (let i = 0; i < len; i += 2) swap(buffer, i, i + 1);
      return buffer;
    }
    function swap32(buffer) {
      const len = buffer.byteLength;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (let i = 0; i < len; i += 4) {
        swap(buffer, i, i + 3);
        swap(buffer, i + 1, i + 2);
      }
      return buffer;
    }
    function swap64(buffer) {
      const len = buffer.byteLength;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (let i = 0; i < len; i += 8) {
        swap(buffer, i, i + 7);
        swap(buffer, i + 1, i + 6);
        swap(buffer, i + 2, i + 5);
        swap(buffer, i + 3, i + 4);
      }
      return buffer;
    }
    function toBuffer(buffer) {
      return buffer;
    }
    function toString(buffer, encoding = "utf8", start = 0, end = buffer.byteLength) {
      if (arguments.length === 1) return utf8.toString(buffer);
      if (arguments.length === 2) return codecFor(encoding).toString(buffer);
      if (start < 0) start = 0;
      if (start >= buffer.byteLength) return "";
      if (end <= start) return "";
      if (end > buffer.byteLength) end = buffer.byteLength;
      if (start !== 0 || end !== buffer.byteLength) {
        buffer = buffer.subarray(start, end);
      }
      return codecFor(encoding).toString(buffer);
    }
    function toHex(buffer, start, end) {
      return toString(buffer, "hex", start, end);
    }
    function write(buffer, string, offset = 0, length = buffer.byteLength, encoding) {
      if (arguments.length === 2) return utf8.write(buffer, string);
      if (typeof offset === "string") {
        encoding = offset;
        offset = 0;
        length = buffer.byteLength;
      } else if (typeof length === "string") {
        encoding = length;
        length = buffer.byteLength - offset;
      }
      length = Math.min(length, exports.byteLength(string, encoding));
      let start = offset;
      if (start < 0) start = 0;
      if (start >= buffer.byteLength) return 0;
      let end = offset + length;
      if (end <= start) return 0;
      if (end > buffer.byteLength) end = buffer.byteLength;
      if (start !== 0 || end !== buffer.byteLength) {
        buffer = buffer.subarray(start, end);
      }
      return codecFor(encoding).write(buffer, string);
    }
    function readDoubleBE(buffer, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      return view.getFloat64(offset, false);
    }
    function readDoubleLE(buffer, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      return view.getFloat64(offset, true);
    }
    function readFloatBE(buffer, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      return view.getFloat32(offset, false);
    }
    function readFloatLE(buffer, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      return view.getFloat32(offset, true);
    }
    function readInt32BE(buffer, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      return view.getInt32(offset, false);
    }
    function readInt32LE(buffer, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      return view.getInt32(offset, true);
    }
    function readUInt32BE(buffer, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      return view.getUint32(offset, false);
    }
    function readUInt32LE(buffer, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      return view.getUint32(offset, true);
    }
    function writeDoubleBE(buffer, value, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      view.setFloat64(offset, value, false);
      return offset + 8;
    }
    function writeDoubleLE(buffer, value, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      view.setFloat64(offset, value, true);
      return offset + 8;
    }
    function writeFloatBE(buffer, value, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      view.setFloat32(offset, value, false);
      return offset + 4;
    }
    function writeFloatLE(buffer, value, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      view.setFloat32(offset, value, true);
      return offset + 4;
    }
    function writeInt32BE(buffer, value, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      view.setInt32(offset, value, false);
      return offset + 4;
    }
    function writeInt32LE(buffer, value, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      view.setInt32(offset, value, true);
      return offset + 4;
    }
    function writeUInt32BE(buffer, value, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      view.setUint32(offset, value, false);
      return offset + 4;
    }
    function writeUInt32LE(buffer, value, offset = 0) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      view.setUint32(offset, value, true);
      return offset + 4;
    }
    module.exports = exports = {
      isBuffer,
      isEncoding,
      alloc,
      allocUnsafe,
      allocUnsafeSlow,
      byteLength,
      compare,
      concat,
      copy,
      equals,
      fill: fill2,
      from,
      includes,
      indexOf,
      lastIndexOf,
      swap16,
      swap32,
      swap64,
      toBuffer,
      toString,
      toHex,
      write,
      readDoubleBE,
      readDoubleLE,
      readFloatBE,
      readFloatLE,
      readInt32BE,
      readInt32LE,
      readUInt32BE,
      readUInt32LE,
      writeDoubleBE,
      writeDoubleLE,
      writeFloatBE,
      writeFloatLE,
      writeInt32BE,
      writeInt32LE,
      writeUInt32BE,
      writeUInt32LE
    };
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/blake2b-wasm/blake2b.js
var require_blake2b = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/blake2b-wasm/blake2b.js"(exports, module) {
    var __commonJS2 = (cb, mod) => function __require() {
      return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    };
    var __toBinary = /* @__PURE__ */ (() => {
      var table = new Uint8Array(128);
      for (var i = 0; i < 64; i++)
        table[i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i * 4 - 205] = i;
      return (base64) => {
        var n = base64.length, bytes2 = new Uint8Array((n - (base64[n - 1] == "=") - (base64[n - 2] == "=")) * 3 / 4 | 0);
        for (var i2 = 0, j = 0; i2 < n; ) {
          var c0 = table[base64.charCodeAt(i2++)], c1 = table[base64.charCodeAt(i2++)];
          var c2 = table[base64.charCodeAt(i2++)], c3 = table[base64.charCodeAt(i2++)];
          bytes2[j++] = c0 << 2 | c1 >> 4;
          bytes2[j++] = c1 << 4 | c2 >> 2;
          bytes2[j++] = c2 << 6 | c3;
        }
        return bytes2;
      };
    })();
    var require_blake2b3 = __commonJS2({
      "wasm-binary:./blake2b.wat"(exports2, module2) {
        module2.exports = __toBinary("AGFzbQEAAAABEANgAn9/AGADf39/AGABfwADBQQAAQICBQUBAQroBwdNBQZtZW1vcnkCAAxibGFrZTJiX2luaXQAAA5ibGFrZTJiX3VwZGF0ZQABDWJsYWtlMmJfZmluYWwAAhBibGFrZTJiX2NvbXByZXNzAAMKvz8EwAIAIABCADcDACAAQgA3AwggAEIANwMQIABCADcDGCAAQgA3AyAgAEIANwMoIABCADcDMCAAQgA3AzggAEIANwNAIABCADcDSCAAQgA3A1AgAEIANwNYIABCADcDYCAAQgA3A2ggAEIANwNwIABCADcDeCAAQoiS853/zPmE6gBBACkDAIU3A4ABIABCu86qptjQ67O7f0EIKQMAhTcDiAEgAEKr8NP0r+68tzxBECkDAIU3A5ABIABC8e30+KWn/aelf0EYKQMAhTcDmAEgAELRhZrv+s+Uh9EAQSApAwCFNwOgASAAQp/Y+dnCkdqCm39BKCkDAIU3A6gBIABC6/qG2r+19sEfQTApAwCFNwOwASAAQvnC+JuRo7Pw2wBBOCkDAIU3A7gBIABCADcDwAEgAEIANwPIASAAQgA3A9ABC20BA38gAEHAAWohAyAAQcgBaiEEIAQpAwCnIQUCQANAIAEgAkYNASAFQYABRgRAIAMgAykDACAFrXw3AwBBACEFIAAQAwsgACAFaiABLQAAOgAAIAVBAWohBSABQQFqIQEMAAsLIAQgBa03AwALYQEDfyAAQcABaiEBIABByAFqIQIgASABKQMAIAIpAwB8NwMAIABCfzcD0AEgAikDAKchAwJAA0AgA0GAAUYNASAAIANqQQA6AAAgA0EBaiEDDAALCyACIAOtNwMAIAAQAwuqOwIgfgl/IABBgAFqISEgAEGIAWohIiAAQZABaiEjIABBmAFqISQgAEGgAWohJSAAQagBaiEmIABBsAFqIScgAEG4AWohKCAhKQMAIQEgIikDACECICMpAwAhAyAkKQMAIQQgJSkDACEFICYpAwAhBiAnKQMAIQcgKCkDACEIQoiS853/zPmE6gAhCUK7zqqm2NDrs7t/IQpCq/DT9K/uvLc8IQtC8e30+KWn/aelfyEMQtGFmu/6z5SH0QAhDUKf2PnZwpHagpt/IQ5C6/qG2r+19sEfIQ9C+cL4m5Gjs/DbACEQIAApAwAhESAAKQMIIRIgACkDECETIAApAxghFCAAKQMgIRUgACkDKCEWIAApAzAhFyAAKQM4IRggACkDQCEZIAApA0ghGiAAKQNQIRsgACkDWCEcIAApA2AhHSAAKQNoIR4gACkDcCEfIAApA3ghICANIAApA8ABhSENIA8gACkD0AGFIQ8gASAFIBF8fCEBIA0gAYVCIIohDSAJIA18IQkgBSAJhUIYiiEFIAEgBSASfHwhASANIAGFQhCKIQ0gCSANfCEJIAUgCYVCP4ohBSACIAYgE3x8IQIgDiAChUIgiiEOIAogDnwhCiAGIAqFQhiKIQYgAiAGIBR8fCECIA4gAoVCEIohDiAKIA58IQogBiAKhUI/iiEGIAMgByAVfHwhAyAPIAOFQiCKIQ8gCyAPfCELIAcgC4VCGIohByADIAcgFnx8IQMgDyADhUIQiiEPIAsgD3whCyAHIAuFQj+KIQcgBCAIIBd8fCEEIBAgBIVCIIohECAMIBB8IQwgCCAMhUIYiiEIIAQgCCAYfHwhBCAQIASFQhCKIRAgDCAQfCEMIAggDIVCP4ohCCABIAYgGXx8IQEgECABhUIgiiEQIAsgEHwhCyAGIAuFQhiKIQYgASAGIBp8fCEBIBAgAYVCEIohECALIBB8IQsgBiALhUI/iiEGIAIgByAbfHwhAiANIAKFQiCKIQ0gDCANfCEMIAcgDIVCGIohByACIAcgHHx8IQIgDSAChUIQiiENIAwgDXwhDCAHIAyFQj+KIQcgAyAIIB18fCEDIA4gA4VCIIohDiAJIA58IQkgCCAJhUIYiiEIIAMgCCAefHwhAyAOIAOFQhCKIQ4gCSAOfCEJIAggCYVCP4ohCCAEIAUgH3x8IQQgDyAEhUIgiiEPIAogD3whCiAFIAqFQhiKIQUgBCAFICB8fCEEIA8gBIVCEIohDyAKIA98IQogBSAKhUI/iiEFIAEgBSAffHwhASANIAGFQiCKIQ0gCSANfCEJIAUgCYVCGIohBSABIAUgG3x8IQEgDSABhUIQiiENIAkgDXwhCSAFIAmFQj+KIQUgAiAGIBV8fCECIA4gAoVCIIohDiAKIA58IQogBiAKhUIYiiEGIAIgBiAZfHwhAiAOIAKFQhCKIQ4gCiAOfCEKIAYgCoVCP4ohBiADIAcgGnx8IQMgDyADhUIgiiEPIAsgD3whCyAHIAuFQhiKIQcgAyAHICB8fCEDIA8gA4VCEIohDyALIA98IQsgByALhUI/iiEHIAQgCCAefHwhBCAQIASFQiCKIRAgDCAQfCEMIAggDIVCGIohCCAEIAggF3x8IQQgECAEhUIQiiEQIAwgEHwhDCAIIAyFQj+KIQggASAGIBJ8fCEBIBAgAYVCIIohECALIBB8IQsgBiALhUIYiiEGIAEgBiAdfHwhASAQIAGFQhCKIRAgCyAQfCELIAYgC4VCP4ohBiACIAcgEXx8IQIgDSAChUIgiiENIAwgDXwhDCAHIAyFQhiKIQcgAiAHIBN8fCECIA0gAoVCEIohDSAMIA18IQwgByAMhUI/iiEHIAMgCCAcfHwhAyAOIAOFQiCKIQ4gCSAOfCEJIAggCYVCGIohCCADIAggGHx8IQMgDiADhUIQiiEOIAkgDnwhCSAIIAmFQj+KIQggBCAFIBZ8fCEEIA8gBIVCIIohDyAKIA98IQogBSAKhUIYiiEFIAQgBSAUfHwhBCAPIASFQhCKIQ8gCiAPfCEKIAUgCoVCP4ohBSABIAUgHHx8IQEgDSABhUIgiiENIAkgDXwhCSAFIAmFQhiKIQUgASAFIBl8fCEBIA0gAYVCEIohDSAJIA18IQkgBSAJhUI/iiEFIAIgBiAdfHwhAiAOIAKFQiCKIQ4gCiAOfCEKIAYgCoVCGIohBiACIAYgEXx8IQIgDiAChUIQiiEOIAogDnwhCiAGIAqFQj+KIQYgAyAHIBZ8fCEDIA8gA4VCIIohDyALIA98IQsgByALhUIYiiEHIAMgByATfHwhAyAPIAOFQhCKIQ8gCyAPfCELIAcgC4VCP4ohByAEIAggIHx8IQQgECAEhUIgiiEQIAwgEHwhDCAIIAyFQhiKIQggBCAIIB58fCEEIBAgBIVCEIohECAMIBB8IQwgCCAMhUI/iiEIIAEgBiAbfHwhASAQIAGFQiCKIRAgCyAQfCELIAYgC4VCGIohBiABIAYgH3x8IQEgECABhUIQiiEQIAsgEHwhCyAGIAuFQj+KIQYgAiAHIBR8fCECIA0gAoVCIIohDSAMIA18IQwgByAMhUIYiiEHIAIgByAXfHwhAiANIAKFQhCKIQ0gDCANfCEMIAcgDIVCP4ohByADIAggGHx8IQMgDiADhUIgiiEOIAkgDnwhCSAIIAmFQhiKIQggAyAIIBJ8fCEDIA4gA4VCEIohDiAJIA58IQkgCCAJhUI/iiEIIAQgBSAafHwhBCAPIASFQiCKIQ8gCiAPfCEKIAUgCoVCGIohBSAEIAUgFXx8IQQgDyAEhUIQiiEPIAogD3whCiAFIAqFQj+KIQUgASAFIBh8fCEBIA0gAYVCIIohDSAJIA18IQkgBSAJhUIYiiEFIAEgBSAafHwhASANIAGFQhCKIQ0gCSANfCEJIAUgCYVCP4ohBSACIAYgFHx8IQIgDiAChUIgiiEOIAogDnwhCiAGIAqFQhiKIQYgAiAGIBJ8fCECIA4gAoVCEIohDiAKIA58IQogBiAKhUI/iiEGIAMgByAefHwhAyAPIAOFQiCKIQ8gCyAPfCELIAcgC4VCGIohByADIAcgHXx8IQMgDyADhUIQiiEPIAsgD3whCyAHIAuFQj+KIQcgBCAIIBx8fCEEIBAgBIVCIIohECAMIBB8IQwgCCAMhUIYiiEIIAQgCCAffHwhBCAQIASFQhCKIRAgDCAQfCEMIAggDIVCP4ohCCABIAYgE3x8IQEgECABhUIgiiEQIAsgEHwhCyAGIAuFQhiKIQYgASAGIBd8fCEBIBAgAYVCEIohECALIBB8IQsgBiALhUI/iiEGIAIgByAWfHwhAiANIAKFQiCKIQ0gDCANfCEMIAcgDIVCGIohByACIAcgG3x8IQIgDSAChUIQiiENIAwgDXwhDCAHIAyFQj+KIQcgAyAIIBV8fCEDIA4gA4VCIIohDiAJIA58IQkgCCAJhUIYiiEIIAMgCCARfHwhAyAOIAOFQhCKIQ4gCSAOfCEJIAggCYVCP4ohCCAEIAUgIHx8IQQgDyAEhUIgiiEPIAogD3whCiAFIAqFQhiKIQUgBCAFIBl8fCEEIA8gBIVCEIohDyAKIA98IQogBSAKhUI/iiEFIAEgBSAafHwhASANIAGFQiCKIQ0gCSANfCEJIAUgCYVCGIohBSABIAUgEXx8IQEgDSABhUIQiiENIAkgDXwhCSAFIAmFQj+KIQUgAiAGIBZ8fCECIA4gAoVCIIohDiAKIA58IQogBiAKhUIYiiEGIAIgBiAYfHwhAiAOIAKFQhCKIQ4gCiAOfCEKIAYgCoVCP4ohBiADIAcgE3x8IQMgDyADhUIgiiEPIAsgD3whCyAHIAuFQhiKIQcgAyAHIBV8fCEDIA8gA4VCEIohDyALIA98IQsgByALhUI/iiEHIAQgCCAbfHwhBCAQIASFQiCKIRAgDCAQfCEMIAggDIVCGIohCCAEIAggIHx8IQQgECAEhUIQiiEQIAwgEHwhDCAIIAyFQj+KIQggASAGIB98fCEBIBAgAYVCIIohECALIBB8IQsgBiALhUIYiiEGIAEgBiASfHwhASAQIAGFQhCKIRAgCyAQfCELIAYgC4VCP4ohBiACIAcgHHx8IQIgDSAChUIgiiENIAwgDXwhDCAHIAyFQhiKIQcgAiAHIB18fCECIA0gAoVCEIohDSAMIA18IQwgByAMhUI/iiEHIAMgCCAXfHwhAyAOIAOFQiCKIQ4gCSAOfCEJIAggCYVCGIohCCADIAggGXx8IQMgDiADhUIQiiEOIAkgDnwhCSAIIAmFQj+KIQggBCAFIBR8fCEEIA8gBIVCIIohDyAKIA98IQogBSAKhUIYiiEFIAQgBSAefHwhBCAPIASFQhCKIQ8gCiAPfCEKIAUgCoVCP4ohBSABIAUgE3x8IQEgDSABhUIgiiENIAkgDXwhCSAFIAmFQhiKIQUgASAFIB18fCEBIA0gAYVCEIohDSAJIA18IQkgBSAJhUI/iiEFIAIgBiAXfHwhAiAOIAKFQiCKIQ4gCiAOfCEKIAYgCoVCGIohBiACIAYgG3x8IQIgDiAChUIQiiEOIAogDnwhCiAGIAqFQj+KIQYgAyAHIBF8fCEDIA8gA4VCIIohDyALIA98IQsgByALhUIYiiEHIAMgByAcfHwhAyAPIAOFQhCKIQ8gCyAPfCELIAcgC4VCP4ohByAEIAggGXx8IQQgECAEhUIgiiEQIAwgEHwhDCAIIAyFQhiKIQggBCAIIBR8fCEEIBAgBIVCEIohECAMIBB8IQwgCCAMhUI/iiEIIAEgBiAVfHwhASAQIAGFQiCKIRAgCyAQfCELIAYgC4VCGIohBiABIAYgHnx8IQEgECABhUIQiiEQIAsgEHwhCyAGIAuFQj+KIQYgAiAHIBh8fCECIA0gAoVCIIohDSAMIA18IQwgByAMhUIYiiEHIAIgByAWfHwhAiANIAKFQhCKIQ0gDCANfCEMIAcgDIVCP4ohByADIAggIHx8IQMgDiADhUIgiiEOIAkgDnwhCSAIIAmFQhiKIQggAyAIIB98fCEDIA4gA4VCEIohDiAJIA58IQkgCCAJhUI/iiEIIAQgBSASfHwhBCAPIASFQiCKIQ8gCiAPfCEKIAUgCoVCGIohBSAEIAUgGnx8IQQgDyAEhUIQiiEPIAogD3whCiAFIAqFQj+KIQUgASAFIB18fCEBIA0gAYVCIIohDSAJIA18IQkgBSAJhUIYiiEFIAEgBSAWfHwhASANIAGFQhCKIQ0gCSANfCEJIAUgCYVCP4ohBSACIAYgEnx8IQIgDiAChUIgiiEOIAogDnwhCiAGIAqFQhiKIQYgAiAGICB8fCECIA4gAoVCEIohDiAKIA58IQogBiAKhUI/iiEGIAMgByAffHwhAyAPIAOFQiCKIQ8gCyAPfCELIAcgC4VCGIohByADIAcgHnx8IQMgDyADhUIQiiEPIAsgD3whCyAHIAuFQj+KIQcgBCAIIBV8fCEEIBAgBIVCIIohECAMIBB8IQwgCCAMhUIYiiEIIAQgCCAbfHwhBCAQIASFQhCKIRAgDCAQfCEMIAggDIVCP4ohCCABIAYgEXx8IQEgECABhUIgiiEQIAsgEHwhCyAGIAuFQhiKIQYgASAGIBh8fCEBIBAgAYVCEIohECALIBB8IQsgBiALhUI/iiEGIAIgByAXfHwhAiANIAKFQiCKIQ0gDCANfCEMIAcgDIVCGIohByACIAcgFHx8IQIgDSAChUIQiiENIAwgDXwhDCAHIAyFQj+KIQcgAyAIIBp8fCEDIA4gA4VCIIohDiAJIA58IQkgCCAJhUIYiiEIIAMgCCATfHwhAyAOIAOFQhCKIQ4gCSAOfCEJIAggCYVCP4ohCCAEIAUgGXx8IQQgDyAEhUIgiiEPIAogD3whCiAFIAqFQhiKIQUgBCAFIBx8fCEEIA8gBIVCEIohDyAKIA98IQogBSAKhUI/iiEFIAEgBSAefHwhASANIAGFQiCKIQ0gCSANfCEJIAUgCYVCGIohBSABIAUgHHx8IQEgDSABhUIQiiENIAkgDXwhCSAFIAmFQj+KIQUgAiAGIBh8fCECIA4gAoVCIIohDiAKIA58IQogBiAKhUIYiiEGIAIgBiAffHwhAiAOIAKFQhCKIQ4gCiAOfCEKIAYgCoVCP4ohBiADIAcgHXx8IQMgDyADhUIgiiEPIAsgD3whCyAHIAuFQhiKIQcgAyAHIBJ8fCEDIA8gA4VCEIohDyALIA98IQsgByALhUI/iiEHIAQgCCAUfHwhBCAQIASFQiCKIRAgDCAQfCEMIAggDIVCGIohCCAEIAggGnx8IQQgECAEhUIQiiEQIAwgEHwhDCAIIAyFQj+KIQggASAGIBZ8fCEBIBAgAYVCIIohECALIBB8IQsgBiALhUIYiiEGIAEgBiARfHwhASAQIAGFQhCKIRAgCyAQfCELIAYgC4VCP4ohBiACIAcgIHx8IQIgDSAChUIgiiENIAwgDXwhDCAHIAyFQhiKIQcgAiAHIBV8fCECIA0gAoVCEIohDSAMIA18IQwgByAMhUI/iiEHIAMgCCAZfHwhAyAOIAOFQiCKIQ4gCSAOfCEJIAggCYVCGIohCCADIAggF3x8IQMgDiADhUIQiiEOIAkgDnwhCSAIIAmFQj+KIQggBCAFIBN8fCEEIA8gBIVCIIohDyAKIA98IQogBSAKhUIYiiEFIAQgBSAbfHwhBCAPIASFQhCKIQ8gCiAPfCEKIAUgCoVCP4ohBSABIAUgF3x8IQEgDSABhUIgiiENIAkgDXwhCSAFIAmFQhiKIQUgASAFICB8fCEBIA0gAYVCEIohDSAJIA18IQkgBSAJhUI/iiEFIAIgBiAffHwhAiAOIAKFQiCKIQ4gCiAOfCEKIAYgCoVCGIohBiACIAYgGnx8IQIgDiAChUIQiiEOIAogDnwhCiAGIAqFQj+KIQYgAyAHIBx8fCEDIA8gA4VCIIohDyALIA98IQsgByALhUIYiiEHIAMgByAUfHwhAyAPIAOFQhCKIQ8gCyAPfCELIAcgC4VCP4ohByAEIAggEXx8IQQgECAEhUIgiiEQIAwgEHwhDCAIIAyFQhiKIQggBCAIIBl8fCEEIBAgBIVCEIohECAMIBB8IQwgCCAMhUI/iiEIIAEgBiAdfHwhASAQIAGFQiCKIRAgCyAQfCELIAYgC4VCGIohBiABIAYgE3x8IQEgECABhUIQiiEQIAsgEHwhCyAGIAuFQj+KIQYgAiAHIB58fCECIA0gAoVCIIohDSAMIA18IQwgByAMhUIYiiEHIAIgByAYfHwhAiANIAKFQhCKIQ0gDCANfCEMIAcgDIVCP4ohByADIAggEnx8IQMgDiADhUIgiiEOIAkgDnwhCSAIIAmFQhiKIQggAyAIIBV8fCEDIA4gA4VCEIohDiAJIA58IQkgCCAJhUI/iiEIIAQgBSAbfHwhBCAPIASFQiCKIQ8gCiAPfCEKIAUgCoVCGIohBSAEIAUgFnx8IQQgDyAEhUIQiiEPIAogD3whCiAFIAqFQj+KIQUgASAFIBt8fCEBIA0gAYVCIIohDSAJIA18IQkgBSAJhUIYiiEFIAEgBSATfHwhASANIAGFQhCKIQ0gCSANfCEJIAUgCYVCP4ohBSACIAYgGXx8IQIgDiAChUIgiiEOIAogDnwhCiAGIAqFQhiKIQYgAiAGIBV8fCECIA4gAoVCEIohDiAKIA58IQogBiAKhUI/iiEGIAMgByAYfHwhAyAPIAOFQiCKIQ8gCyAPfCELIAcgC4VCGIohByADIAcgF3x8IQMgDyADhUIQiiEPIAsgD3whCyAHIAuFQj+KIQcgBCAIIBJ8fCEEIBAgBIVCIIohECAMIBB8IQwgCCAMhUIYiiEIIAQgCCAWfHwhBCAQIASFQhCKIRAgDCAQfCEMIAggDIVCP4ohCCABIAYgIHx8IQEgECABhUIgiiEQIAsgEHwhCyAGIAuFQhiKIQYgASAGIBx8fCEBIBAgAYVCEIohECALIBB8IQsgBiALhUI/iiEGIAIgByAafHwhAiANIAKFQiCKIQ0gDCANfCEMIAcgDIVCGIohByACIAcgH3x8IQIgDSAChUIQiiENIAwgDXwhDCAHIAyFQj+KIQcgAyAIIBR8fCEDIA4gA4VCIIohDiAJIA58IQkgCCAJhUIYiiEIIAMgCCAdfHwhAyAOIAOFQhCKIQ4gCSAOfCEJIAggCYVCP4ohCCAEIAUgHnx8IQQgDyAEhUIgiiEPIAogD3whCiAFIAqFQhiKIQUgBCAFIBF8fCEEIA8gBIVCEIohDyAKIA98IQogBSAKhUI/iiEFIAEgBSARfHwhASANIAGFQiCKIQ0gCSANfCEJIAUgCYVCGIohBSABIAUgEnx8IQEgDSABhUIQiiENIAkgDXwhCSAFIAmFQj+KIQUgAiAGIBN8fCECIA4gAoVCIIohDiAKIA58IQogBiAKhUIYiiEGIAIgBiAUfHwhAiAOIAKFQhCKIQ4gCiAOfCEKIAYgCoVCP4ohBiADIAcgFXx8IQMgDyADhUIgiiEPIAsgD3whCyAHIAuFQhiKIQcgAyAHIBZ8fCEDIA8gA4VCEIohDyALIA98IQsgByALhUI/iiEHIAQgCCAXfHwhBCAQIASFQiCKIRAgDCAQfCEMIAggDIVCGIohCCAEIAggGHx8IQQgECAEhUIQiiEQIAwgEHwhDCAIIAyFQj+KIQggASAGIBl8fCEBIBAgAYVCIIohECALIBB8IQsgBiALhUIYiiEGIAEgBiAafHwhASAQIAGFQhCKIRAgCyAQfCELIAYgC4VCP4ohBiACIAcgG3x8IQIgDSAChUIgiiENIAwgDXwhDCAHIAyFQhiKIQcgAiAHIBx8fCECIA0gAoVCEIohDSAMIA18IQwgByAMhUI/iiEHIAMgCCAdfHwhAyAOIAOFQiCKIQ4gCSAOfCEJIAggCYVCGIohCCADIAggHnx8IQMgDiADhUIQiiEOIAkgDnwhCSAIIAmFQj+KIQggBCAFIB98fCEEIA8gBIVCIIohDyAKIA98IQogBSAKhUIYiiEFIAQgBSAgfHwhBCAPIASFQhCKIQ8gCiAPfCEKIAUgCoVCP4ohBSABIAUgH3x8IQEgDSABhUIgiiENIAkgDXwhCSAFIAmFQhiKIQUgASAFIBt8fCEBIA0gAYVCEIohDSAJIA18IQkgBSAJhUI/iiEFIAIgBiAVfHwhAiAOIAKFQiCKIQ4gCiAOfCEKIAYgCoVCGIohBiACIAYgGXx8IQIgDiAChUIQiiEOIAogDnwhCiAGIAqFQj+KIQYgAyAHIBp8fCEDIA8gA4VCIIohDyALIA98IQsgByALhUIYiiEHIAMgByAgfHwhAyAPIAOFQhCKIQ8gCyAPfCELIAcgC4VCP4ohByAEIAggHnx8IQQgECAEhUIgiiEQIAwgEHwhDCAIIAyFQhiKIQggBCAIIBd8fCEEIBAgBIVCEIohECAMIBB8IQwgCCAMhUI/iiEIIAEgBiASfHwhASAQIAGFQiCKIRAgCyAQfCELIAYgC4VCGIohBiABIAYgHXx8IQEgECABhUIQiiEQIAsgEHwhCyAGIAuFQj+KIQYgAiAHIBF8fCECIA0gAoVCIIohDSAMIA18IQwgByAMhUIYiiEHIAIgByATfHwhAiANIAKFQhCKIQ0gDCANfCEMIAcgDIVCP4ohByADIAggHHx8IQMgDiADhUIgiiEOIAkgDnwhCSAIIAmFQhiKIQggAyAIIBh8fCEDIA4gA4VCEIohDiAJIA58IQkgCCAJhUI/iiEIIAQgBSAWfHwhBCAPIASFQiCKIQ8gCiAPfCEKIAUgCoVCGIohBSAEIAUgFHx8IQQgDyAEhUIQiiEPIAogD3whCiAFIAqFQj+KIQUgISAhKQMAIAEgCYWFNwMAICIgIikDACACIAqFhTcDACAjICMpAwAgAyALhYU3AwAgJCAkKQMAIAQgDIWFNwMAICUgJSkDACAFIA2FhTcDACAmICYpAwAgBiAOhYU3AwAgJyAnKQMAIAcgD4WFNwMAICggKCkDACAIIBCFhTcDAAs=");
      }
    });
    var bytes = require_blake2b3();
    var compiled = WebAssembly.compile(bytes);
    module.exports = async (imports) => {
      const instance = await WebAssembly.instantiate(await compiled, imports);
      return instance.exports;
    };
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/blake2b-wasm/index.js
var require_blake2b_wasm = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/blake2b-wasm/index.js"(exports, module) {
    var assert = require_nanoassert();
    var b4a = require_browser();
    var wasm = null;
    var wasmPromise = typeof WebAssembly !== "undefined" && require_blake2b()().then((mod) => {
      wasm = mod;
    });
    var head = 64;
    var freeList = [];
    module.exports = Blake2b;
    var BYTES_MIN = module.exports.BYTES_MIN = 16;
    var BYTES_MAX = module.exports.BYTES_MAX = 64;
    var BYTES = module.exports.BYTES = 32;
    var KEYBYTES_MIN = module.exports.KEYBYTES_MIN = 16;
    var KEYBYTES_MAX = module.exports.KEYBYTES_MAX = 64;
    var KEYBYTES = module.exports.KEYBYTES = 32;
    var SALTBYTES = module.exports.SALTBYTES = 16;
    var PERSONALBYTES = module.exports.PERSONALBYTES = 16;
    function Blake2b(digestLength, key, salt, personal, noAssert) {
      if (!(this instanceof Blake2b)) return new Blake2b(digestLength, key, salt, personal, noAssert);
      if (!wasm) throw new Error("WASM not loaded. Wait for Blake2b.ready(cb)");
      if (!digestLength) digestLength = 32;
      if (noAssert !== true) {
        assert(digestLength >= BYTES_MIN, "digestLength must be at least " + BYTES_MIN + ", was given " + digestLength);
        assert(digestLength <= BYTES_MAX, "digestLength must be at most " + BYTES_MAX + ", was given " + digestLength);
        if (key != null) {
          assert(key instanceof Uint8Array, "key must be Uint8Array or Buffer");
          assert(key.length >= KEYBYTES_MIN, "key must be at least " + KEYBYTES_MIN + ", was given " + key.length);
          assert(key.length <= KEYBYTES_MAX, "key must be at least " + KEYBYTES_MAX + ", was given " + key.length);
        }
        if (salt != null) {
          assert(salt instanceof Uint8Array, "salt must be Uint8Array or Buffer");
          assert(salt.length === SALTBYTES, "salt must be exactly " + SALTBYTES + ", was given " + salt.length);
        }
        if (personal != null) {
          assert(personal instanceof Uint8Array, "personal must be Uint8Array or Buffer");
          assert(personal.length === PERSONALBYTES, "personal must be exactly " + PERSONALBYTES + ", was given " + personal.length);
        }
      }
      if (!freeList.length) {
        freeList.push(head);
        head += 216;
      }
      this.digestLength = digestLength;
      this.finalized = false;
      this.pointer = freeList.pop();
      this._memory = new Uint8Array(wasm.memory.buffer);
      this._memory.fill(0, 0, 64);
      this._memory[0] = this.digestLength;
      this._memory[1] = key ? key.length : 0;
      this._memory[2] = 1;
      this._memory[3] = 1;
      if (salt) this._memory.set(salt, 32);
      if (personal) this._memory.set(personal, 48);
      if (this.pointer + 216 > this._memory.length) this._realloc(this.pointer + 216);
      wasm.blake2b_init(this.pointer, this.digestLength);
      if (key) {
        this.update(key);
        this._memory.fill(0, head, head + key.length);
        this._memory[this.pointer + 200] = 128;
      }
    }
    Blake2b.prototype._realloc = function(size) {
      wasm.memory.grow(Math.max(0, Math.ceil(Math.abs(size - this._memory.length) / 65536)));
      this._memory = new Uint8Array(wasm.memory.buffer);
    };
    Blake2b.prototype.update = function(input) {
      assert(this.finalized === false, "Hash instance finalized");
      assert(input instanceof Uint8Array, "input must be Uint8Array or Buffer");
      if (head + input.length > this._memory.length) this._realloc(head + input.length);
      this._memory.set(input, head);
      wasm.blake2b_update(this.pointer, head, head + input.length);
      return this;
    };
    Blake2b.prototype.digest = function(enc) {
      assert(this.finalized === false, "Hash instance finalized");
      this.finalized = true;
      freeList.push(this.pointer);
      wasm.blake2b_final(this.pointer);
      if (!enc || enc === "binary") {
        return this._memory.slice(this.pointer + 128, this.pointer + 128 + this.digestLength);
      }
      if (typeof enc === "string") {
        return b4a.toString(this._memory, enc, this.pointer + 128, this.pointer + 128 + this.digestLength);
      }
      assert(enc instanceof Uint8Array && enc.length >= this.digestLength, "input must be Uint8Array or Buffer");
      for (var i = 0; i < this.digestLength; i++) {
        enc[i] = this._memory[this.pointer + 128 + i];
      }
      return enc;
    };
    Blake2b.prototype.final = Blake2b.prototype.digest;
    Blake2b.WASM = wasm;
    Blake2b.SUPPORTED = typeof WebAssembly !== "undefined";
    Blake2b.ready = function(cb) {
      if (!cb) cb = noop;
      if (!wasmPromise) return cb(new Error("WebAssembly not supported"));
      return wasmPromise.then(() => cb(), cb);
    };
    Blake2b.prototype.ready = Blake2b.ready;
    Blake2b.prototype.getPartialHash = function() {
      return this._memory.slice(this.pointer, this.pointer + 216);
    };
    Blake2b.prototype.setPartialHash = function(ph) {
      this._memory.set(ph, this.pointer);
    };
    function noop() {
    }
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/blake2b/index.js
var require_blake2b2 = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/blake2b/index.js"(exports, module) {
    var assert = require_nanoassert();
    var b2wasm = require_blake2b_wasm();
    function ADD64AA(v2, a, b) {
      var o0 = v2[a] + v2[b];
      var o1 = v2[a + 1] + v2[b + 1];
      if (o0 >= 4294967296) {
        o1++;
      }
      v2[a] = o0;
      v2[a + 1] = o1;
    }
    function ADD64AC(v2, a, b0, b1) {
      var o0 = v2[a] + b0;
      if (b0 < 0) {
        o0 += 4294967296;
      }
      var o1 = v2[a + 1] + b1;
      if (o0 >= 4294967296) {
        o1++;
      }
      v2[a] = o0;
      v2[a + 1] = o1;
    }
    function B2B_GET32(arr, i) {
      return arr[i] ^ arr[i + 1] << 8 ^ arr[i + 2] << 16 ^ arr[i + 3] << 24;
    }
    function B2B_G(a, b, c, d, ix, iy) {
      var x0 = m[ix];
      var x1 = m[ix + 1];
      var y0 = m[iy];
      var y1 = m[iy + 1];
      ADD64AA(v, a, b);
      ADD64AC(v, a, x0, x1);
      var xor0 = v[d] ^ v[a];
      var xor1 = v[d + 1] ^ v[a + 1];
      v[d] = xor1;
      v[d + 1] = xor0;
      ADD64AA(v, c, d);
      xor0 = v[b] ^ v[c];
      xor1 = v[b + 1] ^ v[c + 1];
      v[b] = xor0 >>> 24 ^ xor1 << 8;
      v[b + 1] = xor1 >>> 24 ^ xor0 << 8;
      ADD64AA(v, a, b);
      ADD64AC(v, a, y0, y1);
      xor0 = v[d] ^ v[a];
      xor1 = v[d + 1] ^ v[a + 1];
      v[d] = xor0 >>> 16 ^ xor1 << 16;
      v[d + 1] = xor1 >>> 16 ^ xor0 << 16;
      ADD64AA(v, c, d);
      xor0 = v[b] ^ v[c];
      xor1 = v[b + 1] ^ v[c + 1];
      v[b] = xor1 >>> 31 ^ xor0 << 1;
      v[b + 1] = xor0 >>> 31 ^ xor1 << 1;
    }
    var BLAKE2B_IV32 = new Uint32Array([
      4089235720,
      1779033703,
      2227873595,
      3144134277,
      4271175723,
      1013904242,
      1595750129,
      2773480762,
      2917565137,
      1359893119,
      725511199,
      2600822924,
      4215389547,
      528734635,
      327033209,
      1541459225
    ]);
    var SIGMA8 = [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      14,
      10,
      4,
      8,
      9,
      15,
      13,
      6,
      1,
      12,
      0,
      2,
      11,
      7,
      5,
      3,
      11,
      8,
      12,
      0,
      5,
      2,
      15,
      13,
      10,
      14,
      3,
      6,
      7,
      1,
      9,
      4,
      7,
      9,
      3,
      1,
      13,
      12,
      11,
      14,
      2,
      6,
      5,
      10,
      4,
      0,
      15,
      8,
      9,
      0,
      5,
      7,
      2,
      4,
      10,
      15,
      14,
      1,
      11,
      12,
      6,
      8,
      3,
      13,
      2,
      12,
      6,
      10,
      0,
      11,
      8,
      3,
      4,
      13,
      7,
      5,
      15,
      14,
      1,
      9,
      12,
      5,
      1,
      15,
      14,
      13,
      4,
      10,
      0,
      7,
      6,
      3,
      9,
      2,
      8,
      11,
      13,
      11,
      7,
      14,
      12,
      1,
      3,
      9,
      5,
      0,
      15,
      4,
      8,
      6,
      2,
      10,
      6,
      15,
      14,
      9,
      11,
      3,
      0,
      8,
      12,
      2,
      13,
      7,
      1,
      4,
      10,
      5,
      10,
      2,
      8,
      4,
      7,
      6,
      1,
      5,
      15,
      11,
      9,
      14,
      3,
      12,
      13,
      0,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      14,
      10,
      4,
      8,
      9,
      15,
      13,
      6,
      1,
      12,
      0,
      2,
      11,
      7,
      5,
      3
    ];
    var SIGMA82 = new Uint8Array(SIGMA8.map(function(x) {
      return x * 2;
    }));
    var v = new Uint32Array(32);
    var m = new Uint32Array(32);
    function blake2bCompress(ctx, last) {
      var i = 0;
      for (i = 0; i < 16; i++) {
        v[i] = ctx.h[i];
        v[i + 16] = BLAKE2B_IV32[i];
      }
      v[24] = v[24] ^ ctx.t;
      v[25] = v[25] ^ ctx.t / 4294967296;
      if (last) {
        v[28] = ~v[28];
        v[29] = ~v[29];
      }
      for (i = 0; i < 32; i++) {
        m[i] = B2B_GET32(ctx.b, 4 * i);
      }
      for (i = 0; i < 12; i++) {
        B2B_G(0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1]);
        B2B_G(2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3]);
        B2B_G(4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5]);
        B2B_G(6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7]);
        B2B_G(0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9]);
        B2B_G(2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11]);
        B2B_G(4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13]);
        B2B_G(6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15]);
      }
      for (i = 0; i < 16; i++) {
        ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16];
      }
    }
    var parameter_block = new Uint8Array([
      0,
      0,
      0,
      0,
      //  0: outlen, keylen, fanout, depth
      0,
      0,
      0,
      0,
      //  4: leaf length, sequential mode
      0,
      0,
      0,
      0,
      //  8: node offset
      0,
      0,
      0,
      0,
      // 12: node offset
      0,
      0,
      0,
      0,
      // 16: node depth, inner length, rfu
      0,
      0,
      0,
      0,
      // 20: rfu
      0,
      0,
      0,
      0,
      // 24: rfu
      0,
      0,
      0,
      0,
      // 28: rfu
      0,
      0,
      0,
      0,
      // 32: salt
      0,
      0,
      0,
      0,
      // 36: salt
      0,
      0,
      0,
      0,
      // 40: salt
      0,
      0,
      0,
      0,
      // 44: salt
      0,
      0,
      0,
      0,
      // 48: personal
      0,
      0,
      0,
      0,
      // 52: personal
      0,
      0,
      0,
      0,
      // 56: personal
      0,
      0,
      0,
      0
      // 60: personal
    ]);
    function Blake2b(outlen, key, salt, personal) {
      parameter_block.fill(0);
      this.b = new Uint8Array(128);
      this.h = new Uint32Array(16);
      this.t = 0;
      this.c = 0;
      this.outlen = outlen;
      parameter_block[0] = outlen;
      if (key) parameter_block[1] = key.length;
      parameter_block[2] = 1;
      parameter_block[3] = 1;
      if (salt) parameter_block.set(salt, 32);
      if (personal) parameter_block.set(personal, 48);
      for (var i = 0; i < 16; i++) {
        this.h[i] = BLAKE2B_IV32[i] ^ B2B_GET32(parameter_block, i * 4);
      }
      if (key) {
        blake2bUpdate(this, key);
        this.c = 128;
      }
    }
    Blake2b.prototype.update = function(input) {
      assert(input instanceof Uint8Array, "input must be Uint8Array or Buffer");
      blake2bUpdate(this, input);
      return this;
    };
    Blake2b.prototype.digest = function(out) {
      var buf = !out || out === "binary" || out === "hex" ? new Uint8Array(this.outlen) : out;
      assert(buf instanceof Uint8Array, 'out must be "binary", "hex", Uint8Array, or Buffer');
      assert(buf.length >= this.outlen, "out must have at least outlen bytes of space");
      blake2bFinal(this, buf);
      if (out === "hex") return hexSlice(buf);
      return buf;
    };
    Blake2b.prototype.final = Blake2b.prototype.digest;
    Blake2b.ready = function(cb) {
      b2wasm.ready(function() {
        cb();
      });
    };
    function blake2bUpdate(ctx, input) {
      for (var i = 0; i < input.length; i++) {
        if (ctx.c === 128) {
          ctx.t += ctx.c;
          blake2bCompress(ctx, false);
          ctx.c = 0;
        }
        ctx.b[ctx.c++] = input[i];
      }
    }
    function blake2bFinal(ctx, out) {
      ctx.t += ctx.c;
      while (ctx.c < 128) {
        ctx.b[ctx.c++] = 0;
      }
      blake2bCompress(ctx, true);
      for (var i = 0; i < ctx.outlen; i++) {
        out[i] = ctx.h[i >> 2] >> 8 * (i & 3);
      }
      return out;
    }
    function hexSlice(buf) {
      var str = "";
      for (var i = 0; i < buf.length; i++) str += toHex(buf[i]);
      return str;
    }
    function toHex(n) {
      if (n < 16) return "0" + n.toString(16);
      return n.toString(16);
    }
    var Proto = Blake2b;
    module.exports = function createHash(outlen, key, salt, personal, noAssert) {
      if (noAssert !== true) {
        assert(outlen >= BYTES_MIN, "outlen must be at least " + BYTES_MIN + ", was given " + outlen);
        assert(outlen <= BYTES_MAX, "outlen must be at most " + BYTES_MAX + ", was given " + outlen);
        if (key != null) {
          assert(key instanceof Uint8Array, "key must be Uint8Array or Buffer");
          assert(key.length >= KEYBYTES_MIN, "key must be at least " + KEYBYTES_MIN + ", was given " + key.length);
          assert(key.length <= KEYBYTES_MAX, "key must be at most " + KEYBYTES_MAX + ", was given " + key.length);
        }
        if (salt != null) {
          assert(salt instanceof Uint8Array, "salt must be Uint8Array or Buffer");
          assert(salt.length === SALTBYTES, "salt must be exactly " + SALTBYTES + ", was given " + salt.length);
        }
        if (personal != null) {
          assert(personal instanceof Uint8Array, "personal must be Uint8Array or Buffer");
          assert(personal.length === PERSONALBYTES, "personal must be exactly " + PERSONALBYTES + ", was given " + personal.length);
        }
      }
      return new Proto(outlen, key, salt, personal);
    };
    module.exports.ready = function(cb) {
      b2wasm.ready(function() {
        cb();
      });
    };
    module.exports.WASM_SUPPORTED = b2wasm.SUPPORTED;
    module.exports.WASM_LOADED = false;
    var BYTES_MIN = module.exports.BYTES_MIN = 16;
    var BYTES_MAX = module.exports.BYTES_MAX = 64;
    var BYTES = module.exports.BYTES = 32;
    var KEYBYTES_MIN = module.exports.KEYBYTES_MIN = 16;
    var KEYBYTES_MAX = module.exports.KEYBYTES_MAX = 64;
    var KEYBYTES = module.exports.KEYBYTES = 32;
    var SALTBYTES = module.exports.SALTBYTES = 16;
    var PERSONALBYTES = module.exports.PERSONALBYTES = 16;
    b2wasm.ready(function(err2) {
      if (!err2) {
        module.exports.WASM_LOADED = true;
        module.exports = b2wasm;
      }
    });
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/lz4js/util.js
var require_util = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/lz4js/util.js"(exports) {
    exports.hashU32 = function hashU32(a) {
      a = a | 0;
      a = a + 2127912214 + (a << 12) | 0;
      a = a ^ -949894596 ^ a >>> 19;
      a = a + 374761393 + (a << 5) | 0;
      a = a + -744332180 ^ a << 9;
      a = a + -42973499 + (a << 3) | 0;
      return a ^ -1252372727 ^ a >>> 16 | 0;
    };
    exports.readU64 = function readU64(b, n) {
      var x = 0;
      x |= b[n++] << 0;
      x |= b[n++] << 8;
      x |= b[n++] << 16;
      x |= b[n++] << 24;
      x |= b[n++] << 32;
      x |= b[n++] << 40;
      x |= b[n++] << 48;
      x |= b[n++] << 56;
      return x;
    };
    exports.readU32 = function readU32(b, n) {
      var x = 0;
      x |= b[n++] << 0;
      x |= b[n++] << 8;
      x |= b[n++] << 16;
      x |= b[n++] << 24;
      return x;
    };
    exports.writeU32 = function writeU32(b, n, x) {
      b[n++] = x >> 0 & 255;
      b[n++] = x >> 8 & 255;
      b[n++] = x >> 16 & 255;
      b[n++] = x >> 24 & 255;
    };
    exports.imul = function imul(a, b) {
      var ah = a >>> 16;
      var al = a & 65535;
      var bh = b >>> 16;
      var bl = b & 65535;
      return al * bl + (ah * bl + al * bh << 16) | 0;
    };
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/lz4js/xxh32.js
var require_xxh32 = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/lz4js/xxh32.js"(exports) {
    var util = require_util();
    var prime1 = 2654435761;
    var prime2 = 2246822519;
    var prime3 = 3266489917;
    var prime4 = 668265263;
    var prime5 = 374761393;
    function rotl32(x, r) {
      x = x | 0;
      r = r | 0;
      return x >>> (32 - r | 0) | x << r | 0;
    }
    function rotmul32(h, r, m) {
      h = h | 0;
      r = r | 0;
      m = m | 0;
      return util.imul(h >>> (32 - r | 0) | h << r, m) | 0;
    }
    function shiftxor32(h, s) {
      h = h | 0;
      s = s | 0;
      return h >>> s ^ h | 0;
    }
    function xxhapply(h, src, m0, s, m1) {
      return rotmul32(util.imul(src, m0) + h, s, m1);
    }
    function xxh1(h, src, index) {
      return rotmul32(h + util.imul(src[index], prime5), 11, prime1);
    }
    function xxh4(h, src, index) {
      return xxhapply(h, util.readU32(src, index), prime3, 17, prime4);
    }
    function xxh16(h, src, index) {
      return [
        xxhapply(h[0], util.readU32(src, index + 0), prime2, 13, prime1),
        xxhapply(h[1], util.readU32(src, index + 4), prime2, 13, prime1),
        xxhapply(h[2], util.readU32(src, index + 8), prime2, 13, prime1),
        xxhapply(h[3], util.readU32(src, index + 12), prime2, 13, prime1)
      ];
    }
    function xxh32(seed, src, index, len) {
      var h, l;
      l = len;
      if (len >= 16) {
        h = [
          seed + prime1 + prime2,
          seed + prime2,
          seed,
          seed - prime1
        ];
        while (len >= 16) {
          h = xxh16(h, src, index);
          index += 16;
          len -= 16;
        }
        h = rotl32(h[0], 1) + rotl32(h[1], 7) + rotl32(h[2], 12) + rotl32(h[3], 18) + l;
      } else {
        h = seed + prime5 + len >>> 0;
      }
      while (len >= 4) {
        h = xxh4(h, src, index);
        index += 4;
        len -= 4;
      }
      while (len > 0) {
        h = xxh1(h, src, index);
        index++;
        len--;
      }
      h = shiftxor32(util.imul(shiftxor32(util.imul(shiftxor32(h, 15), prime2), 13), prime3), 16);
      return h >>> 0;
    }
    exports.hash = xxh32;
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/lz4js/lz4.js
var require_lz4 = __commonJS({
  "../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/lz4js/lz4.js"(exports) {
    var xxhash = require_xxh32();
    var util = require_util();
    var minMatch = 4;
    var minLength = 13;
    var searchLimit = 5;
    var skipTrigger = 6;
    var hashSize = 1 << 16;
    var mlBits = 4;
    var mlMask = (1 << mlBits) - 1;
    var runBits = 4;
    var runMask = (1 << runBits) - 1;
    var blockBuf = makeBuffer(5 << 20);
    var hashTable = makeHashTable();
    var magicNum = 407708164;
    var fdContentChksum = 4;
    var fdContentSize = 8;
    var fdBlockChksum = 16;
    var fdVersion = 64;
    var fdVersionMask = 192;
    var bsUncompressed = 2147483648;
    var bsDefault = 7;
    var bsShift = 4;
    var bsMask = 7;
    var bsMap = {
      4: 65536,
      5: 262144,
      6: 1048576,
      7: 4194304
    };
    function makeHashTable() {
      try {
        return new Uint32Array(hashSize);
      } catch (error) {
        var hashTable2 = new Array(hashSize);
        for (var i = 0; i < hashSize; i++) {
          hashTable2[i] = 0;
        }
        return hashTable2;
      }
    }
    function clearHashTable(table) {
      for (var i = 0; i < hashSize; i++) {
        hashTable[i] = 0;
      }
    }
    function makeBuffer(size) {
      try {
        return new Uint8Array(size);
      } catch (error) {
        var buf = new Array(size);
        for (var i = 0; i < size; i++) {
          buf[i] = 0;
        }
        return buf;
      }
    }
    function sliceArray(array, start, end) {
      if (typeof array.buffer !== void 0) {
        if (Uint8Array.prototype.slice) {
          return array.slice(start, end);
        } else {
          var len = array.length;
          start = start | 0;
          start = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
          end = end === void 0 ? len : end | 0;
          end = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
          var arraySlice = new Uint8Array(end - start);
          for (var i = start, n = 0; i < end; ) {
            arraySlice[n++] = array[i++];
          }
          return arraySlice;
        }
      } else {
        return array.slice(start, end);
      }
    }
    exports.compressBound = function compressBound(n) {
      return n + n / 255 + 16 | 0;
    };
    exports.decompressBound = function decompressBound(src) {
      var sIndex = 0;
      if (util.readU32(src, sIndex) !== magicNum) {
        throw new Error("invalid magic number");
      }
      sIndex += 4;
      var descriptor = src[sIndex++];
      if ((descriptor & fdVersionMask) !== fdVersion) {
        throw new Error("incompatible descriptor version " + (descriptor & fdVersionMask));
      }
      var useBlockSum = (descriptor & fdBlockChksum) !== 0;
      var useContentSize = (descriptor & fdContentSize) !== 0;
      var bsIdx = src[sIndex++] >> bsShift & bsMask;
      if (bsMap[bsIdx] === void 0) {
        throw new Error("invalid block size " + bsIdx);
      }
      var maxBlockSize = bsMap[bsIdx];
      if (useContentSize) {
        return util.readU64(src, sIndex);
      }
      sIndex++;
      var maxSize = 0;
      while (true) {
        var blockSize = util.readU32(src, sIndex);
        sIndex += 4;
        if (blockSize & bsUncompressed) {
          blockSize &= ~bsUncompressed;
          maxSize += blockSize;
        } else {
          maxSize += maxBlockSize;
        }
        if (blockSize === 0) {
          return maxSize;
        }
        if (useBlockSum) {
          sIndex += 4;
        }
        sIndex += blockSize;
      }
    };
    exports.makeBuffer = makeBuffer;
    exports.decompressBlock = function decompressBlock2(src, dst, sIndex, sLength, dIndex) {
      var mLength, mOffset, sEnd, n, i;
      sEnd = sIndex + sLength;
      while (sIndex < sEnd) {
        var token = src[sIndex++];
        var literalCount = token >> 4;
        if (literalCount > 0) {
          if (literalCount === 15) {
            while (true) {
              literalCount += src[sIndex];
              if (src[sIndex++] !== 255) {
                break;
              }
            }
          }
          for (n = sIndex + literalCount; sIndex < n; ) {
            dst[dIndex++] = src[sIndex++];
          }
        }
        if (sIndex >= sEnd) {
          break;
        }
        mLength = token & 15;
        mOffset = src[sIndex++] | src[sIndex++] << 8;
        if (mLength === 15) {
          while (true) {
            mLength += src[sIndex];
            if (src[sIndex++] !== 255) {
              break;
            }
          }
        }
        mLength += minMatch;
        for (i = dIndex - mOffset, n = i + mLength; i < n; ) {
          dst[dIndex++] = dst[i++] | 0;
        }
      }
      return dIndex;
    };
    exports.compressBlock = function compressBlock(src, dst, sIndex, sLength, hashTable2) {
      var mIndex, mAnchor, mLength, mOffset, mStep;
      var literalCount, dIndex, sEnd, n;
      dIndex = 0;
      sEnd = sLength + sIndex;
      mAnchor = sIndex;
      if (sLength >= minLength) {
        var searchMatchCount = (1 << skipTrigger) + 3;
        while (sIndex + minMatch < sEnd - searchLimit) {
          var seq = util.readU32(src, sIndex);
          var hash = util.hashU32(seq) >>> 0;
          hash = (hash >> 16 ^ hash) >>> 0 & 65535;
          mIndex = hashTable2[hash] - 1;
          hashTable2[hash] = sIndex + 1;
          if (mIndex < 0 || sIndex - mIndex >>> 16 > 0 || util.readU32(src, mIndex) !== seq) {
            mStep = searchMatchCount++ >> skipTrigger;
            sIndex += mStep;
            continue;
          }
          searchMatchCount = (1 << skipTrigger) + 3;
          literalCount = sIndex - mAnchor;
          mOffset = sIndex - mIndex;
          sIndex += minMatch;
          mIndex += minMatch;
          mLength = sIndex;
          while (sIndex < sEnd - searchLimit && src[sIndex] === src[mIndex]) {
            sIndex++;
            mIndex++;
          }
          mLength = sIndex - mLength;
          var token = mLength < mlMask ? mLength : mlMask;
          if (literalCount >= runMask) {
            dst[dIndex++] = (runMask << mlBits) + token;
            for (n = literalCount - runMask; n >= 255; n -= 255) {
              dst[dIndex++] = 255;
            }
            dst[dIndex++] = n;
          } else {
            dst[dIndex++] = (literalCount << mlBits) + token;
          }
          for (var i = 0; i < literalCount; i++) {
            dst[dIndex++] = src[mAnchor + i];
          }
          dst[dIndex++] = mOffset;
          dst[dIndex++] = mOffset >> 8;
          if (mLength >= mlMask) {
            for (n = mLength - mlMask; n >= 255; n -= 255) {
              dst[dIndex++] = 255;
            }
            dst[dIndex++] = n;
          }
          mAnchor = sIndex;
        }
      }
      if (mAnchor === 0) {
        return 0;
      }
      literalCount = sEnd - mAnchor;
      if (literalCount >= runMask) {
        dst[dIndex++] = runMask << mlBits;
        for (n = literalCount - runMask; n >= 255; n -= 255) {
          dst[dIndex++] = 255;
        }
        dst[dIndex++] = n;
      } else {
        dst[dIndex++] = literalCount << mlBits;
      }
      sIndex = mAnchor;
      while (sIndex < sEnd) {
        dst[dIndex++] = src[sIndex++];
      }
      return dIndex;
    };
    exports.decompressFrame = function decompressFrame(src, dst) {
      var useBlockSum, useContentSum, useContentSize, descriptor;
      var sIndex = 0;
      var dIndex = 0;
      if (util.readU32(src, sIndex) !== magicNum) {
        throw new Error("invalid magic number");
      }
      sIndex += 4;
      descriptor = src[sIndex++];
      if ((descriptor & fdVersionMask) !== fdVersion) {
        throw new Error("incompatible descriptor version");
      }
      useBlockSum = (descriptor & fdBlockChksum) !== 0;
      useContentSum = (descriptor & fdContentChksum) !== 0;
      useContentSize = (descriptor & fdContentSize) !== 0;
      var bsIdx = src[sIndex++] >> bsShift & bsMask;
      if (bsMap[bsIdx] === void 0) {
        throw new Error("invalid block size");
      }
      if (useContentSize) {
        sIndex += 8;
      }
      sIndex++;
      while (true) {
        var compSize;
        compSize = util.readU32(src, sIndex);
        sIndex += 4;
        if (compSize === 0) {
          break;
        }
        if (useBlockSum) {
          sIndex += 4;
        }
        if ((compSize & bsUncompressed) !== 0) {
          compSize &= ~bsUncompressed;
          for (var j = 0; j < compSize; j++) {
            dst[dIndex++] = src[sIndex++];
          }
        } else {
          dIndex = exports.decompressBlock(src, dst, sIndex, compSize, dIndex);
          sIndex += compSize;
        }
      }
      if (useContentSum) {
        sIndex += 4;
      }
      return dIndex;
    };
    exports.compressFrame = function compressFrame(src, dst) {
      var dIndex = 0;
      util.writeU32(dst, dIndex, magicNum);
      dIndex += 4;
      dst[dIndex++] = fdVersion;
      dst[dIndex++] = bsDefault << bsShift;
      dst[dIndex] = xxhash.hash(0, dst, 4, dIndex - 4) >> 8;
      dIndex++;
      var maxBlockSize = bsMap[bsDefault];
      var remaining = src.length;
      var sIndex = 0;
      clearHashTable(hashTable);
      while (remaining > 0) {
        var compSize = 0;
        var blockSize = remaining > maxBlockSize ? maxBlockSize : remaining;
        compSize = exports.compressBlock(src, blockBuf, sIndex, blockSize, hashTable);
        if (compSize > blockSize || compSize === 0) {
          util.writeU32(dst, dIndex, 2147483648 | blockSize);
          dIndex += 4;
          for (var z = sIndex + blockSize; sIndex < z; ) {
            dst[dIndex++] = src[sIndex++];
          }
          remaining -= blockSize;
        } else {
          util.writeU32(dst, dIndex, compSize);
          dIndex += 4;
          for (var j = 0; j < compSize; ) {
            dst[dIndex++] = blockBuf[j++];
          }
          sIndex += blockSize;
          remaining -= blockSize;
        }
      }
      util.writeU32(dst, dIndex, 0);
      dIndex += 4;
      return dIndex;
    };
    exports.decompress = function decompress2(src, maxSize) {
      var dst, size;
      if (maxSize === void 0) {
        maxSize = exports.decompressBound(src);
      }
      dst = exports.makeBuffer(maxSize);
      size = exports.decompressFrame(src, dst);
      if (size !== maxSize) {
        dst = sliceArray(dst, 0, size);
      }
      return dst;
    };
    exports.compress = function compress(src, maxSize) {
      var dst, size;
      if (maxSize === void 0) {
        maxSize = exports.compressBound(src.length);
      }
      dst = exports.makeBuffer(maxSize);
      size = exports.compressFrame(src, dst);
      if (size !== maxSize) {
        dst = sliceArray(dst, 0, size);
      }
      return dst;
    };
  }
});

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/rbxm-browser-entry.js
var import_buffer = __toESM(require_buffer());

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/rbxm-parser/dist/index.mjs
var import_blake2b = __toESM(require_blake2b2(), 1);

// lz4-browser:lz4-browser
var import_lz4js = __toESM(require_lz4());
var lz4_browser_default = { decodeBlock(source, target) {
  return (0, import_lz4js.decompressBlock)(source, target, 0, source.length, 0);
} };

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/fzstd/esm/index.mjs
var ab = ArrayBuffer;
var u8 = Uint8Array;
var u16 = Uint16Array;
var i16 = Int16Array;
var i32 = Int32Array;
var slc = function(v, s, e) {
  if (u8.prototype.slice)
    return u8.prototype.slice.call(v, s, e);
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  var n = new u8(e - s);
  n.set(v.subarray(s, e));
  return n;
};
var fill = function(v, n, s, e) {
  if (u8.prototype.fill)
    return u8.prototype.fill.call(v, n, s, e);
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  for (; s < e; ++s)
    v[s] = n;
  return v;
};
var cpw = function(v, t, s, e) {
  if (u8.prototype.copyWithin)
    return u8.prototype.copyWithin.call(v, t, s, e);
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  while (s < e) {
    v[t++] = v[s++];
  }
};
var ec = [
  "invalid zstd data",
  "window size too large (>2046MB)",
  "invalid block type",
  "FSE accuracy too high",
  "match distance too far back",
  "unexpected EOF"
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var rb = function(d, b, n) {
  var i = 0, o = 0;
  for (; i < n; ++i)
    o |= d[b++] << (i << 3);
  return o;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var rzfh = function(dat, w) {
  var n3 = dat[0] | dat[1] << 8 | dat[2] << 16;
  if (n3 == 3126568 && dat[3] == 253) {
    var flg = dat[4];
    var ss = flg >> 5 & 1, cc = flg >> 2 & 1, df = flg & 3, fcf = flg >> 6;
    if (flg & 8)
      err(0);
    var bt = 6 - ss;
    var db = df == 3 ? 4 : df;
    var di = rb(dat, bt, db);
    bt += db;
    var fsb = fcf ? 1 << fcf : ss;
    var fss = rb(dat, bt, fsb) + (fcf == 1 && 256);
    var ws = fss;
    if (!ss) {
      var wb = 1 << 10 + (dat[5] >> 3);
      ws = wb + (wb >> 3) * (dat[5] & 7);
    }
    if (ws > 2145386496)
      err(1);
    var buf = new u8((w == 1 ? fss || ws : w ? 0 : ws) + 12);
    buf[0] = 1, buf[4] = 4, buf[8] = 8;
    return {
      b: bt + fsb,
      y: 0,
      l: 0,
      d: di,
      w: w && w != 1 ? w : buf.subarray(12),
      e: ws,
      o: new i32(buf.buffer, 0, 3),
      u: fss,
      c: cc,
      m: Math.min(131072, ws)
    };
  } else if ((n3 >> 4 | dat[3] << 20) == 25481893) {
    return b4(dat, 4) + 8;
  }
  err(0);
};
var msb = function(val) {
  var bits = 0;
  for (; 1 << bits <= val; ++bits)
    ;
  return bits - 1;
};
var rfse = function(dat, bt, mal) {
  var tpos = (bt << 3) + 4;
  var al = (dat[bt] & 15) + 5;
  if (al > mal)
    err(3);
  var sz = 1 << al;
  var probs = sz, sym = -1, re = -1, i = -1, ht = sz;
  var buf = new ab(512 + (sz << 2));
  var freq = new i16(buf, 0, 256);
  var dstate = new u16(buf, 0, 256);
  var nstate = new u16(buf, 512, sz);
  var bb1 = 512 + (sz << 1);
  var syms = new u8(buf, bb1, sz);
  var nbits = new u8(buf, bb1 + sz);
  while (sym < 255 && probs > 0) {
    var bits = msb(probs + 1);
    var cbt = tpos >> 3;
    var msk = (1 << bits + 1) - 1;
    var val = (dat[cbt] | dat[cbt + 1] << 8 | dat[cbt + 2] << 16) >> (tpos & 7) & msk;
    var msk1fb = (1 << bits) - 1;
    var msv = msk - probs - 1;
    var sval = val & msk1fb;
    if (sval < msv)
      tpos += bits, val = sval;
    else {
      tpos += bits + 1;
      if (val > msk1fb)
        val -= msv;
    }
    freq[++sym] = --val;
    if (val == -1) {
      probs += val;
      syms[--ht] = sym;
    } else
      probs -= val;
    if (!val) {
      do {
        var rbt = tpos >> 3;
        re = (dat[rbt] | dat[rbt + 1] << 8) >> (tpos & 7) & 3;
        tpos += 2;
        sym += re;
      } while (re == 3);
    }
  }
  if (sym > 255 || probs)
    err(0);
  var sympos = 0;
  var sstep = (sz >> 1) + (sz >> 3) + 3;
  var smask = sz - 1;
  for (var s = 0; s <= sym; ++s) {
    var sf = freq[s];
    if (sf < 1) {
      dstate[s] = -sf;
      continue;
    }
    for (i = 0; i < sf; ++i) {
      syms[sympos] = s;
      do {
        sympos = sympos + sstep & smask;
      } while (sympos >= ht);
    }
  }
  if (sympos)
    err(0);
  for (i = 0; i < sz; ++i) {
    var ns = dstate[syms[i]]++;
    var nb = nbits[i] = al - msb(ns);
    nstate[i] = (ns << nb) - sz;
  }
  return [tpos + 7 >> 3, {
    b: al,
    s: syms,
    n: nbits,
    t: nstate
  }];
};
var rhu = function(dat, bt) {
  var i = 0, wc = -1;
  var buf = new u8(292), hb = dat[bt];
  var hw = buf.subarray(0, 256);
  var rc = buf.subarray(256, 268);
  var ri = new u16(buf.buffer, 268);
  if (hb < 128) {
    var _a = rfse(dat, bt + 1, 6), ebt = _a[0], fdt = _a[1];
    bt += hb;
    var epos = ebt << 3;
    var lb = dat[bt];
    if (!lb)
      err(0);
    var st1 = 0, st2 = 0, btr1 = fdt.b, btr2 = btr1;
    var fpos = (++bt << 3) - 8 + msb(lb);
    for (; ; ) {
      fpos -= btr1;
      if (fpos < epos)
        break;
      var cbt = fpos >> 3;
      st1 += (dat[cbt] | dat[cbt + 1] << 8) >> (fpos & 7) & (1 << btr1) - 1;
      hw[++wc] = fdt.s[st1];
      fpos -= btr2;
      if (fpos < epos)
        break;
      cbt = fpos >> 3;
      st2 += (dat[cbt] | dat[cbt + 1] << 8) >> (fpos & 7) & (1 << btr2) - 1;
      hw[++wc] = fdt.s[st2];
      btr1 = fdt.n[st1];
      st1 = fdt.t[st1];
      btr2 = fdt.n[st2];
      st2 = fdt.t[st2];
    }
    if (++wc > 255)
      err(0);
  } else {
    wc = hb - 127;
    for (; i < wc; i += 2) {
      var byte = dat[++bt];
      hw[i] = byte >> 4;
      hw[i + 1] = byte & 15;
    }
    ++bt;
  }
  var wes = 0;
  for (i = 0; i < wc; ++i) {
    var wt = hw[i];
    if (wt > 11)
      err(0);
    wes += wt && 1 << wt - 1;
  }
  var mb = msb(wes) + 1;
  var ts = 1 << mb;
  var rem = ts - wes;
  if (rem & rem - 1)
    err(0);
  hw[wc++] = msb(rem) + 1;
  for (i = 0; i < wc; ++i) {
    var wt = hw[i];
    ++rc[hw[i] = wt && mb + 1 - wt];
  }
  var hbuf = new u8(ts << 1);
  var syms = hbuf.subarray(0, ts), nb = hbuf.subarray(ts);
  ri[mb] = 0;
  for (i = mb; i > 0; --i) {
    var pv = ri[i];
    fill(nb, i, pv, ri[i - 1] = pv + rc[i] * (1 << mb - i));
  }
  if (ri[0] != ts)
    err(0);
  for (i = 0; i < wc; ++i) {
    var bits = hw[i];
    if (bits) {
      var code = ri[bits];
      fill(syms, i, code, ri[bits] = code + (1 << mb - bits));
    }
  }
  return [bt, {
    n: nb,
    b: mb,
    s: syms
  }];
};
var dllt = rfse(/* @__PURE__ */ new u8([
  81,
  16,
  99,
  140,
  49,
  198,
  24,
  99,
  12,
  33,
  196,
  24,
  99,
  102,
  102,
  134,
  70,
  146,
  4
]), 0, 6)[1];
var dmlt = rfse(/* @__PURE__ */ new u8([
  33,
  20,
  196,
  24,
  99,
  140,
  33,
  132,
  16,
  66,
  8,
  33,
  132,
  16,
  66,
  8,
  33,
  68,
  68,
  68,
  68,
  68,
  68,
  68,
  68,
  36,
  9
]), 0, 6)[1];
var doct = rfse(/* @__PURE__ */ new u8([
  32,
  132,
  16,
  66,
  102,
  70,
  68,
  68,
  68,
  68,
  36,
  73,
  2
]), 0, 5)[1];
var b2bl = function(b, s) {
  var len = b.length, bl = new i32(len);
  for (var i = 0; i < len; ++i) {
    bl[i] = s;
    s += 1 << b[i];
  }
  return bl;
};
var llb = /* @__PURE__ */ new u8((/* @__PURE__ */ new i32([
  0,
  0,
  0,
  0,
  16843009,
  50528770,
  134678020,
  202050057,
  269422093
])).buffer, 0, 36);
var llbl = /* @__PURE__ */ b2bl(llb, 0);
var mlb = /* @__PURE__ */ new u8((/* @__PURE__ */ new i32([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  16843009,
  50528770,
  117769220,
  185207048,
  252579084,
  16
])).buffer, 0, 53);
var mlbl = /* @__PURE__ */ b2bl(mlb, 3);
var dhu = function(dat, out, hu) {
  var len = dat.length, ss = out.length, lb = dat[len - 1], msk = (1 << hu.b) - 1, eb = -hu.b;
  if (!lb)
    err(0);
  var st = 0, btr = hu.b, pos = (len << 3) - 8 + msb(lb) - btr, i = -1;
  for (; pos > eb && i < ss; ) {
    var cbt = pos >> 3;
    var val = (dat[cbt] | dat[cbt + 1] << 8 | dat[cbt + 2] << 16) >> (pos & 7);
    st = (st << btr | val) & msk;
    out[++i] = hu.s[st];
    pos -= btr = hu.n[st];
  }
  if (pos != eb || i + 1 != ss)
    err(0);
};
var dhu4 = function(dat, out, hu) {
  var bt = 6;
  var ss = out.length, sz1 = ss + 3 >> 2, sz2 = sz1 << 1, sz3 = sz1 + sz2;
  dhu(dat.subarray(bt, bt += dat[0] | dat[1] << 8), out.subarray(0, sz1), hu);
  dhu(dat.subarray(bt, bt += dat[2] | dat[3] << 8), out.subarray(sz1, sz2), hu);
  dhu(dat.subarray(bt, bt += dat[4] | dat[5] << 8), out.subarray(sz2, sz3), hu);
  dhu(dat.subarray(bt), out.subarray(sz3), hu);
};
var rzb = function(dat, st, out) {
  var _a;
  var bt = st.b;
  var b0 = dat[bt], btype = b0 >> 1 & 3;
  st.l = b0 & 1;
  var sz = b0 >> 3 | dat[bt + 1] << 5 | dat[bt + 2] << 13;
  var ebt = (bt += 3) + sz;
  if (btype == 1) {
    if (bt >= dat.length)
      return;
    st.b = bt + 1;
    if (out) {
      fill(out, dat[bt], st.y, st.y += sz);
      return out;
    }
    return fill(new u8(sz), dat[bt]);
  }
  if (ebt > dat.length)
    return;
  if (btype == 0) {
    st.b = ebt;
    if (out) {
      out.set(dat.subarray(bt, ebt), st.y);
      st.y += sz;
      return out;
    }
    return slc(dat, bt, ebt);
  }
  if (btype == 2) {
    var b3 = dat[bt], lbt = b3 & 3, sf = b3 >> 2 & 3;
    var lss = b3 >> 4, lcs = 0, s4 = 0;
    if (lbt < 2) {
      if (sf & 1)
        lss |= dat[++bt] << 4 | (sf & 2 && dat[++bt] << 12);
      else
        lss = b3 >> 3;
    } else {
      s4 = sf;
      if (sf < 2)
        lss |= (dat[++bt] & 63) << 4, lcs = dat[bt] >> 6 | dat[++bt] << 2;
      else if (sf == 2)
        lss |= dat[++bt] << 4 | (dat[++bt] & 3) << 12, lcs = dat[bt] >> 2 | dat[++bt] << 6;
      else
        lss |= dat[++bt] << 4 | (dat[++bt] & 63) << 12, lcs = dat[bt] >> 6 | dat[++bt] << 2 | dat[++bt] << 10;
    }
    ++bt;
    var buf = out ? out.subarray(st.y, st.y + st.m) : new u8(st.m);
    var spl = buf.length - lss;
    if (lbt == 0)
      buf.set(dat.subarray(bt, bt += lss), spl);
    else if (lbt == 1)
      fill(buf, dat[bt++], spl);
    else {
      var hu = st.h;
      if (lbt == 2) {
        var hud = rhu(dat, bt);
        lcs += bt - (bt = hud[0]);
        st.h = hu = hud[1];
      } else if (!hu)
        err(0);
      (s4 ? dhu4 : dhu)(dat.subarray(bt, bt += lcs), buf.subarray(spl), hu);
    }
    var ns = dat[bt++];
    if (ns) {
      if (ns == 255)
        ns = (dat[bt++] | dat[bt++] << 8) + 32512;
      else if (ns > 127)
        ns = ns - 128 << 8 | dat[bt++];
      var scm = dat[bt++];
      if (scm & 3)
        err(0);
      var dts = [dmlt, doct, dllt];
      for (var i = 2; i > -1; --i) {
        var md = scm >> (i << 1) + 2 & 3;
        if (md == 1) {
          var rbuf = new u8([0, 0, dat[bt++]]);
          dts[i] = {
            s: rbuf.subarray(2, 3),
            n: rbuf.subarray(0, 1),
            t: new u16(rbuf.buffer, 0, 1),
            b: 0
          };
        } else if (md == 2) {
          _a = rfse(dat, bt, 9 - (i & 1)), bt = _a[0], dts[i] = _a[1];
        } else if (md == 3) {
          if (!st.t)
            err(0);
          dts[i] = st.t[i];
        }
      }
      var _b = st.t = dts, mlt = _b[0], oct = _b[1], llt = _b[2];
      var lb = dat[ebt - 1];
      if (!lb)
        err(0);
      var spos = (ebt << 3) - 8 + msb(lb) - llt.b, cbt = spos >> 3, oubt = 0;
      var lst = (dat[cbt] | dat[cbt + 1] << 8) >> (spos & 7) & (1 << llt.b) - 1;
      cbt = (spos -= oct.b) >> 3;
      var ost = (dat[cbt] | dat[cbt + 1] << 8) >> (spos & 7) & (1 << oct.b) - 1;
      cbt = (spos -= mlt.b) >> 3;
      var mst = (dat[cbt] | dat[cbt + 1] << 8) >> (spos & 7) & (1 << mlt.b) - 1;
      for (++ns; --ns; ) {
        var llc = llt.s[lst];
        var lbtr = llt.n[lst];
        var mlc = mlt.s[mst];
        var mbtr = mlt.n[mst];
        var ofc = oct.s[ost];
        var obtr = oct.n[ost];
        cbt = (spos -= ofc) >> 3;
        var ofp = 1 << ofc;
        var off = ofp + ((dat[cbt] | dat[cbt + 1] << 8 | dat[cbt + 2] << 16 | dat[cbt + 3] << 24) >>> (spos & 7) & ofp - 1);
        cbt = (spos -= mlb[mlc]) >> 3;
        var ml = mlbl[mlc] + ((dat[cbt] | dat[cbt + 1] << 8 | dat[cbt + 2] << 16) >> (spos & 7) & (1 << mlb[mlc]) - 1);
        cbt = (spos -= llb[llc]) >> 3;
        var ll = llbl[llc] + ((dat[cbt] | dat[cbt + 1] << 8 | dat[cbt + 2] << 16) >> (spos & 7) & (1 << llb[llc]) - 1);
        cbt = (spos -= lbtr) >> 3;
        lst = llt.t[lst] + ((dat[cbt] | dat[cbt + 1] << 8) >> (spos & 7) & (1 << lbtr) - 1);
        cbt = (spos -= mbtr) >> 3;
        mst = mlt.t[mst] + ((dat[cbt] | dat[cbt + 1] << 8) >> (spos & 7) & (1 << mbtr) - 1);
        cbt = (spos -= obtr) >> 3;
        ost = oct.t[ost] + ((dat[cbt] | dat[cbt + 1] << 8) >> (spos & 7) & (1 << obtr) - 1);
        if (off > 3) {
          st.o[2] = st.o[1];
          st.o[1] = st.o[0];
          st.o[0] = off -= 3;
        } else {
          var idx = off - (ll != 0);
          if (idx) {
            off = idx == 3 ? st.o[0] - 1 : st.o[idx];
            if (idx > 1)
              st.o[2] = st.o[1];
            st.o[1] = st.o[0];
            st.o[0] = off;
          } else
            off = st.o[0];
        }
        for (var i = 0; i < ll; ++i) {
          buf[oubt + i] = buf[spl + i];
        }
        oubt += ll, spl += ll;
        var stin = oubt - off;
        if (stin < 0) {
          var len = -stin;
          var bs = st.e + stin;
          if (len > ml)
            len = ml;
          for (var i = 0; i < len; ++i) {
            buf[oubt + i] = st.w[bs + i];
          }
          oubt += len, ml -= len, stin = 0;
        }
        for (var i = 0; i < ml; ++i) {
          buf[oubt + i] = buf[stin + i];
        }
        oubt += ml;
      }
      if (oubt != spl) {
        while (spl < buf.length) {
          buf[oubt++] = buf[spl++];
        }
      } else
        oubt = buf.length;
      if (out)
        st.y += oubt;
      else
        buf = slc(buf, 0, oubt);
    } else if (out) {
      st.y += lss;
      if (spl) {
        for (var i = 0; i < lss; ++i) {
          buf[i] = buf[spl + i];
        }
      }
    } else if (spl)
      buf = slc(buf, spl);
    st.b = ebt;
    return buf;
  }
  err(2);
};
var cct = function(bufs, ol) {
  if (bufs.length == 1)
    return bufs[0];
  var buf = new u8(ol);
  for (var i = 0, b = 0; i < bufs.length; ++i) {
    var chk = bufs[i];
    buf.set(chk, b);
    b += chk.length;
  }
  return buf;
};
function decompress(dat, buf) {
  var bufs = [], nb = +!buf;
  var bt = 0, ol = 0;
  for (; dat.length; ) {
    var st = rzfh(dat, nb || buf);
    if (typeof st == "object") {
      if (nb) {
        buf = null;
        if (st.w.length == st.u) {
          bufs.push(buf = st.w);
          ol += st.u;
        }
      } else {
        bufs.push(buf);
        st.e = 0;
      }
      for (; !st.l; ) {
        var blk = rzb(dat, st, buf);
        if (!blk)
          err(5);
        if (buf)
          st.e = st.y;
        else {
          bufs.push(blk);
          ol += blk.length;
          cpw(st.w, 0, blk.length);
          st.w.set(blk, st.w.length - blk.length);
        }
      }
      bt = st.b + st.c * 4;
    } else
      bt = st;
    dat = dat.subarray(bt);
  }
  return cct(bufs, ol);
}

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/rbxm-parser/dist/index.mjs
function formatNum(num) {
  if (Math.abs(num) < 1e-4)
    return "0";
  return Number(num.toPrecision(5)).toString();
}
function narrowCopyArray(arr) {
  const copyArr = [];
  for (const val of arr) {
    copyArr.push(val);
  }
  return copyArr;
}
function bytesToBitArray(bytes) {
  const output = new Uint8Array(bytes.length * 8);
  for (let i = 0; i < bytes.length; i++) {
    const val = bytes[i];
    const offset = i * 8;
    for (let j = 0; j < 8; ++j) {
      const bit = val >> j & 1;
      output[7 - j + offset] = bit;
    }
  }
  return output;
}
function bitsToByteArray(bits) {
  const outBytes = new Uint8Array(bits.length / 8);
  for (let i = 0; i < 4; ++i) {
    let val = 0;
    const offset = i * 8;
    for (let j = 0; j < 8; ++j) {
      val |= bits[j + offset] << 7 - j;
    }
    outBytes[i] = val;
  }
  return outBytes;
}
function floatsEqual(num1, num2, eps = 1e-8) {
  return Math.abs(num1 - num2) < eps;
}
var DataType = /* @__PURE__ */ ((DataType2) => {
  DataType2[DataType2["String"] = 1] = "String";
  DataType2[DataType2["Bool"] = 2] = "Bool";
  DataType2[DataType2["Int32"] = 3] = "Int32";
  DataType2[DataType2["Float32"] = 4] = "Float32";
  DataType2[DataType2["Float64"] = 5] = "Float64";
  DataType2[DataType2["UDim"] = 6] = "UDim";
  DataType2[DataType2["UDim2"] = 7] = "UDim2";
  DataType2[DataType2["Ray"] = 8] = "Ray";
  DataType2[DataType2["Faces"] = 9] = "Faces";
  DataType2[DataType2["Axes"] = 10] = "Axes";
  DataType2[DataType2["BrickColor"] = 11] = "BrickColor";
  DataType2[DataType2["Color3"] = 12] = "Color3";
  DataType2[DataType2["Vector2"] = 13] = "Vector2";
  DataType2[DataType2["Vector3"] = 14] = "Vector3";
  DataType2[DataType2["CFrame"] = 16] = "CFrame";
  DataType2[DataType2["Enum"] = 18] = "Enum";
  DataType2[DataType2["Referent"] = 19] = "Referent";
  DataType2[DataType2["Vector3int16"] = 20] = "Vector3int16";
  DataType2[DataType2["NumberSequence"] = 21] = "NumberSequence";
  DataType2[DataType2["ColorSequence"] = 22] = "ColorSequence";
  DataType2[DataType2["NumberRange"] = 23] = "NumberRange";
  DataType2[DataType2["Rect"] = 24] = "Rect";
  DataType2[DataType2["PhysicalProperties"] = 25] = "PhysicalProperties";
  DataType2[DataType2["Color3uint8"] = 26] = "Color3uint8";
  DataType2[DataType2["Int64"] = 27] = "Int64";
  DataType2[DataType2["SharedString"] = 28] = "SharedString";
  DataType2[DataType2["Bytecode"] = 29] = "Bytecode";
  DataType2[DataType2["OptionalCFrame"] = 30] = "OptionalCFrame";
  DataType2[DataType2["UniqueId"] = 31] = "UniqueId";
  DataType2[DataType2["Font"] = 32] = "Font";
  DataType2[DataType2["SecurityCapabilities"] = 33] = "SecurityCapabilities";
  return DataType2;
})(DataType || {});
var ChildContainer = class {
  _children = /* @__PURE__ */ new Set();
  /**
   * Finds the first child that satisfies the given predicate.
   * @param predicate this will keep searching until the predicate returns true
   * @returns the first child that met the predicate, or undefined if none were found.
   */
  FindFirstChild(predicate) {
    for (const child of this._children) {
      if (predicate(child))
        return child;
    }
    return void 0;
  }
  /**
   * Finds the first child of a given class.
   * @param className the class name
   * @param predicate this will keep searching until the predicate returns true
   * @returns the first child of the given class or undefined
   */
  FindFirstChildOfClass(className, predicate) {
    return this.FindFirstChild((child) => child.IsA(className) && (!predicate || predicate(child)));
  }
  /**
   * Finds the first descendant that satisfies the given predicate. Performs a depth-first search.
   * @param predicate this will keep searching until the predicate returns true
   * @returns the first descendant that met the predicate, or undefined if none were found.
   */
  FindFirstDescendant(predicate) {
    for (const child of this._children) {
      if (predicate(child))
        return child;
      const childResult = child.FindFirstDescendant(predicate);
      if (childResult)
        return childResult;
    }
    return void 0;
  }
  /**
   * Finds the first descendant of a given class. Performs a depth-first search.
   * @param className the class name
   * @param predicate this will keep searching until the predicate returns true
   * @returns the first descendant of the given class or undefined
   */
  FindFirstDescendantOfClass(className, predicate) {
    return this.FindFirstDescendant((child) => child.IsA(className) && (!predicate || predicate(child)));
  }
  /**
   * Gathers a list of children that satisfy the given predicate.
   * @param predicate this will include the child if the predicate returns true
   * @returns the list of children that met the predicate, this will have a length of 0 if none were found.
   */
  FindChildren(predicate) {
    const children = [];
    for (const child of this._children) {
      if (predicate(child))
        children.push(child);
    }
    return children;
  }
  /**
   * Gathers a list of children that are of the given class.
   * @param predicate this will include the child if the predicate returns true
   * @returns the list of children, this will have a length of 0 if none were found.
   */
  FindChildrenOfClass(className, predicate) {
    return this.FindChildren((child) => child.IsA(className) && (!predicate || predicate(child)));
  }
  /**
   * Gathers a list of descendants that satisfy the given predicate.
   * @param predicate this will include the descendant if the predicate returns true
   * @returns the list of descendants that met the predicate, this will have a length of 0 if none were found.
   */
  FindDescendants(predicate) {
    const descendants = [];
    for (const child of this._children) {
      if (predicate(child))
        descendants.push(child);
      const childResult = child.FindDescendants(predicate);
      for (const descendant of childResult) {
        descendants.push(descendant);
      }
    }
    return descendants;
  }
  /**
   * Returns an array of all the instances that are a descendant of this
   * @returns an array of all descendants
   */
  GetAllDescendants() {
    const descendants = [];
    this.GetAllDescendantsHelper(descendants);
    return descendants;
  }
  GetAllDescendantsHelper(descendants) {
    for (const child of this._children) {
      descendants.push(child);
      child.GetAllDescendantsHelper(descendants);
    }
  }
  /**
  * Gathers a list of descendants that are of the given class.
  * @param predicate this will include the descendant if the predicate returns true
  * @returns the list of descendants, this will have a length of 0 if none were found.
  */
  FindDescendantsOfClass(className, predicate) {
    return this.FindDescendants((child) => child.IsA(className) && (!predicate || predicate(child)));
  }
};
var CoreInstance = class _CoreInstance extends ChildContainer {
  _classNameList = [];
  _isService;
  _props = /* @__PURE__ */ new Map();
  _parent = void 0;
  _destroyed = false;
  /**
   * Creates a new Instance.
   * @param isService whether or not this is a service, false by default
   */
  constructor(isService = false, className) {
    super();
    if (className) {
      this.addClassName(className);
    }
    this._isService = isService;
  }
  /**
   * Derived classes must use this to add their class name to the list of class
   * of this instance names in order for inheritance checks to work properly.
   * @param className the class name
   */
  addClassName(className) {
    this._classNameList.push(className);
  }
  /**
   * The children of this Instance. This is a readonly array; you cannot change children directly.
   * You must change the parent value of child instances if you want to move them.
   */
  get Children() {
    return Array.from(this._children.values());
  }
  /**
   * Read-only access to the raw property data. Meant for internal use.
   */
  get Props() {
    return this._props;
  }
  /**
   * Clears out all property data. Meant for internal use.
   */
  ResetProps() {
    this._props.clear();
  }
  /**
   * Gets a property value. This is a copy of the value.
   * @param propName the name of the property
   * @param type the DataType of the property
   * @returns The value of the property, or undefined.
   * @example
   * const size: Vector3 | undefined = part.GetProp("size", DataType.Vector3);
   */
  GetProp(propName, type) {
    const prop = this._props.get(propName);
    if (prop?.type === type) {
      return _CoreInstance.CopyValue(prop);
    }
    return void 0;
  }
  static CopyValue(rbxValue) {
    switch (rbxValue.type) {
      case 4:
      case 3:
      case 5:
      case 11:
      case 27:
      case 1:
      case 2:
      case 19:
      case 18:
      case 29:
      case 33:
        return rbxValue.value;
      default:
        return rbxValue.value.Copy();
    }
  }
  /**
   * Sets a property value.
   * @param propName the name of the property
   * @param type: the DataType of the property
   * @param value The RobloxValue to set, or undefined to reset the property to its default value.
   * @example
   * part.SetProp("size", DataType.Vector3, new Vector3(2, 3, 4));
   */
  SetProp(propName, type, value) {
    if (value === void 0) {
      this._props.delete(propName);
      return;
    }
    const valueCopy = _CoreInstance.CopyValue({ type, value });
    this._props.set(propName, { type, value: valueCopy });
  }
  /**
   * The class name.
   */
  get ClassName() {
    return this._classNameList[this._classNameList.length - 1];
  }
  /**
   * The list of class names that this inherits from, stored in order from
   * highest base class to lowest derived class.
   */
  get ClassNameList() {
    return this._classNameList;
  }
  /**
   * Whether or not this is a service.
   */
  get IsService() {
    return this._isService;
  }
  /**
   * The name of this instance.
   */
  get Name() {
    return this.GetProp(
      "Name",
      1
      /* String */
    ) ?? "";
  }
  set Name(newName) {
    this.SetProp("Name", 1, newName);
  }
  /**
   * The parent of this instance. This is undefined if the parent is the root of the model.
   */
  get Parent() {
    return this._parent;
  }
  set Parent(newParent) {
    if (this._parent === newParent) {
      return;
    }
    if (this._parent) {
      this._parent._children.delete(this);
    }
    newParent._children.add(this);
    this._parent = newParent;
  }
  /**
   * This removes the instance that this is parented to. This is mainly to allow
   * setting an instance's parent to be the root of the model. You probably shouldn't be
   * calling this since this can lead to corruption if not used properly.
   */
  RemoveParent() {
    if (this._parent) {
      this._parent._children.delete(this);
    }
    this._parent = void 0;
  }
  /**
   * @param className the class name
   * @returns whether or not this is an instance of the given class name.
   */
  IsA(className) {
    return this._classNameList.includes(className);
  }
  /**
   * This is like IsA but allows any string to be used. Does not provide strong typing unlike IsA.
   * @param className the class name
   * @returns whether or not this is an instance of the given class name.
   */
  IsAUnsafe(className) {
    return this._classNameList.includes(className);
  }
  /**
   * A title string that represents this instance for debugging purposes.
   * @returns \{Class name\} "\{Name\}"
   */
  GetTitleString() {
    return `${this.ClassName} "${this.Name}"`;
  }
  /**
   * This destroys the instance. Once you call this, you cannot use this instance
   * or any of its descendants again. If you try to, bad things will happen...
   */
  Destroy() {
    this.RemoveParent();
    this._destroyed = true;
    for (const child of this.Children) {
      child.Destroy();
    }
  }
  get IsDestroyed() {
    return this._destroyed;
  }
  toString() {
    const propStrings = [];
    this._props.forEach((value, key) => {
      if (key.toLowerCase() === "name") {
        return;
      }
      let valueStr;
      if (typeof value.value === "number") {
        valueStr = formatNum(value.value);
      } else if (typeof value.value === "string") {
        valueStr = `"${value.value}"`;
      } else {
        valueStr = value.value.toString();
      }
      propStrings.push(`${key}: ${valueStr}`);
    });
    return `${this.GetTitleString()} {${propStrings.join(", ")}}`;
  }
};
function deepCopyArray(arr) {
  const copyArr = [];
  for (const val of arr) {
    copyArr.push(val.Copy());
  }
  return copyArr;
}
var UDim = class _UDim {
  Scale;
  Offset;
  constructor(scale, offset) {
    this.Scale = scale;
    this.Offset = offset;
  }
  toString() {
    return `UDim(Scale: ${formatNum(this.Scale)}, Offset: ${formatNum(this.Offset)})`;
  }
  Copy() {
    return new _UDim(this.Scale, this.Offset);
  }
};
var UDim2 = class _UDim2 {
  X;
  Y;
  constructor(x, y) {
    this.X = x;
    this.Y = y;
  }
  toString() {
    return `UDim2(X: ${this.X}, Y: ${this.Y})`;
  }
  Copy() {
    return new _UDim2(this.X.Copy(), this.Y.Copy());
  }
};
var Ray = class _Ray {
  Origin;
  Direction;
  constructor(origin, direction) {
    this.Origin = origin;
    this.Direction = direction;
  }
  toString() {
    return `Ray(Origin: ${this.Origin}, Direction: ${this.Direction})`;
  }
  Copy() {
    return new _Ray(this.Origin, this.Direction);
  }
};
var RBXMFace = /* @__PURE__ */ ((RBXMFace2) => {
  RBXMFace2[RBXMFace2["Front"] = 1] = "Front";
  RBXMFace2[RBXMFace2["Bottom"] = 2] = "Bottom";
  RBXMFace2[RBXMFace2["Left"] = 4] = "Left";
  RBXMFace2[RBXMFace2["Back"] = 8] = "Back";
  RBXMFace2[RBXMFace2["Top"] = 16] = "Top";
  RBXMFace2[RBXMFace2["Right"] = 32] = "Right";
  return RBXMFace2;
})(RBXMFace || {});
var Faces = class _Faces {
  Faces;
  constructor(...faces) {
    this.Faces = faces;
  }
  toString() {
    if (this.Faces.length === 0) {
      return "Faces(<none>)";
    } else {
      return `Faces(${this.Faces.map((face) => RBXMFace[face]).join(", ")})`;
    }
  }
  Copy() {
    return new _Faces(...narrowCopyArray(this.Faces));
  }
};
var RBXMAxis = /* @__PURE__ */ ((RBXMAxis2) => {
  RBXMAxis2[RBXMAxis2["X"] = 1] = "X";
  RBXMAxis2[RBXMAxis2["Y"] = 2] = "Y";
  RBXMAxis2[RBXMAxis2["Z"] = 4] = "Z";
  return RBXMAxis2;
})(RBXMAxis || {});
var Axes = class _Axes {
  Axes;
  constructor(...axes) {
    this.Axes = axes;
  }
  toString() {
    if (this.Axes.length === 0) {
      return "Axes(<none>)";
    } else {
      return `Axes(${this.Axes.map((axis) => RBXMAxis[axis]).join(", ")})`;
    }
  }
  Copy() {
    return new _Axes(...narrowCopyArray(this.Axes));
  }
};
var Color3 = class _Color3 {
  R;
  G;
  B;
  constructor(r, g, b) {
    this.R = r;
    this.G = g;
    this.B = b;
  }
  /**
   * Converts a float RGB to its uint8 representation.
   * @param float a float between 0 to 1
   * @returns the uint8 form
   */
  static FloatToUint8(float) {
    return Math.round(float * 255);
  }
  /**
   * Creates a Color3 from 0-255 RGB values.
   * @param r red
   * @param g green
   * @param b blue
   * @returns a Color3
   */
  static FromRGB(r, g, b) {
    return new _Color3(r / 255, g / 255, b / 255);
  }
  toString() {
    return `Color3(R: ${_Color3.FloatToUint8(this.R)}, G: ${_Color3.FloatToUint8(this.G)}, B: ${_Color3.FloatToUint8(this.B)})`;
  }
  Copy() {
    return new _Color3(this.R, this.G, this.B);
  }
};
var Vector2 = class _Vector2 {
  X;
  Y;
  constructor(x, y) {
    this.X = x;
    this.Y = y;
  }
  /**
   * The magnitude of this Vector2.
   */
  get Magnitude() {
    return Math.sqrt(this.Dot(this));
  }
  /**
   * Calculates the cross product of two Vector2's.
   * @param other the other Vector2
   * @returns the resultant cross product
   */
  Cross(other) {
    return new _Vector2(this.X * other.Y, this.Y * other.X);
  }
  /**
   * Calculates the dot product of two Vector2's.
   * @param other the other Vector2
   * @returns the dot product
   */
  Dot(other) {
    const dotX = this.X * other.X;
    const dotY = this.Y * other.Y;
    return dotX + dotY;
  }
  /**
   * Adds two Vector2's, returns a new Vector2
   * @param other the other Vector2
   * @returns the result of the addition as a new Vector2
   */
  Add(other) {
    return new _Vector2(this.X + other.X, this.Y + other.Y);
  }
  /**
   * Subtracts two Vector2's, returns a new Vector2
   * @param other the other Vector2
   * @returns the result of the subtraction as a new Vector2
   */
  Subtract(other) {
    return new _Vector2(this.X - other.X, this.Y - other.Y);
  }
  /**
   * Multiplies this Vector2 by a scalar amount.
   * @param scalar a scalar amount
   * @returns the result of the multiplication as a new Vector2
   */
  Multiply(scalar) {
    return new _Vector2(this.X * scalar, this.Y * scalar);
  }
  /**
   * Divides this Vector2 by a scalar amount.
   * @param scalar a scalar amount
   * @returns the result of the division as a new Vector2
   */
  Divide(scalar) {
    return new _Vector2(this.X / scalar, this.Y / scalar);
  }
  toString() {
    return `Vector2(X: ${formatNum(this.X)}, Y: ${formatNum(this.Y)})`;
  }
  Copy() {
    return new _Vector2(this.X, this.Y);
  }
};
var Vector3 = class _Vector3 {
  X;
  Y;
  Z;
  constructor(x, y, z) {
    this.X = x;
    this.Y = y;
    this.Z = z;
  }
  /**
   * Unit vector that points in the positive X direction
   */
  static get XAxis() {
    return new _Vector3(1, 0, 0);
  }
  /**
   * Unit vector that points in the positive Y direction
   */
  static get YAxis() {
    return new _Vector3(0, 1, 0);
  }
  /**
   * Unit vector that points in the positive Z direction
   */
  static get ZAxis() {
    return new _Vector3(0, 0, 1);
  }
  /**
   * The magnitude of this Vector3.
   */
  get Magnitude() {
    return Math.sqrt(this.Dot(this));
  }
  /**
   * Calculates the cross product of two Vector3's.
   * @param other the other Vector3
   * @returns the resultant cross product
   */
  Cross(other) {
    const crossX = this.Y * other.Z - other.Y * this.Z;
    const crossY = this.Z * other.X - other.Z * this.X;
    const crossZ = this.X * other.Y - other.X * this.Y;
    return new _Vector3(crossX, crossY, crossZ);
  }
  /**
   * Calculates the dot product of two Vector3's.
   * @param other the other Vector3
   * @returns the dot product
   */
  Dot(other) {
    const dotX = this.X * other.X;
    const dotY = this.Y * other.Y;
    const dotZ = this.Z * other.Z;
    return dotX + dotY + dotZ;
  }
  /**
   * Adds two Vector3's, returns a new Vector3
   * @param other the other Vector3
   * @returns the result of the addition as a new Vector3
   */
  Add(other) {
    return new _Vector3(this.X + other.X, this.Y + other.Y, this.Z + other.Z);
  }
  /**
   * Subtracts two Vector3's, returns a new Vector3
   * @param other the other Vector3
   * @returns the result of the subtraction as a new Vector3
   */
  Subtract(other) {
    return new _Vector3(this.X - other.X, this.Y - other.Y, this.Z - other.Z);
  }
  /**
   * Multiplies this Vector3 by a scalar amount.
   * @param scalar a scalar amount
   * @returns the result of the multiplication as a new Vector3
   */
  Multiply(scalar) {
    return new _Vector3(this.X * scalar, this.Y * scalar, this.Z * scalar);
  }
  /**
   * Divides this Vector3 by a scalar amount.
   * @param scalar a scalar amount
   * @returns the result of the division as a new Vector3
   */
  Divide(scalar) {
    return new _Vector3(this.X / scalar, this.Y / scalar, this.Z / scalar);
  }
  toString() {
    return `Vector3(X: ${formatNum(this.X)}, Y: ${formatNum(this.Y)}, Z: ${formatNum(this.Z)})`;
  }
  Copy() {
    return new _Vector3(this.X, this.Y, this.Z);
  }
};
var CFrame = class _CFrame {
  Position;
  Orientation;
  constructor(position, orientation) {
    this.Position = position;
    this.Orientation = orientation;
  }
  /**
   * The identity CFrame
   */
  static get Identity() {
    return new _CFrame(new Vector3(0, 0, 0), [1, 0, 0, 0, 1, 0, 0, 0, 1]);
  }
  toString() {
    return `CFrame(Position: ${this.Position}, Orientation: [${this.Orientation.map(formatNum).join(", ")}])`;
  }
  Copy() {
    return new _CFrame(this.Position.Copy(), narrowCopyArray(this.Orientation));
  }
};
var NumberSequence = class _NumberSequence {
  Keypoints;
  constructor(...keypoints) {
    this.Keypoints = keypoints;
  }
  toString() {
    return `NumberSequence(Keypoints: ${this.Keypoints.join(", ")})`;
  }
  Copy() {
    return new _NumberSequence(...deepCopyArray(this.Keypoints));
  }
};
var NumberSequenceKeypoint = class _NumberSequenceKeypoint {
  Time;
  Value;
  Envelope;
  constructor(time, value, envelope) {
    this.Time = time;
    this.Value = value;
    this.Envelope = envelope;
  }
  toString() {
    return `NumberSequenceKeypoint(Time: ${formatNum(this.Time)}, Value: ${formatNum(this.Value)}, Envelope: ${formatNum(this.Envelope)})`;
  }
  Copy() {
    return new _NumberSequenceKeypoint(this.Time, this.Value, this.Envelope);
  }
};
var ColorSequence = class _ColorSequence {
  Keypoints;
  constructor(...keypoints) {
    this.Keypoints = keypoints;
  }
  toString() {
    return `ColorSequence(Keypoints: ${this.Keypoints.join(", ")})`;
  }
  Copy() {
    return new _ColorSequence(...deepCopyArray(this.Keypoints));
  }
};
var ColorSequenceKeypoint = class _ColorSequenceKeypoint {
  Time;
  Color;
  constructor(time, color) {
    this.Time = time;
    this.Color = color;
  }
  toString() {
    return `ColorSequenceKeypoint(Time: ${formatNum(this.Time)}, Color: ${this.Color})`;
  }
  Copy() {
    return new _ColorSequenceKeypoint(this.Time, this.Color.Copy());
  }
};
var NumberRange = class _NumberRange {
  Min;
  Max;
  constructor(min, max) {
    this.Min = min;
    this.Max = max;
  }
  toString() {
    return `NumberRange(Min: ${formatNum(this.Min)}, Max: ${formatNum(this.Max)})`;
  }
  Copy() {
    return new _NumberRange(this.Min, this.Max);
  }
};
var Rect = class _Rect {
  Min;
  Max;
  constructor(min, max) {
    this.Min = min;
    this.Max = max;
  }
  toString() {
    return `Rect(Min: ${this.Min}, Max: ${this.Max})`;
  }
  Copy() {
    return new _Rect(this.Min.Copy(), this.Max.Copy());
  }
};
var PhysicalProperties = class _PhysicalProperties {
  Density;
  Friction;
  Elasticity;
  FrictionWeight;
  ElasticityWeight;
  constructor(density, friction, elasticity, frictionWeight, elasticityWeight) {
    this.Density = density;
    this.Friction = friction;
    this.Elasticity = elasticity;
    this.FrictionWeight = frictionWeight;
    this.ElasticityWeight = elasticityWeight;
  }
  toString() {
    return `PhysicalProperties(Density: ${formatNum(this.Density)}, Friction: ${formatNum(this.Friction)}, Elasticity: ${formatNum(this.Elasticity)}, FrictionWeight: ${formatNum(this.FrictionWeight)}, ElasticityWeight: ${formatNum(this.ElasticityWeight)})`;
  }
  Copy() {
    return new _PhysicalProperties(this.Density, this.Friction, this.Elasticity, this.FrictionWeight, this.ElasticityWeight);
  }
};
var SharedString = class {
  Value;
  Hash;
  constructor(value, hash) {
    this.Value = value;
    if (hash) {
      this.Hash = Buffer.from(hash, "binary");
    } else {
      const input = Buffer.from(this.Value);
      this.Hash = (0, import_blake2b.default)(16).update(input).digest();
    }
  }
};
var SharedStringValue = class _SharedStringValue {
  Index;
  constructor(index) {
    this.Index = index;
  }
  toString() {
    return `SharedString(Index: ${this.Index})`;
  }
  Copy() {
    return new _SharedStringValue(this.Index);
  }
};
var UniqueId = class _UniqueId {
  Index;
  Time;
  Random;
  constructor(index, time, random) {
    this.Index = index;
    this.Time = time;
    this.Random = random;
  }
  toString() {
    return `${BigInt.asUintN(63, this.Random).toString(16).padStart(16, "0")}${this.Time.toString(16).padStart(8, "0")}${this.Index.toString(16).padStart(8, "0")}`;
  }
  Copy() {
    return new _UniqueId(this.Index, this.Time, this.Random);
  }
};
var FontWeight = /* @__PURE__ */ ((FontWeight2) => {
  FontWeight2[FontWeight2["Thin"] = 100] = "Thin";
  FontWeight2[FontWeight2["ExtraLight"] = 200] = "ExtraLight";
  FontWeight2[FontWeight2["Light"] = 300] = "Light";
  FontWeight2[FontWeight2["Regular"] = 400] = "Regular";
  FontWeight2[FontWeight2["Medium"] = 500] = "Medium";
  FontWeight2[FontWeight2["SemiBold"] = 600] = "SemiBold";
  FontWeight2[FontWeight2["Bold"] = 700] = "Bold";
  FontWeight2[FontWeight2["ExtraBold"] = 800] = "ExtraBold";
  FontWeight2[FontWeight2["Heavy"] = 900] = "Heavy";
  return FontWeight2;
})(FontWeight || {});
var FontStyle = /* @__PURE__ */ ((FontStyle2) => {
  FontStyle2[FontStyle2["Normal"] = 0] = "Normal";
  FontStyle2[FontStyle2["Italic"] = 1] = "Italic";
  return FontStyle2;
})(FontStyle || {});
var RBXMFont = class _RBXMFont {
  Family;
  Weight;
  Style;
  CachedFaceId;
  constructor(family, weight, style, cachedFaceId) {
    this.Family = family;
    this.Weight = weight;
    this.Style = style;
    this.CachedFaceId = cachedFaceId;
  }
  toString() {
    return `Font(Family: ${this.Family}, Weight: ${FontWeight[this.Weight]}, Style: ${FontStyle[this.Style]}, CachedFaceId: ${this.CachedFaceId || "<none>"})`;
  }
  Copy() {
    return new _RBXMFont(this.Family, this.Weight, this.Style, this.CachedFaceId);
  }
};
var EnumItem = class _EnumItem {
  _name;
  _value;
  constructor(name, value) {
    this._name = name, this._value = value;
  }
  /**
   * The name of this Enum.
   */
  get Name() {
    return this._name;
  }
  /**
   * The value of this Enum.
   */
  get Value() {
    return this._value;
  }
  toString() {
    return this._name !== "" ? this._name : this._value.toString();
  }
  /**
   * Allows you to construct an EnumItem that hasn't been mapped by the generated types.
   * @param value the value of the enum
   * @returns the unknown enum with the given value.
   */
  static MakeUnknownEnum(value) {
    return new _EnumItem("", value);
  }
};
var RobloxFileByteReader = class _RobloxFileByteReader {
  data;
  idx = 0;
  constructor(data = new Uint8Array()) {
    this.data = data;
  }
  get length() {
    return this.data.length;
  }
  get index() {
    return this.idx;
  }
  get dataArray() {
    return this.data;
  }
  getUint8() {
    const val = this.data[this.idx];
    ++this.idx;
    return val;
  }
  getUintOfSize(numBytes) {
    let val = 0;
    for (let i = 0; i < numBytes; ++i) {
      val += this.getUint8() << i * 8;
    }
    return val;
  }
  getUint16() {
    return this.getUintOfSize(2);
  }
  getUint32() {
    return this.getUintOfSize(4);
  }
  static bytesToInt32(bytes) {
    return Buffer.from(bytes).readInt32BE(0);
  }
  static untransformInt32(int32) {
    return int32 >> 1 ^ -(int32 & 1);
  }
  static untransformInt64(int64) {
    return int64 >> BigInt(1) ^ -(int64 & BigInt(1));
  }
  static bytesToRobloxFloat32(bytes) {
    const robloxBitArray = bytesToBitArray(bytes);
    const standardBitArray = new Uint8Array(32);
    for (let i = 0; i < 31; ++i) {
      standardBitArray[i + 1] = robloxBitArray[i];
    }
    standardBitArray[0] = robloxBitArray[31];
    const outBytes = bitsToByteArray(standardBitArray);
    return Buffer.from(outBytes).readFloatBE(0);
  }
  getBytesReversed(numBytes) {
    const bytes = new Uint8Array(numBytes);
    for (let i = numBytes - 1; i >= 0; --i) {
      bytes[i] = this.getUint8();
    }
    return bytes;
  }
  getInt16() {
    const bytes = this.getBytes(2);
    return Buffer.from(bytes).readInt16LE(0);
  }
  getInt32() {
    const bytes = this.getBytesReversed(4);
    return _RobloxFileByteReader.bytesToInt32(bytes);
  }
  getInt64() {
    const bytes = this.getBytes(8);
    return Buffer.from(bytes).readBigInt64LE(0);
  }
  getFloat32() {
    const bytes = this.getBytes(4);
    return Buffer.from(bytes).readFloatLE(0);
  }
  getFloat64() {
    const bytes = this.getBytes(8);
    return Buffer.from(bytes).readDoubleLE(0);
  }
  getBytes(numBytes) {
    const bytes = new Uint8Array(numBytes);
    for (let i = 0; i < numBytes; ++i) {
      bytes[i] = this.data[this.idx];
      ++this.idx;
    }
    return bytes;
  }
  getBytesAsString(numBytes) {
    let s = "";
    for (let i = 0; i < numBytes; ++i) {
      s += String.fromCharCode(this.data[this.idx]);
      ++this.idx;
    }
    return s;
  }
  skipBytes(numBytes) {
    this.idx += numBytes;
  }
  getString() {
    const length = this.getUint32();
    return this.getBytesAsString(length);
  }
  getBool() {
    return this.getUint8() !== 0;
  }
  static convertInterleaved(bytes, length, converter) {
    const byteSize = bytes.length / length;
    const rotatedBytes = new Array(length);
    for (let i = 0; i < length; ++i) {
      const transform = new Uint8Array(byteSize);
      for (let j = byteSize - 1; j >= 0; --j) {
        transform[j] = bytes[i + j * length];
      }
      rotatedBytes[i] = converter(transform);
    }
    return rotatedBytes;
  }
  getInterleavedFloat32Array(length) {
    const interleavedBytes = this.getBytes(length * 4);
    return _RobloxFileByteReader.convertInterleaved(interleavedBytes, length, _RobloxFileByteReader.bytesToRobloxFloat32);
  }
  getInterleavedInt32Array(length) {
    const interleavedBytes = this.getBytes(length * 4);
    const bytes = _RobloxFileByteReader.convertInterleaved(interleavedBytes, length, _RobloxFileByteReader.bytesToInt32);
    return bytes.map(_RobloxFileByteReader.untransformInt32);
  }
  getInterleavedUint32Array(length) {
    const interleavedBytes = this.getBytes(length * 4);
    return _RobloxFileByteReader.convertInterleaved(interleavedBytes, length, (bytes) => Buffer.from(bytes).readUint32BE(0));
  }
  getInterleavedInt64Array(length) {
    const interleavedBytes = this.getBytes(length * 8);
    const bytes = _RobloxFileByteReader.convertInterleaved(interleavedBytes, length, (bytes2) => Buffer.from(bytes2).readBigInt64BE(0));
    return bytes.map(_RobloxFileByteReader.untransformInt64);
  }
  getInterleavedUint64Array(length) {
    const interleavedBytes = this.getBytes(length * 8);
    return _RobloxFileByteReader.convertInterleaved(interleavedBytes, length, (bytes) => Buffer.from(bytes).readBigUint64BE(0));
  }
  getFloat32Array(length) {
    const bytes = new Array(length);
    for (let i = 0; i < length; ++i) {
      bytes[i] = this.getFloat32();
    }
    return bytes;
  }
  getFloat64Array(length) {
    const bytes = new Array(length);
    for (let i = 0; i < length; ++i) {
      bytes[i] = this.getFloat64();
    }
    return bytes;
  }
  getReferentArray(length) {
    const referents = this.getInterleavedInt32Array(length);
    for (let i = 1; i < length; ++i) {
      referents[i] = referents[i - 1] + referents[i];
    }
    return referents;
  }
};
var RobloxFileByteWriter = class _RobloxFileByteWriter {
  data = [];
  get bytes() {
    return new Uint8Array(this.data);
  }
  putUint8(uint8) {
    this.data.push(uint8);
  }
  putUint16(uint16) {
    const buf = Buffer.alloc(2);
    buf.writeUInt16LE(uint16);
    this.putBytes(buf);
  }
  putUint32(uint32) {
    const buf = Buffer.alloc(4);
    buf.writeUInt32LE(uint32);
    this.putBytes(buf);
  }
  static int32ToBytes(int32) {
    const buf = Buffer.alloc(4);
    buf.writeInt32BE(int32);
    return buf;
  }
  static transformInt32(int32) {
    return int32 << 1 ^ int32 >> 31;
  }
  static transformInt64(int64) {
    return int64 << BigInt(1) ^ int64 >> BigInt(63);
  }
  static f32ToRobloxF32Bytes(f32) {
    const bytes = Buffer.allocUnsafe(4);
    bytes.writeFloatBE(f32);
    const origBitArray = bytesToBitArray(bytes);
    const robloxBitArray = new Uint8Array(32);
    for (let i = 0; i < 31; ++i) {
      robloxBitArray[i] = origBitArray[i + 1];
    }
    robloxBitArray[31] = origBitArray[0];
    return bitsToByteArray(robloxBitArray);
  }
  putBytesReversed(bytes) {
    for (let i = bytes.length - 1; i >= 0; --i) {
      this.putUint8(bytes[i]);
    }
  }
  putInt16(int16) {
    const buf = Buffer.alloc(2);
    buf.writeInt16LE(int16);
    this.putBytes(buf);
  }
  putInt32(int32) {
    this.putBytesReversed(_RobloxFileByteWriter.int32ToBytes(int32));
  }
  putInt64(int64) {
    const buf = Buffer.alloc(8);
    buf.writeBigInt64LE(int64);
    this.putBytes(buf);
  }
  putFloat32(f32) {
    const buf = Buffer.alloc(4);
    buf.writeFloatLE(f32);
    this.putBytes(buf);
  }
  putFloat64(f64) {
    const buf = Buffer.alloc(8);
    buf.writeDoubleLE(f64);
    this.putBytes(buf);
  }
  putBytes(bytes) {
    for (const byte of bytes) {
      this.putUint8(byte);
    }
  }
  putStringAsBytes(str) {
    for (let i = 0; i < str.length; ++i) {
      this.putUint8(str.charCodeAt(i));
    }
  }
  putString(str) {
    this.putUint32(str.length);
    return this.putStringAsBytes(str);
  }
  putBool(bool) {
    this.putUint8(bool ? 1 : 0);
  }
  putBytesInterleaved(bytes, length) {
    const byteSize = bytes.length / length;
    const rotatedBytes = new Uint8Array(bytes.length);
    for (let i = 0; i < length; ++i) {
      for (let j = 0; j < byteSize; ++j) {
        rotatedBytes[j * length + i] = bytes[i * byteSize + j];
      }
    }
    this.putBytes(rotatedBytes);
  }
  putInterleavedFloat32Array(nums) {
    const bytes = new Uint8Array(nums.length * 4);
    for (let i = 0; i < nums.length; ++i) {
      const rbxF32bytes = _RobloxFileByteWriter.f32ToRobloxF32Bytes(nums[i]);
      for (let j = 0; j < 4; ++j) {
        bytes[i * 4 + j] = rbxF32bytes[j];
      }
    }
    this.putBytesInterleaved(bytes, nums.length);
  }
  putInterleavedInt32Array(nums) {
    const bytes = new Uint8Array(nums.length * 4);
    for (let i = 0; i < nums.length; ++i) {
      const buf = Buffer.allocUnsafe(4);
      buf.writeInt32BE(_RobloxFileByteWriter.transformInt32(nums[i]));
      for (let j = 0; j < 4; ++j) {
        bytes[i * 4 + j] = buf[j];
      }
    }
    this.putBytesInterleaved(bytes, nums.length);
  }
  putInterleavedUint32Array(nums) {
    const bytes = new Uint8Array(nums.length * 4);
    for (let i = 0; i < nums.length; ++i) {
      const buf = Buffer.allocUnsafe(4);
      buf.writeUint32BE(nums[i]);
      for (let j = 0; j < 4; ++j) {
        bytes[i * 4 + j] = buf[j];
      }
    }
    this.putBytesInterleaved(bytes, nums.length);
  }
  putInterleavedInt64Array(nums) {
    const bytes = new Uint8Array(nums.length * 8);
    for (let i = 0; i < nums.length; ++i) {
      const buf = Buffer.allocUnsafe(8);
      buf.writeBigInt64BE(_RobloxFileByteWriter.transformInt64(nums[i]));
      for (let j = 0; j < 8; ++j) {
        bytes[i * 8 + j] = buf[j];
      }
    }
    this.putBytesInterleaved(bytes, nums.length);
  }
  putInterleavedUint64Array(nums) {
    const bytes = new Uint8Array(nums.length * 8);
    for (let i = 0; i < nums.length; ++i) {
      const buf = Buffer.allocUnsafe(8);
      buf.writeBigUint64BE(nums[i]);
      for (let j = 0; j < 4; ++j) {
        bytes[i * 8 + j] = buf[j];
      }
    }
    this.putBytesInterleaved(bytes, nums.length);
  }
  putFloat32Array(nums) {
    for (const num of nums) {
      this.putFloat32(num);
    }
  }
  putFloat64Array(nums) {
    for (const num of nums) {
      this.putFloat64(num);
    }
  }
  putReferentArray(referents) {
    if (referents.length < 1) {
      return;
    }
    let prevReferent = referents[0];
    const accumlated = [prevReferent];
    for (let i = 1; i < referents.length; ++i) {
      const curReferent = referents[i];
      accumlated.push(curReferent - prevReferent);
      prevReferent = curReferent;
    }
    this.putInterleavedInt32Array(accumlated);
  }
};
var RobloxFileDOM = class {
  MAGIC_HEADER = "<roblox!\x89\xFF\r\n\n";
  MAGIC_END = "</roblox>";
  dataTypeParsers = /* @__PURE__ */ new Map();
  classIdToInfo = /* @__PURE__ */ new Map();
  referentIdToClassId = /* @__PURE__ */ new Map();
  constructor() {
    this.dataTypeParsers.set(1, new StringParser());
    this.dataTypeParsers.set(2, new BoolParser());
    this.dataTypeParsers.set(3, new Int32Parser());
    this.dataTypeParsers.set(4, new Float32Parser());
    this.dataTypeParsers.set(5, new Float64Parser());
    this.dataTypeParsers.set(6, new UDimParser());
    this.dataTypeParsers.set(7, new UDim2Parser());
    this.dataTypeParsers.set(8, new RayParser());
    this.dataTypeParsers.set(9, new FacesParser());
    this.dataTypeParsers.set(10, new AxesParser());
    this.dataTypeParsers.set(11, new BrickColorParser());
    this.dataTypeParsers.set(12, new Color3Parser());
    this.dataTypeParsers.set(13, new Vector2Parser());
    this.dataTypeParsers.set(14, new Vector3Parser());
    this.dataTypeParsers.set(16, new CFrameParser());
    this.dataTypeParsers.set(18, new EnumParser());
    this.dataTypeParsers.set(19, new ReferentParser());
    this.dataTypeParsers.set(26, new Color3uint8Parser());
    this.dataTypeParsers.set(20, new Vector3int16Parser());
    this.dataTypeParsers.set(21, new NumberSequenceParser());
    this.dataTypeParsers.set(22, new ColorSequenceParser());
    this.dataTypeParsers.set(23, new NumberRangeParser());
    this.dataTypeParsers.set(24, new RectParser());
    this.dataTypeParsers.set(25, new PhysicalPropertiesParser());
    this.dataTypeParsers.set(27, new Int64Parser());
    this.dataTypeParsers.set(28, new SharedStringParser());
    this.dataTypeParsers.set(29, new BytecodeParser());
    this.dataTypeParsers.set(30, new OptionalCFrameParser());
    this.dataTypeParsers.set(31, new UniqueIdParser());
    this.dataTypeParsers.set(32, new FontParser());
    this.dataTypeParsers.set(33, new SecurityCapabilitiesParser());
  }
};
var DataTypeParser = class {
};
var StringParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    for (let i = 0; i < numInstances; ++i) {
      const str = bytes.getString();
      outValues.push(str ? { type: 1, value: str } : void 0);
    }
  }
  write(writer, values) {
    for (const value of values) {
      if (value?.type === 1) {
        writer.putString(value.value);
      } else {
        writer.putString("");
      }
    }
  }
};
var BoolParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    for (let i = 0; i < numInstances; ++i) {
      const bool = bytes.getBool();
      outValues.push({ type: 2, value: bool });
    }
  }
  write(writer, values) {
    for (const value of values) {
      if (value?.type === 2) {
        writer.putBool(value.value);
      } else {
        writer.putBool(false);
      }
    }
  }
};
var Int32Parser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const ints = bytes.getInterleavedInt32Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 3, value: ints[i] });
    }
  }
  write(writer, values) {
    const nums = [];
    for (const value of values) {
      if (value?.type === 3) {
        nums.push(value.value);
      } else {
        nums.push(0);
      }
    }
    writer.putInterleavedInt32Array(nums);
  }
};
var Float32Parser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const floats = bytes.getInterleavedFloat32Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 4, value: floats[i] });
    }
  }
  write(writer, values) {
    const nums = [];
    for (const value of values) {
      if (value?.type === 4) {
        nums.push(value.value);
      } else {
        nums.push(0);
      }
    }
    writer.putInterleavedFloat32Array(nums);
  }
};
var Float64Parser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const floats = bytes.getFloat64Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 5, value: floats[i] });
    }
  }
  write(writer, values) {
    const nums = [];
    for (const value of values) {
      if (value?.type === 5) {
        nums.push(value.value);
      } else {
        nums.push(0);
      }
    }
    writer.putFloat64Array(nums);
  }
};
var UDimParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const scales = bytes.getInterleavedFloat32Array(numInstances);
    const offsets = bytes.getInterleavedInt32Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 6, value: new UDim(scales[i], offsets[i]) });
    }
  }
  write(writer, values) {
    const scales = [];
    const offsets = [];
    for (const value of values) {
      if (value?.type === 6) {
        scales.push(value.value.Scale);
        offsets.push(value.value.Offset);
      } else {
        scales.push(0);
        offsets.push(0);
      }
    }
    writer.putInterleavedFloat32Array(scales);
    writer.putInterleavedInt32Array(offsets);
  }
};
var UDim2Parser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const scalesX = bytes.getInterleavedFloat32Array(numInstances);
    const scalesY = bytes.getInterleavedFloat32Array(numInstances);
    const offsetsX = bytes.getInterleavedInt32Array(numInstances);
    const offsetsY = bytes.getInterleavedInt32Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      const x = new UDim(scalesX[i], offsetsX[i]);
      const y = new UDim(scalesY[i], offsetsY[i]);
      outValues.push({ type: 7, value: new UDim2(x, y) });
    }
  }
  write(writer, values) {
    const scalesX = [];
    const scalesY = [];
    const offsetsX = [];
    const offsetsY = [];
    for (const value of values) {
      if (value?.type === 7) {
        const x = value.value.X;
        const y = value.value.Y;
        scalesX.push(x.Scale);
        scalesY.push(y.Scale);
        offsetsX.push(x.Offset);
        offsetsY.push(y.Offset);
      } else {
        scalesX.push(0);
        scalesY.push(0);
        offsetsX.push(0);
        offsetsY.push(0);
      }
    }
    writer.putInterleavedFloat32Array(scalesX);
    writer.putInterleavedFloat32Array(scalesY);
    writer.putInterleavedInt32Array(offsetsX);
    writer.putInterleavedInt32Array(offsetsY);
  }
};
var RayParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    for (let i = 0; i < numInstances; ++i) {
      const origin = new Vector3(bytes.getFloat32(), bytes.getFloat32(), bytes.getFloat32());
      const direction = new Vector3(bytes.getFloat32(), bytes.getFloat32(), bytes.getFloat32());
      outValues.push({ type: 8, value: new Ray(origin, direction) });
    }
  }
  write(writer, values) {
    for (const value of values) {
      if (value?.type === 8) {
        const ray = value.value;
        writer.putFloat32(ray.Origin.X);
        writer.putFloat32(ray.Origin.Y);
        writer.putFloat32(ray.Origin.Z);
        writer.putFloat32(ray.Direction.X);
        writer.putFloat32(ray.Direction.Y);
        writer.putFloat32(ray.Direction.Z);
      } else {
        writer.putFloat32(0);
        writer.putFloat32(0);
        writer.putFloat32(0);
        writer.putFloat32(0);
        writer.putFloat32(0);
        writer.putFloat32(0);
      }
    }
  }
};
var FacesParser = class extends DataTypeParser {
  FacesList = [
    1,
    2,
    4,
    8,
    16,
    32
    /* Right */
  ];
  read(bytes, numInstances, outValues) {
    for (let i = 0; i < numInstances; ++i) {
      const faces = new Array();
      const facesBytes = bytes.getUint8();
      for (const face of this.FacesList) {
        if ((facesBytes & face) > 0) {
          faces.push(face);
        }
      }
      outValues.push({ type: 9, value: new Faces(...faces) });
    }
  }
  write(writer, values) {
    for (const value of values) {
      if (value?.type === 9) {
        let bitMask = 0;
        for (const face of value.value.Faces) {
          bitMask |= face;
        }
        writer.putUint8(bitMask);
      } else {
        writer.putUint8(0);
      }
    }
  }
};
var AxesParser = class extends DataTypeParser {
  AxisList = [
    1,
    2,
    4
    /* Z */
  ];
  read(bytes, numInstances, outValues) {
    for (let i = 0; i < numInstances; ++i) {
      const axes = new Array();
      const axesBytes = bytes.getUint8();
      for (const axis of this.AxisList) {
        if ((axesBytes & axis) > 0) {
          axes.push(axis);
        }
      }
      outValues.push({ type: 10, value: new Axes(...axes) });
    }
  }
  write(writer, values) {
    for (const value of values) {
      if (value?.type === 10) {
        let bitMask = 0;
        for (const axis of value.value.Axes) {
          bitMask |= axis;
        }
        writer.putUint8(bitMask);
      } else {
        writer.putUint8(0);
      }
    }
  }
};
var BrickColorParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const brickColors = bytes.getInterleavedUint32Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 11, value: brickColors[i] });
    }
  }
  write(writer, values) {
    const brickColors = [];
    for (const value of values) {
      if (value?.type === 11) {
        brickColors.push(value.value);
      } else {
        brickColors.push(0);
      }
    }
    writer.putInterleavedUint32Array(brickColors);
  }
};
var Color3Parser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const rVals = bytes.getInterleavedFloat32Array(numInstances);
    const gVals = bytes.getInterleavedFloat32Array(numInstances);
    const bVals = bytes.getInterleavedFloat32Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 12, value: new Color3(rVals[i], gVals[i], bVals[i]) });
    }
  }
  write(writer, values) {
    const r = [];
    const g = [];
    const b = [];
    for (const value of values) {
      if (value?.type === 12) {
        const color = value.value;
        r.push(color.R);
        g.push(color.G);
        b.push(color.B);
      } else {
        r.push(0);
        g.push(0);
        b.push(0);
      }
    }
    writer.putInterleavedFloat32Array(r);
    writer.putInterleavedFloat32Array(g);
    writer.putInterleavedFloat32Array(b);
  }
};
var Vector2Parser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const xVals = bytes.getInterleavedFloat32Array(numInstances);
    const yVals = bytes.getInterleavedFloat32Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 13, value: new Vector2(xVals[i], yVals[i]) });
    }
  }
  write(writer, values) {
    const x = [];
    const y = [];
    for (const value of values) {
      if (value?.type === 13) {
        x.push(value.value.X);
        y.push(value.value.Y);
      } else {
        x.push(0);
        y.push(0);
      }
    }
    writer.putInterleavedFloat32Array(x);
    writer.putInterleavedFloat32Array(y);
  }
};
var Vector3Parser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const xVals = bytes.getInterleavedFloat32Array(numInstances);
    const yVals = bytes.getInterleavedFloat32Array(numInstances);
    const zVals = bytes.getInterleavedFloat32Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 14, value: new Vector3(xVals[i], yVals[i], zVals[i]) });
    }
  }
  write(writer, values) {
    const x = [];
    const y = [];
    const z = [];
    for (const value of values) {
      if (value?.type === 14) {
        x.push(value.value.X);
        y.push(value.value.Y);
        z.push(value.value.Z);
      } else {
        x.push(0);
        y.push(0);
        z.push(0);
      }
    }
    writer.putInterleavedFloat32Array(x);
    writer.putInterleavedFloat32Array(y);
    writer.putInterleavedFloat32Array(z);
  }
};
var CFrameParser = class _CFrameParser extends DataTypeParser {
  orientIdToArray = /* @__PURE__ */ new Map([
    [2, [1, 0, 0, 0, 1, 0, 0, 0, 1]],
    [3, [1, 0, 0, 0, 0, -1, 0, 1, 0]],
    [5, [1, 0, 0, 0, -1, 0, 0, 0, -1]],
    [6, [1, 0, 0, 0, 0, 1, 0, -1, 0]],
    [7, [0, 1, 0, 1, 0, 0, 0, 0, -1]],
    [9, [0, 0, 1, 1, 0, 0, 0, 1, 0]],
    [10, [0, -1, 0, 1, 0, 0, 0, 0, 1]],
    [12, [0, 0, -1, 1, 0, 0, 0, -1, 0]],
    [13, [0, 1, 0, 0, 0, 1, 1, 0, 0]],
    [14, [0, 0, -1, 0, 1, 0, 1, 0, 0]],
    [16, [0, -1, 0, 0, 0, -1, 1, 0, 0]],
    [17, [0, 0, 1, 0, -1, 0, 1, 0, 0]],
    [20, [-1, 0, 0, 0, 1, 0, 0, 0, -1]],
    [21, [-1, 0, 0, 0, 0, 1, 0, 1, 0]],
    [23, [-1, 0, 0, 0, -1, 0, 0, 0, 1]],
    [24, [-1, 0, 0, 0, 0, -1, 0, -1, 0]],
    [25, [0, 1, 0, -1, 0, 0, 0, 0, 1]],
    [27, [0, 0, -1, -1, 0, 0, 0, 1, 0]],
    [28, [0, -1, 0, -1, 0, 0, 0, 0, -1]],
    [30, [0, 0, 1, -1, 0, 0, 0, -1, 0]],
    [31, [0, 1, 0, 0, 0, -1, -1, 0, 0]],
    [32, [0, 0, 1, 0, 1, 0, -1, 0, 0]],
    [34, [0, -1, 0, 0, 0, 1, -1, 0, 0]],
    [35, [0, 0, -1, 0, -1, 0, -1, 0, 0]]
  ]);
  orientationToId = /* @__PURE__ */ new Map();
  constructor() {
    super();
    for (const [orientId, orientation] of this.orientIdToArray) {
      this.orientationToId.set(_CFrameParser.getOrientationKey(orientation), orientId);
    }
  }
  read(bytes, numInstances, outValues) {
    const orientations = [];
    for (let i = 0; i < numInstances; ++i) {
      const orientId = bytes.getUint8();
      if (orientId > 0) {
        const orientation = this.getOrientationFromId(orientId);
        orientations.push(orientation);
      } else {
        orientations.push(bytes.getFloat32Array(9));
      }
    }
    const xVals = bytes.getInterleavedFloat32Array(numInstances);
    const yVals = bytes.getInterleavedFloat32Array(numInstances);
    const zVals = bytes.getInterleavedFloat32Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      const position = new Vector3(xVals[i], yVals[i], zVals[i]);
      const orientation = orientations[i];
      outValues.push({ type: 16, value: new CFrame(position, orientation) });
    }
  }
  write(writer, values) {
    this.writeCFrame(
      writer,
      values,
      16
      /* CFrame */
    );
  }
  writeCFrame(writer, values, type) {
    const hasValueArray = [];
    const x = [];
    const y = [];
    const z = [];
    for (const value of values) {
      const hasValue = value?.type === type;
      hasValueArray.push(hasValue);
      const cframe = hasValue ? value.value : CFrame.Identity;
      const orientId = this.getOrientId(cframe.Orientation);
      if (orientId === -1) {
        writer.putUint8(0);
        writer.putFloat32Array(cframe.Orientation);
      } else {
        writer.putUint8(orientId);
      }
      const pos = cframe.Position;
      x.push(pos.X);
      y.push(pos.Y);
      z.push(pos.Z);
    }
    writer.putInterleavedFloat32Array(x);
    writer.putInterleavedFloat32Array(y);
    writer.putInterleavedFloat32Array(z);
    return hasValueArray;
  }
  getOrientationFromId(orientId) {
    const orientation = this.orientIdToArray.get(orientId);
    if (!orientation) {
      return [];
    }
    return narrowCopyArray(orientation);
  }
  getOrientId(orientation) {
    for (let i = 0; i < 9; i += 3) {
      let equalsZero = 0;
      let equalsOne = 0;
      for (let j = 0; j < 3; ++j) {
        const val = Math.abs(orientation[i + j]);
        if (floatsEqual(val, 0)) {
          equalsZero += 1;
        } else if (floatsEqual(val, 1)) {
          equalsOne += 1;
        }
      }
      if (equalsZero !== 2 || equalsOne !== 1) {
        return -1;
      }
    }
    const key = _CFrameParser.getOrientationKey(orientation);
    const id = this.orientationToId.get(key);
    return id ?? -1;
  }
  static getOrientationKey(orientation) {
    let key = 0;
    for (let i = 0; i < 9; ++i) {
      const val = Math.round(orientation[i]);
      if (val < 0) {
        key |= 1 << i + 9;
      } else if (val > 0) {
        key |= 1 << i;
      }
    }
    return key;
  }
};
var EnumParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues, extraInfo) {
    const enumValues = bytes.getInterleavedUint32Array(numInstances);
    const enumFactory = extraInfo?.enumFactory;
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 18, value: this.createEnumValue(enumValues[i], enumFactory) });
    }
  }
  createEnumValue(value, enumFactory) {
    if (enumFactory) {
      const enumValue = enumFactory(value);
      return enumValue ?? EnumItem.MakeUnknownEnum(value);
    }
    return EnumItem.MakeUnknownEnum(value);
  }
  write(writer, values) {
    const enums = [];
    for (const value of values) {
      if (value?.type === 18) {
        enums.push(value.value.Value);
      } else {
        enums.push(0);
      }
    }
    writer.putInterleavedUint32Array(enums);
  }
};
var ReferentParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues, extraInfo) {
    const referents = bytes.getReferentArray(numInstances);
    const getInstance = extraInfo?.getInstanceFromReferent;
    for (let i = 0; i < numInstances; ++i) {
      const referent = referents[i];
      const instance = getInstance ? getInstance(referent) : null;
      outValues.push(instance ? { type: 19, value: instance } : void 0);
    }
  }
  write(writer, values, extraInfo) {
    const referents = [];
    const getReferent = extraInfo?.getReferentFromInstance;
    for (const value of values) {
      if (value?.type === 19) {
        referents.push(getReferent ? getReferent(value.value) : -1);
      } else {
        referents.push(-1);
      }
    }
    writer.putReferentArray(referents);
  }
};
var Color3uint8Parser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const rVals = bytes.getBytes(numInstances);
    const gVals = bytes.getBytes(numInstances);
    const bVals = bytes.getBytes(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 26, value: Color3.FromRGB(rVals[i], gVals[i], bVals[i]) });
    }
  }
  write(writer, values) {
    const r = [];
    const g = [];
    const b = [];
    for (const value of values) {
      if (value?.type === 26) {
        const color = value.value;
        r.push(Color3.FloatToUint8(color.R));
        g.push(Color3.FloatToUint8(color.G));
        b.push(Color3.FloatToUint8(color.B));
      } else {
        r.push(0);
        g.push(0);
        b.push(0);
      }
    }
    writer.putBytes(new Uint8Array(r));
    writer.putBytes(new Uint8Array(g));
    writer.putBytes(new Uint8Array(b));
  }
};
var Vector3int16Parser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    for (let i = 0; i < numInstances; ++i) {
      const x = bytes.getInt16();
      const y = bytes.getInt16();
      const z = bytes.getInt16();
      outValues.push({ type: 20, value: new Vector3(x, y, z) });
    }
  }
  write(writer, values) {
    for (const value of values) {
      if (value?.type === 20) {
        const vec = value.value;
        writer.putInt16(vec.X);
        writer.putInt16(vec.Y);
        writer.putInt16(vec.Z);
      } else {
        writer.putInt16(0);
        writer.putInt16(0);
        writer.putInt16(0);
      }
    }
  }
};
var NumberSequenceParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    for (let i = 0; i < numInstances; ++i) {
      const keypoints = [];
      const numKeypoints = bytes.getUint32();
      for (let j = 0; j < numKeypoints; ++j) {
        const time = bytes.getFloat32();
        const value = bytes.getFloat32();
        const envelope = bytes.getFloat32();
        keypoints.push(new NumberSequenceKeypoint(time, value, envelope));
      }
      outValues.push({ type: 21, value: new NumberSequence(...keypoints) });
    }
  }
  write(writer, values) {
    for (const value of values) {
      if (value?.type === 21) {
        const seq = value.value;
        writer.putUint32(seq.Keypoints.length);
        for (const keypt of seq.Keypoints) {
          writer.putFloat32(keypt.Time);
          writer.putFloat32(keypt.Value);
          writer.putFloat32(keypt.Envelope);
        }
      } else {
        writer.putUint32(0);
      }
    }
  }
};
var ColorSequenceParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    for (let i = 0; i < numInstances; ++i) {
      const keypoints = [];
      const numKeypoints = bytes.getUint32();
      for (let j = 0; j < numKeypoints; ++j) {
        const time = bytes.getFloat32();
        const r = bytes.getFloat32();
        const g = bytes.getFloat32();
        const b = bytes.getFloat32();
        bytes.getFloat32();
        keypoints.push(new ColorSequenceKeypoint(time, new Color3(r, g, b)));
      }
      outValues.push({ type: 22, value: new ColorSequence(...keypoints) });
    }
  }
  write(writer, values) {
    for (const value of values) {
      if (value?.type === 22) {
        const seq = value.value;
        writer.putUint32(seq.Keypoints.length);
        for (const keypt of seq.Keypoints) {
          writer.putFloat32(keypt.Time);
          writer.putFloat32(keypt.Color.R);
          writer.putFloat32(keypt.Color.G);
          writer.putFloat32(keypt.Color.B);
          writer.putFloat32(0);
        }
      } else {
        writer.putUint32(0);
      }
    }
  }
};
var NumberRangeParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    for (let i = 0; i < numInstances; ++i) {
      const min = bytes.getFloat32();
      const max = bytes.getFloat32();
      outValues.push({ type: 23, value: new NumberRange(min, max) });
    }
  }
  write(writer, values) {
    for (const value of values) {
      if (value?.type === 23) {
        writer.putFloat32(value.value.Min);
        writer.putFloat32(value.value.Max);
      } else {
        writer.putFloat32(0);
        writer.putFloat32(0);
      }
    }
  }
};
var RectParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const minXs = bytes.getInterleavedFloat32Array(numInstances);
    const minYs = bytes.getInterleavedFloat32Array(numInstances);
    const maxXs = bytes.getInterleavedFloat32Array(numInstances);
    const maxYs = bytes.getInterleavedFloat32Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      const min = new Vector2(minXs[i], minYs[i]);
      const max = new Vector2(maxXs[i], maxYs[i]);
      outValues.push({ type: 24, value: new Rect(min, max) });
    }
  }
  write(writer, values) {
    const minXs = [];
    const minYs = [];
    const maxXs = [];
    const maxYs = [];
    for (const value of values) {
      if (value?.type === 24) {
        const rect = value.value;
        minXs.push(rect.Min.X);
        minYs.push(rect.Min.Y);
        maxXs.push(rect.Max.X);
        maxYs.push(rect.Max.Y);
      } else {
        minXs.push(0);
        minYs.push(0);
        maxXs.push(0);
        maxYs.push(0);
      }
    }
    writer.putInterleavedFloat32Array(minXs);
    writer.putInterleavedFloat32Array(minYs);
    writer.putInterleavedFloat32Array(maxXs);
    writer.putInterleavedFloat32Array(maxYs);
  }
};
var PhysicalPropertiesParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    for (let i = 0; i < numInstances; ++i) {
      if (!bytes.getBool()) {
        outValues.push(void 0);
        continue;
      }
      const density = bytes.getFloat32();
      const friction = bytes.getFloat32();
      const elasticity = bytes.getFloat32();
      const frictionWeight = bytes.getFloat32();
      const elasticityWeight = bytes.getFloat32();
      outValues.push({ type: 25, value: new PhysicalProperties(density, friction, elasticity, frictionWeight, elasticityWeight) });
    }
  }
  write(writer, values) {
    for (const value of values) {
      if (value?.type === 25) {
        const props = value.value;
        writer.putBool(true);
        writer.putFloat32(props.Density);
        writer.putFloat32(props.Friction);
        writer.putFloat32(props.Elasticity);
        writer.putFloat32(props.FrictionWeight);
        writer.putFloat32(props.ElasticityWeight);
      } else {
        writer.putBool(false);
      }
    }
  }
};
var Int64Parser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const int64s = bytes.getInterleavedInt64Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 27, value: int64s[i] });
    }
  }
  write(writer, values) {
    const nums = [];
    for (const value of values) {
      if (value?.type === 27) {
        nums.push(value.value);
      } else {
        nums.push(BigInt(0));
      }
    }
    writer.putInterleavedInt64Array(nums);
  }
};
var SharedStringParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const indices = bytes.getInterleavedUint32Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 28, value: new SharedStringValue(indices[i]) });
    }
  }
  write(writer, values, extraInfo) {
    const sharedStrings = extraInfo?.sharedStrings;
    if (sharedStrings === void 0) {
      throw new Error("Missing shared strings array");
    }
    const indices = [];
    for (const value of values) {
      if (value?.type === 28) {
        indices.push(value.value.Index);
      } else {
        sharedStrings.push(new SharedString(""));
        indices.push(sharedStrings.length - 1);
      }
    }
    writer.putInterleavedUint32Array(indices);
  }
};
var BytecodeParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    for (let i = 0; i < numInstances; ++i) {
      const byteCode = bytes.getString();
      outValues.push(byteCode ? { type: 29, value: byteCode } : void 0);
    }
  }
  write(writer, values) {
    for (const value of values) {
      if (value?.type === 29) {
        writer.putString(value.value);
      } else {
        writer.putString("");
      }
    }
  }
};
var OptionalCFrameParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    bytes.getUint8();
    const cFrameValues = [];
    new CFrameParser().read(bytes, numInstances, cFrameValues);
    bytes.getUint8();
    for (let i = 0; i < numInstances; ++i) {
      const hasValue = bytes.getBool();
      const cFrame = cFrameValues[i];
      if (hasValue && cFrame) {
        outValues.push({ type: 30, value: cFrame.value });
      } else {
        outValues.push(void 0);
      }
    }
  }
  write(writer, values) {
    writer.putUint8(
      16
      /* CFrame */
    );
    const hasValueArray = new CFrameParser().writeCFrame(
      writer,
      values,
      30
      /* OptionalCFrame */
    );
    writer.putUint8(2);
    for (const hasValue of hasValueArray) {
      writer.putBool(hasValue);
    }
  }
};
var UniqueIdParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const interleavedBytes = bytes.getBytes(numInstances * 16);
    const uniqueIds = RobloxFileByteReader.convertInterleaved(interleavedBytes, numInstances, (bytes2) => {
      const reader = new RobloxFileByteReader(bytes2.reverse());
      const random = RobloxFileByteReader.untransformInt64(reader.getInt64());
      const time = reader.getUint32();
      const index = reader.getUint32();
      return new UniqueId(index, time, random);
    });
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 31, value: uniqueIds[i] });
    }
  }
  write(writer, values) {
    const idWriter = new RobloxFileByteWriter();
    for (let i = values.length - 1; i >= 0; --i) {
      const value = values[i];
      if (!value || value.type !== 31) {
        throw new Error("Tried to write missing unique ID");
      }
      const id = value.value;
      idWriter.putInt64(RobloxFileByteWriter.transformInt64(id.Random));
      idWriter.putUint32(id.Time);
      idWriter.putUint32(id.Index);
    }
    writer.putBytesInterleaved(idWriter.bytes.reverse(), values.length);
  }
};
var FontParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    for (let i = 0; i < numInstances; ++i) {
      const family = bytes.getString();
      const weight = bytes.getUint16();
      const style = bytes.getUint8();
      const cachedFaceId = bytes.getString();
      outValues.push({ type: 32, value: new RBXMFont(family, weight, style, cachedFaceId) });
    }
  }
  write(writer, values) {
    for (const value of values) {
      if (value?.type === 32) {
        const font = value.value;
        writer.putString(font.Family);
        writer.putUint16(font.Weight);
        writer.putUint8(font.Style);
        writer.putString(font.CachedFaceId ?? "");
      } else {
        writer.putString("");
        writer.putUint16(0);
        writer.putUint8(0);
        writer.putString("");
      }
    }
  }
};
var SecurityCapabilitiesParser = class extends DataTypeParser {
  read(bytes, numInstances, outValues) {
    const values = bytes.getInterleavedUint64Array(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      outValues.push({ type: 33, value: values[i] });
    }
  }
  write(writer, values) {
    const nums = [];
    for (const value of values) {
      if (value?.type === 33) {
        nums.push(value.value);
      } else {
        nums.push(BigInt(0));
      }
    }
    writer.putInterleavedInt64Array(nums);
  }
};
var Instance = class extends CoreInstance {
  constructor(isService = false) {
    super(isService);
    this.addClassName("Instance");
    this.AttributesSerialize = "";
    this.Capabilities = BigInt(0);
    this.DefinesCapabilities = false;
    this.HistoryId = new UniqueId(0, 0, BigInt(0));
    this.SourceAssetId = BigInt(-1);
    this.Tags = "";
    this.UniqueId = new UniqueId(0, 0, BigInt(0));
    this.Archivable = true;
  }
  get AttributesSerialize() {
    return this.GetProp(
      "AttributesSerialize",
      1
      /* String */
    );
  }
  set AttributesSerialize(value) {
    this.SetProp("AttributesSerialize", 1, value);
  }
  get Capabilities() {
    return this.GetProp(
      "Capabilities",
      33
      /* SecurityCapabilities */
    );
  }
  set Capabilities(value) {
    this.SetProp("Capabilities", 33, value);
  }
  get DefinesCapabilities() {
    return this.GetProp(
      "DefinesCapabilities",
      2
      /* Bool */
    );
  }
  set DefinesCapabilities(value) {
    this.SetProp("DefinesCapabilities", 2, value);
  }
  get HistoryId() {
    return this.GetProp(
      "HistoryId",
      31
      /* UniqueId */
    );
  }
  set HistoryId(value) {
    this.SetProp("HistoryId", 31, value);
  }
  get SourceAssetId() {
    return this.GetProp(
      "SourceAssetId",
      27
      /* Int64 */
    );
  }
  set SourceAssetId(value) {
    this.SetProp("SourceAssetId", 27, value);
  }
  get Tags() {
    return this.GetProp(
      "Tags",
      1
      /* String */
    );
  }
  set Tags(value) {
    this.SetProp("Tags", 1, value);
  }
  get UniqueId() {
    return this.GetProp(
      "UniqueId",
      31
      /* UniqueId */
    );
  }
  set UniqueId(value) {
    this.SetProp("UniqueId", 31, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Archivable() {
    return this.GetProp(
      "archivable",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Archivable(value) {
    this.SetProp("archivable", 2, value);
  }
};
var AccessoryDescription = class extends Instance {
  constructor() {
    super();
    this.addClassName("AccessoryDescription");
    this.Name = "AccessoryDescription";
    this.AccessoryType = AccessoryType.Unknown;
    this.AssetId = BigInt(0);
    this.IsLayered = false;
    this.Order = 0;
    this.Position = new Vector3(0, 0, 0);
    this.Puffiness = 1;
    this.Rotation = new Vector3(0, 0, 0);
    this.Scale = new Vector3(1, 1, 1);
  }
  get AccessoryType() {
    return this.GetProp(
      "AccessoryType",
      18
      /* Enum */
    );
  }
  set AccessoryType(value) {
    this.SetProp("AccessoryType", 18, value);
  }
  get AssetId() {
    return this.GetProp(
      "AssetId",
      27
      /* Int64 */
    );
  }
  set AssetId(value) {
    this.SetProp("AssetId", 27, value);
  }
  get Instance() {
    return this.GetProp(
      "Instance",
      19
      /* Referent */
    );
  }
  set Instance(value) {
    this.SetProp("Instance", 19, value);
  }
  get IsLayered() {
    return this.GetProp(
      "IsLayered",
      2
      /* Bool */
    );
  }
  set IsLayered(value) {
    this.SetProp("IsLayered", 2, value);
  }
  get Order() {
    return this.GetProp(
      "Order",
      3
      /* Int32 */
    );
  }
  set Order(value) {
    this.SetProp("Order", 3, value);
  }
  get Position() {
    return this.GetProp(
      "Position",
      14
      /* Vector3 */
    );
  }
  set Position(value) {
    this.SetProp("Position", 14, value);
  }
  get Puffiness() {
    return this.GetProp(
      "Puffiness",
      4
      /* Float32 */
    );
  }
  set Puffiness(value) {
    this.SetProp("Puffiness", 4, value);
  }
  get Rotation() {
    return this.GetProp(
      "Rotation",
      14
      /* Vector3 */
    );
  }
  set Rotation(value) {
    this.SetProp("Rotation", 14, value);
  }
  get Scale() {
    return this.GetProp(
      "Scale",
      14
      /* Vector3 */
    );
  }
  set Scale(value) {
    this.SetProp("Scale", 14, value);
  }
};
var AccountService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AccountService");
    this.Name = "AccountService";
  }
};
var Accoutrement = class extends Instance {
  constructor() {
    super();
    this.addClassName("Accoutrement");
    this.Name = "Accoutrement";
    this.AttachmentPoint = CFrame.Identity;
  }
  get AttachmentPoint() {
    return this.GetProp(
      "AttachmentPoint",
      16
      /* CFrame */
    );
  }
  set AttachmentPoint(value) {
    this.SetProp("AttachmentPoint", 16, value);
  }
};
var Accessory = class extends Accoutrement {
  constructor() {
    super();
    this.addClassName("Accessory");
    this.Name = "Accessory";
    this.AccessoryType = AccessoryType.Unknown;
  }
  get AccessoryType() {
    return this.GetProp(
      "AccessoryType",
      18
      /* Enum */
    );
  }
  set AccessoryType(value) {
    this.SetProp("AccessoryType", 18, value);
  }
};
var Hat = class extends Accoutrement {
  constructor() {
    super();
    this.addClassName("Hat");
    this.Name = "Hat";
  }
};
var AchievementService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AchievementService");
    this.Name = "AchievementService";
  }
};
var ActivityHistoryEventService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ActivityHistoryEventService");
    this.Name = "ActivityHistoryEventService";
  }
};
var AdPortal = class extends Instance {
  constructor() {
    super();
    this.addClassName("AdPortal");
    this.Name = "AdPortal";
  }
};
var AdService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AdService");
    this.Name = "AdService";
  }
};
var AdvancedDragger = class extends Instance {
  constructor() {
    super();
    this.addClassName("AdvancedDragger");
    this.Name = "AdvancedDragger";
  }
};
var AnalyticsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AnalyticsService");
    this.Name = "AnalyticsService";
    this.ApiKey = "";
  }
  /**@deprecated Deprecated by Roblox*/
  get ApiKey() {
    return this.GetProp(
      "ApiKey",
      1
      /* String */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set ApiKey(value) {
    this.SetProp("ApiKey", 1, value);
  }
};
var Animation = class extends Instance {
  constructor() {
    super();
    this.addClassName("Animation");
    this.Name = "Animation";
    this.AnimationId = "";
  }
  get AnimationId() {
    return this.GetProp(
      "AnimationId",
      1
      /* String */
    );
  }
  set AnimationId(value) {
    this.SetProp("AnimationId", 1, value);
  }
};
var AnimationClip = class extends Instance {
  constructor() {
    super();
    this.addClassName("AnimationClip");
    this.Loop = true;
    this.Priority = AnimationPriority.Action;
  }
  get GuidBinaryString() {
    return this.GetProp(
      "GuidBinaryString",
      1
      /* String */
    );
  }
  set GuidBinaryString(value) {
    this.SetProp("GuidBinaryString", 1, value);
  }
  get Loop() {
    return this.GetProp(
      "Loop",
      2
      /* Bool */
    );
  }
  set Loop(value) {
    this.SetProp("Loop", 2, value);
  }
  get Priority() {
    return this.GetProp(
      "Priority",
      18
      /* Enum */
    );
  }
  set Priority(value) {
    this.SetProp("Priority", 18, value);
  }
};
var CurveAnimation = class extends AnimationClip {
  constructor() {
    super();
    this.addClassName("CurveAnimation");
    this.Name = "CurveAnimation";
  }
};
var KeyframeSequence = class extends AnimationClip {
  constructor() {
    super();
    this.addClassName("KeyframeSequence");
    this.Name = "KeyframeSequence";
    this.AuthoredHipHeight = 2;
  }
  get AuthoredHipHeight() {
    return this.GetProp(
      "AuthoredHipHeight",
      4
      /* Float32 */
    );
  }
  set AuthoredHipHeight(value) {
    this.SetProp("AuthoredHipHeight", 4, value);
  }
};
var AnimationClipProvider = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AnimationClipProvider");
    this.Name = "AnimationClipProvider";
  }
};
var AnimationController = class extends Instance {
  constructor() {
    super();
    this.addClassName("AnimationController");
    this.Name = "AnimationController";
  }
};
var AnimationFromVideoCreatorService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AnimationFromVideoCreatorService");
    this.Name = "AnimationFromVideoCreatorService";
  }
};
var AnimationFromVideoCreatorStudioService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AnimationFromVideoCreatorStudioService");
    this.Name = "AnimationFromVideoCreatorStudioService";
  }
};
var AnimationRigData = class extends Instance {
  constructor() {
    super();
    this.addClassName("AnimationRigData");
    this.Name = "AnimationRigData";
    this.Label = "";
    this.PostTransform = "";
    this.PreTransform = "";
    this.Transform = "";
  }
  get Label() {
    return this.GetProp(
      "label",
      1
      /* String */
    );
  }
  set Label(value) {
    this.SetProp("label", 1, value);
  }
  get PostTransform() {
    return this.GetProp(
      "postTransform",
      1
      /* String */
    );
  }
  set PostTransform(value) {
    this.SetProp("postTransform", 1, value);
  }
  get PreTransform() {
    return this.GetProp(
      "preTransform",
      1
      /* String */
    );
  }
  set PreTransform(value) {
    this.SetProp("preTransform", 1, value);
  }
  get Transform() {
    return this.GetProp(
      "transform",
      1
      /* String */
    );
  }
  set Transform(value) {
    this.SetProp("transform", 1, value);
  }
};
var Animator = class extends Instance {
  constructor() {
    super();
    this.addClassName("Animator");
    this.Name = "Animator";
    this.PreferLodEnabled = true;
  }
  get PreferLodEnabled() {
    return this.GetProp(
      "PreferLodEnabled",
      2
      /* Bool */
    );
  }
  set PreferLodEnabled(value) {
    this.SetProp("PreferLodEnabled", 2, value);
  }
};
var Annotation = class extends Instance {
  constructor() {
    super();
    this.addClassName("Annotation");
    this.Name = "Annotation";
  }
};
var WorkspaceAnnotation = class extends Annotation {
  constructor() {
    super();
    this.addClassName("WorkspaceAnnotation");
    this.Name = "WorkspaceAnnotation";
  }
};
var AnnotationsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AnnotationsService");
    this.Name = "AnnotationsService";
  }
};
var AppLifecycleObserverService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AppLifecycleObserverService");
    this.Name = "AppLifecycleObserverService";
  }
};
var AppUpdateService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AppUpdateService");
    this.Name = "AppUpdateService";
  }
};
var AssetCounterService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AssetCounterService");
    this.Name = "AssetCounterService";
  }
};
var AssetDeliveryProxy = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AssetDeliveryProxy");
    this.Name = "AssetDeliveryProxy";
    this.Interface = "";
    this.Port = 0;
    this.StartServer = false;
  }
  get Interface() {
    return this.GetProp(
      "Interface",
      1
      /* String */
    );
  }
  set Interface(value) {
    this.SetProp("Interface", 1, value);
  }
  get Port() {
    return this.GetProp(
      "Port",
      3
      /* Int32 */
    );
  }
  set Port(value) {
    this.SetProp("Port", 3, value);
  }
  get StartServer() {
    return this.GetProp(
      "StartServer",
      2
      /* Bool */
    );
  }
  set StartServer(value) {
    this.SetProp("StartServer", 2, value);
  }
};
var AssetImportService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AssetImportService");
    this.Name = "AssetImportService";
  }
};
var AssetManagerService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AssetManagerService");
    this.Name = "AssetManagerService";
  }
};
var AssetService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AssetService");
    this.Name = "AssetService";
  }
};
var Atmosphere = class extends Instance {
  constructor() {
    super();
    this.addClassName("Atmosphere");
    this.Name = "Atmosphere";
    this.Color = Color3.FromRGB(200, 170, 108);
    this.Decay = Color3.FromRGB(92, 60, 14);
    this.Density = 0.395;
    this.Glare = 0;
    this.Haze = 0;
    this.Offset = 0;
  }
  get Color() {
    return this.GetProp(
      "Color",
      12
      /* Color3 */
    );
  }
  set Color(value) {
    this.SetProp("Color", 12, value);
  }
  get Decay() {
    return this.GetProp(
      "Decay",
      12
      /* Color3 */
    );
  }
  set Decay(value) {
    this.SetProp("Decay", 12, value);
  }
  get Density() {
    return this.GetProp(
      "Density",
      4
      /* Float32 */
    );
  }
  set Density(value) {
    this.SetProp("Density", 4, value);
  }
  get Glare() {
    return this.GetProp(
      "Glare",
      4
      /* Float32 */
    );
  }
  set Glare(value) {
    this.SetProp("Glare", 4, value);
  }
  get Haze() {
    return this.GetProp(
      "Haze",
      4
      /* Float32 */
    );
  }
  set Haze(value) {
    this.SetProp("Haze", 4, value);
  }
  get Offset() {
    return this.GetProp(
      "Offset",
      4
      /* Float32 */
    );
  }
  set Offset(value) {
    this.SetProp("Offset", 4, value);
  }
};
var Attachment = class extends Instance {
  constructor() {
    super();
    this.addClassName("Attachment");
    this.Name = "Attachment";
    this.Visible = false;
    this.CFrame = CFrame.Identity;
  }
  get CFrame() {
    return this.GetProp(
      "CFrame",
      16
      /* CFrame */
    );
  }
  set CFrame(value) {
    this.SetProp("CFrame", 16, value);
  }
  get Visible() {
    return this.GetProp(
      "Visible",
      2
      /* Bool */
    );
  }
  set Visible(value) {
    this.SetProp("Visible", 2, value);
  }
};
var Bone = class extends Attachment {
  constructor() {
    super();
    this.addClassName("Bone");
    this.Name = "Bone";
  }
};
var AudioAnalyzer = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioAnalyzer");
    this.Name = "AudioAnalyzer";
    this.SpectrumEnabled = true;
    this.WindowSize = AudioWindowSize.Medium;
  }
  get SpectrumEnabled() {
    return this.GetProp(
      "SpectrumEnabled",
      2
      /* Bool */
    );
  }
  set SpectrumEnabled(value) {
    this.SetProp("SpectrumEnabled", 2, value);
  }
  get WindowSize() {
    return this.GetProp(
      "WindowSize",
      18
      /* Enum */
    );
  }
  set WindowSize(value) {
    this.SetProp("WindowSize", 18, value);
  }
};
var AudioChannelMixer = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioChannelMixer");
    this.Name = "AudioChannelMixer";
    this.Layout = AudioChannelLayout.Stereo;
  }
  get Layout() {
    return this.GetProp(
      "Layout",
      18
      /* Enum */
    );
  }
  set Layout(value) {
    this.SetProp("Layout", 18, value);
  }
};
var AudioChannelSplitter = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioChannelSplitter");
    this.Name = "AudioChannelSplitter";
    this.Layout = AudioChannelLayout.Stereo;
  }
  get Layout() {
    return this.GetProp(
      "Layout",
      18
      /* Enum */
    );
  }
  set Layout(value) {
    this.SetProp("Layout", 18, value);
  }
};
var AudioChorus = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioChorus");
    this.Name = "AudioChorus";
    this.Bypass = false;
    this.Depth = 0.45;
    this.Mix = 0.85;
    this.Rate = 5;
  }
  get Bypass() {
    return this.GetProp(
      "Bypass",
      2
      /* Bool */
    );
  }
  set Bypass(value) {
    this.SetProp("Bypass", 2, value);
  }
  get Depth() {
    return this.GetProp(
      "Depth",
      4
      /* Float32 */
    );
  }
  set Depth(value) {
    this.SetProp("Depth", 4, value);
  }
  get Mix() {
    return this.GetProp(
      "Mix",
      4
      /* Float32 */
    );
  }
  set Mix(value) {
    this.SetProp("Mix", 4, value);
  }
  get Rate() {
    return this.GetProp(
      "Rate",
      4
      /* Float32 */
    );
  }
  set Rate(value) {
    this.SetProp("Rate", 4, value);
  }
};
var AudioCompressor = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioCompressor");
    this.Name = "AudioCompressor";
    this.Attack = 0.1;
    this.Bypass = false;
    this.MakeupGain = 0;
    this.Ratio = 40;
    this.Release = 0.1;
    this.Threshold = -40;
  }
  get Attack() {
    return this.GetProp(
      "Attack",
      4
      /* Float32 */
    );
  }
  set Attack(value) {
    this.SetProp("Attack", 4, value);
  }
  get Bypass() {
    return this.GetProp(
      "Bypass",
      2
      /* Bool */
    );
  }
  set Bypass(value) {
    this.SetProp("Bypass", 2, value);
  }
  get MakeupGain() {
    return this.GetProp(
      "MakeupGain",
      4
      /* Float32 */
    );
  }
  set MakeupGain(value) {
    this.SetProp("MakeupGain", 4, value);
  }
  get Ratio() {
    return this.GetProp(
      "Ratio",
      4
      /* Float32 */
    );
  }
  set Ratio(value) {
    this.SetProp("Ratio", 4, value);
  }
  get Release() {
    return this.GetProp(
      "Release",
      4
      /* Float32 */
    );
  }
  set Release(value) {
    this.SetProp("Release", 4, value);
  }
  get Threshold() {
    return this.GetProp(
      "Threshold",
      4
      /* Float32 */
    );
  }
  set Threshold(value) {
    this.SetProp("Threshold", 4, value);
  }
};
var AudioDeviceInput = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioDeviceInput");
    this.Name = "AudioDeviceInput";
    this.AccessType = AccessModifierType.Deny;
    this.Active = true;
    this.Muted = false;
    this.Volume = 1;
  }
  get AccessType() {
    return this.GetProp(
      "AccessType",
      18
      /* Enum */
    );
  }
  set AccessType(value) {
    this.SetProp("AccessType", 18, value);
  }
  get Active() {
    return this.GetProp(
      "Active",
      2
      /* Bool */
    );
  }
  set Active(value) {
    this.SetProp("Active", 2, value);
  }
  get Muted() {
    return this.GetProp(
      "Muted",
      2
      /* Bool */
    );
  }
  set Muted(value) {
    this.SetProp("Muted", 2, value);
  }
  get Player() {
    return this.GetProp(
      "Player",
      19
      /* Referent */
    );
  }
  set Player(value) {
    this.SetProp("Player", 19, value);
  }
  get Volume() {
    return this.GetProp(
      "Volume",
      4
      /* Float32 */
    );
  }
  set Volume(value) {
    this.SetProp("Volume", 4, value);
  }
};
var AudioDeviceOutput = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioDeviceOutput");
    this.Name = "AudioDeviceOutput";
  }
  get Player() {
    return this.GetProp(
      "Player",
      19
      /* Referent */
    );
  }
  set Player(value) {
    this.SetProp("Player", 19, value);
  }
};
var AudioDistortion = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioDistortion");
    this.Name = "AudioDistortion";
    this.Bypass = false;
    this.Level = 0.5;
  }
  get Bypass() {
    return this.GetProp(
      "Bypass",
      2
      /* Bool */
    );
  }
  set Bypass(value) {
    this.SetProp("Bypass", 2, value);
  }
  get Level() {
    return this.GetProp(
      "Level",
      4
      /* Float32 */
    );
  }
  set Level(value) {
    this.SetProp("Level", 4, value);
  }
};
var AudioEcho = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioEcho");
    this.Name = "AudioEcho";
    this.Bypass = false;
    this.DelayTime = 1;
    this.DryLevel = 0;
    this.Feedback = 0.5;
    this.RampTime = 0;
    this.WetLevel = 0;
  }
  get Bypass() {
    return this.GetProp(
      "Bypass",
      2
      /* Bool */
    );
  }
  set Bypass(value) {
    this.SetProp("Bypass", 2, value);
  }
  get DelayTime() {
    return this.GetProp(
      "DelayTime",
      4
      /* Float32 */
    );
  }
  set DelayTime(value) {
    this.SetProp("DelayTime", 4, value);
  }
  get DryLevel() {
    return this.GetProp(
      "DryLevel",
      4
      /* Float32 */
    );
  }
  set DryLevel(value) {
    this.SetProp("DryLevel", 4, value);
  }
  get Feedback() {
    return this.GetProp(
      "Feedback",
      4
      /* Float32 */
    );
  }
  set Feedback(value) {
    this.SetProp("Feedback", 4, value);
  }
  get RampTime() {
    return this.GetProp(
      "RampTime",
      4
      /* Float32 */
    );
  }
  set RampTime(value) {
    this.SetProp("RampTime", 4, value);
  }
  get WetLevel() {
    return this.GetProp(
      "WetLevel",
      4
      /* Float32 */
    );
  }
  set WetLevel(value) {
    this.SetProp("WetLevel", 4, value);
  }
};
var AudioEmitter = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioEmitter");
    this.Name = "AudioEmitter";
    this.AngleAttenuation = "";
    this.AudioInteractionGroup = "";
    this.DistanceAttenuation = "";
    this.SimulationFidelity = AudioSimulationFidelity.Automatic;
  }
  get AngleAttenuation() {
    return this.GetProp(
      "AngleAttenuation",
      1
      /* String */
    );
  }
  set AngleAttenuation(value) {
    this.SetProp("AngleAttenuation", 1, value);
  }
  get AudioInteractionGroup() {
    return this.GetProp(
      "AudioInteractionGroup",
      1
      /* String */
    );
  }
  set AudioInteractionGroup(value) {
    this.SetProp("AudioInteractionGroup", 1, value);
  }
  get DistanceAttenuation() {
    return this.GetProp(
      "DistanceAttenuation",
      1
      /* String */
    );
  }
  set DistanceAttenuation(value) {
    this.SetProp("DistanceAttenuation", 1, value);
  }
  get SimulationFidelity() {
    return this.GetProp(
      "SimulationFidelity",
      18
      /* Enum */
    );
  }
  set SimulationFidelity(value) {
    this.SetProp("SimulationFidelity", 18, value);
  }
};
var AudioEqualizer = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioEqualizer");
    this.Name = "AudioEqualizer";
    this.Bypass = false;
    this.HighGain = 0;
    this.LowGain = 0;
    this.MidGain = 0;
    this.MidRange = new NumberRange(400, 4e3);
  }
  get Bypass() {
    return this.GetProp(
      "Bypass",
      2
      /* Bool */
    );
  }
  set Bypass(value) {
    this.SetProp("Bypass", 2, value);
  }
  get HighGain() {
    return this.GetProp(
      "HighGain",
      4
      /* Float32 */
    );
  }
  set HighGain(value) {
    this.SetProp("HighGain", 4, value);
  }
  get LowGain() {
    return this.GetProp(
      "LowGain",
      4
      /* Float32 */
    );
  }
  set LowGain(value) {
    this.SetProp("LowGain", 4, value);
  }
  get MidGain() {
    return this.GetProp(
      "MidGain",
      4
      /* Float32 */
    );
  }
  set MidGain(value) {
    this.SetProp("MidGain", 4, value);
  }
  get MidRange() {
    return this.GetProp(
      "MidRange",
      23
      /* NumberRange */
    );
  }
  set MidRange(value) {
    this.SetProp("MidRange", 23, value);
  }
};
var AudioFader = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioFader");
    this.Name = "AudioFader";
    this.Bypass = false;
    this.Volume = 1;
  }
  get Bypass() {
    return this.GetProp(
      "Bypass",
      2
      /* Bool */
    );
  }
  set Bypass(value) {
    this.SetProp("Bypass", 2, value);
  }
  get Volume() {
    return this.GetProp(
      "Volume",
      4
      /* Float32 */
    );
  }
  set Volume(value) {
    this.SetProp("Volume", 4, value);
  }
};
var AudioFilter = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioFilter");
    this.Name = "AudioFilter";
    this.Bypass = false;
    this.FilterType = AudioFilterType.Peak;
    this.Frequency = 2e3;
    this.Gain = 0;
    this.Q = 0.707;
  }
  get Bypass() {
    return this.GetProp(
      "Bypass",
      2
      /* Bool */
    );
  }
  set Bypass(value) {
    this.SetProp("Bypass", 2, value);
  }
  get FilterType() {
    return this.GetProp(
      "FilterType",
      18
      /* Enum */
    );
  }
  set FilterType(value) {
    this.SetProp("FilterType", 18, value);
  }
  get Frequency() {
    return this.GetProp(
      "Frequency",
      4
      /* Float32 */
    );
  }
  set Frequency(value) {
    this.SetProp("Frequency", 4, value);
  }
  get Gain() {
    return this.GetProp(
      "Gain",
      4
      /* Float32 */
    );
  }
  set Gain(value) {
    this.SetProp("Gain", 4, value);
  }
  get Q() {
    return this.GetProp(
      "Q",
      4
      /* Float32 */
    );
  }
  set Q(value) {
    this.SetProp("Q", 4, value);
  }
};
var AudioFlanger = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioFlanger");
    this.Name = "AudioFlanger";
    this.Bypass = false;
    this.Depth = 0.45;
    this.Mix = 0.85;
    this.Rate = 5;
  }
  get Bypass() {
    return this.GetProp(
      "Bypass",
      2
      /* Bool */
    );
  }
  set Bypass(value) {
    this.SetProp("Bypass", 2, value);
  }
  get Depth() {
    return this.GetProp(
      "Depth",
      4
      /* Float32 */
    );
  }
  set Depth(value) {
    this.SetProp("Depth", 4, value);
  }
  get Mix() {
    return this.GetProp(
      "Mix",
      4
      /* Float32 */
    );
  }
  set Mix(value) {
    this.SetProp("Mix", 4, value);
  }
  get Rate() {
    return this.GetProp(
      "Rate",
      4
      /* Float32 */
    );
  }
  set Rate(value) {
    this.SetProp("Rate", 4, value);
  }
};
var AudioFocusService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AudioFocusService");
    this.Name = "AudioFocusService";
  }
};
var AudioLimiter = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioLimiter");
    this.Name = "AudioLimiter";
    this.Bypass = false;
    this.MaxLevel = 0;
    this.Release = 0.01;
  }
  get Bypass() {
    return this.GetProp(
      "Bypass",
      2
      /* Bool */
    );
  }
  set Bypass(value) {
    this.SetProp("Bypass", 2, value);
  }
  get MaxLevel() {
    return this.GetProp(
      "MaxLevel",
      4
      /* Float32 */
    );
  }
  set MaxLevel(value) {
    this.SetProp("MaxLevel", 4, value);
  }
  get Release() {
    return this.GetProp(
      "Release",
      4
      /* Float32 */
    );
  }
  set Release(value) {
    this.SetProp("Release", 4, value);
  }
};
var AudioListener = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioListener");
    this.Name = "AudioListener";
    this.AngleAttenuation = "";
    this.AudioInteractionGroup = "";
    this.DistanceAttenuation = "";
    this.SimulationFidelity = AudioSimulationFidelity.Automatic;
  }
  get AngleAttenuation() {
    return this.GetProp(
      "AngleAttenuation",
      1
      /* String */
    );
  }
  set AngleAttenuation(value) {
    this.SetProp("AngleAttenuation", 1, value);
  }
  get AudioInteractionGroup() {
    return this.GetProp(
      "AudioInteractionGroup",
      1
      /* String */
    );
  }
  set AudioInteractionGroup(value) {
    this.SetProp("AudioInteractionGroup", 1, value);
  }
  get DistanceAttenuation() {
    return this.GetProp(
      "DistanceAttenuation",
      1
      /* String */
    );
  }
  set DistanceAttenuation(value) {
    this.SetProp("DistanceAttenuation", 1, value);
  }
  get SimulationFidelity() {
    return this.GetProp(
      "SimulationFidelity",
      18
      /* Enum */
    );
  }
  set SimulationFidelity(value) {
    this.SetProp("SimulationFidelity", 18, value);
  }
};
var AudioPitchShifter = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioPitchShifter");
    this.Name = "AudioPitchShifter";
    this.Bypass = false;
    this.Pitch = 1.25;
    this.WindowSize = AudioWindowSize.Medium;
  }
  get Bypass() {
    return this.GetProp(
      "Bypass",
      2
      /* Bool */
    );
  }
  set Bypass(value) {
    this.SetProp("Bypass", 2, value);
  }
  get Pitch() {
    return this.GetProp(
      "Pitch",
      4
      /* Float32 */
    );
  }
  set Pitch(value) {
    this.SetProp("Pitch", 4, value);
  }
  get WindowSize() {
    return this.GetProp(
      "WindowSize",
      18
      /* Enum */
    );
  }
  set WindowSize(value) {
    this.SetProp("WindowSize", 18, value);
  }
};
var AudioPlayer = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioPlayer");
    this.Name = "AudioPlayer";
    this.Asset = "";
    this.AssetId = "";
    this.AutoLoad = true;
    this.LoopRegion = new NumberRange(0, 6e4);
    this.Looping = false;
    this.PlaybackRegion = new NumberRange(0, 6e4);
    this.PlaybackSpeed = 1;
    this.TimePosition = 0;
    this.Volume = 1;
  }
  get Asset() {
    return this.GetProp(
      "Asset",
      1
      /* String */
    );
  }
  set Asset(value) {
    this.SetProp("Asset", 1, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get AssetId() {
    return this.GetProp(
      "AssetId",
      1
      /* String */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set AssetId(value) {
    this.SetProp("AssetId", 1, value);
  }
  get AutoLoad() {
    return this.GetProp(
      "AutoLoad",
      2
      /* Bool */
    );
  }
  set AutoLoad(value) {
    this.SetProp("AutoLoad", 2, value);
  }
  get LoopRegion() {
    return this.GetProp(
      "LoopRegion",
      23
      /* NumberRange */
    );
  }
  set LoopRegion(value) {
    this.SetProp("LoopRegion", 23, value);
  }
  get Looping() {
    return this.GetProp(
      "Looping",
      2
      /* Bool */
    );
  }
  set Looping(value) {
    this.SetProp("Looping", 2, value);
  }
  get PlaybackRegion() {
    return this.GetProp(
      "PlaybackRegion",
      23
      /* NumberRange */
    );
  }
  set PlaybackRegion(value) {
    this.SetProp("PlaybackRegion", 23, value);
  }
  get PlaybackSpeed() {
    return this.GetProp(
      "PlaybackSpeed",
      5
      /* Float64 */
    );
  }
  set PlaybackSpeed(value) {
    this.SetProp("PlaybackSpeed", 5, value);
  }
  get TimePosition() {
    return this.GetProp(
      "TimePosition",
      5
      /* Float64 */
    );
  }
  set TimePosition(value) {
    this.SetProp("TimePosition", 5, value);
  }
  get Volume() {
    return this.GetProp(
      "Volume",
      4
      /* Float32 */
    );
  }
  set Volume(value) {
    this.SetProp("Volume", 4, value);
  }
};
var AudioRecorder = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioRecorder");
    this.Name = "AudioRecorder";
    this.IsRecording = false;
  }
  get IsRecording() {
    return this.GetProp(
      "IsRecording",
      2
      /* Bool */
    );
  }
  set IsRecording(value) {
    this.SetProp("IsRecording", 2, value);
  }
};
var AudioReverb = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioReverb");
    this.Name = "AudioReverb";
    this.Bypass = false;
    this.DecayRatio = 0.5;
    this.DecayTime = 1.5;
    this.Density = 1;
    this.Diffusion = 1;
    this.DryLevel = 0;
    this.EarlyDelayTime = 0.02;
    this.HighCutFrequency = 2e4;
    this.LateDelayTime = 0.04;
    this.LowShelfFrequency = 250;
    this.LowShelfGain = 0;
    this.ReferenceFrequency = 5e3;
    this.WetLevel = -6;
  }
  get Bypass() {
    return this.GetProp(
      "Bypass",
      2
      /* Bool */
    );
  }
  set Bypass(value) {
    this.SetProp("Bypass", 2, value);
  }
  get DecayRatio() {
    return this.GetProp(
      "DecayRatio",
      4
      /* Float32 */
    );
  }
  set DecayRatio(value) {
    this.SetProp("DecayRatio", 4, value);
  }
  get DecayTime() {
    return this.GetProp(
      "DecayTime",
      4
      /* Float32 */
    );
  }
  set DecayTime(value) {
    this.SetProp("DecayTime", 4, value);
  }
  get Density() {
    return this.GetProp(
      "Density",
      4
      /* Float32 */
    );
  }
  set Density(value) {
    this.SetProp("Density", 4, value);
  }
  get Diffusion() {
    return this.GetProp(
      "Diffusion",
      4
      /* Float32 */
    );
  }
  set Diffusion(value) {
    this.SetProp("Diffusion", 4, value);
  }
  get DryLevel() {
    return this.GetProp(
      "DryLevel",
      4
      /* Float32 */
    );
  }
  set DryLevel(value) {
    this.SetProp("DryLevel", 4, value);
  }
  get EarlyDelayTime() {
    return this.GetProp(
      "EarlyDelayTime",
      4
      /* Float32 */
    );
  }
  set EarlyDelayTime(value) {
    this.SetProp("EarlyDelayTime", 4, value);
  }
  get HighCutFrequency() {
    return this.GetProp(
      "HighCutFrequency",
      4
      /* Float32 */
    );
  }
  set HighCutFrequency(value) {
    this.SetProp("HighCutFrequency", 4, value);
  }
  get LateDelayTime() {
    return this.GetProp(
      "LateDelayTime",
      4
      /* Float32 */
    );
  }
  set LateDelayTime(value) {
    this.SetProp("LateDelayTime", 4, value);
  }
  get LowShelfFrequency() {
    return this.GetProp(
      "LowShelfFrequency",
      4
      /* Float32 */
    );
  }
  set LowShelfFrequency(value) {
    this.SetProp("LowShelfFrequency", 4, value);
  }
  get LowShelfGain() {
    return this.GetProp(
      "LowShelfGain",
      4
      /* Float32 */
    );
  }
  set LowShelfGain(value) {
    this.SetProp("LowShelfGain", 4, value);
  }
  get ReferenceFrequency() {
    return this.GetProp(
      "ReferenceFrequency",
      4
      /* Float32 */
    );
  }
  set ReferenceFrequency(value) {
    this.SetProp("ReferenceFrequency", 4, value);
  }
  get WetLevel() {
    return this.GetProp(
      "WetLevel",
      4
      /* Float32 */
    );
  }
  set WetLevel(value) {
    this.SetProp("WetLevel", 4, value);
  }
};
var AudioSearchParams = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioSearchParams");
    this.Name = "AudioSearchParams";
    this.Album = "";
    this.Artist = "";
    this.AudioSubType = AudioSubType.Music;
    this.AudioSubtype = AudioSubType.Music;
    this.MaxDuration = 2147483647;
    this.MinDuration = 0;
    this.SearchKeyword = "";
    this.Tag = "";
    this.Title = "";
  }
  get Album() {
    return this.GetProp(
      "Album",
      1
      /* String */
    );
  }
  set Album(value) {
    this.SetProp("Album", 1, value);
  }
  get Artist() {
    return this.GetProp(
      "Artist",
      1
      /* String */
    );
  }
  set Artist(value) {
    this.SetProp("Artist", 1, value);
  }
  get AudioSubType() {
    return this.GetProp(
      "AudioSubType",
      18
      /* Enum */
    );
  }
  set AudioSubType(value) {
    this.SetProp("AudioSubType", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get AudioSubtype() {
    return this.GetProp(
      "AudioSubtype",
      18
      /* Enum */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set AudioSubtype(value) {
    this.SetProp("AudioSubtype", 18, value);
  }
  get MaxDuration() {
    return this.GetProp(
      "MaxDuration",
      3
      /* Int32 */
    );
  }
  set MaxDuration(value) {
    this.SetProp("MaxDuration", 3, value);
  }
  get MinDuration() {
    return this.GetProp(
      "MinDuration",
      3
      /* Int32 */
    );
  }
  set MinDuration(value) {
    this.SetProp("MinDuration", 3, value);
  }
  get SearchKeyword() {
    return this.GetProp(
      "SearchKeyword",
      1
      /* String */
    );
  }
  set SearchKeyword(value) {
    this.SetProp("SearchKeyword", 1, value);
  }
  get Tag() {
    return this.GetProp(
      "Tag",
      1
      /* String */
    );
  }
  set Tag(value) {
    this.SetProp("Tag", 1, value);
  }
  get Title() {
    return this.GetProp(
      "Title",
      1
      /* String */
    );
  }
  set Title(value) {
    this.SetProp("Title", 1, value);
  }
};
var AudioTextToSpeech = class extends Instance {
  constructor() {
    super();
    this.addClassName("AudioTextToSpeech");
    this.Name = "AudioTextToSpeech";
    this.Looping = false;
    this.Pitch = 0;
    this.PlaybackSpeed = 1;
    this.Speed = 1;
    this.Text = "";
    this.TimePosition = 0;
    this.VoiceId = "";
    this.Volume = 1;
  }
  get Looping() {
    return this.GetProp(
      "Looping",
      2
      /* Bool */
    );
  }
  set Looping(value) {
    this.SetProp("Looping", 2, value);
  }
  get Pitch() {
    return this.GetProp(
      "Pitch",
      4
      /* Float32 */
    );
  }
  set Pitch(value) {
    this.SetProp("Pitch", 4, value);
  }
  get PlaybackSpeed() {
    return this.GetProp(
      "PlaybackSpeed",
      4
      /* Float32 */
    );
  }
  set PlaybackSpeed(value) {
    this.SetProp("PlaybackSpeed", 4, value);
  }
  get Speed() {
    return this.GetProp(
      "Speed",
      4
      /* Float32 */
    );
  }
  set Speed(value) {
    this.SetProp("Speed", 4, value);
  }
  get Text() {
    return this.GetProp(
      "Text",
      1
      /* String */
    );
  }
  set Text(value) {
    this.SetProp("Text", 1, value);
  }
  get TimePosition() {
    return this.GetProp(
      "TimePosition",
      5
      /* Float64 */
    );
  }
  set TimePosition(value) {
    this.SetProp("TimePosition", 5, value);
  }
  get VoiceId() {
    return this.GetProp(
      "VoiceId",
      1
      /* String */
    );
  }
  set VoiceId(value) {
    this.SetProp("VoiceId", 1, value);
  }
  get Volume() {
    return this.GetProp(
      "Volume",
      4
      /* Float32 */
    );
  }
  set Volume(value) {
    this.SetProp("Volume", 4, value);
  }
};
var AuroraScriptService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AuroraScriptService");
    this.Name = "AuroraScriptService";
  }
};
var AuroraService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AuroraService");
    this.Name = "AuroraService";
  }
};
var AvatarAccessoryRules = class extends Instance {
  constructor() {
    super();
    this.addClassName("AvatarAccessoryRules");
    this.Name = "AvatarAccessoryRules";
    this.AccessoryMode = AvatarSettingsAccessoryMode.PlayerChoice;
    this.CustomAccessoryMode = AvatarSettingsCustomAccessoryMode.PlayerChoice;
    this.CustomBackAccessoryEnabled = false;
    this.CustomBackAccessoryId = BigInt(0);
    this.CustomFaceAccessoryEnabled = false;
    this.CustomFaceAccessoryId = BigInt(0);
    this.CustomFrontAccessoryEnabled = false;
    this.CustomFrontAccessoryId = BigInt(0);
    this.CustomHairAccessoryEnabled = false;
    this.CustomHairAccessoryId = BigInt(0);
    this.CustomHeadAccessoryEnabled = false;
    this.CustomHeadAccessoryId = BigInt(0);
    this.CustomNeckAccessoryEnabled = false;
    this.CustomNeckAccessoryId = BigInt(0);
    this.CustomShoulderAccessoryEnabled = false;
    this.CustomShoulderAccessoryId = BigInt(0);
    this.CustomWaistAccessoryEnabled = false;
    this.CustomWaistAccessoryId = BigInt(0);
    this.EnableSound = true;
    this.EnableVFX = true;
    this.LimitBounds = new Vector3(0, 0, 0);
    this.LimitMethod = AvatarSettingsAccessoryLimitMethod.Remove;
  }
  get AccessoryMode() {
    return this.GetProp(
      "AccessoryMode",
      18
      /* Enum */
    );
  }
  set AccessoryMode(value) {
    this.SetProp("AccessoryMode", 18, value);
  }
  get CustomAccessoryMode() {
    return this.GetProp(
      "CustomAccessoryMode",
      18
      /* Enum */
    );
  }
  set CustomAccessoryMode(value) {
    this.SetProp("CustomAccessoryMode", 18, value);
  }
  get CustomBackAccessoryEnabled() {
    return this.GetProp(
      "CustomBackAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomBackAccessoryEnabled(value) {
    this.SetProp("CustomBackAccessoryEnabled", 2, value);
  }
  get CustomBackAccessoryId() {
    return this.GetProp(
      "CustomBackAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomBackAccessoryId(value) {
    this.SetProp("CustomBackAccessoryId", 27, value);
  }
  get CustomFaceAccessoryEnabled() {
    return this.GetProp(
      "CustomFaceAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomFaceAccessoryEnabled(value) {
    this.SetProp("CustomFaceAccessoryEnabled", 2, value);
  }
  get CustomFaceAccessoryId() {
    return this.GetProp(
      "CustomFaceAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomFaceAccessoryId(value) {
    this.SetProp("CustomFaceAccessoryId", 27, value);
  }
  get CustomFrontAccessoryEnabled() {
    return this.GetProp(
      "CustomFrontAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomFrontAccessoryEnabled(value) {
    this.SetProp("CustomFrontAccessoryEnabled", 2, value);
  }
  get CustomFrontAccessoryId() {
    return this.GetProp(
      "CustomFrontAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomFrontAccessoryId(value) {
    this.SetProp("CustomFrontAccessoryId", 27, value);
  }
  get CustomHairAccessoryEnabled() {
    return this.GetProp(
      "CustomHairAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomHairAccessoryEnabled(value) {
    this.SetProp("CustomHairAccessoryEnabled", 2, value);
  }
  get CustomHairAccessoryId() {
    return this.GetProp(
      "CustomHairAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomHairAccessoryId(value) {
    this.SetProp("CustomHairAccessoryId", 27, value);
  }
  get CustomHeadAccessoryEnabled() {
    return this.GetProp(
      "CustomHeadAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomHeadAccessoryEnabled(value) {
    this.SetProp("CustomHeadAccessoryEnabled", 2, value);
  }
  get CustomHeadAccessoryId() {
    return this.GetProp(
      "CustomHeadAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomHeadAccessoryId(value) {
    this.SetProp("CustomHeadAccessoryId", 27, value);
  }
  get CustomNeckAccessoryEnabled() {
    return this.GetProp(
      "CustomNeckAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomNeckAccessoryEnabled(value) {
    this.SetProp("CustomNeckAccessoryEnabled", 2, value);
  }
  get CustomNeckAccessoryId() {
    return this.GetProp(
      "CustomNeckAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomNeckAccessoryId(value) {
    this.SetProp("CustomNeckAccessoryId", 27, value);
  }
  get CustomShoulderAccessoryEnabled() {
    return this.GetProp(
      "CustomShoulderAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomShoulderAccessoryEnabled(value) {
    this.SetProp("CustomShoulderAccessoryEnabled", 2, value);
  }
  get CustomShoulderAccessoryId() {
    return this.GetProp(
      "CustomShoulderAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomShoulderAccessoryId(value) {
    this.SetProp("CustomShoulderAccessoryId", 27, value);
  }
  get CustomWaistAccessoryEnabled() {
    return this.GetProp(
      "CustomWaistAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomWaistAccessoryEnabled(value) {
    this.SetProp("CustomWaistAccessoryEnabled", 2, value);
  }
  get CustomWaistAccessoryId() {
    return this.GetProp(
      "CustomWaistAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomWaistAccessoryId(value) {
    this.SetProp("CustomWaistAccessoryId", 27, value);
  }
  get EnableSound() {
    return this.GetProp(
      "EnableSound",
      2
      /* Bool */
    );
  }
  set EnableSound(value) {
    this.SetProp("EnableSound", 2, value);
  }
  get EnableVFX() {
    return this.GetProp(
      "EnableVFX",
      2
      /* Bool */
    );
  }
  set EnableVFX(value) {
    this.SetProp("EnableVFX", 2, value);
  }
  get LimitBounds() {
    return this.GetProp(
      "LimitBounds",
      14
      /* Vector3 */
    );
  }
  set LimitBounds(value) {
    this.SetProp("LimitBounds", 14, value);
  }
  get LimitMethod() {
    return this.GetProp(
      "LimitMethod",
      18
      /* Enum */
    );
  }
  set LimitMethod(value) {
    this.SetProp("LimitMethod", 18, value);
  }
};
var AvatarAnimationRules = class extends Instance {
  constructor() {
    super();
    this.addClassName("AvatarAnimationRules");
    this.Name = "AvatarAnimationRules";
    this.AnimationClipsMode = AvatarSettingsAnimationClipsMode.PlayerChoice;
    this.AnimationPacksMode = AvatarSettingsAnimationPacksMode.PlayerChoice;
    this.CustomClimbAnimationEnabled = false;
    this.CustomClimbAnimationId = BigInt(0);
    this.CustomFallAnimationEnabled = false;
    this.CustomFallAnimationId = BigInt(0);
    this.CustomIdleAlt1AnimationEnabled = false;
    this.CustomIdleAlt1AnimationId = BigInt(0);
    this.CustomIdleAlt2AnimationEnabled = false;
    this.CustomIdleAlt2AnimationId = BigInt(0);
    this.CustomIdleAnimationEnabled = false;
    this.CustomIdleAnimationId = BigInt(0);
    this.CustomJumpAnimationEnabled = false;
    this.CustomJumpAnimationId = BigInt(0);
    this.CustomRunAnimationEnabled = false;
    this.CustomRunAnimationId = BigInt(0);
    this.CustomSwimAnimationEnabled = false;
    this.CustomSwimAnimationId = BigInt(0);
    this.CustomSwimIdleAnimationEnabled = false;
    this.CustomSwimIdleAnimationId = BigInt(0);
    this.CustomWalkAnimationEnabled = false;
    this.CustomWalkAnimationId = BigInt(0);
  }
  get AnimationClipsMode() {
    return this.GetProp(
      "AnimationClipsMode",
      18
      /* Enum */
    );
  }
  set AnimationClipsMode(value) {
    this.SetProp("AnimationClipsMode", 18, value);
  }
  get AnimationPacksMode() {
    return this.GetProp(
      "AnimationPacksMode",
      18
      /* Enum */
    );
  }
  set AnimationPacksMode(value) {
    this.SetProp("AnimationPacksMode", 18, value);
  }
  get CustomClimbAnimationEnabled() {
    return this.GetProp(
      "CustomClimbAnimationEnabled",
      2
      /* Bool */
    );
  }
  set CustomClimbAnimationEnabled(value) {
    this.SetProp("CustomClimbAnimationEnabled", 2, value);
  }
  get CustomClimbAnimationId() {
    return this.GetProp(
      "CustomClimbAnimationId",
      27
      /* Int64 */
    );
  }
  set CustomClimbAnimationId(value) {
    this.SetProp("CustomClimbAnimationId", 27, value);
  }
  get CustomFallAnimationEnabled() {
    return this.GetProp(
      "CustomFallAnimationEnabled",
      2
      /* Bool */
    );
  }
  set CustomFallAnimationEnabled(value) {
    this.SetProp("CustomFallAnimationEnabled", 2, value);
  }
  get CustomFallAnimationId() {
    return this.GetProp(
      "CustomFallAnimationId",
      27
      /* Int64 */
    );
  }
  set CustomFallAnimationId(value) {
    this.SetProp("CustomFallAnimationId", 27, value);
  }
  get CustomIdleAlt1AnimationEnabled() {
    return this.GetProp(
      "CustomIdleAlt1AnimationEnabled",
      2
      /* Bool */
    );
  }
  set CustomIdleAlt1AnimationEnabled(value) {
    this.SetProp("CustomIdleAlt1AnimationEnabled", 2, value);
  }
  get CustomIdleAlt1AnimationId() {
    return this.GetProp(
      "CustomIdleAlt1AnimationId",
      27
      /* Int64 */
    );
  }
  set CustomIdleAlt1AnimationId(value) {
    this.SetProp("CustomIdleAlt1AnimationId", 27, value);
  }
  get CustomIdleAlt2AnimationEnabled() {
    return this.GetProp(
      "CustomIdleAlt2AnimationEnabled",
      2
      /* Bool */
    );
  }
  set CustomIdleAlt2AnimationEnabled(value) {
    this.SetProp("CustomIdleAlt2AnimationEnabled", 2, value);
  }
  get CustomIdleAlt2AnimationId() {
    return this.GetProp(
      "CustomIdleAlt2AnimationId",
      27
      /* Int64 */
    );
  }
  set CustomIdleAlt2AnimationId(value) {
    this.SetProp("CustomIdleAlt2AnimationId", 27, value);
  }
  get CustomIdleAnimationEnabled() {
    return this.GetProp(
      "CustomIdleAnimationEnabled",
      2
      /* Bool */
    );
  }
  set CustomIdleAnimationEnabled(value) {
    this.SetProp("CustomIdleAnimationEnabled", 2, value);
  }
  get CustomIdleAnimationId() {
    return this.GetProp(
      "CustomIdleAnimationId",
      27
      /* Int64 */
    );
  }
  set CustomIdleAnimationId(value) {
    this.SetProp("CustomIdleAnimationId", 27, value);
  }
  get CustomJumpAnimationEnabled() {
    return this.GetProp(
      "CustomJumpAnimationEnabled",
      2
      /* Bool */
    );
  }
  set CustomJumpAnimationEnabled(value) {
    this.SetProp("CustomJumpAnimationEnabled", 2, value);
  }
  get CustomJumpAnimationId() {
    return this.GetProp(
      "CustomJumpAnimationId",
      27
      /* Int64 */
    );
  }
  set CustomJumpAnimationId(value) {
    this.SetProp("CustomJumpAnimationId", 27, value);
  }
  get CustomRunAnimationEnabled() {
    return this.GetProp(
      "CustomRunAnimationEnabled",
      2
      /* Bool */
    );
  }
  set CustomRunAnimationEnabled(value) {
    this.SetProp("CustomRunAnimationEnabled", 2, value);
  }
  get CustomRunAnimationId() {
    return this.GetProp(
      "CustomRunAnimationId",
      27
      /* Int64 */
    );
  }
  set CustomRunAnimationId(value) {
    this.SetProp("CustomRunAnimationId", 27, value);
  }
  get CustomSwimAnimationEnabled() {
    return this.GetProp(
      "CustomSwimAnimationEnabled",
      2
      /* Bool */
    );
  }
  set CustomSwimAnimationEnabled(value) {
    this.SetProp("CustomSwimAnimationEnabled", 2, value);
  }
  get CustomSwimAnimationId() {
    return this.GetProp(
      "CustomSwimAnimationId",
      27
      /* Int64 */
    );
  }
  set CustomSwimAnimationId(value) {
    this.SetProp("CustomSwimAnimationId", 27, value);
  }
  get CustomSwimIdleAnimationEnabled() {
    return this.GetProp(
      "CustomSwimIdleAnimationEnabled",
      2
      /* Bool */
    );
  }
  set CustomSwimIdleAnimationEnabled(value) {
    this.SetProp("CustomSwimIdleAnimationEnabled", 2, value);
  }
  get CustomSwimIdleAnimationId() {
    return this.GetProp(
      "CustomSwimIdleAnimationId",
      27
      /* Int64 */
    );
  }
  set CustomSwimIdleAnimationId(value) {
    this.SetProp("CustomSwimIdleAnimationId", 27, value);
  }
  get CustomWalkAnimationEnabled() {
    return this.GetProp(
      "CustomWalkAnimationEnabled",
      2
      /* Bool */
    );
  }
  set CustomWalkAnimationEnabled(value) {
    this.SetProp("CustomWalkAnimationEnabled", 2, value);
  }
  get CustomWalkAnimationId() {
    return this.GetProp(
      "CustomWalkAnimationId",
      27
      /* Int64 */
    );
  }
  set CustomWalkAnimationId(value) {
    this.SetProp("CustomWalkAnimationId", 27, value);
  }
};
var AvatarBodyRules = class extends Instance {
  constructor() {
    super();
    this.addClassName("AvatarBodyRules");
    this.Name = "AvatarBodyRules";
    this.AppearanceMode = AvatarSettingsAppearanceMode.PlayerChoice;
    this.BuildMode = AvatarSettingsBuildMode.PlayerChoice;
    this.CustomBodyBundleId = BigInt(0);
    this.CustomBodyType = AvatarSettingsCustomBodyType.AvatarReference;
    this.CustomBodyTypeScale = new NumberRange(0, 100);
    this.CustomHeadEnabled = false;
    this.CustomHeadId = BigInt(0);
    this.CustomHeadScale = new NumberRange(95, 100);
    this.CustomHeight = new NumberRange(6, 6);
    this.CustomHeightScale = new NumberRange(90, 105);
    this.CustomLeftArmEnabled = false;
    this.CustomLeftArmId = BigInt(0);
    this.CustomLeftLegEnabled = false;
    this.CustomLeftLegId = BigInt(0);
    this.CustomProportionsScale = new NumberRange(0, 100);
    this.CustomRightArmEnabled = false;
    this.CustomRightArmId = BigInt(0);
    this.CustomRightLegEnabled = false;
    this.CustomRightLegId = BigInt(0);
    this.CustomTorsoEnabled = false;
    this.CustomTorsoId = BigInt(0);
    this.CustomWidthScale = new NumberRange(70, 100);
    this.KeepPlayerHead = true;
    this.ScaleMode = AvatarSettingsScaleMode.PlayerChoice;
  }
  get AppearanceMode() {
    return this.GetProp(
      "AppearanceMode",
      18
      /* Enum */
    );
  }
  set AppearanceMode(value) {
    this.SetProp("AppearanceMode", 18, value);
  }
  get BuildMode() {
    return this.GetProp(
      "BuildMode",
      18
      /* Enum */
    );
  }
  set BuildMode(value) {
    this.SetProp("BuildMode", 18, value);
  }
  get CustomBodyAvatarReference() {
    return this.GetProp(
      "CustomBodyAvatarReference",
      19
      /* Referent */
    );
  }
  set CustomBodyAvatarReference(value) {
    this.SetProp("CustomBodyAvatarReference", 19, value);
  }
  get CustomBodyBundleId() {
    return this.GetProp(
      "CustomBodyBundleId",
      27
      /* Int64 */
    );
  }
  set CustomBodyBundleId(value) {
    this.SetProp("CustomBodyBundleId", 27, value);
  }
  get CustomBodyType() {
    return this.GetProp(
      "CustomBodyType",
      18
      /* Enum */
    );
  }
  set CustomBodyType(value) {
    this.SetProp("CustomBodyType", 18, value);
  }
  get CustomBodyTypeScale() {
    return this.GetProp(
      "CustomBodyTypeScale",
      23
      /* NumberRange */
    );
  }
  set CustomBodyTypeScale(value) {
    this.SetProp("CustomBodyTypeScale", 23, value);
  }
  get CustomHeadEnabled() {
    return this.GetProp(
      "CustomHeadEnabled",
      2
      /* Bool */
    );
  }
  set CustomHeadEnabled(value) {
    this.SetProp("CustomHeadEnabled", 2, value);
  }
  get CustomHeadId() {
    return this.GetProp(
      "CustomHeadId",
      27
      /* Int64 */
    );
  }
  set CustomHeadId(value) {
    this.SetProp("CustomHeadId", 27, value);
  }
  get CustomHeadScale() {
    return this.GetProp(
      "CustomHeadScale",
      23
      /* NumberRange */
    );
  }
  set CustomHeadScale(value) {
    this.SetProp("CustomHeadScale", 23, value);
  }
  get CustomHeight() {
    return this.GetProp(
      "CustomHeight",
      23
      /* NumberRange */
    );
  }
  set CustomHeight(value) {
    this.SetProp("CustomHeight", 23, value);
  }
  get CustomHeightScale() {
    return this.GetProp(
      "CustomHeightScale",
      23
      /* NumberRange */
    );
  }
  set CustomHeightScale(value) {
    this.SetProp("CustomHeightScale", 23, value);
  }
  get CustomLeftArmEnabled() {
    return this.GetProp(
      "CustomLeftArmEnabled",
      2
      /* Bool */
    );
  }
  set CustomLeftArmEnabled(value) {
    this.SetProp("CustomLeftArmEnabled", 2, value);
  }
  get CustomLeftArmId() {
    return this.GetProp(
      "CustomLeftArmId",
      27
      /* Int64 */
    );
  }
  set CustomLeftArmId(value) {
    this.SetProp("CustomLeftArmId", 27, value);
  }
  get CustomLeftLegEnabled() {
    return this.GetProp(
      "CustomLeftLegEnabled",
      2
      /* Bool */
    );
  }
  set CustomLeftLegEnabled(value) {
    this.SetProp("CustomLeftLegEnabled", 2, value);
  }
  get CustomLeftLegId() {
    return this.GetProp(
      "CustomLeftLegId",
      27
      /* Int64 */
    );
  }
  set CustomLeftLegId(value) {
    this.SetProp("CustomLeftLegId", 27, value);
  }
  get CustomProportionsScale() {
    return this.GetProp(
      "CustomProportionsScale",
      23
      /* NumberRange */
    );
  }
  set CustomProportionsScale(value) {
    this.SetProp("CustomProportionsScale", 23, value);
  }
  get CustomRightArmEnabled() {
    return this.GetProp(
      "CustomRightArmEnabled",
      2
      /* Bool */
    );
  }
  set CustomRightArmEnabled(value) {
    this.SetProp("CustomRightArmEnabled", 2, value);
  }
  get CustomRightArmId() {
    return this.GetProp(
      "CustomRightArmId",
      27
      /* Int64 */
    );
  }
  set CustomRightArmId(value) {
    this.SetProp("CustomRightArmId", 27, value);
  }
  get CustomRightLegEnabled() {
    return this.GetProp(
      "CustomRightLegEnabled",
      2
      /* Bool */
    );
  }
  set CustomRightLegEnabled(value) {
    this.SetProp("CustomRightLegEnabled", 2, value);
  }
  get CustomRightLegId() {
    return this.GetProp(
      "CustomRightLegId",
      27
      /* Int64 */
    );
  }
  set CustomRightLegId(value) {
    this.SetProp("CustomRightLegId", 27, value);
  }
  get CustomTorsoEnabled() {
    return this.GetProp(
      "CustomTorsoEnabled",
      2
      /* Bool */
    );
  }
  set CustomTorsoEnabled(value) {
    this.SetProp("CustomTorsoEnabled", 2, value);
  }
  get CustomTorsoId() {
    return this.GetProp(
      "CustomTorsoId",
      27
      /* Int64 */
    );
  }
  set CustomTorsoId(value) {
    this.SetProp("CustomTorsoId", 27, value);
  }
  get CustomWidthScale() {
    return this.GetProp(
      "CustomWidthScale",
      23
      /* NumberRange */
    );
  }
  set CustomWidthScale(value) {
    this.SetProp("CustomWidthScale", 23, value);
  }
  get KeepPlayerHead() {
    return this.GetProp(
      "KeepPlayerHead",
      2
      /* Bool */
    );
  }
  set KeepPlayerHead(value) {
    this.SetProp("KeepPlayerHead", 2, value);
  }
  get ScaleMode() {
    return this.GetProp(
      "ScaleMode",
      18
      /* Enum */
    );
  }
  set ScaleMode(value) {
    this.SetProp("ScaleMode", 18, value);
  }
};
var AvatarChatService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AvatarChatService");
    this.Name = "AvatarChatService";
  }
};
var AvatarClothingRules = class extends Instance {
  constructor() {
    super();
    this.addClassName("AvatarClothingRules");
    this.Name = "AvatarClothingRules";
    this.ClothingMode = AvatarSettingsClothingMode.PlayerChoice;
    this.CustomClassicPantsAccessoryEnabled = false;
    this.CustomClassicPantsAccessoryId = BigInt(0);
    this.CustomClassicShirtsAccessoryEnabled = false;
    this.CustomClassicShirtsAccessoryId = BigInt(0);
    this.CustomClassicTShirtsAccessoryEnabled = false;
    this.CustomClassicTShirtsAccessoryId = BigInt(0);
    this.CustomClothingMode = AvatarSettingsCustomClothingMode.PlayerChoice;
    this.CustomDressSkirtAccessoryEnabled = false;
    this.CustomDressSkirtAccessoryId = BigInt(0);
    this.CustomJacketAccessoryEnabled = false;
    this.CustomJacketAccessoryId = BigInt(0);
    this.CustomLeftShoesAccessoryEnabled = false;
    this.CustomLeftShoesAccessoryId = BigInt(0);
    this.CustomPantsAccessoryEnabled = false;
    this.CustomPantsAccessoryId = BigInt(0);
    this.CustomRightShoesAccessoryEnabled = false;
    this.CustomRightShoesAccessoryId = BigInt(0);
    this.CustomShirtAccessoryEnabled = false;
    this.CustomShirtAccessoryId = BigInt(0);
    this.CustomShortsAccessoryEnabled = false;
    this.CustomShortsAccessoryId = BigInt(0);
    this.CustomSweaterAccessoryEnabled = false;
    this.CustomSweaterAccessoryId = BigInt(0);
    this.CustomTShirtAccessoryEnabled = false;
    this.CustomTShirtAccessoryId = BigInt(0);
    this.LimitBounds = new Vector3(0, 0, 0);
  }
  get ClothingMode() {
    return this.GetProp(
      "ClothingMode",
      18
      /* Enum */
    );
  }
  set ClothingMode(value) {
    this.SetProp("ClothingMode", 18, value);
  }
  get CustomClassicPantsAccessoryEnabled() {
    return this.GetProp(
      "CustomClassicPantsAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomClassicPantsAccessoryEnabled(value) {
    this.SetProp("CustomClassicPantsAccessoryEnabled", 2, value);
  }
  get CustomClassicPantsAccessoryId() {
    return this.GetProp(
      "CustomClassicPantsAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomClassicPantsAccessoryId(value) {
    this.SetProp("CustomClassicPantsAccessoryId", 27, value);
  }
  get CustomClassicShirtsAccessoryEnabled() {
    return this.GetProp(
      "CustomClassicShirtsAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomClassicShirtsAccessoryEnabled(value) {
    this.SetProp("CustomClassicShirtsAccessoryEnabled", 2, value);
  }
  get CustomClassicShirtsAccessoryId() {
    return this.GetProp(
      "CustomClassicShirtsAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomClassicShirtsAccessoryId(value) {
    this.SetProp("CustomClassicShirtsAccessoryId", 27, value);
  }
  get CustomClassicTShirtsAccessoryEnabled() {
    return this.GetProp(
      "CustomClassicTShirtsAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomClassicTShirtsAccessoryEnabled(value) {
    this.SetProp("CustomClassicTShirtsAccessoryEnabled", 2, value);
  }
  get CustomClassicTShirtsAccessoryId() {
    return this.GetProp(
      "CustomClassicTShirtsAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomClassicTShirtsAccessoryId(value) {
    this.SetProp("CustomClassicTShirtsAccessoryId", 27, value);
  }
  get CustomClothingMode() {
    return this.GetProp(
      "CustomClothingMode",
      18
      /* Enum */
    );
  }
  set CustomClothingMode(value) {
    this.SetProp("CustomClothingMode", 18, value);
  }
  get CustomDressSkirtAccessoryEnabled() {
    return this.GetProp(
      "CustomDressSkirtAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomDressSkirtAccessoryEnabled(value) {
    this.SetProp("CustomDressSkirtAccessoryEnabled", 2, value);
  }
  get CustomDressSkirtAccessoryId() {
    return this.GetProp(
      "CustomDressSkirtAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomDressSkirtAccessoryId(value) {
    this.SetProp("CustomDressSkirtAccessoryId", 27, value);
  }
  get CustomJacketAccessoryEnabled() {
    return this.GetProp(
      "CustomJacketAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomJacketAccessoryEnabled(value) {
    this.SetProp("CustomJacketAccessoryEnabled", 2, value);
  }
  get CustomJacketAccessoryId() {
    return this.GetProp(
      "CustomJacketAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomJacketAccessoryId(value) {
    this.SetProp("CustomJacketAccessoryId", 27, value);
  }
  get CustomLeftShoesAccessoryEnabled() {
    return this.GetProp(
      "CustomLeftShoesAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomLeftShoesAccessoryEnabled(value) {
    this.SetProp("CustomLeftShoesAccessoryEnabled", 2, value);
  }
  get CustomLeftShoesAccessoryId() {
    return this.GetProp(
      "CustomLeftShoesAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomLeftShoesAccessoryId(value) {
    this.SetProp("CustomLeftShoesAccessoryId", 27, value);
  }
  get CustomPantsAccessoryEnabled() {
    return this.GetProp(
      "CustomPantsAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomPantsAccessoryEnabled(value) {
    this.SetProp("CustomPantsAccessoryEnabled", 2, value);
  }
  get CustomPantsAccessoryId() {
    return this.GetProp(
      "CustomPantsAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomPantsAccessoryId(value) {
    this.SetProp("CustomPantsAccessoryId", 27, value);
  }
  get CustomRightShoesAccessoryEnabled() {
    return this.GetProp(
      "CustomRightShoesAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomRightShoesAccessoryEnabled(value) {
    this.SetProp("CustomRightShoesAccessoryEnabled", 2, value);
  }
  get CustomRightShoesAccessoryId() {
    return this.GetProp(
      "CustomRightShoesAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomRightShoesAccessoryId(value) {
    this.SetProp("CustomRightShoesAccessoryId", 27, value);
  }
  get CustomShirtAccessoryEnabled() {
    return this.GetProp(
      "CustomShirtAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomShirtAccessoryEnabled(value) {
    this.SetProp("CustomShirtAccessoryEnabled", 2, value);
  }
  get CustomShirtAccessoryId() {
    return this.GetProp(
      "CustomShirtAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomShirtAccessoryId(value) {
    this.SetProp("CustomShirtAccessoryId", 27, value);
  }
  get CustomShortsAccessoryEnabled() {
    return this.GetProp(
      "CustomShortsAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomShortsAccessoryEnabled(value) {
    this.SetProp("CustomShortsAccessoryEnabled", 2, value);
  }
  get CustomShortsAccessoryId() {
    return this.GetProp(
      "CustomShortsAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomShortsAccessoryId(value) {
    this.SetProp("CustomShortsAccessoryId", 27, value);
  }
  get CustomSweaterAccessoryEnabled() {
    return this.GetProp(
      "CustomSweaterAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomSweaterAccessoryEnabled(value) {
    this.SetProp("CustomSweaterAccessoryEnabled", 2, value);
  }
  get CustomSweaterAccessoryId() {
    return this.GetProp(
      "CustomSweaterAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomSweaterAccessoryId(value) {
    this.SetProp("CustomSweaterAccessoryId", 27, value);
  }
  get CustomTShirtAccessoryEnabled() {
    return this.GetProp(
      "CustomTShirtAccessoryEnabled",
      2
      /* Bool */
    );
  }
  set CustomTShirtAccessoryEnabled(value) {
    this.SetProp("CustomTShirtAccessoryEnabled", 2, value);
  }
  get CustomTShirtAccessoryId() {
    return this.GetProp(
      "CustomTShirtAccessoryId",
      27
      /* Int64 */
    );
  }
  set CustomTShirtAccessoryId(value) {
    this.SetProp("CustomTShirtAccessoryId", 27, value);
  }
  get LimitBounds() {
    return this.GetProp(
      "LimitBounds",
      14
      /* Vector3 */
    );
  }
  set LimitBounds(value) {
    this.SetProp("LimitBounds", 14, value);
  }
};
var AvatarCollisionRules = class extends Instance {
  constructor() {
    super();
    this.addClassName("AvatarCollisionRules");
    this.Name = "AvatarCollisionRules";
    this.CollisionMode = AvatarSettingsCollisionMode.Default;
    this.HitAndTouchDetectionMode = AvatarSettingsHitAndTouchDetectionMode.UseParts;
    this.LegacyCollisionMode = AvatarSettingsLegacyCollisionMode.R6Colliders;
    this.SingleColliderSize = new Vector3(2, 4, 1);
  }
  get CollisionMode() {
    return this.GetProp(
      "CollisionMode",
      18
      /* Enum */
    );
  }
  set CollisionMode(value) {
    this.SetProp("CollisionMode", 18, value);
  }
  get HitAndTouchDetectionMode() {
    return this.GetProp(
      "HitAndTouchDetectionMode",
      18
      /* Enum */
    );
  }
  set HitAndTouchDetectionMode(value) {
    this.SetProp("HitAndTouchDetectionMode", 18, value);
  }
  get LegacyCollisionMode() {
    return this.GetProp(
      "LegacyCollisionMode",
      18
      /* Enum */
    );
  }
  set LegacyCollisionMode(value) {
    this.SetProp("LegacyCollisionMode", 18, value);
  }
  get SingleColliderSize() {
    return this.GetProp(
      "SingleColliderSize",
      14
      /* Vector3 */
    );
  }
  set SingleColliderSize(value) {
    this.SetProp("SingleColliderSize", 14, value);
  }
};
var AvatarCreationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AvatarCreationService");
    this.Name = "AvatarCreationService";
  }
};
var AvatarEditorService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AvatarEditorService");
    this.Name = "AvatarEditorService";
  }
};
var AvatarImportService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AvatarImportService");
    this.Name = "AvatarImportService";
  }
};
var AvatarPreloader = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AvatarPreloader");
    this.Name = "AvatarPreloader";
  }
};
var AvatarRules = class extends Instance {
  constructor() {
    super();
    this.addClassName("AvatarRules");
    this.Name = "AvatarRules";
    this.AvatarType = GameAvatarType.R15;
  }
  get AvatarType() {
    return this.GetProp(
      "AvatarType",
      18
      /* Enum */
    );
  }
  set AvatarType(value) {
    this.SetProp("AvatarType", 18, value);
  }
};
var AvatarSettings = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("AvatarSettings");
    this.Name = "AvatarSettings";
  }
};
var Backpack = class extends Instance {
  constructor() {
    super();
    this.addClassName("Backpack");
    this.Name = "Backpack";
  }
};
var BadgeService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("BadgeService");
    this.Name = "BadgeService";
  }
};
var BasePlayerGui = class extends Instance {
  constructor() {
    super();
    this.addClassName("BasePlayerGui");
  }
};
var CoreGui = class extends BasePlayerGui {
  constructor() {
    super();
    this._isService = true;
    this.addClassName("CoreGui");
    this.Name = "CoreGui";
  }
  get SelectionImageObject() {
    return this.GetProp(
      "SelectionImageObject",
      19
      /* Referent */
    );
  }
  set SelectionImageObject(value) {
    this.SetProp("SelectionImageObject", 19, value);
  }
};
var StarterGui = class extends BasePlayerGui {
  constructor() {
    super();
    this._isService = true;
    this.addClassName("StarterGui");
    this.Name = "StarterGui";
    this.ResetPlayerGuiOnSpawn = true;
    this.ScreenOrientation = ScreenOrientation.LandscapeSensor;
    this.ShowDevelopmentGui = true;
  }
  /**@deprecated Deprecated by Roblox*/
  get ResetPlayerGuiOnSpawn() {
    return this.GetProp(
      "ResetPlayerGuiOnSpawn",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set ResetPlayerGuiOnSpawn(value) {
    this.SetProp("ResetPlayerGuiOnSpawn", 2, value);
  }
  get RtlTextSupport() {
    return this.GetProp(
      "RtlTextSupport",
      18
      /* Enum */
    );
  }
  set RtlTextSupport(value) {
    this.SetProp("RtlTextSupport", 18, value);
  }
  get ScreenOrientation() {
    return this.GetProp(
      "ScreenOrientation",
      18
      /* Enum */
    );
  }
  set ScreenOrientation(value) {
    this.SetProp("ScreenOrientation", 18, value);
  }
  get ShowDevelopmentGui() {
    return this.GetProp(
      "ShowDevelopmentGui",
      2
      /* Bool */
    );
  }
  set ShowDevelopmentGui(value) {
    this.SetProp("ShowDevelopmentGui", 2, value);
  }
  get StudioDefaultStyleSheet() {
    return this.GetProp(
      "StudioDefaultStyleSheet",
      19
      /* Referent */
    );
  }
  set StudioDefaultStyleSheet(value) {
    this.SetProp("StudioDefaultStyleSheet", 19, value);
  }
  get StudioInsertWidgetLayerCollectorAutoLinkStyleSheet() {
    return this.GetProp(
      "StudioInsertWidgetLayerCollectorAutoLinkStyleSheet",
      19
      /* Referent */
    );
  }
  set StudioInsertWidgetLayerCollectorAutoLinkStyleSheet(value) {
    this.SetProp("StudioInsertWidgetLayerCollectorAutoLinkStyleSheet", 19, value);
  }
  get VirtualCursorMode() {
    return this.GetProp(
      "VirtualCursorMode",
      18
      /* Enum */
    );
  }
  set VirtualCursorMode(value) {
    this.SetProp("VirtualCursorMode", 18, value);
  }
};
var BaseRemoteEvent = class extends Instance {
  constructor() {
    super();
    this.addClassName("BaseRemoteEvent");
  }
};
var RemoteEvent = class extends BaseRemoteEvent {
  constructor() {
    super();
    this.addClassName("RemoteEvent");
    this.Name = "RemoteEvent";
  }
};
var UnreliableRemoteEvent = class extends BaseRemoteEvent {
  constructor() {
    super();
    this.addClassName("UnreliableRemoteEvent");
    this.Name = "UnreliableRemoteEvent";
  }
};
var BaseWrap = class extends Instance {
  constructor() {
    super();
    this.addClassName("BaseWrap");
    this.CageMeshId = "";
    this.CageOrigin = CFrame.Identity;
    this.ImportOrigin = CFrame.Identity;
  }
  get CageMeshContent() {
    return this.GetProp(
      "CageMeshContent",
      1
      /* String */
    );
  }
  set CageMeshContent(value) {
    this.SetProp("CageMeshContent", 1, value);
  }
  get CageMeshId() {
    return this.GetProp(
      "CageMeshId",
      1
      /* String */
    );
  }
  set CageMeshId(value) {
    this.SetProp("CageMeshId", 1, value);
  }
  get CageOrigin() {
    return this.GetProp(
      "CageOrigin",
      16
      /* CFrame */
    );
  }
  set CageOrigin(value) {
    this.SetProp("CageOrigin", 16, value);
  }
  get HSRAssetId() {
    return this.GetProp(
      "HSRAssetId",
      1
      /* String */
    );
  }
  set HSRAssetId(value) {
    this.SetProp("HSRAssetId", 1, value);
  }
  get HSRData() {
    return this.GetProp(
      "HSRData",
      28
      /* SharedString */
    );
  }
  set HSRData(value) {
    this.SetProp("HSRData", 28, value);
  }
  get HSRMeshIdData() {
    return this.GetProp(
      "HSRMeshIdData",
      28
      /* SharedString */
    );
  }
  set HSRMeshIdData(value) {
    this.SetProp("HSRMeshIdData", 28, value);
  }
  get ImportOrigin() {
    return this.GetProp(
      "ImportOrigin",
      16
      /* CFrame */
    );
  }
  set ImportOrigin(value) {
    this.SetProp("ImportOrigin", 16, value);
  }
  get MaxSize() {
    return this.GetProp(
      "MaxSize",
      14
      /* Vector3 */
    );
  }
  set MaxSize(value) {
    this.SetProp("MaxSize", 14, value);
  }
  get Offset() {
    return this.GetProp(
      "Offset",
      14
      /* Vector3 */
    );
  }
  set Offset(value) {
    this.SetProp("Offset", 14, value);
  }
  get TemporaryCageMeshId() {
    return this.GetProp(
      "TemporaryCageMeshId",
      1
      /* String */
    );
  }
  set TemporaryCageMeshId(value) {
    this.SetProp("TemporaryCageMeshId", 1, value);
  }
};
var WrapDeformer = class extends BaseWrap {
  constructor() {
    super();
    this.addClassName("WrapDeformer");
    this.Name = "WrapDeformer";
  }
};
var WrapLayer = class extends BaseWrap {
  constructor() {
    super();
    this.addClassName("WrapLayer");
    this.Name = "WrapLayer";
    this.AutoSkin = WrapLayerAutoSkin.Disabled;
    this.Enabled = true;
    this.Order = 1;
    this.Puffiness = 1;
    this.ReferenceMeshId = "";
    this.ShrinkFactor = 0;
    this.TemporaryReferenceId = "";
    this.BindOffset = CFrame.Identity;
    this.ReferenceOrigin = CFrame.Identity;
  }
  get AutoSkin() {
    return this.GetProp(
      "AutoSkin",
      18
      /* Enum */
    );
  }
  set AutoSkin(value) {
    this.SetProp("AutoSkin", 18, value);
  }
  get BindOffset() {
    return this.GetProp(
      "BindOffset",
      16
      /* CFrame */
    );
  }
  set BindOffset(value) {
    this.SetProp("BindOffset", 16, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Order() {
    return this.GetProp(
      "Order",
      3
      /* Int32 */
    );
  }
  set Order(value) {
    this.SetProp("Order", 3, value);
  }
  get Puffiness() {
    return this.GetProp(
      "Puffiness",
      4
      /* Float32 */
    );
  }
  set Puffiness(value) {
    this.SetProp("Puffiness", 4, value);
  }
  get ReferenceMeshContent() {
    return this.GetProp(
      "ReferenceMeshContent",
      1
      /* String */
    );
  }
  set ReferenceMeshContent(value) {
    this.SetProp("ReferenceMeshContent", 1, value);
  }
  get ReferenceMeshId() {
    return this.GetProp(
      "ReferenceMeshId",
      1
      /* String */
    );
  }
  set ReferenceMeshId(value) {
    this.SetProp("ReferenceMeshId", 1, value);
  }
  get ReferenceOrigin() {
    return this.GetProp(
      "ReferenceOrigin",
      16
      /* CFrame */
    );
  }
  set ReferenceOrigin(value) {
    this.SetProp("ReferenceOrigin", 16, value);
  }
  get ShrinkFactor() {
    return this.GetProp(
      "ShrinkFactor",
      4
      /* Float32 */
    );
  }
  set ShrinkFactor(value) {
    this.SetProp("ShrinkFactor", 4, value);
  }
  get TemporaryReferenceId() {
    return this.GetProp(
      "TemporaryReferenceId",
      1
      /* String */
    );
  }
  set TemporaryReferenceId(value) {
    this.SetProp("TemporaryReferenceId", 1, value);
  }
};
var WrapTarget = class extends BaseWrap {
  constructor() {
    super();
    this.addClassName("WrapTarget");
    this.Name = "WrapTarget";
    this.Stiffness = 0;
  }
  get Stiffness() {
    return this.GetProp(
      "Stiffness",
      4
      /* Float32 */
    );
  }
  set Stiffness(value) {
    this.SetProp("Stiffness", 4, value);
  }
};
var Beam = class extends Instance {
  constructor() {
    super();
    this.addClassName("Beam");
    this.Name = "Beam";
    this.Brightness = 1;
    this.Color = new ColorSequence(new ColorSequenceKeypoint(0, Color3.FromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.FromRGB(255, 255, 255)));
    this.CurveSize0 = 0;
    this.CurveSize1 = 0;
    this.Enabled = true;
    this.FaceCamera = false;
    this.LightEmission = 0;
    this.LightInfluence = 0;
    this.Segments = 10;
    this.Texture = "";
    this.TextureLength = 1;
    this.TextureMode = TextureMode.Stretch;
    this.TextureSpeed = 1;
    this.Transparency = new NumberSequence(new NumberSequenceKeypoint(0, 0.5, 0), new NumberSequenceKeypoint(1, 0.5, 0));
    this.Width0 = 1;
    this.Width1 = 1;
    this.ZOffset = 0;
  }
  get Attachment0() {
    return this.GetProp(
      "Attachment0",
      19
      /* Referent */
    );
  }
  set Attachment0(value) {
    this.SetProp("Attachment0", 19, value);
  }
  get Attachment1() {
    return this.GetProp(
      "Attachment1",
      19
      /* Referent */
    );
  }
  set Attachment1(value) {
    this.SetProp("Attachment1", 19, value);
  }
  get Brightness() {
    return this.GetProp(
      "Brightness",
      4
      /* Float32 */
    );
  }
  set Brightness(value) {
    this.SetProp("Brightness", 4, value);
  }
  get Color() {
    return this.GetProp(
      "Color",
      22
      /* ColorSequence */
    );
  }
  set Color(value) {
    this.SetProp("Color", 22, value);
  }
  get CurveSize0() {
    return this.GetProp(
      "CurveSize0",
      4
      /* Float32 */
    );
  }
  set CurveSize0(value) {
    this.SetProp("CurveSize0", 4, value);
  }
  get CurveSize1() {
    return this.GetProp(
      "CurveSize1",
      4
      /* Float32 */
    );
  }
  set CurveSize1(value) {
    this.SetProp("CurveSize1", 4, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get FaceCamera() {
    return this.GetProp(
      "FaceCamera",
      2
      /* Bool */
    );
  }
  set FaceCamera(value) {
    this.SetProp("FaceCamera", 2, value);
  }
  get LightEmission() {
    return this.GetProp(
      "LightEmission",
      4
      /* Float32 */
    );
  }
  set LightEmission(value) {
    this.SetProp("LightEmission", 4, value);
  }
  get LightInfluence() {
    return this.GetProp(
      "LightInfluence",
      4
      /* Float32 */
    );
  }
  set LightInfluence(value) {
    this.SetProp("LightInfluence", 4, value);
  }
  get Segments() {
    return this.GetProp(
      "Segments",
      3
      /* Int32 */
    );
  }
  set Segments(value) {
    this.SetProp("Segments", 3, value);
  }
  get Texture() {
    return this.GetProp(
      "Texture",
      1
      /* String */
    );
  }
  set Texture(value) {
    this.SetProp("Texture", 1, value);
  }
  get TextureLength() {
    return this.GetProp(
      "TextureLength",
      4
      /* Float32 */
    );
  }
  set TextureLength(value) {
    this.SetProp("TextureLength", 4, value);
  }
  get TextureMode() {
    return this.GetProp(
      "TextureMode",
      18
      /* Enum */
    );
  }
  set TextureMode(value) {
    this.SetProp("TextureMode", 18, value);
  }
  get TextureSpeed() {
    return this.GetProp(
      "TextureSpeed",
      4
      /* Float32 */
    );
  }
  set TextureSpeed(value) {
    this.SetProp("TextureSpeed", 4, value);
  }
  get Transparency() {
    return this.GetProp(
      "Transparency",
      21
      /* NumberSequence */
    );
  }
  set Transparency(value) {
    this.SetProp("Transparency", 21, value);
  }
  get Width0() {
    return this.GetProp(
      "Width0",
      4
      /* Float32 */
    );
  }
  set Width0(value) {
    this.SetProp("Width0", 4, value);
  }
  get Width1() {
    return this.GetProp(
      "Width1",
      4
      /* Float32 */
    );
  }
  set Width1(value) {
    this.SetProp("Width1", 4, value);
  }
  get ZOffset() {
    return this.GetProp(
      "ZOffset",
      4
      /* Float32 */
    );
  }
  set ZOffset(value) {
    this.SetProp("ZOffset", 4, value);
  }
};
var BindableEvent = class extends Instance {
  constructor() {
    super();
    this.addClassName("BindableEvent");
    this.Name = "BindableEvent";
  }
};
var BindableFunction = class extends Instance {
  constructor() {
    super();
    this.addClassName("BindableFunction");
    this.Name = "BindableFunction";
  }
};
var BodyMover = class extends Instance {
  constructor() {
    super();
    this.addClassName("BodyMover");
  }
};
var BodyAngularVelocity = class extends BodyMover {
  constructor() {
    super();
    this.addClassName("BodyAngularVelocity");
    this.Name = "BodyAngularVelocity";
    this.AngularVelocity = new Vector3(0, 2, 0);
    this.MaxTorque = new Vector3(4e3, 4e3, 4e3);
    this.P = 1250;
  }
  get AngularVelocity() {
    return this.GetProp(
      "AngularVelocity",
      14
      /* Vector3 */
    );
  }
  set AngularVelocity(value) {
    this.SetProp("AngularVelocity", 14, value);
  }
  get MaxTorque() {
    return this.GetProp(
      "MaxTorque",
      14
      /* Vector3 */
    );
  }
  set MaxTorque(value) {
    this.SetProp("MaxTorque", 14, value);
  }
  get P() {
    return this.GetProp(
      "P",
      4
      /* Float32 */
    );
  }
  set P(value) {
    this.SetProp("P", 4, value);
  }
};
var BodyForce = class extends BodyMover {
  constructor() {
    super();
    this.addClassName("BodyForce");
    this.Name = "BodyForce";
    this.Force = new Vector3(0, 1, 0);
  }
  get Force() {
    return this.GetProp(
      "Force",
      14
      /* Vector3 */
    );
  }
  set Force(value) {
    this.SetProp("Force", 14, value);
  }
};
var BodyGyro = class extends BodyMover {
  constructor() {
    super();
    this.addClassName("BodyGyro");
    this.Name = "BodyGyro";
    this.D = 500;
    this.MaxTorque = new Vector3(4e5, 0, 4e5);
    this.P = 3e3;
    this.CFrame = CFrame.Identity;
  }
  get CFrame() {
    return this.GetProp(
      "CFrame",
      16
      /* CFrame */
    );
  }
  set CFrame(value) {
    this.SetProp("CFrame", 16, value);
  }
  get D() {
    return this.GetProp(
      "D",
      4
      /* Float32 */
    );
  }
  set D(value) {
    this.SetProp("D", 4, value);
  }
  get MaxTorque() {
    return this.GetProp(
      "MaxTorque",
      14
      /* Vector3 */
    );
  }
  set MaxTorque(value) {
    this.SetProp("MaxTorque", 14, value);
  }
  get P() {
    return this.GetProp(
      "P",
      4
      /* Float32 */
    );
  }
  set P(value) {
    this.SetProp("P", 4, value);
  }
};
var BodyPosition = class extends BodyMover {
  constructor() {
    super();
    this.addClassName("BodyPosition");
    this.Name = "BodyPosition";
    this.D = 1250;
    this.MaxForce = new Vector3(4e3, 4e3, 4e3);
    this.P = 1e4;
    this.Position = new Vector3(0, 50, 0);
  }
  get D() {
    return this.GetProp(
      "D",
      4
      /* Float32 */
    );
  }
  set D(value) {
    this.SetProp("D", 4, value);
  }
  get MaxForce() {
    return this.GetProp(
      "MaxForce",
      14
      /* Vector3 */
    );
  }
  set MaxForce(value) {
    this.SetProp("MaxForce", 14, value);
  }
  get P() {
    return this.GetProp(
      "P",
      4
      /* Float32 */
    );
  }
  set P(value) {
    this.SetProp("P", 4, value);
  }
  get Position() {
    return this.GetProp(
      "Position",
      14
      /* Vector3 */
    );
  }
  set Position(value) {
    this.SetProp("Position", 14, value);
  }
};
var BodyThrust = class extends BodyMover {
  constructor() {
    super();
    this.addClassName("BodyThrust");
    this.Name = "BodyThrust";
    this.Force = new Vector3(0, 1, 0);
    this.Location = new Vector3(0, 0, 0);
  }
  get Force() {
    return this.GetProp(
      "Force",
      14
      /* Vector3 */
    );
  }
  set Force(value) {
    this.SetProp("Force", 14, value);
  }
  get Location() {
    return this.GetProp(
      "Location",
      14
      /* Vector3 */
    );
  }
  set Location(value) {
    this.SetProp("Location", 14, value);
  }
};
var BodyVelocity = class extends BodyMover {
  constructor() {
    super();
    this.addClassName("BodyVelocity");
    this.Name = "BodyVelocity";
    this.MaxForce = new Vector3(4e3, 4e3, 4e3);
    this.P = 1250;
    this.Velocity = new Vector3(0, 2, 0);
  }
  get MaxForce() {
    return this.GetProp(
      "MaxForce",
      14
      /* Vector3 */
    );
  }
  set MaxForce(value) {
    this.SetProp("MaxForce", 14, value);
  }
  get P() {
    return this.GetProp(
      "P",
      4
      /* Float32 */
    );
  }
  set P(value) {
    this.SetProp("P", 4, value);
  }
  get Velocity() {
    return this.GetProp(
      "Velocity",
      14
      /* Vector3 */
    );
  }
  set Velocity(value) {
    this.SetProp("Velocity", 14, value);
  }
};
var RocketPropulsion = class extends BodyMover {
  constructor() {
    super();
    this.addClassName("RocketPropulsion");
    this.Name = "RocketPropulsion";
    this.CartoonFactor = 0.7;
    this.MaxSpeed = 30;
    this.MaxThrust = 4e3;
    this.MaxTorque = new Vector3(4e5, 4e5, 0);
    this.TargetOffset = new Vector3(0, 0, 0);
    this.TargetRadius = 4;
    this.ThrustD = 1e-3;
    this.ThrustP = 5;
    this.TurnD = 500;
    this.TurnP = 3e3;
  }
  get CartoonFactor() {
    return this.GetProp(
      "CartoonFactor",
      4
      /* Float32 */
    );
  }
  set CartoonFactor(value) {
    this.SetProp("CartoonFactor", 4, value);
  }
  get MaxSpeed() {
    return this.GetProp(
      "MaxSpeed",
      4
      /* Float32 */
    );
  }
  set MaxSpeed(value) {
    this.SetProp("MaxSpeed", 4, value);
  }
  get MaxThrust() {
    return this.GetProp(
      "MaxThrust",
      4
      /* Float32 */
    );
  }
  set MaxThrust(value) {
    this.SetProp("MaxThrust", 4, value);
  }
  get MaxTorque() {
    return this.GetProp(
      "MaxTorque",
      14
      /* Vector3 */
    );
  }
  set MaxTorque(value) {
    this.SetProp("MaxTorque", 14, value);
  }
  get Target() {
    return this.GetProp(
      "Target",
      19
      /* Referent */
    );
  }
  set Target(value) {
    this.SetProp("Target", 19, value);
  }
  get TargetOffset() {
    return this.GetProp(
      "TargetOffset",
      14
      /* Vector3 */
    );
  }
  set TargetOffset(value) {
    this.SetProp("TargetOffset", 14, value);
  }
  get TargetRadius() {
    return this.GetProp(
      "TargetRadius",
      4
      /* Float32 */
    );
  }
  set TargetRadius(value) {
    this.SetProp("TargetRadius", 4, value);
  }
  get ThrustD() {
    return this.GetProp(
      "ThrustD",
      4
      /* Float32 */
    );
  }
  set ThrustD(value) {
    this.SetProp("ThrustD", 4, value);
  }
  get ThrustP() {
    return this.GetProp(
      "ThrustP",
      4
      /* Float32 */
    );
  }
  set ThrustP(value) {
    this.SetProp("ThrustP", 4, value);
  }
  get TurnD() {
    return this.GetProp(
      "TurnD",
      4
      /* Float32 */
    );
  }
  set TurnD(value) {
    this.SetProp("TurnD", 4, value);
  }
  get TurnP() {
    return this.GetProp(
      "TurnP",
      4
      /* Float32 */
    );
  }
  set TurnP(value) {
    this.SetProp("TurnP", 4, value);
  }
};
var BodyPartDescription = class extends Instance {
  constructor() {
    super();
    this.addClassName("BodyPartDescription");
    this.Name = "BodyPartDescription";
    this.AssetId = BigInt(0);
    this.BodyPart = BodyPart.Head;
    this.Color = Color3.FromRGB(0, 0, 0);
  }
  get AssetId() {
    return this.GetProp(
      "AssetId",
      27
      /* Int64 */
    );
  }
  set AssetId(value) {
    this.SetProp("AssetId", 27, value);
  }
  get BodyPart() {
    return this.GetProp(
      "BodyPart",
      18
      /* Enum */
    );
  }
  set BodyPart(value) {
    this.SetProp("BodyPart", 18, value);
  }
  get Color() {
    return this.GetProp(
      "Color",
      12
      /* Color3 */
    );
  }
  set Color(value) {
    this.SetProp("Color", 12, value);
  }
  get Instance() {
    return this.GetProp(
      "Instance",
      19
      /* Referent */
    );
  }
  set Instance(value) {
    this.SetProp("Instance", 19, value);
  }
};
var Breakpoint = class extends Instance {
  constructor() {
    super();
    this.addClassName("Breakpoint");
    this.Name = "Breakpoint";
  }
};
var BrowserService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("BrowserService");
    this.Name = "BrowserService";
  }
};
var BugReporterService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("BugReporterService");
    this.Name = "BugReporterService";
  }
};
var BulkImportService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("BulkImportService");
    this.Name = "BulkImportService";
  }
};
var CacheableContentProvider = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CacheableContentProvider");
  }
};
var HSRDataContentProvider = class extends CacheableContentProvider {
  constructor() {
    super();
    this.addClassName("HSRDataContentProvider");
    this.Name = "HSRDataContentProvider";
  }
};
var MeshContentProvider = class extends CacheableContentProvider {
  constructor() {
    super();
    this.addClassName("MeshContentProvider");
    this.Name = "MeshContentProvider";
  }
};
var SolidModelContentProvider = class extends CacheableContentProvider {
  constructor() {
    super();
    this.addClassName("SolidModelContentProvider");
    this.Name = "SolidModelContentProvider";
  }
};
var CalloutService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CalloutService");
    this.Name = "CalloutService";
  }
};
var CaptureService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CaptureService");
    this.Name = "CaptureService";
  }
};
var ChangeHistoryService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ChangeHistoryService");
    this.Name = "ChangeHistoryService";
  }
};
var CharacterAppearance = class extends Instance {
  constructor() {
    super();
    this.addClassName("CharacterAppearance");
  }
};
var BodyColors = class extends CharacterAppearance {
  constructor() {
    super();
    this.addClassName("BodyColors");
    this.Name = "BodyColors";
    this.HeadColor3 = Color3.FromRGB(253, 234, 141);
    this.LeftArmColor3 = Color3.FromRGB(253, 234, 141);
    this.LeftLegColor3 = Color3.FromRGB(13, 105, 172);
    this.RightArmColor3 = Color3.FromRGB(253, 234, 141);
    this.RightLegColor3 = Color3.FromRGB(13, 105, 172);
    this.TorsoColor3 = Color3.FromRGB(40, 127, 71);
  }
  get HeadColor3() {
    return this.GetProp(
      "HeadColor3",
      12
      /* Color3 */
    );
  }
  set HeadColor3(value) {
    this.SetProp("HeadColor3", 12, value);
  }
  get LeftArmColor3() {
    return this.GetProp(
      "LeftArmColor3",
      12
      /* Color3 */
    );
  }
  set LeftArmColor3(value) {
    this.SetProp("LeftArmColor3", 12, value);
  }
  get LeftLegColor3() {
    return this.GetProp(
      "LeftLegColor3",
      12
      /* Color3 */
    );
  }
  set LeftLegColor3(value) {
    this.SetProp("LeftLegColor3", 12, value);
  }
  get RightArmColor3() {
    return this.GetProp(
      "RightArmColor3",
      12
      /* Color3 */
    );
  }
  set RightArmColor3(value) {
    this.SetProp("RightArmColor3", 12, value);
  }
  get RightLegColor3() {
    return this.GetProp(
      "RightLegColor3",
      12
      /* Color3 */
    );
  }
  set RightLegColor3(value) {
    this.SetProp("RightLegColor3", 12, value);
  }
  get TorsoColor3() {
    return this.GetProp(
      "TorsoColor3",
      12
      /* Color3 */
    );
  }
  set TorsoColor3(value) {
    this.SetProp("TorsoColor3", 12, value);
  }
};
var CharacterMesh = class extends CharacterAppearance {
  constructor() {
    super();
    this.addClassName("CharacterMesh");
    this.Name = "CharacterMesh";
    this.BaseTextureId = BigInt(0);
    this.BodyPart = BodyPart.Head;
    this.MeshId = BigInt(0);
    this.OverlayTextureId = BigInt(0);
  }
  get BaseTextureId() {
    return this.GetProp(
      "BaseTextureId",
      27
      /* Int64 */
    );
  }
  set BaseTextureId(value) {
    this.SetProp("BaseTextureId", 27, value);
  }
  get BodyPart() {
    return this.GetProp(
      "BodyPart",
      18
      /* Enum */
    );
  }
  set BodyPart(value) {
    this.SetProp("BodyPart", 18, value);
  }
  get MeshId() {
    return this.GetProp(
      "MeshId",
      27
      /* Int64 */
    );
  }
  set MeshId(value) {
    this.SetProp("MeshId", 27, value);
  }
  get OverlayTextureId() {
    return this.GetProp(
      "OverlayTextureId",
      27
      /* Int64 */
    );
  }
  set OverlayTextureId(value) {
    this.SetProp("OverlayTextureId", 27, value);
  }
};
var Clothing = class extends CharacterAppearance {
  constructor() {
    super();
    this.addClassName("Clothing");
    this.Color3 = Color3.FromRGB(255, 255, 255);
  }
  get Color3() {
    return this.GetProp(
      "Color3",
      12
      /* Color3 */
    );
  }
  set Color3(value) {
    this.SetProp("Color3", 12, value);
  }
};
var Pants = class extends Clothing {
  constructor() {
    super();
    this.addClassName("Pants");
    this.Name = "Pants";
    this.PantsTemplate = "";
  }
  get PantsTemplate() {
    return this.GetProp(
      "PantsTemplate",
      1
      /* String */
    );
  }
  set PantsTemplate(value) {
    this.SetProp("PantsTemplate", 1, value);
  }
};
var Shirt = class extends Clothing {
  constructor() {
    super();
    this.addClassName("Shirt");
    this.Name = "Shirt";
    this.ShirtTemplate = "";
  }
  get ShirtTemplate() {
    return this.GetProp(
      "ShirtTemplate",
      1
      /* String */
    );
  }
  set ShirtTemplate(value) {
    this.SetProp("ShirtTemplate", 1, value);
  }
};
var ShirtGraphic = class extends CharacterAppearance {
  constructor() {
    super();
    this.addClassName("ShirtGraphic");
    this.Name = "ShirtGraphic";
    this.Color3 = Color3.FromRGB(255, 255, 255);
    this.Graphic = "";
  }
  get Color3() {
    return this.GetProp(
      "Color3",
      12
      /* Color3 */
    );
  }
  set Color3(value) {
    this.SetProp("Color3", 12, value);
  }
  get Graphic() {
    return this.GetProp(
      "Graphic",
      1
      /* String */
    );
  }
  set Graphic(value) {
    this.SetProp("Graphic", 1, value);
  }
};
var Skin = class extends CharacterAppearance {
  constructor() {
    super();
    this.addClassName("Skin");
    this.Name = "Skin";
  }
  get SkinColor() {
    return this.GetProp(
      "SkinColor",
      11
      /* BrickColor */
    );
  }
  set SkinColor(value) {
    this.SetProp("SkinColor", 11, value);
  }
};
var Chat = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("Chat");
    this.Name = "Chat";
    this.BubbleChatEnabled = false;
    this.IsAutoMigrated = false;
    this.LoadDefaultChat = true;
  }
  get BubbleChatEnabled() {
    return this.GetProp(
      "BubbleChatEnabled",
      2
      /* Bool */
    );
  }
  set BubbleChatEnabled(value) {
    this.SetProp("BubbleChatEnabled", 2, value);
  }
  get IsAutoMigrated() {
    return this.GetProp(
      "IsAutoMigrated",
      2
      /* Bool */
    );
  }
  set IsAutoMigrated(value) {
    this.SetProp("IsAutoMigrated", 2, value);
  }
  get LoadDefaultChat() {
    return this.GetProp(
      "LoadDefaultChat",
      2
      /* Bool */
    );
  }
  set LoadDefaultChat(value) {
    this.SetProp("LoadDefaultChat", 2, value);
  }
};
var ChatbotUIService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ChatbotUIService");
    this.Name = "ChatbotUIService";
  }
};
var ClickDetector = class extends Instance {
  constructor() {
    super();
    this.addClassName("ClickDetector");
    this.Name = "ClickDetector";
    this.CursorIcon = "";
    this.MaxActivationDistance = 32;
  }
  get CursorIcon() {
    return this.GetProp(
      "CursorIcon",
      1
      /* String */
    );
  }
  set CursorIcon(value) {
    this.SetProp("CursorIcon", 1, value);
  }
  get MaxActivationDistance() {
    return this.GetProp(
      "MaxActivationDistance",
      4
      /* Float32 */
    );
  }
  set MaxActivationDistance(value) {
    this.SetProp("MaxActivationDistance", 4, value);
  }
};
var DragDetector = class extends ClickDetector {
  constructor() {
    super();
    this.addClassName("DragDetector");
    this.Name = "DragDetector";
    this.ActivatedCursorIcon = "";
    this.ApplyAtCenterOfMass = false;
    this.DragStyle = DragDetectorDragStyle.TranslatePlane;
    this.Enabled = true;
    this.GamepadModeSwitchKeyCode = KeyCode.ButtonR1;
    this.KeyboardModeSwitchKeyCode = KeyCode.LeftControl;
    this.MaxDragAngle = 0;
    this.MaxDragTranslation = new Vector3(0, 0, 0);
    this.MaxForce = 1e7;
    this.MaxTorque = 1e4;
    this.MinDragAngle = 0;
    this.MinDragTranslation = new Vector3(0, 0, 0);
    this.Orientation = new Vector3(0, 180, 90);
    this.PermissionPolicy = DragDetectorPermissionPolicy.Everybody;
    this.ResponseStyle = DragDetectorResponseStyle.Physical;
    this.Responsiveness = 10;
    this.RunLocally = false;
    this.TrackballRadialPullFactor = 1;
    this.TrackballRollFactor = 1;
    this.VRSwitchKeyCode = KeyCode.ButtonL2;
    this.DragFrame = CFrame.Identity;
  }
  get ActivatedCursorIcon() {
    return this.GetProp(
      "ActivatedCursorIcon",
      1
      /* String */
    );
  }
  set ActivatedCursorIcon(value) {
    this.SetProp("ActivatedCursorIcon", 1, value);
  }
  get ApplyAtCenterOfMass() {
    return this.GetProp(
      "ApplyAtCenterOfMass",
      2
      /* Bool */
    );
  }
  set ApplyAtCenterOfMass(value) {
    this.SetProp("ApplyAtCenterOfMass", 2, value);
  }
  get DragFrame() {
    return this.GetProp(
      "DragFrame",
      16
      /* CFrame */
    );
  }
  set DragFrame(value) {
    this.SetProp("DragFrame", 16, value);
  }
  get DragStyle() {
    return this.GetProp(
      "DragStyle",
      18
      /* Enum */
    );
  }
  set DragStyle(value) {
    this.SetProp("DragStyle", 18, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get GamepadModeSwitchKeyCode() {
    return this.GetProp(
      "GamepadModeSwitchKeyCode",
      18
      /* Enum */
    );
  }
  set GamepadModeSwitchKeyCode(value) {
    this.SetProp("GamepadModeSwitchKeyCode", 18, value);
  }
  get KeyboardModeSwitchKeyCode() {
    return this.GetProp(
      "KeyboardModeSwitchKeyCode",
      18
      /* Enum */
    );
  }
  set KeyboardModeSwitchKeyCode(value) {
    this.SetProp("KeyboardModeSwitchKeyCode", 18, value);
  }
  get MaxDragAngle() {
    return this.GetProp(
      "MaxDragAngle",
      4
      /* Float32 */
    );
  }
  set MaxDragAngle(value) {
    this.SetProp("MaxDragAngle", 4, value);
  }
  get MaxDragTranslation() {
    return this.GetProp(
      "MaxDragTranslation",
      14
      /* Vector3 */
    );
  }
  set MaxDragTranslation(value) {
    this.SetProp("MaxDragTranslation", 14, value);
  }
  get MaxForce() {
    return this.GetProp(
      "MaxForce",
      4
      /* Float32 */
    );
  }
  set MaxForce(value) {
    this.SetProp("MaxForce", 4, value);
  }
  get MaxTorque() {
    return this.GetProp(
      "MaxTorque",
      4
      /* Float32 */
    );
  }
  set MaxTorque(value) {
    this.SetProp("MaxTorque", 4, value);
  }
  get MinDragAngle() {
    return this.GetProp(
      "MinDragAngle",
      4
      /* Float32 */
    );
  }
  set MinDragAngle(value) {
    this.SetProp("MinDragAngle", 4, value);
  }
  get MinDragTranslation() {
    return this.GetProp(
      "MinDragTranslation",
      14
      /* Vector3 */
    );
  }
  set MinDragTranslation(value) {
    this.SetProp("MinDragTranslation", 14, value);
  }
  get Orientation() {
    return this.GetProp(
      "Orientation",
      14
      /* Vector3 */
    );
  }
  set Orientation(value) {
    this.SetProp("Orientation", 14, value);
  }
  get PermissionPolicy() {
    return this.GetProp(
      "PermissionPolicy",
      18
      /* Enum */
    );
  }
  set PermissionPolicy(value) {
    this.SetProp("PermissionPolicy", 18, value);
  }
  get ReferenceInstance() {
    return this.GetProp(
      "ReferenceInstance",
      19
      /* Referent */
    );
  }
  set ReferenceInstance(value) {
    this.SetProp("ReferenceInstance", 19, value);
  }
  get ResponseStyle() {
    return this.GetProp(
      "ResponseStyle",
      18
      /* Enum */
    );
  }
  set ResponseStyle(value) {
    this.SetProp("ResponseStyle", 18, value);
  }
  get Responsiveness() {
    return this.GetProp(
      "Responsiveness",
      4
      /* Float32 */
    );
  }
  set Responsiveness(value) {
    this.SetProp("Responsiveness", 4, value);
  }
  get RunLocally() {
    return this.GetProp(
      "RunLocally",
      2
      /* Bool */
    );
  }
  set RunLocally(value) {
    this.SetProp("RunLocally", 2, value);
  }
  get TrackballRadialPullFactor() {
    return this.GetProp(
      "TrackballRadialPullFactor",
      4
      /* Float32 */
    );
  }
  set TrackballRadialPullFactor(value) {
    this.SetProp("TrackballRadialPullFactor", 4, value);
  }
  get TrackballRollFactor() {
    return this.GetProp(
      "TrackballRollFactor",
      4
      /* Float32 */
    );
  }
  set TrackballRollFactor(value) {
    this.SetProp("TrackballRollFactor", 4, value);
  }
  get VRSwitchKeyCode() {
    return this.GetProp(
      "VRSwitchKeyCode",
      18
      /* Enum */
    );
  }
  set VRSwitchKeyCode(value) {
    this.SetProp("VRSwitchKeyCode", 18, value);
  }
};
var CloudCRUDService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CloudCRUDService");
    this.Name = "CloudCRUDService";
  }
};
var Clouds = class extends Instance {
  constructor() {
    super();
    this.addClassName("Clouds");
    this.Name = "Clouds";
    this.Color = Color3.FromRGB(255, 255, 255);
    this.Cover = 0.5;
    this.Density = 0.7;
    this.Enabled = true;
  }
  get Color() {
    return this.GetProp(
      "Color",
      12
      /* Color3 */
    );
  }
  set Color(value) {
    this.SetProp("Color", 12, value);
  }
  get Cover() {
    return this.GetProp(
      "Cover",
      4
      /* Float32 */
    );
  }
  set Cover(value) {
    this.SetProp("Cover", 4, value);
  }
  get Density() {
    return this.GetProp(
      "Density",
      4
      /* Float32 */
    );
  }
  set Density(value) {
    this.SetProp("Density", 4, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
};
var ClusterPacketCache = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ClusterPacketCache");
    this.Name = "ClusterPacketCache";
  }
};
var CollaboratorsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CollaboratorsService");
    this.Name = "CollaboratorsService";
  }
};
var CollectionService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CollectionService");
    this.Name = "CollectionService";
  }
};
var CommandService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CommandService");
    this.Name = "CommandService";
  }
};
var CommerceService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CommerceService");
    this.Name = "CommerceService";
  }
};
var ConfigService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ConfigService");
    this.Name = "ConfigService";
  }
};
var Configuration = class extends Instance {
  constructor() {
    super();
    this.addClassName("Configuration");
    this.Name = "Configuration";
  }
};
var ConfigureServerService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ConfigureServerService");
    this.Name = "ConfigureServerService";
  }
};
var ConnectivityService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ConnectivityService");
    this.Name = "ConnectivityService";
  }
};
var Constraint = class extends Instance {
  constructor() {
    super();
    this.addClassName("Constraint");
    this.Enabled = true;
    this.Visible = false;
  }
  get Attachment0() {
    return this.GetProp(
      "Attachment0",
      19
      /* Referent */
    );
  }
  set Attachment0(value) {
    this.SetProp("Attachment0", 19, value);
  }
  get Attachment1() {
    return this.GetProp(
      "Attachment1",
      19
      /* Referent */
    );
  }
  set Attachment1(value) {
    this.SetProp("Attachment1", 19, value);
  }
  get Color() {
    return this.GetProp(
      "Color",
      11
      /* BrickColor */
    );
  }
  set Color(value) {
    this.SetProp("Color", 11, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Visible() {
    return this.GetProp(
      "Visible",
      2
      /* Bool */
    );
  }
  set Visible(value) {
    this.SetProp("Visible", 2, value);
  }
};
var AlignOrientation = class extends Constraint {
  constructor() {
    super();
    this.addClassName("AlignOrientation");
    this.Name = "AlignOrientation";
    this.AlignType = AlignType.AllAxes;
    this.MaxAngularVelocity = Infinity;
    this.MaxTorque = 1e4;
    this.Mode = OrientationAlignmentMode.TwoAttachment;
    this.PrimaryAxisOnly = false;
    this.ReactionTorqueEnabled = false;
    this.Responsiveness = 10;
    this.RigidityEnabled = false;
    this.CFrame = CFrame.Identity;
  }
  get AlignType() {
    return this.GetProp(
      "AlignType",
      18
      /* Enum */
    );
  }
  set AlignType(value) {
    this.SetProp("AlignType", 18, value);
  }
  get CFrame() {
    return this.GetProp(
      "CFrame",
      16
      /* CFrame */
    );
  }
  set CFrame(value) {
    this.SetProp("CFrame", 16, value);
  }
  get MaxAngularVelocity() {
    return this.GetProp(
      "MaxAngularVelocity",
      4
      /* Float32 */
    );
  }
  set MaxAngularVelocity(value) {
    this.SetProp("MaxAngularVelocity", 4, value);
  }
  get MaxTorque() {
    return this.GetProp(
      "MaxTorque",
      4
      /* Float32 */
    );
  }
  set MaxTorque(value) {
    this.SetProp("MaxTorque", 4, value);
  }
  get Mode() {
    return this.GetProp(
      "Mode",
      18
      /* Enum */
    );
  }
  set Mode(value) {
    this.SetProp("Mode", 18, value);
  }
  get PrimaryAxisOnly() {
    return this.GetProp(
      "PrimaryAxisOnly",
      2
      /* Bool */
    );
  }
  set PrimaryAxisOnly(value) {
    this.SetProp("PrimaryAxisOnly", 2, value);
  }
  get ReactionTorqueEnabled() {
    return this.GetProp(
      "ReactionTorqueEnabled",
      2
      /* Bool */
    );
  }
  set ReactionTorqueEnabled(value) {
    this.SetProp("ReactionTorqueEnabled", 2, value);
  }
  get Responsiveness() {
    return this.GetProp(
      "Responsiveness",
      4
      /* Float32 */
    );
  }
  set Responsiveness(value) {
    this.SetProp("Responsiveness", 4, value);
  }
  get RigidityEnabled() {
    return this.GetProp(
      "RigidityEnabled",
      2
      /* Bool */
    );
  }
  set RigidityEnabled(value) {
    this.SetProp("RigidityEnabled", 2, value);
  }
};
var AlignPosition = class extends Constraint {
  constructor() {
    super();
    this.addClassName("AlignPosition");
    this.Name = "AlignPosition";
    this.ApplyAtCenterOfMass = false;
    this.ForceLimitMode = ForceLimitMode.Magnitude;
    this.ForceRelativeTo = ActuatorRelativeTo.World;
    this.MaxAxesForce = new Vector3(1e4, 1e4, 1e4);
    this.MaxForce = 1e4;
    this.MaxVelocity = Infinity;
    this.Mode = PositionAlignmentMode.TwoAttachment;
    this.Position = new Vector3(0, 0, 0);
    this.ReactionForceEnabled = false;
    this.Responsiveness = 10;
    this.RigidityEnabled = false;
  }
  get ApplyAtCenterOfMass() {
    return this.GetProp(
      "ApplyAtCenterOfMass",
      2
      /* Bool */
    );
  }
  set ApplyAtCenterOfMass(value) {
    this.SetProp("ApplyAtCenterOfMass", 2, value);
  }
  get ForceLimitMode() {
    return this.GetProp(
      "ForceLimitMode",
      18
      /* Enum */
    );
  }
  set ForceLimitMode(value) {
    this.SetProp("ForceLimitMode", 18, value);
  }
  get ForceRelativeTo() {
    return this.GetProp(
      "ForceRelativeTo",
      18
      /* Enum */
    );
  }
  set ForceRelativeTo(value) {
    this.SetProp("ForceRelativeTo", 18, value);
  }
  get MaxAxesForce() {
    return this.GetProp(
      "MaxAxesForce",
      14
      /* Vector3 */
    );
  }
  set MaxAxesForce(value) {
    this.SetProp("MaxAxesForce", 14, value);
  }
  get MaxForce() {
    return this.GetProp(
      "MaxForce",
      4
      /* Float32 */
    );
  }
  set MaxForce(value) {
    this.SetProp("MaxForce", 4, value);
  }
  get MaxVelocity() {
    return this.GetProp(
      "MaxVelocity",
      4
      /* Float32 */
    );
  }
  set MaxVelocity(value) {
    this.SetProp("MaxVelocity", 4, value);
  }
  get Mode() {
    return this.GetProp(
      "Mode",
      18
      /* Enum */
    );
  }
  set Mode(value) {
    this.SetProp("Mode", 18, value);
  }
  get Position() {
    return this.GetProp(
      "Position",
      14
      /* Vector3 */
    );
  }
  set Position(value) {
    this.SetProp("Position", 14, value);
  }
  get ReactionForceEnabled() {
    return this.GetProp(
      "ReactionForceEnabled",
      2
      /* Bool */
    );
  }
  set ReactionForceEnabled(value) {
    this.SetProp("ReactionForceEnabled", 2, value);
  }
  get Responsiveness() {
    return this.GetProp(
      "Responsiveness",
      4
      /* Float32 */
    );
  }
  set Responsiveness(value) {
    this.SetProp("Responsiveness", 4, value);
  }
  get RigidityEnabled() {
    return this.GetProp(
      "RigidityEnabled",
      2
      /* Bool */
    );
  }
  set RigidityEnabled(value) {
    this.SetProp("RigidityEnabled", 2, value);
  }
};
var AngularVelocity = class extends Constraint {
  constructor() {
    super();
    this.addClassName("AngularVelocity");
    this.Name = "AngularVelocity";
    this.AngularVelocity = new Vector3(0, 0, 0);
    this.MaxTorque = 0;
    this.ReactionTorqueEnabled = false;
    this.RelativeTo = ActuatorRelativeTo.World;
  }
  get AngularVelocity() {
    return this.GetProp(
      "AngularVelocity",
      14
      /* Vector3 */
    );
  }
  set AngularVelocity(value) {
    this.SetProp("AngularVelocity", 14, value);
  }
  get MaxTorque() {
    return this.GetProp(
      "MaxTorque",
      4
      /* Float32 */
    );
  }
  set MaxTorque(value) {
    this.SetProp("MaxTorque", 4, value);
  }
  get ReactionTorqueEnabled() {
    return this.GetProp(
      "ReactionTorqueEnabled",
      2
      /* Bool */
    );
  }
  set ReactionTorqueEnabled(value) {
    this.SetProp("ReactionTorqueEnabled", 2, value);
  }
  get RelativeTo() {
    return this.GetProp(
      "RelativeTo",
      18
      /* Enum */
    );
  }
  set RelativeTo(value) {
    this.SetProp("RelativeTo", 18, value);
  }
};
var AnimationConstraint = class extends Constraint {
  constructor() {
    super();
    this.addClassName("AnimationConstraint");
    this.Name = "AnimationConstraint";
    this.IsKinematic = false;
    this.MaxForce = 1e4;
    this.MaxTorque = 1e4;
    this.Transform = CFrame.Identity;
  }
  get IsKinematic() {
    return this.GetProp(
      "IsKinematic",
      2
      /* Bool */
    );
  }
  set IsKinematic(value) {
    this.SetProp("IsKinematic", 2, value);
  }
  get MaxForce() {
    return this.GetProp(
      "MaxForce",
      4
      /* Float32 */
    );
  }
  set MaxForce(value) {
    this.SetProp("MaxForce", 4, value);
  }
  get MaxTorque() {
    return this.GetProp(
      "MaxTorque",
      4
      /* Float32 */
    );
  }
  set MaxTorque(value) {
    this.SetProp("MaxTorque", 4, value);
  }
  get Transform() {
    return this.GetProp(
      "Transform",
      16
      /* CFrame */
    );
  }
  set Transform(value) {
    this.SetProp("Transform", 16, value);
  }
};
var BallSocketConstraint = class extends Constraint {
  constructor() {
    super();
    this.addClassName("BallSocketConstraint");
    this.Name = "BallSocketConstraint";
    this.LimitsEnabled = false;
    this.MaxFrictionTorqueXml = 0;
    this.Radius = 0.15;
    this.Restitution = 0;
    this.TwistLimitsEnabled = false;
    this.TwistLowerAngle = -45;
    this.TwistUpperAngle = 45;
    this.UpperAngle = 45;
  }
  get LimitsEnabled() {
    return this.GetProp(
      "LimitsEnabled",
      2
      /* Bool */
    );
  }
  set LimitsEnabled(value) {
    this.SetProp("LimitsEnabled", 2, value);
  }
  get MaxFrictionTorqueXml() {
    return this.GetProp(
      "MaxFrictionTorqueXml",
      4
      /* Float32 */
    );
  }
  set MaxFrictionTorqueXml(value) {
    this.SetProp("MaxFrictionTorqueXml", 4, value);
  }
  get Radius() {
    return this.GetProp(
      "Radius",
      4
      /* Float32 */
    );
  }
  set Radius(value) {
    this.SetProp("Radius", 4, value);
  }
  get Restitution() {
    return this.GetProp(
      "Restitution",
      4
      /* Float32 */
    );
  }
  set Restitution(value) {
    this.SetProp("Restitution", 4, value);
  }
  get TwistLimitsEnabled() {
    return this.GetProp(
      "TwistLimitsEnabled",
      2
      /* Bool */
    );
  }
  set TwistLimitsEnabled(value) {
    this.SetProp("TwistLimitsEnabled", 2, value);
  }
  get TwistLowerAngle() {
    return this.GetProp(
      "TwistLowerAngle",
      4
      /* Float32 */
    );
  }
  set TwistLowerAngle(value) {
    this.SetProp("TwistLowerAngle", 4, value);
  }
  get TwistUpperAngle() {
    return this.GetProp(
      "TwistUpperAngle",
      4
      /* Float32 */
    );
  }
  set TwistUpperAngle(value) {
    this.SetProp("TwistUpperAngle", 4, value);
  }
  get UpperAngle() {
    return this.GetProp(
      "UpperAngle",
      4
      /* Float32 */
    );
  }
  set UpperAngle(value) {
    this.SetProp("UpperAngle", 4, value);
  }
};
var HingeConstraint = class extends Constraint {
  constructor() {
    super();
    this.addClassName("HingeConstraint");
    this.Name = "HingeConstraint";
    this.ActuatorType = ActuatorType.None;
    this.AngularResponsiveness = 45;
    this.AngularSpeed = 0;
    this.AngularVelocity = 0;
    this.LimitsEnabled = false;
    this.LowerAngle = -45;
    this.MotorMaxAcceleration = 5e5;
    this.MotorMaxTorque = 0;
    this.Radius = 0.15;
    this.Restitution = 0;
    this.ServoMaxTorque = 0;
    this.SoftlockServoUponReachingTarget = false;
    this.TargetAngle = 0;
    this.UpperAngle = 45;
  }
  get ActuatorType() {
    return this.GetProp(
      "ActuatorType",
      18
      /* Enum */
    );
  }
  set ActuatorType(value) {
    this.SetProp("ActuatorType", 18, value);
  }
  get AngularResponsiveness() {
    return this.GetProp(
      "AngularResponsiveness",
      4
      /* Float32 */
    );
  }
  set AngularResponsiveness(value) {
    this.SetProp("AngularResponsiveness", 4, value);
  }
  get AngularSpeed() {
    return this.GetProp(
      "AngularSpeed",
      4
      /* Float32 */
    );
  }
  set AngularSpeed(value) {
    this.SetProp("AngularSpeed", 4, value);
  }
  get AngularVelocity() {
    return this.GetProp(
      "AngularVelocity",
      4
      /* Float32 */
    );
  }
  set AngularVelocity(value) {
    this.SetProp("AngularVelocity", 4, value);
  }
  get LimitsEnabled() {
    return this.GetProp(
      "LimitsEnabled",
      2
      /* Bool */
    );
  }
  set LimitsEnabled(value) {
    this.SetProp("LimitsEnabled", 2, value);
  }
  get LowerAngle() {
    return this.GetProp(
      "LowerAngle",
      4
      /* Float32 */
    );
  }
  set LowerAngle(value) {
    this.SetProp("LowerAngle", 4, value);
  }
  get MotorMaxAcceleration() {
    return this.GetProp(
      "MotorMaxAcceleration",
      4
      /* Float32 */
    );
  }
  set MotorMaxAcceleration(value) {
    this.SetProp("MotorMaxAcceleration", 4, value);
  }
  get MotorMaxTorque() {
    return this.GetProp(
      "MotorMaxTorque",
      4
      /* Float32 */
    );
  }
  set MotorMaxTorque(value) {
    this.SetProp("MotorMaxTorque", 4, value);
  }
  get Radius() {
    return this.GetProp(
      "Radius",
      4
      /* Float32 */
    );
  }
  set Radius(value) {
    this.SetProp("Radius", 4, value);
  }
  get Restitution() {
    return this.GetProp(
      "Restitution",
      4
      /* Float32 */
    );
  }
  set Restitution(value) {
    this.SetProp("Restitution", 4, value);
  }
  get ServoMaxTorque() {
    return this.GetProp(
      "ServoMaxTorque",
      4
      /* Float32 */
    );
  }
  set ServoMaxTorque(value) {
    this.SetProp("ServoMaxTorque", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get SoftlockServoUponReachingTarget() {
    return this.GetProp(
      "SoftlockServoUponReachingTarget",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set SoftlockServoUponReachingTarget(value) {
    this.SetProp("SoftlockServoUponReachingTarget", 2, value);
  }
  get TargetAngle() {
    return this.GetProp(
      "TargetAngle",
      4
      /* Float32 */
    );
  }
  set TargetAngle(value) {
    this.SetProp("TargetAngle", 4, value);
  }
  get UpperAngle() {
    return this.GetProp(
      "UpperAngle",
      4
      /* Float32 */
    );
  }
  set UpperAngle(value) {
    this.SetProp("UpperAngle", 4, value);
  }
};
var LineForce = class extends Constraint {
  constructor() {
    super();
    this.addClassName("LineForce");
    this.Name = "LineForce";
    this.ApplyAtCenterOfMass = false;
    this.InverseSquareLaw = false;
    this.Magnitude = 1e3;
    this.MaxForce = Infinity;
    this.ReactionForceEnabled = false;
  }
  get ApplyAtCenterOfMass() {
    return this.GetProp(
      "ApplyAtCenterOfMass",
      2
      /* Bool */
    );
  }
  set ApplyAtCenterOfMass(value) {
    this.SetProp("ApplyAtCenterOfMass", 2, value);
  }
  get InverseSquareLaw() {
    return this.GetProp(
      "InverseSquareLaw",
      2
      /* Bool */
    );
  }
  set InverseSquareLaw(value) {
    this.SetProp("InverseSquareLaw", 2, value);
  }
  get Magnitude() {
    return this.GetProp(
      "Magnitude",
      4
      /* Float32 */
    );
  }
  set Magnitude(value) {
    this.SetProp("Magnitude", 4, value);
  }
  get MaxForce() {
    return this.GetProp(
      "MaxForce",
      4
      /* Float32 */
    );
  }
  set MaxForce(value) {
    this.SetProp("MaxForce", 4, value);
  }
  get ReactionForceEnabled() {
    return this.GetProp(
      "ReactionForceEnabled",
      2
      /* Bool */
    );
  }
  set ReactionForceEnabled(value) {
    this.SetProp("ReactionForceEnabled", 2, value);
  }
};
var LinearVelocity = class extends Constraint {
  constructor() {
    super();
    this.addClassName("LinearVelocity");
    this.Name = "LinearVelocity";
    this.ForceLimitMode = ForceLimitMode.Magnitude;
    this.ForceLimitsEnabled = true;
    this.LineDirection = new Vector3(1, 0, 0);
    this.LineVelocity = 0;
    this.MaxAxesForce = new Vector3(1e3, 1e3, 1e3);
    this.MaxForce = 1e3;
    this.MaxPlanarAxesForce = new Vector2(1e3, 1e3);
    this.PlaneVelocity = new Vector2(0, 0);
    this.PrimaryTangentAxis = new Vector3(1, 0, 0);
    this.ReactionForceEnabled = true;
    this.RelativeTo = ActuatorRelativeTo.World;
    this.SecondaryTangentAxis = new Vector3(0, 1, 0);
    this.VectorVelocity = new Vector3(0, 0, 0);
    this.VelocityConstraintMode = VelocityConstraintMode.Vector;
  }
  get ForceLimitMode() {
    return this.GetProp(
      "ForceLimitMode",
      18
      /* Enum */
    );
  }
  set ForceLimitMode(value) {
    this.SetProp("ForceLimitMode", 18, value);
  }
  get ForceLimitsEnabled() {
    return this.GetProp(
      "ForceLimitsEnabled",
      2
      /* Bool */
    );
  }
  set ForceLimitsEnabled(value) {
    this.SetProp("ForceLimitsEnabled", 2, value);
  }
  get LineDirection() {
    return this.GetProp(
      "LineDirection",
      14
      /* Vector3 */
    );
  }
  set LineDirection(value) {
    this.SetProp("LineDirection", 14, value);
  }
  get LineVelocity() {
    return this.GetProp(
      "LineVelocity",
      4
      /* Float32 */
    );
  }
  set LineVelocity(value) {
    this.SetProp("LineVelocity", 4, value);
  }
  get MaxAxesForce() {
    return this.GetProp(
      "MaxAxesForce",
      14
      /* Vector3 */
    );
  }
  set MaxAxesForce(value) {
    this.SetProp("MaxAxesForce", 14, value);
  }
  get MaxForce() {
    return this.GetProp(
      "MaxForce",
      4
      /* Float32 */
    );
  }
  set MaxForce(value) {
    this.SetProp("MaxForce", 4, value);
  }
  get MaxPlanarAxesForce() {
    return this.GetProp(
      "MaxPlanarAxesForce",
      13
      /* Vector2 */
    );
  }
  set MaxPlanarAxesForce(value) {
    this.SetProp("MaxPlanarAxesForce", 13, value);
  }
  get PlaneVelocity() {
    return this.GetProp(
      "PlaneVelocity",
      13
      /* Vector2 */
    );
  }
  set PlaneVelocity(value) {
    this.SetProp("PlaneVelocity", 13, value);
  }
  get PrimaryTangentAxis() {
    return this.GetProp(
      "PrimaryTangentAxis",
      14
      /* Vector3 */
    );
  }
  set PrimaryTangentAxis(value) {
    this.SetProp("PrimaryTangentAxis", 14, value);
  }
  get ReactionForceEnabled() {
    return this.GetProp(
      "ReactionForceEnabled",
      2
      /* Bool */
    );
  }
  set ReactionForceEnabled(value) {
    this.SetProp("ReactionForceEnabled", 2, value);
  }
  get RelativeTo() {
    return this.GetProp(
      "RelativeTo",
      18
      /* Enum */
    );
  }
  set RelativeTo(value) {
    this.SetProp("RelativeTo", 18, value);
  }
  get SecondaryTangentAxis() {
    return this.GetProp(
      "SecondaryTangentAxis",
      14
      /* Vector3 */
    );
  }
  set SecondaryTangentAxis(value) {
    this.SetProp("SecondaryTangentAxis", 14, value);
  }
  get VectorVelocity() {
    return this.GetProp(
      "VectorVelocity",
      14
      /* Vector3 */
    );
  }
  set VectorVelocity(value) {
    this.SetProp("VectorVelocity", 14, value);
  }
  get VelocityConstraintMode() {
    return this.GetProp(
      "VelocityConstraintMode",
      18
      /* Enum */
    );
  }
  set VelocityConstraintMode(value) {
    this.SetProp("VelocityConstraintMode", 18, value);
  }
};
var PlaneConstraint = class extends Constraint {
  constructor() {
    super();
    this.addClassName("PlaneConstraint");
    this.Name = "PlaneConstraint";
  }
};
var Plane = class extends PlaneConstraint {
  constructor() {
    super();
    this.addClassName("Plane");
    this.Name = "Plane";
  }
};
var RigidConstraint = class extends Constraint {
  constructor() {
    super();
    this.addClassName("RigidConstraint");
    this.Name = "RigidConstraint";
  }
};
var RodConstraint = class extends Constraint {
  constructor() {
    super();
    this.addClassName("RodConstraint");
    this.Name = "RodConstraint";
    this.Length = 5;
    this.LimitAngle0 = 90;
    this.LimitAngle1 = 90;
    this.LimitsEnabled = false;
    this.Thickness = 0.1;
  }
  get Length() {
    return this.GetProp(
      "Length",
      4
      /* Float32 */
    );
  }
  set Length(value) {
    this.SetProp("Length", 4, value);
  }
  get LimitAngle0() {
    return this.GetProp(
      "LimitAngle0",
      4
      /* Float32 */
    );
  }
  set LimitAngle0(value) {
    this.SetProp("LimitAngle0", 4, value);
  }
  get LimitAngle1() {
    return this.GetProp(
      "LimitAngle1",
      4
      /* Float32 */
    );
  }
  set LimitAngle1(value) {
    this.SetProp("LimitAngle1", 4, value);
  }
  get LimitsEnabled() {
    return this.GetProp(
      "LimitsEnabled",
      2
      /* Bool */
    );
  }
  set LimitsEnabled(value) {
    this.SetProp("LimitsEnabled", 2, value);
  }
  get Thickness() {
    return this.GetProp(
      "Thickness",
      4
      /* Float32 */
    );
  }
  set Thickness(value) {
    this.SetProp("Thickness", 4, value);
  }
};
var RopeConstraint = class extends Constraint {
  constructor() {
    super();
    this.addClassName("RopeConstraint");
    this.Name = "RopeConstraint";
    this.Length = 5;
    this.Restitution = 0;
    this.Thickness = 0.1;
    this.WinchEnabled = false;
    this.WinchForce = 1e4;
    this.WinchResponsiveness = 45;
    this.WinchSpeed = 2;
    this.WinchTarget = 5;
  }
  get Length() {
    return this.GetProp(
      "Length",
      4
      /* Float32 */
    );
  }
  set Length(value) {
    this.SetProp("Length", 4, value);
  }
  get Restitution() {
    return this.GetProp(
      "Restitution",
      4
      /* Float32 */
    );
  }
  set Restitution(value) {
    this.SetProp("Restitution", 4, value);
  }
  get Thickness() {
    return this.GetProp(
      "Thickness",
      4
      /* Float32 */
    );
  }
  set Thickness(value) {
    this.SetProp("Thickness", 4, value);
  }
  get WinchEnabled() {
    return this.GetProp(
      "WinchEnabled",
      2
      /* Bool */
    );
  }
  set WinchEnabled(value) {
    this.SetProp("WinchEnabled", 2, value);
  }
  get WinchForce() {
    return this.GetProp(
      "WinchForce",
      4
      /* Float32 */
    );
  }
  set WinchForce(value) {
    this.SetProp("WinchForce", 4, value);
  }
  get WinchResponsiveness() {
    return this.GetProp(
      "WinchResponsiveness",
      4
      /* Float32 */
    );
  }
  set WinchResponsiveness(value) {
    this.SetProp("WinchResponsiveness", 4, value);
  }
  get WinchSpeed() {
    return this.GetProp(
      "WinchSpeed",
      4
      /* Float32 */
    );
  }
  set WinchSpeed(value) {
    this.SetProp("WinchSpeed", 4, value);
  }
  get WinchTarget() {
    return this.GetProp(
      "WinchTarget",
      4
      /* Float32 */
    );
  }
  set WinchTarget(value) {
    this.SetProp("WinchTarget", 4, value);
  }
};
var SlidingBallConstraint = class extends Constraint {
  constructor() {
    super();
    this.addClassName("SlidingBallConstraint");
    this.ActuatorType = ActuatorType.None;
    this.LimitsEnabled = false;
    this.LinearResponsiveness = 45;
    this.LowerLimit = 0;
    this.MotorMaxAcceleration = Infinity;
    this.MotorMaxForce = 0;
    this.Restitution = 0;
    this.ServoMaxForce = 0;
    this.Size = 0.15;
    this.SoftlockServoUponReachingTarget = false;
    this.Speed = 0;
    this.TargetPosition = 0;
    this.UpperLimit = 5;
    this.Velocity = 0;
  }
  get ActuatorType() {
    return this.GetProp(
      "ActuatorType",
      18
      /* Enum */
    );
  }
  set ActuatorType(value) {
    this.SetProp("ActuatorType", 18, value);
  }
  get LimitsEnabled() {
    return this.GetProp(
      "LimitsEnabled",
      2
      /* Bool */
    );
  }
  set LimitsEnabled(value) {
    this.SetProp("LimitsEnabled", 2, value);
  }
  get LinearResponsiveness() {
    return this.GetProp(
      "LinearResponsiveness",
      4
      /* Float32 */
    );
  }
  set LinearResponsiveness(value) {
    this.SetProp("LinearResponsiveness", 4, value);
  }
  get LowerLimit() {
    return this.GetProp(
      "LowerLimit",
      4
      /* Float32 */
    );
  }
  set LowerLimit(value) {
    this.SetProp("LowerLimit", 4, value);
  }
  get MotorMaxAcceleration() {
    return this.GetProp(
      "MotorMaxAcceleration",
      4
      /* Float32 */
    );
  }
  set MotorMaxAcceleration(value) {
    this.SetProp("MotorMaxAcceleration", 4, value);
  }
  get MotorMaxForce() {
    return this.GetProp(
      "MotorMaxForce",
      4
      /* Float32 */
    );
  }
  set MotorMaxForce(value) {
    this.SetProp("MotorMaxForce", 4, value);
  }
  get Restitution() {
    return this.GetProp(
      "Restitution",
      4
      /* Float32 */
    );
  }
  set Restitution(value) {
    this.SetProp("Restitution", 4, value);
  }
  get ServoMaxForce() {
    return this.GetProp(
      "ServoMaxForce",
      4
      /* Float32 */
    );
  }
  set ServoMaxForce(value) {
    this.SetProp("ServoMaxForce", 4, value);
  }
  get Size() {
    return this.GetProp(
      "Size",
      4
      /* Float32 */
    );
  }
  set Size(value) {
    this.SetProp("Size", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get SoftlockServoUponReachingTarget() {
    return this.GetProp(
      "SoftlockServoUponReachingTarget",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set SoftlockServoUponReachingTarget(value) {
    this.SetProp("SoftlockServoUponReachingTarget", 2, value);
  }
  get Speed() {
    return this.GetProp(
      "Speed",
      4
      /* Float32 */
    );
  }
  set Speed(value) {
    this.SetProp("Speed", 4, value);
  }
  get TargetPosition() {
    return this.GetProp(
      "TargetPosition",
      4
      /* Float32 */
    );
  }
  set TargetPosition(value) {
    this.SetProp("TargetPosition", 4, value);
  }
  get UpperLimit() {
    return this.GetProp(
      "UpperLimit",
      4
      /* Float32 */
    );
  }
  set UpperLimit(value) {
    this.SetProp("UpperLimit", 4, value);
  }
  get Velocity() {
    return this.GetProp(
      "Velocity",
      4
      /* Float32 */
    );
  }
  set Velocity(value) {
    this.SetProp("Velocity", 4, value);
  }
};
var CylindricalConstraint = class extends SlidingBallConstraint {
  constructor() {
    super();
    this.addClassName("CylindricalConstraint");
    this.Name = "CylindricalConstraint";
    this.AngularActuatorType = ActuatorType.None;
    this.AngularLimitsEnabled = false;
    this.AngularResponsiveness = 45;
    this.AngularRestitution = 0;
    this.AngularSpeed = 0;
    this.AngularVelocity = 0;
    this.InclinationAngle = 0;
    this.LowerAngle = -45;
    this.MotorMaxAngularAcceleration = 5e5;
    this.MotorMaxTorque = 0;
    this.RotationAxisVisible = false;
    this.ServoMaxTorque = 0;
    this.SoftlockAngularServoUponReachingTarget = false;
    this.TargetAngle = 0;
    this.UpperAngle = 45;
  }
  get AngularActuatorType() {
    return this.GetProp(
      "AngularActuatorType",
      18
      /* Enum */
    );
  }
  set AngularActuatorType(value) {
    this.SetProp("AngularActuatorType", 18, value);
  }
  get AngularLimitsEnabled() {
    return this.GetProp(
      "AngularLimitsEnabled",
      2
      /* Bool */
    );
  }
  set AngularLimitsEnabled(value) {
    this.SetProp("AngularLimitsEnabled", 2, value);
  }
  get AngularResponsiveness() {
    return this.GetProp(
      "AngularResponsiveness",
      4
      /* Float32 */
    );
  }
  set AngularResponsiveness(value) {
    this.SetProp("AngularResponsiveness", 4, value);
  }
  get AngularRestitution() {
    return this.GetProp(
      "AngularRestitution",
      4
      /* Float32 */
    );
  }
  set AngularRestitution(value) {
    this.SetProp("AngularRestitution", 4, value);
  }
  get AngularSpeed() {
    return this.GetProp(
      "AngularSpeed",
      4
      /* Float32 */
    );
  }
  set AngularSpeed(value) {
    this.SetProp("AngularSpeed", 4, value);
  }
  get AngularVelocity() {
    return this.GetProp(
      "AngularVelocity",
      4
      /* Float32 */
    );
  }
  set AngularVelocity(value) {
    this.SetProp("AngularVelocity", 4, value);
  }
  get InclinationAngle() {
    return this.GetProp(
      "InclinationAngle",
      4
      /* Float32 */
    );
  }
  set InclinationAngle(value) {
    this.SetProp("InclinationAngle", 4, value);
  }
  get LowerAngle() {
    return this.GetProp(
      "LowerAngle",
      4
      /* Float32 */
    );
  }
  set LowerAngle(value) {
    this.SetProp("LowerAngle", 4, value);
  }
  get MotorMaxAngularAcceleration() {
    return this.GetProp(
      "MotorMaxAngularAcceleration",
      4
      /* Float32 */
    );
  }
  set MotorMaxAngularAcceleration(value) {
    this.SetProp("MotorMaxAngularAcceleration", 4, value);
  }
  get MotorMaxTorque() {
    return this.GetProp(
      "MotorMaxTorque",
      4
      /* Float32 */
    );
  }
  set MotorMaxTorque(value) {
    this.SetProp("MotorMaxTorque", 4, value);
  }
  get RotationAxisVisible() {
    return this.GetProp(
      "RotationAxisVisible",
      2
      /* Bool */
    );
  }
  set RotationAxisVisible(value) {
    this.SetProp("RotationAxisVisible", 2, value);
  }
  get ServoMaxTorque() {
    return this.GetProp(
      "ServoMaxTorque",
      4
      /* Float32 */
    );
  }
  set ServoMaxTorque(value) {
    this.SetProp("ServoMaxTorque", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get SoftlockAngularServoUponReachingTarget() {
    return this.GetProp(
      "SoftlockAngularServoUponReachingTarget",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set SoftlockAngularServoUponReachingTarget(value) {
    this.SetProp("SoftlockAngularServoUponReachingTarget", 2, value);
  }
  get TargetAngle() {
    return this.GetProp(
      "TargetAngle",
      4
      /* Float32 */
    );
  }
  set TargetAngle(value) {
    this.SetProp("TargetAngle", 4, value);
  }
  get UpperAngle() {
    return this.GetProp(
      "UpperAngle",
      4
      /* Float32 */
    );
  }
  set UpperAngle(value) {
    this.SetProp("UpperAngle", 4, value);
  }
};
var PrismaticConstraint = class extends SlidingBallConstraint {
  constructor() {
    super();
    this.addClassName("PrismaticConstraint");
    this.Name = "PrismaticConstraint";
  }
};
var SpringConstraint = class extends Constraint {
  constructor() {
    super();
    this.addClassName("SpringConstraint");
    this.Name = "SpringConstraint";
    this.Coils = 3;
    this.Damping = 0;
    this.FreeLength = 1;
    this.LimitsEnabled = false;
    this.MaxForce = Infinity;
    this.MaxLength = 5;
    this.MinLength = 0;
    this.Radius = 0.4;
    this.Stiffness = 0;
    this.Thickness = 0.1;
  }
  get Coils() {
    return this.GetProp(
      "Coils",
      4
      /* Float32 */
    );
  }
  set Coils(value) {
    this.SetProp("Coils", 4, value);
  }
  get Damping() {
    return this.GetProp(
      "Damping",
      4
      /* Float32 */
    );
  }
  set Damping(value) {
    this.SetProp("Damping", 4, value);
  }
  get FreeLength() {
    return this.GetProp(
      "FreeLength",
      4
      /* Float32 */
    );
  }
  set FreeLength(value) {
    this.SetProp("FreeLength", 4, value);
  }
  get LimitsEnabled() {
    return this.GetProp(
      "LimitsEnabled",
      2
      /* Bool */
    );
  }
  set LimitsEnabled(value) {
    this.SetProp("LimitsEnabled", 2, value);
  }
  get MaxForce() {
    return this.GetProp(
      "MaxForce",
      4
      /* Float32 */
    );
  }
  set MaxForce(value) {
    this.SetProp("MaxForce", 4, value);
  }
  get MaxLength() {
    return this.GetProp(
      "MaxLength",
      4
      /* Float32 */
    );
  }
  set MaxLength(value) {
    this.SetProp("MaxLength", 4, value);
  }
  get MinLength() {
    return this.GetProp(
      "MinLength",
      4
      /* Float32 */
    );
  }
  set MinLength(value) {
    this.SetProp("MinLength", 4, value);
  }
  get Radius() {
    return this.GetProp(
      "Radius",
      4
      /* Float32 */
    );
  }
  set Radius(value) {
    this.SetProp("Radius", 4, value);
  }
  get Stiffness() {
    return this.GetProp(
      "Stiffness",
      4
      /* Float32 */
    );
  }
  set Stiffness(value) {
    this.SetProp("Stiffness", 4, value);
  }
  get Thickness() {
    return this.GetProp(
      "Thickness",
      4
      /* Float32 */
    );
  }
  set Thickness(value) {
    this.SetProp("Thickness", 4, value);
  }
};
var Torque = class extends Constraint {
  constructor() {
    super();
    this.addClassName("Torque");
    this.Name = "Torque";
    this.RelativeTo = ActuatorRelativeTo.Attachment0;
    this.Torque = new Vector3(0, 0, 0);
  }
  get RelativeTo() {
    return this.GetProp(
      "RelativeTo",
      18
      /* Enum */
    );
  }
  set RelativeTo(value) {
    this.SetProp("RelativeTo", 18, value);
  }
  get Torque() {
    return this.GetProp(
      "Torque",
      14
      /* Vector3 */
    );
  }
  set Torque(value) {
    this.SetProp("Torque", 14, value);
  }
};
var TorsionSpringConstraint = class extends Constraint {
  constructor() {
    super();
    this.addClassName("TorsionSpringConstraint");
    this.Name = "TorsionSpringConstraint";
    this.Coils = 8;
    this.Damping = 0.01;
    this.LimitEnabled = false;
    this.LimitsEnabled = false;
    this.MaxAngle = 45;
    this.MaxTorque = Infinity;
    this.Radius = 0.4;
    this.Restitution = 0;
    this.Stiffness = 100;
  }
  get Coils() {
    return this.GetProp(
      "Coils",
      4
      /* Float32 */
    );
  }
  set Coils(value) {
    this.SetProp("Coils", 4, value);
  }
  get Damping() {
    return this.GetProp(
      "Damping",
      4
      /* Float32 */
    );
  }
  set Damping(value) {
    this.SetProp("Damping", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get LimitEnabled() {
    return this.GetProp(
      "LimitEnabled",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set LimitEnabled(value) {
    this.SetProp("LimitEnabled", 2, value);
  }
  get LimitsEnabled() {
    return this.GetProp(
      "LimitsEnabled",
      2
      /* Bool */
    );
  }
  set LimitsEnabled(value) {
    this.SetProp("LimitsEnabled", 2, value);
  }
  get MaxAngle() {
    return this.GetProp(
      "MaxAngle",
      4
      /* Float32 */
    );
  }
  set MaxAngle(value) {
    this.SetProp("MaxAngle", 4, value);
  }
  get MaxTorque() {
    return this.GetProp(
      "MaxTorque",
      4
      /* Float32 */
    );
  }
  set MaxTorque(value) {
    this.SetProp("MaxTorque", 4, value);
  }
  get Radius() {
    return this.GetProp(
      "Radius",
      4
      /* Float32 */
    );
  }
  set Radius(value) {
    this.SetProp("Radius", 4, value);
  }
  get Restitution() {
    return this.GetProp(
      "Restitution",
      4
      /* Float32 */
    );
  }
  set Restitution(value) {
    this.SetProp("Restitution", 4, value);
  }
  get Stiffness() {
    return this.GetProp(
      "Stiffness",
      4
      /* Float32 */
    );
  }
  set Stiffness(value) {
    this.SetProp("Stiffness", 4, value);
  }
};
var UniversalConstraint = class extends Constraint {
  constructor() {
    super();
    this.addClassName("UniversalConstraint");
    this.Name = "UniversalConstraint";
    this.LimitsEnabled = false;
    this.MaxAngle = 45;
    this.Radius = 0.2;
    this.Restitution = 0;
  }
  get LimitsEnabled() {
    return this.GetProp(
      "LimitsEnabled",
      2
      /* Bool */
    );
  }
  set LimitsEnabled(value) {
    this.SetProp("LimitsEnabled", 2, value);
  }
  get MaxAngle() {
    return this.GetProp(
      "MaxAngle",
      4
      /* Float32 */
    );
  }
  set MaxAngle(value) {
    this.SetProp("MaxAngle", 4, value);
  }
  get Radius() {
    return this.GetProp(
      "Radius",
      4
      /* Float32 */
    );
  }
  set Radius(value) {
    this.SetProp("Radius", 4, value);
  }
  get Restitution() {
    return this.GetProp(
      "Restitution",
      4
      /* Float32 */
    );
  }
  set Restitution(value) {
    this.SetProp("Restitution", 4, value);
  }
};
var VectorForce = class extends Constraint {
  constructor() {
    super();
    this.addClassName("VectorForce");
    this.Name = "VectorForce";
    this.ApplyAtCenterOfMass = false;
    this.Force = new Vector3(1e3, 0, 0);
    this.RelativeTo = ActuatorRelativeTo.Attachment0;
  }
  get ApplyAtCenterOfMass() {
    return this.GetProp(
      "ApplyAtCenterOfMass",
      2
      /* Bool */
    );
  }
  set ApplyAtCenterOfMass(value) {
    this.SetProp("ApplyAtCenterOfMass", 2, value);
  }
  get Force() {
    return this.GetProp(
      "Force",
      14
      /* Vector3 */
    );
  }
  set Force(value) {
    this.SetProp("Force", 14, value);
  }
  get RelativeTo() {
    return this.GetProp(
      "RelativeTo",
      18
      /* Enum */
    );
  }
  set RelativeTo(value) {
    this.SetProp("RelativeTo", 18, value);
  }
};
var ContentProvider = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ContentProvider");
    this.Name = "ContentProvider";
  }
};
var ContextActionService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ContextActionService");
    this.Name = "ContextActionService";
  }
};
var Controller = class extends Instance {
  constructor() {
    super();
    this.addClassName("Controller");
  }
};
var HumanoidController = class extends Controller {
  constructor() {
    super();
    this.addClassName("HumanoidController");
    this.Name = "HumanoidController";
  }
};
var SkateboardController = class extends Controller {
  constructor() {
    super();
    this.addClassName("SkateboardController");
    this.Name = "SkateboardController";
  }
};
var VehicleController = class extends Controller {
  constructor() {
    super();
    this.addClassName("VehicleController");
    this.Name = "VehicleController";
  }
};
var ControllerBase = class extends Instance {
  constructor() {
    super();
    this.addClassName("ControllerBase");
    this.BalanceRigidityEnabled = false;
    this.MoveSpeedFactor = 1;
  }
  get BalanceRigidityEnabled() {
    return this.GetProp(
      "BalanceRigidityEnabled",
      2
      /* Bool */
    );
  }
  set BalanceRigidityEnabled(value) {
    this.SetProp("BalanceRigidityEnabled", 2, value);
  }
  get MoveSpeedFactor() {
    return this.GetProp(
      "MoveSpeedFactor",
      4
      /* Float32 */
    );
  }
  set MoveSpeedFactor(value) {
    this.SetProp("MoveSpeedFactor", 4, value);
  }
};
var AirController = class extends ControllerBase {
  constructor() {
    super();
    this.addClassName("AirController");
    this.Name = "AirController";
    this.BalanceMaxTorque = 1e4;
    this.BalanceSpeed = 100;
    this.MaintainAngularMomentum = true;
    this.MaintainLinearMomentum = true;
    this.MoveMaxForce = 1e3;
    this.TurnMaxTorque = 1e4;
    this.TurnSpeedFactor = 1;
  }
  get BalanceMaxTorque() {
    return this.GetProp(
      "BalanceMaxTorque",
      4
      /* Float32 */
    );
  }
  set BalanceMaxTorque(value) {
    this.SetProp("BalanceMaxTorque", 4, value);
  }
  get BalanceSpeed() {
    return this.GetProp(
      "BalanceSpeed",
      4
      /* Float32 */
    );
  }
  set BalanceSpeed(value) {
    this.SetProp("BalanceSpeed", 4, value);
  }
  get MaintainAngularMomentum() {
    return this.GetProp(
      "MaintainAngularMomentum",
      2
      /* Bool */
    );
  }
  set MaintainAngularMomentum(value) {
    this.SetProp("MaintainAngularMomentum", 2, value);
  }
  get MaintainLinearMomentum() {
    return this.GetProp(
      "MaintainLinearMomentum",
      2
      /* Bool */
    );
  }
  set MaintainLinearMomentum(value) {
    this.SetProp("MaintainLinearMomentum", 2, value);
  }
  get MoveMaxForce() {
    return this.GetProp(
      "MoveMaxForce",
      4
      /* Float32 */
    );
  }
  set MoveMaxForce(value) {
    this.SetProp("MoveMaxForce", 4, value);
  }
  get TurnMaxTorque() {
    return this.GetProp(
      "TurnMaxTorque",
      4
      /* Float32 */
    );
  }
  set TurnMaxTorque(value) {
    this.SetProp("TurnMaxTorque", 4, value);
  }
  get TurnSpeedFactor() {
    return this.GetProp(
      "TurnSpeedFactor",
      4
      /* Float32 */
    );
  }
  set TurnSpeedFactor(value) {
    this.SetProp("TurnSpeedFactor", 4, value);
  }
};
var ClimbController = class extends ControllerBase {
  constructor() {
    super();
    this.addClassName("ClimbController");
    this.Name = "ClimbController";
    this.AccelerationTime = 0;
    this.BalanceMaxTorque = 1e4;
    this.BalanceSpeed = 100;
    this.MoveMaxForce = 1e4;
  }
  get AccelerationTime() {
    return this.GetProp(
      "AccelerationTime",
      4
      /* Float32 */
    );
  }
  set AccelerationTime(value) {
    this.SetProp("AccelerationTime", 4, value);
  }
  get BalanceMaxTorque() {
    return this.GetProp(
      "BalanceMaxTorque",
      4
      /* Float32 */
    );
  }
  set BalanceMaxTorque(value) {
    this.SetProp("BalanceMaxTorque", 4, value);
  }
  get BalanceSpeed() {
    return this.GetProp(
      "BalanceSpeed",
      4
      /* Float32 */
    );
  }
  set BalanceSpeed(value) {
    this.SetProp("BalanceSpeed", 4, value);
  }
  get MoveMaxForce() {
    return this.GetProp(
      "MoveMaxForce",
      4
      /* Float32 */
    );
  }
  set MoveMaxForce(value) {
    this.SetProp("MoveMaxForce", 4, value);
  }
};
var GroundController = class extends ControllerBase {
  constructor() {
    super();
    this.addClassName("GroundController");
    this.Name = "GroundController";
    this.AccelerationLean = 1;
    this.AccelerationTime = 0;
    this.BalanceMaxTorque = 1e4;
    this.BalanceSpeed = 100;
    this.DecelerationTime = 0;
    this.Friction = 2;
    this.FrictionWeight = 1;
    this.GroundOffset = 1;
    this.StandForce = 1e4;
    this.StandSpeed = 100;
    this.TurnSpeedFactor = 1;
  }
  get AccelerationLean() {
    return this.GetProp(
      "AccelerationLean",
      4
      /* Float32 */
    );
  }
  set AccelerationLean(value) {
    this.SetProp("AccelerationLean", 4, value);
  }
  get AccelerationTime() {
    return this.GetProp(
      "AccelerationTime",
      4
      /* Float32 */
    );
  }
  set AccelerationTime(value) {
    this.SetProp("AccelerationTime", 4, value);
  }
  get BalanceMaxTorque() {
    return this.GetProp(
      "BalanceMaxTorque",
      4
      /* Float32 */
    );
  }
  set BalanceMaxTorque(value) {
    this.SetProp("BalanceMaxTorque", 4, value);
  }
  get BalanceSpeed() {
    return this.GetProp(
      "BalanceSpeed",
      4
      /* Float32 */
    );
  }
  set BalanceSpeed(value) {
    this.SetProp("BalanceSpeed", 4, value);
  }
  get DecelerationTime() {
    return this.GetProp(
      "DecelerationTime",
      4
      /* Float32 */
    );
  }
  set DecelerationTime(value) {
    this.SetProp("DecelerationTime", 4, value);
  }
  get Friction() {
    return this.GetProp(
      "Friction",
      4
      /* Float32 */
    );
  }
  set Friction(value) {
    this.SetProp("Friction", 4, value);
  }
  get FrictionWeight() {
    return this.GetProp(
      "FrictionWeight",
      4
      /* Float32 */
    );
  }
  set FrictionWeight(value) {
    this.SetProp("FrictionWeight", 4, value);
  }
  get GroundOffset() {
    return this.GetProp(
      "GroundOffset",
      4
      /* Float32 */
    );
  }
  set GroundOffset(value) {
    this.SetProp("GroundOffset", 4, value);
  }
  get StandForce() {
    return this.GetProp(
      "StandForce",
      4
      /* Float32 */
    );
  }
  set StandForce(value) {
    this.SetProp("StandForce", 4, value);
  }
  get StandSpeed() {
    return this.GetProp(
      "StandSpeed",
      4
      /* Float32 */
    );
  }
  set StandSpeed(value) {
    this.SetProp("StandSpeed", 4, value);
  }
  get TurnSpeedFactor() {
    return this.GetProp(
      "TurnSpeedFactor",
      4
      /* Float32 */
    );
  }
  set TurnSpeedFactor(value) {
    this.SetProp("TurnSpeedFactor", 4, value);
  }
};
var SwimController = class extends ControllerBase {
  constructor() {
    super();
    this.addClassName("SwimController");
    this.Name = "SwimController";
    this.AccelerationTime = 0;
    this.PitchMaxTorque = 1e4;
    this.PitchSpeedFactor = 1;
    this.RollMaxTorque = 1e4;
    this.RollSpeedFactor = 1;
  }
  get AccelerationTime() {
    return this.GetProp(
      "AccelerationTime",
      4
      /* Float32 */
    );
  }
  set AccelerationTime(value) {
    this.SetProp("AccelerationTime", 4, value);
  }
  get PitchMaxTorque() {
    return this.GetProp(
      "PitchMaxTorque",
      4
      /* Float32 */
    );
  }
  set PitchMaxTorque(value) {
    this.SetProp("PitchMaxTorque", 4, value);
  }
  get PitchSpeedFactor() {
    return this.GetProp(
      "PitchSpeedFactor",
      4
      /* Float32 */
    );
  }
  set PitchSpeedFactor(value) {
    this.SetProp("PitchSpeedFactor", 4, value);
  }
  get RollMaxTorque() {
    return this.GetProp(
      "RollMaxTorque",
      4
      /* Float32 */
    );
  }
  set RollMaxTorque(value) {
    this.SetProp("RollMaxTorque", 4, value);
  }
  get RollSpeedFactor() {
    return this.GetProp(
      "RollSpeedFactor",
      4
      /* Float32 */
    );
  }
  set RollSpeedFactor(value) {
    this.SetProp("RollSpeedFactor", 4, value);
  }
};
var ControllerManager = class extends Instance {
  constructor() {
    super();
    this.addClassName("ControllerManager");
    this.Name = "ControllerManager";
    this.BaseMoveSpeed = 16;
    this.BaseTurnSpeed = 8;
    this.FacingDirection = new Vector3(0, 0, 1);
    this.MovingDirection = new Vector3(0, 0, 0);
    this.UpDirection = new Vector3(0, 1, 0);
  }
  get ActiveController() {
    return this.GetProp(
      "ActiveController",
      19
      /* Referent */
    );
  }
  set ActiveController(value) {
    this.SetProp("ActiveController", 19, value);
  }
  get BaseMoveSpeed() {
    return this.GetProp(
      "BaseMoveSpeed",
      4
      /* Float32 */
    );
  }
  set BaseMoveSpeed(value) {
    this.SetProp("BaseMoveSpeed", 4, value);
  }
  get BaseTurnSpeed() {
    return this.GetProp(
      "BaseTurnSpeed",
      4
      /* Float32 */
    );
  }
  set BaseTurnSpeed(value) {
    this.SetProp("BaseTurnSpeed", 4, value);
  }
  get ClimbSensor() {
    return this.GetProp(
      "ClimbSensor",
      19
      /* Referent */
    );
  }
  set ClimbSensor(value) {
    this.SetProp("ClimbSensor", 19, value);
  }
  get FacingDirection() {
    return this.GetProp(
      "FacingDirection",
      14
      /* Vector3 */
    );
  }
  set FacingDirection(value) {
    this.SetProp("FacingDirection", 14, value);
  }
  get GroundSensor() {
    return this.GetProp(
      "GroundSensor",
      19
      /* Referent */
    );
  }
  set GroundSensor(value) {
    this.SetProp("GroundSensor", 19, value);
  }
  get MovingDirection() {
    return this.GetProp(
      "MovingDirection",
      14
      /* Vector3 */
    );
  }
  set MovingDirection(value) {
    this.SetProp("MovingDirection", 14, value);
  }
  get RootPart() {
    return this.GetProp(
      "RootPart",
      19
      /* Referent */
    );
  }
  set RootPart(value) {
    this.SetProp("RootPart", 19, value);
  }
  get UpDirection() {
    return this.GetProp(
      "UpDirection",
      14
      /* Vector3 */
    );
  }
  set UpDirection(value) {
    this.SetProp("UpDirection", 14, value);
  }
};
var ControllerService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ControllerService");
    this.Name = "ControllerService";
  }
};
var ConversationalAIAcceptanceService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ConversationalAIAcceptanceService");
    this.Name = "ConversationalAIAcceptanceService";
  }
};
var CookiesService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CookiesService");
    this.Name = "CookiesService";
  }
};
var CorePackages = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CorePackages");
    this.Name = "CorePackages";
  }
};
var CoreScriptDebuggingManagerHelper = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CoreScriptDebuggingManagerHelper");
    this.Name = "CoreScriptDebuggingManagerHelper";
  }
};
var CoreScriptSyncService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CoreScriptSyncService");
    this.Name = "CoreScriptSyncService";
  }
};
var CreationDBService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CreationDBService");
    this.Name = "CreationDBService";
  }
};
var CreatorStoreService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CreatorStoreService");
    this.Name = "CreatorStoreService";
  }
};
var CrossDMScriptChangeListener = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("CrossDMScriptChangeListener");
    this.Name = "CrossDMScriptChangeListener";
  }
};
var CustomEvent = class extends Instance {
  constructor() {
    super();
    this.addClassName("CustomEvent");
    this.Name = "CustomEvent";
    this.PersistedCurrentValue = 0;
  }
  get PersistedCurrentValue() {
    return this.GetProp(
      "PersistedCurrentValue",
      4
      /* Float32 */
    );
  }
  set PersistedCurrentValue(value) {
    this.SetProp("PersistedCurrentValue", 4, value);
  }
};
var CustomEventReceiver = class extends Instance {
  constructor() {
    super();
    this.addClassName("CustomEventReceiver");
    this.Name = "CustomEventReceiver";
  }
  get Source() {
    return this.GetProp(
      "Source",
      19
      /* Referent */
    );
  }
  set Source(value) {
    this.SetProp("Source", 19, value);
  }
};
var CustomLog = class extends Instance {
  constructor() {
    super();
    this.addClassName("CustomLog");
    this.Name = "CustomLog";
  }
};
var DataModelMesh = class extends Instance {
  constructor() {
    super();
    this.addClassName("DataModelMesh");
    this.Offset = new Vector3(0, 0, 0);
    this.Scale = new Vector3(1, 1, 1);
    this.VertexColor = new Vector3(1, 1, 1);
  }
  get Offset() {
    return this.GetProp(
      "Offset",
      14
      /* Vector3 */
    );
  }
  set Offset(value) {
    this.SetProp("Offset", 14, value);
  }
  get Scale() {
    return this.GetProp(
      "Scale",
      14
      /* Vector3 */
    );
  }
  set Scale(value) {
    this.SetProp("Scale", 14, value);
  }
  get VertexColor() {
    return this.GetProp(
      "VertexColor",
      14
      /* Vector3 */
    );
  }
  set VertexColor(value) {
    this.SetProp("VertexColor", 14, value);
  }
};
var BevelMesh = class extends DataModelMesh {
  constructor() {
    super();
    this.addClassName("BevelMesh");
  }
  get Bevel() {
    return this.GetProp(
      "Bevel",
      4
      /* Float32 */
    );
  }
  set Bevel(value) {
    this.SetProp("Bevel", 4, value);
  }
  get BevelRoundness() {
    return this.GetProp(
      "Bevel Roundness",
      4
      /* Float32 */
    );
  }
  set BevelRoundness(value) {
    this.SetProp("Bevel Roundness", 4, value);
  }
  get Bulge() {
    return this.GetProp(
      "Bulge",
      4
      /* Float32 */
    );
  }
  set Bulge(value) {
    this.SetProp("Bulge", 4, value);
  }
};
var BlockMesh = class extends BevelMesh {
  constructor() {
    super();
    this.addClassName("BlockMesh");
    this.Name = "BlockMesh";
  }
};
var CylinderMesh = class extends BevelMesh {
  constructor() {
    super();
    this.addClassName("CylinderMesh");
    this.Name = "CylinderMesh";
  }
};
var FileMesh = class extends DataModelMesh {
  constructor() {
    super();
    this.addClassName("FileMesh");
    this.Name = "FileMesh";
    this.MeshId = "";
    this.TextureId = "";
  }
  get MeshId() {
    return this.GetProp(
      "MeshId",
      1
      /* String */
    );
  }
  set MeshId(value) {
    this.SetProp("MeshId", 1, value);
  }
  get TextureId() {
    return this.GetProp(
      "TextureId",
      1
      /* String */
    );
  }
  set TextureId(value) {
    this.SetProp("TextureId", 1, value);
  }
};
var SpecialMesh = class extends FileMesh {
  constructor() {
    super();
    this.addClassName("SpecialMesh");
    this.Name = "SpecialMesh";
    this.MeshType = MeshType.Head;
  }
  get MeshType() {
    return this.GetProp(
      "MeshType",
      18
      /* Enum */
    );
  }
  set MeshType(value) {
    this.SetProp("MeshType", 18, value);
  }
};
var DataModelPatchService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("DataModelPatchService");
    this.Name = "DataModelPatchService";
  }
};
var DataStoreGetOptions = class extends Instance {
  constructor() {
    super();
    this.addClassName("DataStoreGetOptions");
    this.Name = "DataStoreGetOptions";
    this.UseCache = true;
  }
  get UseCache() {
    return this.GetProp(
      "UseCache",
      2
      /* Bool */
    );
  }
  set UseCache(value) {
    this.SetProp("UseCache", 2, value);
  }
};
var DataStoreIncrementOptions = class extends Instance {
  constructor() {
    super();
    this.addClassName("DataStoreIncrementOptions");
    this.Name = "DataStoreIncrementOptions";
  }
};
var DataStoreOptions = class extends Instance {
  constructor() {
    super();
    this.addClassName("DataStoreOptions");
    this.Name = "DataStoreOptions";
    this.AllScopes = false;
  }
  get AllScopes() {
    return this.GetProp(
      "AllScopes",
      2
      /* Bool */
    );
  }
  set AllScopes(value) {
    this.SetProp("AllScopes", 2, value);
  }
};
var DataStoreService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("DataStoreService");
    this.Name = "DataStoreService";
    this.AutomaticRetry = true;
    this.LegacyNamingScheme = false;
  }
  get AutomaticRetry() {
    return this.GetProp(
      "AutomaticRetry",
      2
      /* Bool */
    );
  }
  set AutomaticRetry(value) {
    this.SetProp("AutomaticRetry", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get LegacyNamingScheme() {
    return this.GetProp(
      "LegacyNamingScheme",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set LegacyNamingScheme(value) {
    this.SetProp("LegacyNamingScheme", 2, value);
  }
};
var DataStoreSetOptions = class extends Instance {
  constructor() {
    super();
    this.addClassName("DataStoreSetOptions");
    this.Name = "DataStoreSetOptions";
  }
};
var Debris = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("Debris");
    this.Name = "Debris";
    this.MaxItems = 1e3;
  }
  /**@deprecated Deprecated by Roblox*/
  get MaxItems() {
    return this.GetProp(
      "MaxItems",
      3
      /* Int32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set MaxItems(value) {
    this.SetProp("MaxItems", 3, value);
  }
};
var DebuggablePluginWatcher = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("DebuggablePluginWatcher");
    this.Name = "DebuggablePluginWatcher";
  }
};
var DebuggerConnectionManager = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("DebuggerConnectionManager");
    this.Name = "DebuggerConnectionManager";
  }
  get Timeout() {
    return this.GetProp(
      "Timeout",
      5
      /* Float64 */
    );
  }
  set Timeout(value) {
    this.SetProp("Timeout", 5, value);
  }
};
var DebuggerManager = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("DebuggerManager");
    this.Name = "DebuggerManager";
  }
};
var DebuggerUIService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("DebuggerUIService");
    this.Name = "DebuggerUIService";
  }
};
var DebuggerWatch = class extends Instance {
  constructor() {
    super();
    this.addClassName("DebuggerWatch");
    this.Name = "DebuggerWatch";
    this.Expression = "";
  }
  get Expression() {
    return this.GetProp(
      "Expression",
      1
      /* String */
    );
  }
  set Expression(value) {
    this.SetProp("Expression", 1, value);
  }
};
var DeviceIdService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("DeviceIdService");
    this.Name = "DeviceIdService";
  }
};
var Dialog = class extends Instance {
  constructor() {
    super();
    this.addClassName("Dialog");
    this.Name = "Dialog";
    this.BehaviorType = DialogBehaviorType.SinglePlayer;
    this.ConversationDistance = 25;
    this.GoodbyeChoiceActive = true;
    this.GoodbyeDialog = "";
    this.InitialPrompt = "";
    this.Purpose = DialogPurpose.Help;
    this.Tone = DialogTone.Neutral;
    this.TriggerDistance = 0;
    this.TriggerOffset = new Vector3(0, 0, 0);
  }
  get BehaviorType() {
    return this.GetProp(
      "BehaviorType",
      18
      /* Enum */
    );
  }
  set BehaviorType(value) {
    this.SetProp("BehaviorType", 18, value);
  }
  get ConversationDistance() {
    return this.GetProp(
      "ConversationDistance",
      4
      /* Float32 */
    );
  }
  set ConversationDistance(value) {
    this.SetProp("ConversationDistance", 4, value);
  }
  get GoodbyeChoiceActive() {
    return this.GetProp(
      "GoodbyeChoiceActive",
      2
      /* Bool */
    );
  }
  set GoodbyeChoiceActive(value) {
    this.SetProp("GoodbyeChoiceActive", 2, value);
  }
  get GoodbyeDialog() {
    return this.GetProp(
      "GoodbyeDialog",
      1
      /* String */
    );
  }
  set GoodbyeDialog(value) {
    this.SetProp("GoodbyeDialog", 1, value);
  }
  get InitialPrompt() {
    return this.GetProp(
      "InitialPrompt",
      1
      /* String */
    );
  }
  set InitialPrompt(value) {
    this.SetProp("InitialPrompt", 1, value);
  }
  get Purpose() {
    return this.GetProp(
      "Purpose",
      18
      /* Enum */
    );
  }
  set Purpose(value) {
    this.SetProp("Purpose", 18, value);
  }
  get Tone() {
    return this.GetProp(
      "Tone",
      18
      /* Enum */
    );
  }
  set Tone(value) {
    this.SetProp("Tone", 18, value);
  }
  get TriggerDistance() {
    return this.GetProp(
      "TriggerDistance",
      4
      /* Float32 */
    );
  }
  set TriggerDistance(value) {
    this.SetProp("TriggerDistance", 4, value);
  }
  get TriggerOffset() {
    return this.GetProp(
      "TriggerOffset",
      14
      /* Vector3 */
    );
  }
  set TriggerOffset(value) {
    this.SetProp("TriggerOffset", 14, value);
  }
};
var DialogChoice = class extends Instance {
  constructor() {
    super();
    this.addClassName("DialogChoice");
    this.Name = "DialogChoice";
    this.GoodbyeChoiceActive = true;
    this.GoodbyeDialog = "";
    this.ResponseDialog = "";
    this.UserDialog = "";
  }
  get GoodbyeChoiceActive() {
    return this.GetProp(
      "GoodbyeChoiceActive",
      2
      /* Bool */
    );
  }
  set GoodbyeChoiceActive(value) {
    this.SetProp("GoodbyeChoiceActive", 2, value);
  }
  get GoodbyeDialog() {
    return this.GetProp(
      "GoodbyeDialog",
      1
      /* String */
    );
  }
  set GoodbyeDialog(value) {
    this.SetProp("GoodbyeDialog", 1, value);
  }
  get ResponseDialog() {
    return this.GetProp(
      "ResponseDialog",
      1
      /* String */
    );
  }
  set ResponseDialog(value) {
    this.SetProp("ResponseDialog", 1, value);
  }
  get UserDialog() {
    return this.GetProp(
      "UserDialog",
      1
      /* String */
    );
  }
  set UserDialog(value) {
    this.SetProp("UserDialog", 1, value);
  }
};
var DraftsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("DraftsService");
    this.Name = "DraftsService";
  }
};
var Dragger = class extends Instance {
  constructor() {
    super();
    this.addClassName("Dragger");
    this.Name = "Dragger";
  }
};
var DraggerService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("DraggerService");
    this.Name = "DraggerService";
  }
};
var EditableService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("EditableService");
    this.Name = "EditableService";
  }
};
var EulerRotationCurve = class extends Instance {
  constructor() {
    super();
    this.addClassName("EulerRotationCurve");
    this.Name = "EulerRotationCurve";
    this.RotationOrder = RotationOrder.XYZ;
  }
  get RotationOrder() {
    return this.GetProp(
      "RotationOrder",
      18
      /* Enum */
    );
  }
  set RotationOrder(value) {
    this.SetProp("RotationOrder", 18, value);
  }
};
var EventIngestService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("EventIngestService");
    this.Name = "EventIngestService";
  }
};
var ExampleService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ExampleService");
    this.Name = "ExampleService";
  }
};
var ExperienceAuthService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ExperienceAuthService");
    this.Name = "ExperienceAuthService";
  }
};
var ExperienceInviteOptions = class extends Instance {
  constructor() {
    super();
    this.addClassName("ExperienceInviteOptions");
    this.Name = "ExperienceInviteOptions";
    this.InviteMessageId = "";
    this.InviteUser = BigInt(0);
    this.LaunchData = "";
    this.PromptMessage = "";
  }
  get InviteMessageId() {
    return this.GetProp(
      "InviteMessageId",
      1
      /* String */
    );
  }
  set InviteMessageId(value) {
    this.SetProp("InviteMessageId", 1, value);
  }
  get InviteUser() {
    return this.GetProp(
      "InviteUser",
      27
      /* Int64 */
    );
  }
  set InviteUser(value) {
    this.SetProp("InviteUser", 27, value);
  }
  get LaunchData() {
    return this.GetProp(
      "LaunchData",
      1
      /* String */
    );
  }
  set LaunchData(value) {
    this.SetProp("LaunchData", 1, value);
  }
  get PromptMessage() {
    return this.GetProp(
      "PromptMessage",
      1
      /* String */
    );
  }
  set PromptMessage(value) {
    this.SetProp("PromptMessage", 1, value);
  }
};
var ExperienceNotificationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ExperienceNotificationService");
    this.Name = "ExperienceNotificationService";
  }
};
var ExperienceService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ExperienceService");
    this.Name = "ExperienceService";
  }
};
var ExperienceStateCaptureService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ExperienceStateCaptureService");
    this.Name = "ExperienceStateCaptureService";
  }
};
var ExplorerFilter = class extends Instance {
  constructor() {
    super();
    this.addClassName("ExplorerFilter");
    this.Name = "ExplorerFilter";
  }
};
var ExplorerServiceVisibilityService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ExplorerServiceVisibilityService");
    this.Name = "ExplorerServiceVisibilityService";
  }
};
var Explosion = class extends Instance {
  constructor() {
    super();
    this.addClassName("Explosion");
    this.Name = "Explosion";
    this.BlastPressure = 5e5;
    this.BlastRadius = 4;
    this.DestroyJointRadiusPercent = 1;
    this.ExplosionType = ExplosionType.Craters;
    this.Position = new Vector3(0, 0, 0);
    this.TimeScale = 1;
    this.Visible = true;
  }
  get BlastPressure() {
    return this.GetProp(
      "BlastPressure",
      4
      /* Float32 */
    );
  }
  set BlastPressure(value) {
    this.SetProp("BlastPressure", 4, value);
  }
  get BlastRadius() {
    return this.GetProp(
      "BlastRadius",
      4
      /* Float32 */
    );
  }
  set BlastRadius(value) {
    this.SetProp("BlastRadius", 4, value);
  }
  get DestroyJointRadiusPercent() {
    return this.GetProp(
      "DestroyJointRadiusPercent",
      4
      /* Float32 */
    );
  }
  set DestroyJointRadiusPercent(value) {
    this.SetProp("DestroyJointRadiusPercent", 4, value);
  }
  get ExplosionType() {
    return this.GetProp(
      "ExplosionType",
      18
      /* Enum */
    );
  }
  set ExplosionType(value) {
    this.SetProp("ExplosionType", 18, value);
  }
  get Position() {
    return this.GetProp(
      "Position",
      14
      /* Vector3 */
    );
  }
  set Position(value) {
    this.SetProp("Position", 14, value);
  }
  get TimeScale() {
    return this.GetProp(
      "TimeScale",
      4
      /* Float32 */
    );
  }
  set TimeScale(value) {
    this.SetProp("TimeScale", 4, value);
  }
  get Visible() {
    return this.GetProp(
      "Visible",
      2
      /* Bool */
    );
  }
  set Visible(value) {
    this.SetProp("Visible", 2, value);
  }
};
var FaceAnimatorService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("FaceAnimatorService");
    this.Name = "FaceAnimatorService";
  }
};
var FaceControls = class extends Instance {
  constructor() {
    super();
    this.addClassName("FaceControls");
    this.Name = "FaceControls";
  }
};
var FaceInstance = class extends Instance {
  constructor() {
    super();
    this.addClassName("FaceInstance");
    this.Face = NormalId.Front;
  }
  get Face() {
    return this.GetProp(
      "Face",
      18
      /* Enum */
    );
  }
  set Face(value) {
    this.SetProp("Face", 18, value);
  }
};
var Decal = class extends FaceInstance {
  constructor() {
    super();
    this.addClassName("Decal");
    this.Name = "Decal";
    this.Color3 = Color3.FromRGB(255, 255, 255);
    this.Shiny = 20;
    this.Specular = 0;
    this.Texture = "";
    this.Transparency = 0;
    this.ZIndex = 1;
  }
  get Color3() {
    return this.GetProp(
      "Color3",
      12
      /* Color3 */
    );
  }
  set Color3(value) {
    this.SetProp("Color3", 12, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Shiny() {
    return this.GetProp(
      "Shiny",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Shiny(value) {
    this.SetProp("Shiny", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Specular() {
    return this.GetProp(
      "Specular",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Specular(value) {
    this.SetProp("Specular", 4, value);
  }
  get Texture() {
    return this.GetProp(
      "Texture",
      1
      /* String */
    );
  }
  set Texture(value) {
    this.SetProp("Texture", 1, value);
  }
  get TextureContent() {
    return this.GetProp(
      "TextureContent",
      1
      /* String */
    );
  }
  set TextureContent(value) {
    this.SetProp("TextureContent", 1, value);
  }
  get Transparency() {
    return this.GetProp(
      "Transparency",
      4
      /* Float32 */
    );
  }
  set Transparency(value) {
    this.SetProp("Transparency", 4, value);
  }
  get ZIndex() {
    return this.GetProp(
      "ZIndex",
      3
      /* Int32 */
    );
  }
  set ZIndex(value) {
    this.SetProp("ZIndex", 3, value);
  }
};
var Texture = class extends Decal {
  constructor() {
    super();
    this.addClassName("Texture");
    this.Name = "Texture";
    this.OffsetStudsU = 0;
    this.OffsetStudsV = 0;
    this.StudsPerTileU = 2;
    this.StudsPerTileV = 2;
  }
  get OffsetStudsU() {
    return this.GetProp(
      "OffsetStudsU",
      4
      /* Float32 */
    );
  }
  set OffsetStudsU(value) {
    this.SetProp("OffsetStudsU", 4, value);
  }
  get OffsetStudsV() {
    return this.GetProp(
      "OffsetStudsV",
      4
      /* Float32 */
    );
  }
  set OffsetStudsV(value) {
    this.SetProp("OffsetStudsV", 4, value);
  }
  get StudsPerTileU() {
    return this.GetProp(
      "StudsPerTileU",
      4
      /* Float32 */
    );
  }
  set StudsPerTileU(value) {
    this.SetProp("StudsPerTileU", 4, value);
  }
  get StudsPerTileV() {
    return this.GetProp(
      "StudsPerTileV",
      4
      /* Float32 */
    );
  }
  set StudsPerTileV(value) {
    this.SetProp("StudsPerTileV", 4, value);
  }
};
var FacialAgeEstimationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("FacialAgeEstimationService");
    this.Name = "FacialAgeEstimationService";
  }
};
var FacialAnimationRecordingService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("FacialAnimationRecordingService");
    this.Name = "FacialAnimationRecordingService";
  }
};
var FacialAnimationStreamingServiceV2 = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("FacialAnimationStreamingServiceV2");
    this.Name = "FacialAnimationStreamingServiceV2";
    this.ServiceState = 0;
  }
  get ServiceState() {
    return this.GetProp(
      "ServiceState",
      3
      /* Int32 */
    );
  }
  set ServiceState(value) {
    this.SetProp("ServiceState", 3, value);
  }
};
var Feature = class extends Instance {
  constructor() {
    super();
    this.addClassName("Feature");
    this.FaceId = NormalId.Right;
    this.InOut = InOut.Center;
    this.LeftRight = LeftRight.Center;
    this.TopBottom = TopBottom.Center;
  }
  get FaceId() {
    return this.GetProp(
      "FaceId",
      18
      /* Enum */
    );
  }
  set FaceId(value) {
    this.SetProp("FaceId", 18, value);
  }
  get InOut() {
    return this.GetProp(
      "InOut",
      18
      /* Enum */
    );
  }
  set InOut(value) {
    this.SetProp("InOut", 18, value);
  }
  get LeftRight() {
    return this.GetProp(
      "LeftRight",
      18
      /* Enum */
    );
  }
  set LeftRight(value) {
    this.SetProp("LeftRight", 18, value);
  }
  get TopBottom() {
    return this.GetProp(
      "TopBottom",
      18
      /* Enum */
    );
  }
  set TopBottom(value) {
    this.SetProp("TopBottom", 18, value);
  }
};
var Hole = class extends Feature {
  constructor() {
    super();
    this.addClassName("Hole");
    this.Name = "Hole";
  }
};
var MotorFeature = class extends Feature {
  constructor() {
    super();
    this.addClassName("MotorFeature");
    this.Name = "MotorFeature";
  }
};
var FeatureRestrictionManager = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("FeatureRestrictionManager");
    this.Name = "FeatureRestrictionManager";
  }
};
var FeedService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("FeedService");
    this.Name = "FeedService";
  }
};
var Fire = class extends Instance {
  constructor() {
    super();
    this.addClassName("Fire");
    this.Name = "Fire";
    this.Color = Color3.FromRGB(236, 139, 70);
    this.Enabled = true;
    this.SecondaryColor = Color3.FromRGB(139, 80, 55);
    this.TimeScale = 1;
    this.Heatxml = 9;
    this.Size = 5;
    this.Sizexml = 5;
  }
  get Color() {
    return this.GetProp(
      "Color",
      12
      /* Color3 */
    );
  }
  set Color(value) {
    this.SetProp("Color", 12, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get SecondaryColor() {
    return this.GetProp(
      "SecondaryColor",
      12
      /* Color3 */
    );
  }
  set SecondaryColor(value) {
    this.SetProp("SecondaryColor", 12, value);
  }
  get TimeScale() {
    return this.GetProp(
      "TimeScale",
      4
      /* Float32 */
    );
  }
  set TimeScale(value) {
    this.SetProp("TimeScale", 4, value);
  }
  get Heatxml() {
    return this.GetProp(
      "heat_xml",
      4
      /* Float32 */
    );
  }
  set Heatxml(value) {
    this.SetProp("heat_xml", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Size() {
    return this.GetProp(
      "size",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Size(value) {
    this.SetProp("size", 4, value);
  }
  get Sizexml() {
    return this.GetProp(
      "size_xml",
      4
      /* Float32 */
    );
  }
  set Sizexml(value) {
    this.SetProp("size_xml", 4, value);
  }
};
var FlagStandService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("FlagStandService");
    this.Name = "FlagStandService";
  }
};
var FloatCurve = class extends Instance {
  constructor() {
    super();
    this.addClassName("FloatCurve");
    this.Name = "FloatCurve";
    this.ValuesAndTimes = "";
  }
  get ValuesAndTimes() {
    return this.GetProp(
      "ValuesAndTimes",
      1
      /* String */
    );
  }
  set ValuesAndTimes(value) {
    this.SetProp("ValuesAndTimes", 1, value);
  }
};
var FlyweightService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("FlyweightService");
    this.Name = "FlyweightService";
  }
};
var CSGDictionaryService = class extends FlyweightService {
  constructor() {
    super();
    this.addClassName("CSGDictionaryService");
    this.Name = "CSGDictionaryService";
  }
};
var NonReplicatedCSGDictionaryService = class extends FlyweightService {
  constructor() {
    super();
    this.addClassName("NonReplicatedCSGDictionaryService");
    this.Name = "NonReplicatedCSGDictionaryService";
  }
};
var Folder = class extends Instance {
  constructor() {
    super();
    this.addClassName("Folder");
    this.Name = "Folder";
  }
};
var ForceField = class extends Instance {
  constructor() {
    super();
    this.addClassName("ForceField");
    this.Name = "ForceField";
    this.Visible = true;
  }
  get Visible() {
    return this.GetProp(
      "Visible",
      2
      /* Bool */
    );
  }
  set Visible(value) {
    this.SetProp("Visible", 2, value);
  }
};
var FriendService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("FriendService");
    this.Name = "FriendService";
  }
};
var FunctionalTest = class extends Instance {
  constructor() {
    super();
    this.addClassName("FunctionalTest");
    this.Name = "FunctionalTest";
    this.Description = "?";
    this.HasMigratedSettingsToTestService = false;
  }
  get Description() {
    return this.GetProp(
      "Description",
      1
      /* String */
    );
  }
  set Description(value) {
    this.SetProp("Description", 1, value);
  }
  get HasMigratedSettingsToTestService() {
    return this.GetProp(
      "HasMigratedSettingsToTestService",
      2
      /* Bool */
    );
  }
  set HasMigratedSettingsToTestService(value) {
    this.SetProp("HasMigratedSettingsToTestService", 2, value);
  }
};
var GamePassService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("GamePassService");
    this.Name = "GamePassService";
  }
};
var GamepadService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("GamepadService");
    this.Name = "GamepadService";
    this.GamepadCursorEnabled = false;
  }
  get GamepadCursorEnabled() {
    return this.GetProp(
      "GamepadCursorEnabled",
      2
      /* Bool */
    );
  }
  set GamepadCursorEnabled(value) {
    this.SetProp("GamepadCursorEnabled", 2, value);
  }
};
var GenerationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("GenerationService");
    this.Name = "GenerationService";
  }
};
var GenericChallengeService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("GenericChallengeService");
    this.Name = "GenericChallengeService";
  }
};
var Geometry = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("Geometry");
    this.Name = "Geometry";
  }
};
var GeometryService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("GeometryService");
    this.Name = "GeometryService";
  }
};
var GetTextBoundsParams = class extends Instance {
  constructor() {
    super();
    this.addClassName("GetTextBoundsParams");
    this.Name = "GetTextBoundsParams";
    this.RichText = false;
    this.Size = 20;
    this.Text = "";
    this.Width = 0;
    this.Font = new RBXMFont(
      "rbxasset://fonts/families/SourceSansPro.json",
      400,
      0
      /* Normal */
    );
  }
  get Font() {
    return this.GetProp(
      "Font",
      32
      /* Font */
    );
  }
  set Font(value) {
    this.SetProp("Font", 32, value);
  }
  get RichText() {
    return this.GetProp(
      "RichText",
      2
      /* Bool */
    );
  }
  set RichText(value) {
    this.SetProp("RichText", 2, value);
  }
  get Size() {
    return this.GetProp(
      "Size",
      4
      /* Float32 */
    );
  }
  set Size(value) {
    this.SetProp("Size", 4, value);
  }
  get Text() {
    return this.GetProp(
      "Text",
      1
      /* String */
    );
  }
  set Text(value) {
    this.SetProp("Text", 1, value);
  }
  get Width() {
    return this.GetProp(
      "Width",
      4
      /* Float32 */
    );
  }
  set Width(value) {
    this.SetProp("Width", 4, value);
  }
};
var GoogleAnalyticsConfiguration = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("GoogleAnalyticsConfiguration");
    this.Name = "GoogleAnalyticsConfiguration";
  }
  get GaID() {
    return this.GetProp(
      "gaID",
      1
      /* String */
    );
  }
  set GaID(value) {
    this.SetProp("gaID", 1, value);
  }
};
var GroupService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("GroupService");
    this.Name = "GroupService";
  }
};
var GuiBase = class extends Instance {
  constructor() {
    super();
    this.addClassName("GuiBase");
  }
};
var GuiBase2d = class extends GuiBase {
  constructor() {
    super();
    this.addClassName("GuiBase2d");
    this.AutoLocalize = true;
    this.Localize = true;
    this.SelectionBehaviorDown = SelectionBehavior.Escape;
    this.SelectionBehaviorLeft = SelectionBehavior.Escape;
    this.SelectionBehaviorRight = SelectionBehavior.Escape;
    this.SelectionBehaviorUp = SelectionBehavior.Escape;
  }
  get AutoLocalize() {
    return this.GetProp(
      "AutoLocalize",
      2
      /* Bool */
    );
  }
  set AutoLocalize(value) {
    this.SetProp("AutoLocalize", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Localize() {
    return this.GetProp(
      "Localize",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Localize(value) {
    this.SetProp("Localize", 2, value);
  }
  get RootLocalizationTable() {
    return this.GetProp(
      "RootLocalizationTable",
      19
      /* Referent */
    );
  }
  set RootLocalizationTable(value) {
    this.SetProp("RootLocalizationTable", 19, value);
  }
  get SelectionBehaviorDown() {
    return this.GetProp(
      "SelectionBehaviorDown",
      18
      /* Enum */
    );
  }
  set SelectionBehaviorDown(value) {
    this.SetProp("SelectionBehaviorDown", 18, value);
  }
  get SelectionBehaviorLeft() {
    return this.GetProp(
      "SelectionBehaviorLeft",
      18
      /* Enum */
    );
  }
  set SelectionBehaviorLeft(value) {
    this.SetProp("SelectionBehaviorLeft", 18, value);
  }
  get SelectionBehaviorRight() {
    return this.GetProp(
      "SelectionBehaviorRight",
      18
      /* Enum */
    );
  }
  set SelectionBehaviorRight(value) {
    this.SetProp("SelectionBehaviorRight", 18, value);
  }
  get SelectionBehaviorUp() {
    return this.GetProp(
      "SelectionBehaviorUp",
      18
      /* Enum */
    );
  }
  set SelectionBehaviorUp(value) {
    this.SetProp("SelectionBehaviorUp", 18, value);
  }
  get SelectionGroup() {
    return this.GetProp(
      "SelectionGroup",
      2
      /* Bool */
    );
  }
  set SelectionGroup(value) {
    this.SetProp("SelectionGroup", 2, value);
  }
};
var GuiObject = class extends GuiBase2d {
  constructor() {
    super();
    this.addClassName("GuiObject");
    this.AnchorPoint = new Vector2(0, 0);
    this.AutomaticSize = AutomaticSize.None;
    this.BackgroundColor3 = Color3.FromRGB(163, 162, 165);
    this.BackgroundTransparency = 0;
    this.BorderColor3 = Color3.FromRGB(27, 42, 53);
    this.BorderMode = BorderMode.Outline;
    this.BorderSizePixel = 1;
    this.Draggable = false;
    this.Interactable = true;
    this.LayoutOrder = 0;
    this.Position = new UDim2(new UDim(0, 0), new UDim(0, 0));
    this.Rotation = 0;
    this.SelectionOrder = 0;
    this.Size = new UDim2(new UDim(0, 0), new UDim(0, 0));
    this.SizeConstraint = SizeConstraint.RelativeXY;
    this.Visible = true;
    this.ZIndex = 1;
  }
  get Active() {
    return this.GetProp(
      "Active",
      2
      /* Bool */
    );
  }
  set Active(value) {
    this.SetProp("Active", 2, value);
  }
  get AnchorPoint() {
    return this.GetProp(
      "AnchorPoint",
      13
      /* Vector2 */
    );
  }
  set AnchorPoint(value) {
    this.SetProp("AnchorPoint", 13, value);
  }
  get AutomaticSize() {
    return this.GetProp(
      "AutomaticSize",
      18
      /* Enum */
    );
  }
  set AutomaticSize(value) {
    this.SetProp("AutomaticSize", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get BackgroundColor() {
    return this.GetProp(
      "BackgroundColor",
      11
      /* BrickColor */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set BackgroundColor(value) {
    this.SetProp("BackgroundColor", 11, value);
  }
  get BackgroundColor3() {
    return this.GetProp(
      "BackgroundColor3",
      12
      /* Color3 */
    );
  }
  set BackgroundColor3(value) {
    this.SetProp("BackgroundColor3", 12, value);
  }
  get BackgroundTransparency() {
    return this.GetProp(
      "BackgroundTransparency",
      4
      /* Float32 */
    );
  }
  set BackgroundTransparency(value) {
    this.SetProp("BackgroundTransparency", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get BorderColor() {
    return this.GetProp(
      "BorderColor",
      11
      /* BrickColor */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set BorderColor(value) {
    this.SetProp("BorderColor", 11, value);
  }
  get BorderColor3() {
    return this.GetProp(
      "BorderColor3",
      12
      /* Color3 */
    );
  }
  set BorderColor3(value) {
    this.SetProp("BorderColor3", 12, value);
  }
  get BorderMode() {
    return this.GetProp(
      "BorderMode",
      18
      /* Enum */
    );
  }
  set BorderMode(value) {
    this.SetProp("BorderMode", 18, value);
  }
  get BorderSizePixel() {
    return this.GetProp(
      "BorderSizePixel",
      3
      /* Int32 */
    );
  }
  set BorderSizePixel(value) {
    this.SetProp("BorderSizePixel", 3, value);
  }
  get ClipsDescendants() {
    return this.GetProp(
      "ClipsDescendants",
      2
      /* Bool */
    );
  }
  set ClipsDescendants(value) {
    this.SetProp("ClipsDescendants", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Draggable() {
    return this.GetProp(
      "Draggable",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Draggable(value) {
    this.SetProp("Draggable", 2, value);
  }
  get Interactable() {
    return this.GetProp(
      "Interactable",
      2
      /* Bool */
    );
  }
  set Interactable(value) {
    this.SetProp("Interactable", 2, value);
  }
  get LayoutOrder() {
    return this.GetProp(
      "LayoutOrder",
      3
      /* Int32 */
    );
  }
  set LayoutOrder(value) {
    this.SetProp("LayoutOrder", 3, value);
  }
  get NextSelectionDown() {
    return this.GetProp(
      "NextSelectionDown",
      19
      /* Referent */
    );
  }
  set NextSelectionDown(value) {
    this.SetProp("NextSelectionDown", 19, value);
  }
  get NextSelectionLeft() {
    return this.GetProp(
      "NextSelectionLeft",
      19
      /* Referent */
    );
  }
  set NextSelectionLeft(value) {
    this.SetProp("NextSelectionLeft", 19, value);
  }
  get NextSelectionRight() {
    return this.GetProp(
      "NextSelectionRight",
      19
      /* Referent */
    );
  }
  set NextSelectionRight(value) {
    this.SetProp("NextSelectionRight", 19, value);
  }
  get NextSelectionUp() {
    return this.GetProp(
      "NextSelectionUp",
      19
      /* Referent */
    );
  }
  set NextSelectionUp(value) {
    this.SetProp("NextSelectionUp", 19, value);
  }
  get Position() {
    return this.GetProp(
      "Position",
      7
      /* UDim2 */
    );
  }
  set Position(value) {
    this.SetProp("Position", 7, value);
  }
  get Rotation() {
    return this.GetProp(
      "Rotation",
      4
      /* Float32 */
    );
  }
  set Rotation(value) {
    this.SetProp("Rotation", 4, value);
  }
  get Selectable() {
    return this.GetProp(
      "Selectable",
      2
      /* Bool */
    );
  }
  set Selectable(value) {
    this.SetProp("Selectable", 2, value);
  }
  get SelectionImageObject() {
    return this.GetProp(
      "SelectionImageObject",
      19
      /* Referent */
    );
  }
  set SelectionImageObject(value) {
    this.SetProp("SelectionImageObject", 19, value);
  }
  get SelectionOrder() {
    return this.GetProp(
      "SelectionOrder",
      3
      /* Int32 */
    );
  }
  set SelectionOrder(value) {
    this.SetProp("SelectionOrder", 3, value);
  }
  get Size() {
    return this.GetProp(
      "Size",
      7
      /* UDim2 */
    );
  }
  set Size(value) {
    this.SetProp("Size", 7, value);
  }
  get SizeConstraint() {
    return this.GetProp(
      "SizeConstraint",
      18
      /* Enum */
    );
  }
  set SizeConstraint(value) {
    this.SetProp("SizeConstraint", 18, value);
  }
  get Visible() {
    return this.GetProp(
      "Visible",
      2
      /* Bool */
    );
  }
  set Visible(value) {
    this.SetProp("Visible", 2, value);
  }
  get ZIndex() {
    return this.GetProp(
      "ZIndex",
      3
      /* Int32 */
    );
  }
  set ZIndex(value) {
    this.SetProp("ZIndex", 3, value);
  }
};
var CanvasGroup = class extends GuiObject {
  constructor() {
    super();
    this.addClassName("CanvasGroup");
    this.Name = "CanvasGroup";
    this.GroupColor3 = Color3.FromRGB(255, 255, 255);
    this.GroupTransparency = 0;
    this.Active = false;
    this.ClipsDescendants = true;
    this.Selectable = false;
    this.SelectionGroup = false;
  }
  get GroupColor3() {
    return this.GetProp(
      "GroupColor3",
      12
      /* Color3 */
    );
  }
  set GroupColor3(value) {
    this.SetProp("GroupColor3", 12, value);
  }
  get GroupTransparency() {
    return this.GetProp(
      "GroupTransparency",
      4
      /* Float32 */
    );
  }
  set GroupTransparency(value) {
    this.SetProp("GroupTransparency", 4, value);
  }
};
var Frame = class extends GuiObject {
  constructor() {
    super();
    this.addClassName("Frame");
    this.Name = "Frame";
    this.Style = FrameStyle.Custom;
    this.Active = false;
    this.ClipsDescendants = false;
    this.Selectable = false;
    this.SelectionGroup = false;
  }
  get Style() {
    return this.GetProp(
      "Style",
      18
      /* Enum */
    );
  }
  set Style(value) {
    this.SetProp("Style", 18, value);
  }
};
var GuiButton = class extends GuiObject {
  constructor() {
    super();
    this.addClassName("GuiButton");
    this.AutoButtonColor = true;
    this.Modal = false;
    this.Selected = false;
    this.Style = ButtonStyle.Custom;
    this.Active = true;
    this.ClipsDescendants = false;
    this.Selectable = true;
    this.SelectionGroup = false;
  }
  get AutoButtonColor() {
    return this.GetProp(
      "AutoButtonColor",
      2
      /* Bool */
    );
  }
  set AutoButtonColor(value) {
    this.SetProp("AutoButtonColor", 2, value);
  }
  get HoverHapticEffect() {
    return this.GetProp(
      "HoverHapticEffect",
      19
      /* Referent */
    );
  }
  set HoverHapticEffect(value) {
    this.SetProp("HoverHapticEffect", 19, value);
  }
  get Modal() {
    return this.GetProp(
      "Modal",
      2
      /* Bool */
    );
  }
  set Modal(value) {
    this.SetProp("Modal", 2, value);
  }
  get PressHapticEffect() {
    return this.GetProp(
      "PressHapticEffect",
      19
      /* Referent */
    );
  }
  set PressHapticEffect(value) {
    this.SetProp("PressHapticEffect", 19, value);
  }
  get Selected() {
    return this.GetProp(
      "Selected",
      2
      /* Bool */
    );
  }
  set Selected(value) {
    this.SetProp("Selected", 2, value);
  }
  get Style() {
    return this.GetProp(
      "Style",
      18
      /* Enum */
    );
  }
  set Style(value) {
    this.SetProp("Style", 18, value);
  }
};
var ImageButton = class extends GuiButton {
  constructor() {
    super();
    this.addClassName("ImageButton");
    this.Name = "ImageButton";
    this.HoverImage = "";
    this.Image = "";
    this.ImageColor3 = Color3.FromRGB(255, 255, 255);
    this.ImageRectOffset = new Vector2(0, 0);
    this.ImageRectSize = new Vector2(0, 0);
    this.ImageTransparency = 0;
    this.PressedImage = "";
    this.ResampleMode = ResamplerMode.Default;
    this.ScaleType = ScaleType.Stretch;
    this.SliceCenter = new Rect(new Vector2(0, 0), new Vector2(0, 0));
    this.SliceScale = 1;
    this.TileSize = new UDim2(new UDim(1, 0), new UDim(1, 0));
  }
  get HoverImage() {
    return this.GetProp(
      "HoverImage",
      1
      /* String */
    );
  }
  set HoverImage(value) {
    this.SetProp("HoverImage", 1, value);
  }
  get HoverImageContent() {
    return this.GetProp(
      "HoverImageContent",
      1
      /* String */
    );
  }
  set HoverImageContent(value) {
    this.SetProp("HoverImageContent", 1, value);
  }
  get Image() {
    return this.GetProp(
      "Image",
      1
      /* String */
    );
  }
  set Image(value) {
    this.SetProp("Image", 1, value);
  }
  get ImageColor3() {
    return this.GetProp(
      "ImageColor3",
      12
      /* Color3 */
    );
  }
  set ImageColor3(value) {
    this.SetProp("ImageColor3", 12, value);
  }
  get ImageContent() {
    return this.GetProp(
      "ImageContent",
      1
      /* String */
    );
  }
  set ImageContent(value) {
    this.SetProp("ImageContent", 1, value);
  }
  get ImageRectOffset() {
    return this.GetProp(
      "ImageRectOffset",
      13
      /* Vector2 */
    );
  }
  set ImageRectOffset(value) {
    this.SetProp("ImageRectOffset", 13, value);
  }
  get ImageRectSize() {
    return this.GetProp(
      "ImageRectSize",
      13
      /* Vector2 */
    );
  }
  set ImageRectSize(value) {
    this.SetProp("ImageRectSize", 13, value);
  }
  get ImageTransparency() {
    return this.GetProp(
      "ImageTransparency",
      4
      /* Float32 */
    );
  }
  set ImageTransparency(value) {
    this.SetProp("ImageTransparency", 4, value);
  }
  get PressedImage() {
    return this.GetProp(
      "PressedImage",
      1
      /* String */
    );
  }
  set PressedImage(value) {
    this.SetProp("PressedImage", 1, value);
  }
  get PressedImageContent() {
    return this.GetProp(
      "PressedImageContent",
      1
      /* String */
    );
  }
  set PressedImageContent(value) {
    this.SetProp("PressedImageContent", 1, value);
  }
  get ResampleMode() {
    return this.GetProp(
      "ResampleMode",
      18
      /* Enum */
    );
  }
  set ResampleMode(value) {
    this.SetProp("ResampleMode", 18, value);
  }
  get ScaleType() {
    return this.GetProp(
      "ScaleType",
      18
      /* Enum */
    );
  }
  set ScaleType(value) {
    this.SetProp("ScaleType", 18, value);
  }
  get SliceCenter() {
    return this.GetProp(
      "SliceCenter",
      24
      /* Rect */
    );
  }
  set SliceCenter(value) {
    this.SetProp("SliceCenter", 24, value);
  }
  get SliceScale() {
    return this.GetProp(
      "SliceScale",
      4
      /* Float32 */
    );
  }
  set SliceScale(value) {
    this.SetProp("SliceScale", 4, value);
  }
  get TileSize() {
    return this.GetProp(
      "TileSize",
      7
      /* UDim2 */
    );
  }
  set TileSize(value) {
    this.SetProp("TileSize", 7, value);
  }
};
var TextButton = class extends GuiButton {
  constructor() {
    super();
    this.addClassName("TextButton");
    this.Name = "TextButton";
    this.FontSize = FontSize.Size8;
    this.LineHeight = 1;
    this.LocalizationMatchIdentifier = "";
    this.LocalizationMatchedSourceText = "";
    this.MaxVisibleGraphemes = -1;
    this.OpenTypeFeatures = "";
    this.RichText = false;
    this.Text = "Button";
    this.TextColor3 = Color3.FromRGB(27, 42, 53);
    this.TextDirection = TextDirection.Auto;
    this.TextScaled = false;
    this.TextSize = 8;
    this.TextStrokeColor3 = Color3.FromRGB(0, 0, 0);
    this.TextStrokeTransparency = 1;
    this.TextTransparency = 0;
    this.TextTruncate = TextTruncate.None;
    this.TextWrap = false;
    this.TextWrapped = false;
    this.TextXAlignment = TextXAlignment.Center;
    this.TextYAlignment = TextYAlignment.Center;
    this.FontFace = new RBXMFont(
      "rbxasset://fonts/families/LegacyArial.json",
      400,
      0
      /* Normal */
    );
  }
  get FontFace() {
    return this.GetProp(
      "FontFace",
      32
      /* Font */
    );
  }
  set FontFace(value) {
    this.SetProp("FontFace", 32, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get FontSize() {
    return this.GetProp(
      "FontSize",
      18
      /* Enum */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set FontSize(value) {
    this.SetProp("FontSize", 18, value);
  }
  get LineHeight() {
    return this.GetProp(
      "LineHeight",
      4
      /* Float32 */
    );
  }
  set LineHeight(value) {
    this.SetProp("LineHeight", 4, value);
  }
  get LocalizationMatchIdentifier() {
    return this.GetProp(
      "LocalizationMatchIdentifier",
      1
      /* String */
    );
  }
  set LocalizationMatchIdentifier(value) {
    this.SetProp("LocalizationMatchIdentifier", 1, value);
  }
  get LocalizationMatchedSourceText() {
    return this.GetProp(
      "LocalizationMatchedSourceText",
      1
      /* String */
    );
  }
  set LocalizationMatchedSourceText(value) {
    this.SetProp("LocalizationMatchedSourceText", 1, value);
  }
  get MaxVisibleGraphemes() {
    return this.GetProp(
      "MaxVisibleGraphemes",
      3
      /* Int32 */
    );
  }
  set MaxVisibleGraphemes(value) {
    this.SetProp("MaxVisibleGraphemes", 3, value);
  }
  get OpenTypeFeatures() {
    return this.GetProp(
      "OpenTypeFeatures",
      1
      /* String */
    );
  }
  set OpenTypeFeatures(value) {
    this.SetProp("OpenTypeFeatures", 1, value);
  }
  get RichText() {
    return this.GetProp(
      "RichText",
      2
      /* Bool */
    );
  }
  set RichText(value) {
    this.SetProp("RichText", 2, value);
  }
  get Text() {
    return this.GetProp(
      "Text",
      1
      /* String */
    );
  }
  set Text(value) {
    this.SetProp("Text", 1, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get TextColor() {
    return this.GetProp(
      "TextColor",
      11
      /* BrickColor */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set TextColor(value) {
    this.SetProp("TextColor", 11, value);
  }
  get TextColor3() {
    return this.GetProp(
      "TextColor3",
      12
      /* Color3 */
    );
  }
  set TextColor3(value) {
    this.SetProp("TextColor3", 12, value);
  }
  get TextDirection() {
    return this.GetProp(
      "TextDirection",
      18
      /* Enum */
    );
  }
  set TextDirection(value) {
    this.SetProp("TextDirection", 18, value);
  }
  get TextScaled() {
    return this.GetProp(
      "TextScaled",
      2
      /* Bool */
    );
  }
  set TextScaled(value) {
    this.SetProp("TextScaled", 2, value);
  }
  get TextSize() {
    return this.GetProp(
      "TextSize",
      4
      /* Float32 */
    );
  }
  set TextSize(value) {
    this.SetProp("TextSize", 4, value);
  }
  get TextStrokeColor3() {
    return this.GetProp(
      "TextStrokeColor3",
      12
      /* Color3 */
    );
  }
  set TextStrokeColor3(value) {
    this.SetProp("TextStrokeColor3", 12, value);
  }
  get TextStrokeTransparency() {
    return this.GetProp(
      "TextStrokeTransparency",
      4
      /* Float32 */
    );
  }
  set TextStrokeTransparency(value) {
    this.SetProp("TextStrokeTransparency", 4, value);
  }
  get TextTransparency() {
    return this.GetProp(
      "TextTransparency",
      4
      /* Float32 */
    );
  }
  set TextTransparency(value) {
    this.SetProp("TextTransparency", 4, value);
  }
  get TextTruncate() {
    return this.GetProp(
      "TextTruncate",
      18
      /* Enum */
    );
  }
  set TextTruncate(value) {
    this.SetProp("TextTruncate", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get TextWrap() {
    return this.GetProp(
      "TextWrap",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set TextWrap(value) {
    this.SetProp("TextWrap", 2, value);
  }
  get TextWrapped() {
    return this.GetProp(
      "TextWrapped",
      2
      /* Bool */
    );
  }
  set TextWrapped(value) {
    this.SetProp("TextWrapped", 2, value);
  }
  get TextXAlignment() {
    return this.GetProp(
      "TextXAlignment",
      18
      /* Enum */
    );
  }
  set TextXAlignment(value) {
    this.SetProp("TextXAlignment", 18, value);
  }
  get TextYAlignment() {
    return this.GetProp(
      "TextYAlignment",
      18
      /* Enum */
    );
  }
  set TextYAlignment(value) {
    this.SetProp("TextYAlignment", 18, value);
  }
};
var GuiLabel = class extends GuiObject {
  constructor() {
    super();
    this.addClassName("GuiLabel");
    this.Active = false;
    this.ClipsDescendants = false;
    this.Selectable = false;
    this.SelectionGroup = false;
  }
};
var ImageLabel = class extends GuiLabel {
  constructor() {
    super();
    this.addClassName("ImageLabel");
    this.Name = "ImageLabel";
    this.Image = "";
    this.ImageColor3 = Color3.FromRGB(255, 255, 255);
    this.ImageRectOffset = new Vector2(0, 0);
    this.ImageRectSize = new Vector2(0, 0);
    this.ImageTransparency = 0;
    this.ResampleMode = ResamplerMode.Default;
    this.ScaleType = ScaleType.Stretch;
    this.SliceCenter = new Rect(new Vector2(0, 0), new Vector2(0, 0));
    this.SliceScale = 1;
    this.TileSize = new UDim2(new UDim(1, 0), new UDim(1, 0));
  }
  get Image() {
    return this.GetProp(
      "Image",
      1
      /* String */
    );
  }
  set Image(value) {
    this.SetProp("Image", 1, value);
  }
  get ImageColor3() {
    return this.GetProp(
      "ImageColor3",
      12
      /* Color3 */
    );
  }
  set ImageColor3(value) {
    this.SetProp("ImageColor3", 12, value);
  }
  get ImageContent() {
    return this.GetProp(
      "ImageContent",
      1
      /* String */
    );
  }
  set ImageContent(value) {
    this.SetProp("ImageContent", 1, value);
  }
  get ImageRectOffset() {
    return this.GetProp(
      "ImageRectOffset",
      13
      /* Vector2 */
    );
  }
  set ImageRectOffset(value) {
    this.SetProp("ImageRectOffset", 13, value);
  }
  get ImageRectSize() {
    return this.GetProp(
      "ImageRectSize",
      13
      /* Vector2 */
    );
  }
  set ImageRectSize(value) {
    this.SetProp("ImageRectSize", 13, value);
  }
  get ImageTransparency() {
    return this.GetProp(
      "ImageTransparency",
      4
      /* Float32 */
    );
  }
  set ImageTransparency(value) {
    this.SetProp("ImageTransparency", 4, value);
  }
  get ResampleMode() {
    return this.GetProp(
      "ResampleMode",
      18
      /* Enum */
    );
  }
  set ResampleMode(value) {
    this.SetProp("ResampleMode", 18, value);
  }
  get ScaleType() {
    return this.GetProp(
      "ScaleType",
      18
      /* Enum */
    );
  }
  set ScaleType(value) {
    this.SetProp("ScaleType", 18, value);
  }
  get SliceCenter() {
    return this.GetProp(
      "SliceCenter",
      24
      /* Rect */
    );
  }
  set SliceCenter(value) {
    this.SetProp("SliceCenter", 24, value);
  }
  get SliceScale() {
    return this.GetProp(
      "SliceScale",
      4
      /* Float32 */
    );
  }
  set SliceScale(value) {
    this.SetProp("SliceScale", 4, value);
  }
  get TileSize() {
    return this.GetProp(
      "TileSize",
      7
      /* UDim2 */
    );
  }
  set TileSize(value) {
    this.SetProp("TileSize", 7, value);
  }
};
var TextLabel = class extends GuiLabel {
  constructor() {
    super();
    this.addClassName("TextLabel");
    this.Name = "TextLabel";
    this.FontSize = FontSize.Size8;
    this.LineHeight = 1;
    this.LocalizationMatchIdentifier = "";
    this.LocalizationMatchedSourceText = "";
    this.MaxVisibleGraphemes = -1;
    this.OpenTypeFeatures = "";
    this.RichText = false;
    this.Text = "Label";
    this.TextColor3 = Color3.FromRGB(27, 42, 53);
    this.TextDirection = TextDirection.Auto;
    this.TextScaled = false;
    this.TextSize = 8;
    this.TextStrokeColor3 = Color3.FromRGB(0, 0, 0);
    this.TextStrokeTransparency = 1;
    this.TextTransparency = 0;
    this.TextTruncate = TextTruncate.None;
    this.TextWrap = false;
    this.TextWrapped = false;
    this.TextXAlignment = TextXAlignment.Center;
    this.TextYAlignment = TextYAlignment.Center;
    this.FontFace = new RBXMFont(
      "rbxasset://fonts/families/LegacyArial.json",
      400,
      0
      /* Normal */
    );
  }
  get FontFace() {
    return this.GetProp(
      "FontFace",
      32
      /* Font */
    );
  }
  set FontFace(value) {
    this.SetProp("FontFace", 32, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get FontSize() {
    return this.GetProp(
      "FontSize",
      18
      /* Enum */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set FontSize(value) {
    this.SetProp("FontSize", 18, value);
  }
  get LineHeight() {
    return this.GetProp(
      "LineHeight",
      4
      /* Float32 */
    );
  }
  set LineHeight(value) {
    this.SetProp("LineHeight", 4, value);
  }
  get LocalizationMatchIdentifier() {
    return this.GetProp(
      "LocalizationMatchIdentifier",
      1
      /* String */
    );
  }
  set LocalizationMatchIdentifier(value) {
    this.SetProp("LocalizationMatchIdentifier", 1, value);
  }
  get LocalizationMatchedSourceText() {
    return this.GetProp(
      "LocalizationMatchedSourceText",
      1
      /* String */
    );
  }
  set LocalizationMatchedSourceText(value) {
    this.SetProp("LocalizationMatchedSourceText", 1, value);
  }
  get MaxVisibleGraphemes() {
    return this.GetProp(
      "MaxVisibleGraphemes",
      3
      /* Int32 */
    );
  }
  set MaxVisibleGraphemes(value) {
    this.SetProp("MaxVisibleGraphemes", 3, value);
  }
  get OpenTypeFeatures() {
    return this.GetProp(
      "OpenTypeFeatures",
      1
      /* String */
    );
  }
  set OpenTypeFeatures(value) {
    this.SetProp("OpenTypeFeatures", 1, value);
  }
  get RichText() {
    return this.GetProp(
      "RichText",
      2
      /* Bool */
    );
  }
  set RichText(value) {
    this.SetProp("RichText", 2, value);
  }
  get Text() {
    return this.GetProp(
      "Text",
      1
      /* String */
    );
  }
  set Text(value) {
    this.SetProp("Text", 1, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get TextColor() {
    return this.GetProp(
      "TextColor",
      11
      /* BrickColor */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set TextColor(value) {
    this.SetProp("TextColor", 11, value);
  }
  get TextColor3() {
    return this.GetProp(
      "TextColor3",
      12
      /* Color3 */
    );
  }
  set TextColor3(value) {
    this.SetProp("TextColor3", 12, value);
  }
  get TextDirection() {
    return this.GetProp(
      "TextDirection",
      18
      /* Enum */
    );
  }
  set TextDirection(value) {
    this.SetProp("TextDirection", 18, value);
  }
  get TextScaled() {
    return this.GetProp(
      "TextScaled",
      2
      /* Bool */
    );
  }
  set TextScaled(value) {
    this.SetProp("TextScaled", 2, value);
  }
  get TextSize() {
    return this.GetProp(
      "TextSize",
      4
      /* Float32 */
    );
  }
  set TextSize(value) {
    this.SetProp("TextSize", 4, value);
  }
  get TextStrokeColor3() {
    return this.GetProp(
      "TextStrokeColor3",
      12
      /* Color3 */
    );
  }
  set TextStrokeColor3(value) {
    this.SetProp("TextStrokeColor3", 12, value);
  }
  get TextStrokeTransparency() {
    return this.GetProp(
      "TextStrokeTransparency",
      4
      /* Float32 */
    );
  }
  set TextStrokeTransparency(value) {
    this.SetProp("TextStrokeTransparency", 4, value);
  }
  get TextTransparency() {
    return this.GetProp(
      "TextTransparency",
      4
      /* Float32 */
    );
  }
  set TextTransparency(value) {
    this.SetProp("TextTransparency", 4, value);
  }
  get TextTruncate() {
    return this.GetProp(
      "TextTruncate",
      18
      /* Enum */
    );
  }
  set TextTruncate(value) {
    this.SetProp("TextTruncate", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get TextWrap() {
    return this.GetProp(
      "TextWrap",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set TextWrap(value) {
    this.SetProp("TextWrap", 2, value);
  }
  get TextWrapped() {
    return this.GetProp(
      "TextWrapped",
      2
      /* Bool */
    );
  }
  set TextWrapped(value) {
    this.SetProp("TextWrapped", 2, value);
  }
  get TextXAlignment() {
    return this.GetProp(
      "TextXAlignment",
      18
      /* Enum */
    );
  }
  set TextXAlignment(value) {
    this.SetProp("TextXAlignment", 18, value);
  }
  get TextYAlignment() {
    return this.GetProp(
      "TextYAlignment",
      18
      /* Enum */
    );
  }
  set TextYAlignment(value) {
    this.SetProp("TextYAlignment", 18, value);
  }
};
var RelativeGui = class extends GuiObject {
  constructor() {
    super();
    this.addClassName("RelativeGui");
    this.Name = "RelativeGui";
  }
};
var ScrollingFrame = class extends GuiObject {
  constructor() {
    super();
    this.addClassName("ScrollingFrame");
    this.Name = "ScrollingFrame";
    this.AutomaticCanvasSize = AutomaticSize.None;
    this.BottomImage = "rbxasset://textures/ui/Scroll/scroll-bottom.png";
    this.CanvasPosition = new Vector2(0, 0);
    this.CanvasSize = new UDim2(new UDim(0, 0), new UDim(2, 0));
    this.ElasticBehavior = ElasticBehavior.WhenScrollable;
    this.HorizontalScrollBarInset = ScrollBarInset.None;
    this.MidImage = "rbxasset://textures/ui/Scroll/scroll-middle.png";
    this.ScrollBarImageColor3 = Color3.FromRGB(255, 255, 255);
    this.ScrollBarImageTransparency = 0;
    this.ScrollBarThickness = 12;
    this.ScrollingDirection = ScrollingDirection.XY;
    this.ScrollingEnabled = true;
    this.TopImage = "rbxasset://textures/ui/Scroll/scroll-top.png";
    this.VerticalScrollBarInset = ScrollBarInset.None;
    this.VerticalScrollBarPosition = VerticalScrollBarPosition.Right;
    this.Active = false;
    this.ClipsDescendants = true;
    this.Selectable = true;
    this.SelectionGroup = true;
  }
  get AutomaticCanvasSize() {
    return this.GetProp(
      "AutomaticCanvasSize",
      18
      /* Enum */
    );
  }
  set AutomaticCanvasSize(value) {
    this.SetProp("AutomaticCanvasSize", 18, value);
  }
  get BottomImage() {
    return this.GetProp(
      "BottomImage",
      1
      /* String */
    );
  }
  set BottomImage(value) {
    this.SetProp("BottomImage", 1, value);
  }
  get CanvasPosition() {
    return this.GetProp(
      "CanvasPosition",
      13
      /* Vector2 */
    );
  }
  set CanvasPosition(value) {
    this.SetProp("CanvasPosition", 13, value);
  }
  get CanvasSize() {
    return this.GetProp(
      "CanvasSize",
      7
      /* UDim2 */
    );
  }
  set CanvasSize(value) {
    this.SetProp("CanvasSize", 7, value);
  }
  get ElasticBehavior() {
    return this.GetProp(
      "ElasticBehavior",
      18
      /* Enum */
    );
  }
  set ElasticBehavior(value) {
    this.SetProp("ElasticBehavior", 18, value);
  }
  get HorizontalScrollBarInset() {
    return this.GetProp(
      "HorizontalScrollBarInset",
      18
      /* Enum */
    );
  }
  set HorizontalScrollBarInset(value) {
    this.SetProp("HorizontalScrollBarInset", 18, value);
  }
  get MidImage() {
    return this.GetProp(
      "MidImage",
      1
      /* String */
    );
  }
  set MidImage(value) {
    this.SetProp("MidImage", 1, value);
  }
  get ScrollBarImageColor3() {
    return this.GetProp(
      "ScrollBarImageColor3",
      12
      /* Color3 */
    );
  }
  set ScrollBarImageColor3(value) {
    this.SetProp("ScrollBarImageColor3", 12, value);
  }
  get ScrollBarImageTransparency() {
    return this.GetProp(
      "ScrollBarImageTransparency",
      4
      /* Float32 */
    );
  }
  set ScrollBarImageTransparency(value) {
    this.SetProp("ScrollBarImageTransparency", 4, value);
  }
  get ScrollBarThickness() {
    return this.GetProp(
      "ScrollBarThickness",
      3
      /* Int32 */
    );
  }
  set ScrollBarThickness(value) {
    this.SetProp("ScrollBarThickness", 3, value);
  }
  get ScrollingDirection() {
    return this.GetProp(
      "ScrollingDirection",
      18
      /* Enum */
    );
  }
  set ScrollingDirection(value) {
    this.SetProp("ScrollingDirection", 18, value);
  }
  get ScrollingEnabled() {
    return this.GetProp(
      "ScrollingEnabled",
      2
      /* Bool */
    );
  }
  set ScrollingEnabled(value) {
    this.SetProp("ScrollingEnabled", 2, value);
  }
  get TopImage() {
    return this.GetProp(
      "TopImage",
      1
      /* String */
    );
  }
  set TopImage(value) {
    this.SetProp("TopImage", 1, value);
  }
  get VerticalScrollBarInset() {
    return this.GetProp(
      "VerticalScrollBarInset",
      18
      /* Enum */
    );
  }
  set VerticalScrollBarInset(value) {
    this.SetProp("VerticalScrollBarInset", 18, value);
  }
  get VerticalScrollBarPosition() {
    return this.GetProp(
      "VerticalScrollBarPosition",
      18
      /* Enum */
    );
  }
  set VerticalScrollBarPosition(value) {
    this.SetProp("VerticalScrollBarPosition", 18, value);
  }
};
var TextBox = class extends GuiObject {
  constructor() {
    super();
    this.addClassName("TextBox");
    this.Name = "TextBox";
    this.ClearTextOnFocus = true;
    this.FontSize = FontSize.Size8;
    this.LineHeight = 1;
    this.LocalizationMatchIdentifier = "";
    this.LocalizationMatchedSourceText = "";
    this.MaxVisibleGraphemes = -1;
    this.MultiLine = false;
    this.OpenTypeFeatures = "";
    this.PlaceholderColor3 = Color3.FromRGB(179, 179, 179);
    this.PlaceholderText = "";
    this.RichText = false;
    this.ShowNativeInput = true;
    this.Text = "TextBox";
    this.TextColor3 = Color3.FromRGB(27, 42, 53);
    this.TextDirection = TextDirection.Auto;
    this.TextEditable = true;
    this.TextScaled = false;
    this.TextSize = 8;
    this.TextStrokeColor3 = Color3.FromRGB(0, 0, 0);
    this.TextStrokeTransparency = 1;
    this.TextTransparency = 0;
    this.TextTruncate = TextTruncate.None;
    this.TextWrap = false;
    this.TextWrapped = false;
    this.TextXAlignment = TextXAlignment.Center;
    this.TextYAlignment = TextYAlignment.Center;
    this.FontFace = new RBXMFont(
      "rbxasset://fonts/families/LegacyArial.json",
      400,
      0
      /* Normal */
    );
    this.Active = true;
    this.ClipsDescendants = false;
    this.Selectable = true;
    this.SelectionGroup = false;
  }
  get ClearTextOnFocus() {
    return this.GetProp(
      "ClearTextOnFocus",
      2
      /* Bool */
    );
  }
  set ClearTextOnFocus(value) {
    this.SetProp("ClearTextOnFocus", 2, value);
  }
  get FontFace() {
    return this.GetProp(
      "FontFace",
      32
      /* Font */
    );
  }
  set FontFace(value) {
    this.SetProp("FontFace", 32, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get FontSize() {
    return this.GetProp(
      "FontSize",
      18
      /* Enum */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set FontSize(value) {
    this.SetProp("FontSize", 18, value);
  }
  get LineHeight() {
    return this.GetProp(
      "LineHeight",
      4
      /* Float32 */
    );
  }
  set LineHeight(value) {
    this.SetProp("LineHeight", 4, value);
  }
  get LocalizationMatchIdentifier() {
    return this.GetProp(
      "LocalizationMatchIdentifier",
      1
      /* String */
    );
  }
  set LocalizationMatchIdentifier(value) {
    this.SetProp("LocalizationMatchIdentifier", 1, value);
  }
  get LocalizationMatchedSourceText() {
    return this.GetProp(
      "LocalizationMatchedSourceText",
      1
      /* String */
    );
  }
  set LocalizationMatchedSourceText(value) {
    this.SetProp("LocalizationMatchedSourceText", 1, value);
  }
  get MaxVisibleGraphemes() {
    return this.GetProp(
      "MaxVisibleGraphemes",
      3
      /* Int32 */
    );
  }
  set MaxVisibleGraphemes(value) {
    this.SetProp("MaxVisibleGraphemes", 3, value);
  }
  get MultiLine() {
    return this.GetProp(
      "MultiLine",
      2
      /* Bool */
    );
  }
  set MultiLine(value) {
    this.SetProp("MultiLine", 2, value);
  }
  get OpenTypeFeatures() {
    return this.GetProp(
      "OpenTypeFeatures",
      1
      /* String */
    );
  }
  set OpenTypeFeatures(value) {
    this.SetProp("OpenTypeFeatures", 1, value);
  }
  get PlaceholderColor3() {
    return this.GetProp(
      "PlaceholderColor3",
      12
      /* Color3 */
    );
  }
  set PlaceholderColor3(value) {
    this.SetProp("PlaceholderColor3", 12, value);
  }
  get PlaceholderText() {
    return this.GetProp(
      "PlaceholderText",
      1
      /* String */
    );
  }
  set PlaceholderText(value) {
    this.SetProp("PlaceholderText", 1, value);
  }
  get RichText() {
    return this.GetProp(
      "RichText",
      2
      /* Bool */
    );
  }
  set RichText(value) {
    this.SetProp("RichText", 2, value);
  }
  get ShowNativeInput() {
    return this.GetProp(
      "ShowNativeInput",
      2
      /* Bool */
    );
  }
  set ShowNativeInput(value) {
    this.SetProp("ShowNativeInput", 2, value);
  }
  get Text() {
    return this.GetProp(
      "Text",
      1
      /* String */
    );
  }
  set Text(value) {
    this.SetProp("Text", 1, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get TextColor() {
    return this.GetProp(
      "TextColor",
      11
      /* BrickColor */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set TextColor(value) {
    this.SetProp("TextColor", 11, value);
  }
  get TextColor3() {
    return this.GetProp(
      "TextColor3",
      12
      /* Color3 */
    );
  }
  set TextColor3(value) {
    this.SetProp("TextColor3", 12, value);
  }
  get TextDirection() {
    return this.GetProp(
      "TextDirection",
      18
      /* Enum */
    );
  }
  set TextDirection(value) {
    this.SetProp("TextDirection", 18, value);
  }
  get TextEditable() {
    return this.GetProp(
      "TextEditable",
      2
      /* Bool */
    );
  }
  set TextEditable(value) {
    this.SetProp("TextEditable", 2, value);
  }
  get TextScaled() {
    return this.GetProp(
      "TextScaled",
      2
      /* Bool */
    );
  }
  set TextScaled(value) {
    this.SetProp("TextScaled", 2, value);
  }
  get TextSize() {
    return this.GetProp(
      "TextSize",
      4
      /* Float32 */
    );
  }
  set TextSize(value) {
    this.SetProp("TextSize", 4, value);
  }
  get TextStrokeColor3() {
    return this.GetProp(
      "TextStrokeColor3",
      12
      /* Color3 */
    );
  }
  set TextStrokeColor3(value) {
    this.SetProp("TextStrokeColor3", 12, value);
  }
  get TextStrokeTransparency() {
    return this.GetProp(
      "TextStrokeTransparency",
      4
      /* Float32 */
    );
  }
  set TextStrokeTransparency(value) {
    this.SetProp("TextStrokeTransparency", 4, value);
  }
  get TextTransparency() {
    return this.GetProp(
      "TextTransparency",
      4
      /* Float32 */
    );
  }
  set TextTransparency(value) {
    this.SetProp("TextTransparency", 4, value);
  }
  get TextTruncate() {
    return this.GetProp(
      "TextTruncate",
      18
      /* Enum */
    );
  }
  set TextTruncate(value) {
    this.SetProp("TextTruncate", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get TextWrap() {
    return this.GetProp(
      "TextWrap",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set TextWrap(value) {
    this.SetProp("TextWrap", 2, value);
  }
  get TextWrapped() {
    return this.GetProp(
      "TextWrapped",
      2
      /* Bool */
    );
  }
  set TextWrapped(value) {
    this.SetProp("TextWrapped", 2, value);
  }
  get TextXAlignment() {
    return this.GetProp(
      "TextXAlignment",
      18
      /* Enum */
    );
  }
  set TextXAlignment(value) {
    this.SetProp("TextXAlignment", 18, value);
  }
  get TextYAlignment() {
    return this.GetProp(
      "TextYAlignment",
      18
      /* Enum */
    );
  }
  set TextYAlignment(value) {
    this.SetProp("TextYAlignment", 18, value);
  }
};
var VideoDisplay = class extends GuiObject {
  constructor() {
    super();
    this.addClassName("VideoDisplay");
    this.Name = "VideoDisplay";
    this.ResampleMode = ResamplerMode.Default;
    this.ScaleType = ScaleType.Stretch;
    this.TileSize = new UDim2(new UDim(1, 0), new UDim(1, 0));
    this.VideoColor3 = Color3.FromRGB(255, 255, 255);
    this.VideoRectOffset = new Vector2(0, 0);
    this.VideoRectSize = new Vector2(0, 0);
    this.VideoTransparency = 0;
  }
  get ResampleMode() {
    return this.GetProp(
      "ResampleMode",
      18
      /* Enum */
    );
  }
  set ResampleMode(value) {
    this.SetProp("ResampleMode", 18, value);
  }
  get ScaleType() {
    return this.GetProp(
      "ScaleType",
      18
      /* Enum */
    );
  }
  set ScaleType(value) {
    this.SetProp("ScaleType", 18, value);
  }
  get TileSize() {
    return this.GetProp(
      "TileSize",
      7
      /* UDim2 */
    );
  }
  set TileSize(value) {
    this.SetProp("TileSize", 7, value);
  }
  get VideoColor3() {
    return this.GetProp(
      "VideoColor3",
      12
      /* Color3 */
    );
  }
  set VideoColor3(value) {
    this.SetProp("VideoColor3", 12, value);
  }
  get VideoRectOffset() {
    return this.GetProp(
      "VideoRectOffset",
      13
      /* Vector2 */
    );
  }
  set VideoRectOffset(value) {
    this.SetProp("VideoRectOffset", 13, value);
  }
  get VideoRectSize() {
    return this.GetProp(
      "VideoRectSize",
      13
      /* Vector2 */
    );
  }
  set VideoRectSize(value) {
    this.SetProp("VideoRectSize", 13, value);
  }
  get VideoTransparency() {
    return this.GetProp(
      "VideoTransparency",
      4
      /* Float32 */
    );
  }
  set VideoTransparency(value) {
    this.SetProp("VideoTransparency", 4, value);
  }
};
var VideoFrame = class extends GuiObject {
  constructor() {
    super();
    this.addClassName("VideoFrame");
    this.Name = "VideoFrame";
    this.Looped = false;
    this.Playing = false;
    this.TimePosition = 0;
    this.Video = "";
    this.Volume = 1;
    this.Active = false;
    this.ClipsDescendants = false;
    this.Selectable = false;
    this.SelectionGroup = false;
  }
  get Looped() {
    return this.GetProp(
      "Looped",
      2
      /* Bool */
    );
  }
  set Looped(value) {
    this.SetProp("Looped", 2, value);
  }
  get Playing() {
    return this.GetProp(
      "Playing",
      2
      /* Bool */
    );
  }
  set Playing(value) {
    this.SetProp("Playing", 2, value);
  }
  get TimePosition() {
    return this.GetProp(
      "TimePosition",
      5
      /* Float64 */
    );
  }
  set TimePosition(value) {
    this.SetProp("TimePosition", 5, value);
  }
  get Video() {
    return this.GetProp(
      "Video",
      1
      /* String */
    );
  }
  set Video(value) {
    this.SetProp("Video", 1, value);
  }
  get VideoContent() {
    return this.GetProp(
      "VideoContent",
      1
      /* String */
    );
  }
  set VideoContent(value) {
    this.SetProp("VideoContent", 1, value);
  }
  get Volume() {
    return this.GetProp(
      "Volume",
      4
      /* Float32 */
    );
  }
  set Volume(value) {
    this.SetProp("Volume", 4, value);
  }
};
var ViewportFrame = class extends GuiObject {
  constructor() {
    super();
    this.addClassName("ViewportFrame");
    this.Name = "ViewportFrame";
    this.Ambient = Color3.FromRGB(200, 200, 200);
    this.CameraFieldOfView = 1.22173;
    this.ImageColor3 = Color3.FromRGB(255, 255, 255);
    this.ImageTransparency = 0;
    this.LightColor = Color3.FromRGB(140, 140, 140);
    this.LightDirection = new Vector3(-1, -1, -1);
    this.Active = false;
    this.ClipsDescendants = false;
    this.Selectable = false;
    this.SelectionGroup = false;
  }
  get Ambient() {
    return this.GetProp(
      "Ambient",
      12
      /* Color3 */
    );
  }
  set Ambient(value) {
    this.SetProp("Ambient", 12, value);
  }
  get CameraCFrame() {
    return this.GetProp(
      "CameraCFrame",
      16
      /* CFrame */
    );
  }
  set CameraCFrame(value) {
    this.SetProp("CameraCFrame", 16, value);
  }
  get CameraFieldOfView() {
    return this.GetProp(
      "CameraFieldOfView",
      4
      /* Float32 */
    );
  }
  set CameraFieldOfView(value) {
    this.SetProp("CameraFieldOfView", 4, value);
  }
  get ImageColor3() {
    return this.GetProp(
      "ImageColor3",
      12
      /* Color3 */
    );
  }
  set ImageColor3(value) {
    this.SetProp("ImageColor3", 12, value);
  }
  get ImageTransparency() {
    return this.GetProp(
      "ImageTransparency",
      4
      /* Float32 */
    );
  }
  set ImageTransparency(value) {
    this.SetProp("ImageTransparency", 4, value);
  }
  get LightColor() {
    return this.GetProp(
      "LightColor",
      12
      /* Color3 */
    );
  }
  set LightColor(value) {
    this.SetProp("LightColor", 12, value);
  }
  get LightDirection() {
    return this.GetProp(
      "LightDirection",
      14
      /* Vector3 */
    );
  }
  set LightDirection(value) {
    this.SetProp("LightDirection", 14, value);
  }
};
var LayerCollector = class extends GuiBase2d {
  constructor() {
    super();
    this.addClassName("LayerCollector");
    this.Enabled = true;
    this.ResetOnSpawn = true;
    this.ZIndexBehavior = ZIndexBehavior.Global;
    this.SelectionGroup = false;
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get ResetOnSpawn() {
    return this.GetProp(
      "ResetOnSpawn",
      2
      /* Bool */
    );
  }
  set ResetOnSpawn(value) {
    this.SetProp("ResetOnSpawn", 2, value);
  }
  get ZIndexBehavior() {
    return this.GetProp(
      "ZIndexBehavior",
      18
      /* Enum */
    );
  }
  set ZIndexBehavior(value) {
    this.SetProp("ZIndexBehavior", 18, value);
  }
};
var BillboardGui = class extends LayerCollector {
  constructor() {
    super();
    this.addClassName("BillboardGui");
    this.Name = "BillboardGui";
    this.Active = false;
    this.AlwaysOnTop = false;
    this.Brightness = 1;
    this.ClipsDescendants = false;
    this.DistanceLowerLimit = 0;
    this.DistanceStep = 0;
    this.DistanceUpperLimit = -1;
    this.ExtentsOffset = new Vector3(0, 0, 0);
    this.ExtentsOffsetWorldSpace = new Vector3(0, 0, 0);
    this.LightInfluence = 0;
    this.MaxDistance = Infinity;
    this.Size = new UDim2(new UDim(0, 0), new UDim(0, 0));
    this.SizeOffset = new Vector2(0, 0);
    this.StudsOffset = new Vector3(0, 0, 0);
    this.StudsOffsetWorldSpace = new Vector3(0, 0, 0);
  }
  get Active() {
    return this.GetProp(
      "Active",
      2
      /* Bool */
    );
  }
  set Active(value) {
    this.SetProp("Active", 2, value);
  }
  get Adornee() {
    return this.GetProp(
      "Adornee",
      19
      /* Referent */
    );
  }
  set Adornee(value) {
    this.SetProp("Adornee", 19, value);
  }
  get AlwaysOnTop() {
    return this.GetProp(
      "AlwaysOnTop",
      2
      /* Bool */
    );
  }
  set AlwaysOnTop(value) {
    this.SetProp("AlwaysOnTop", 2, value);
  }
  get Brightness() {
    return this.GetProp(
      "Brightness",
      4
      /* Float32 */
    );
  }
  set Brightness(value) {
    this.SetProp("Brightness", 4, value);
  }
  get ClipsDescendants() {
    return this.GetProp(
      "ClipsDescendants",
      2
      /* Bool */
    );
  }
  set ClipsDescendants(value) {
    this.SetProp("ClipsDescendants", 2, value);
  }
  get DistanceLowerLimit() {
    return this.GetProp(
      "DistanceLowerLimit",
      4
      /* Float32 */
    );
  }
  set DistanceLowerLimit(value) {
    this.SetProp("DistanceLowerLimit", 4, value);
  }
  get DistanceStep() {
    return this.GetProp(
      "DistanceStep",
      4
      /* Float32 */
    );
  }
  set DistanceStep(value) {
    this.SetProp("DistanceStep", 4, value);
  }
  get DistanceUpperLimit() {
    return this.GetProp(
      "DistanceUpperLimit",
      4
      /* Float32 */
    );
  }
  set DistanceUpperLimit(value) {
    this.SetProp("DistanceUpperLimit", 4, value);
  }
  get ExtentsOffset() {
    return this.GetProp(
      "ExtentsOffset",
      14
      /* Vector3 */
    );
  }
  set ExtentsOffset(value) {
    this.SetProp("ExtentsOffset", 14, value);
  }
  get ExtentsOffsetWorldSpace() {
    return this.GetProp(
      "ExtentsOffsetWorldSpace",
      14
      /* Vector3 */
    );
  }
  set ExtentsOffsetWorldSpace(value) {
    this.SetProp("ExtentsOffsetWorldSpace", 14, value);
  }
  get LightInfluence() {
    return this.GetProp(
      "LightInfluence",
      4
      /* Float32 */
    );
  }
  set LightInfluence(value) {
    this.SetProp("LightInfluence", 4, value);
  }
  get MaxDistance() {
    return this.GetProp(
      "MaxDistance",
      4
      /* Float32 */
    );
  }
  set MaxDistance(value) {
    this.SetProp("MaxDistance", 4, value);
  }
  get PlayerToHideFrom() {
    return this.GetProp(
      "PlayerToHideFrom",
      19
      /* Referent */
    );
  }
  set PlayerToHideFrom(value) {
    this.SetProp("PlayerToHideFrom", 19, value);
  }
  get Size() {
    return this.GetProp(
      "Size",
      7
      /* UDim2 */
    );
  }
  set Size(value) {
    this.SetProp("Size", 7, value);
  }
  get SizeOffset() {
    return this.GetProp(
      "SizeOffset",
      13
      /* Vector2 */
    );
  }
  set SizeOffset(value) {
    this.SetProp("SizeOffset", 13, value);
  }
  get StudsOffset() {
    return this.GetProp(
      "StudsOffset",
      14
      /* Vector3 */
    );
  }
  set StudsOffset(value) {
    this.SetProp("StudsOffset", 14, value);
  }
  get StudsOffsetWorldSpace() {
    return this.GetProp(
      "StudsOffsetWorldSpace",
      14
      /* Vector3 */
    );
  }
  set StudsOffsetWorldSpace(value) {
    this.SetProp("StudsOffsetWorldSpace", 14, value);
  }
};
var ScreenGui = class extends LayerCollector {
  constructor() {
    super();
    this.addClassName("ScreenGui");
    this.Name = "ScreenGui";
    this.ClipToDeviceSafeArea = true;
    this.DisplayOrder = 0;
    this.SafeAreaCompatibility = SafeAreaCompatibility.FullscreenExtension;
    this.ScreenInsets = ScreenInsets.CoreUISafeInsets;
  }
  get ClipToDeviceSafeArea() {
    return this.GetProp(
      "ClipToDeviceSafeArea",
      2
      /* Bool */
    );
  }
  set ClipToDeviceSafeArea(value) {
    this.SetProp("ClipToDeviceSafeArea", 2, value);
  }
  get DisplayOrder() {
    return this.GetProp(
      "DisplayOrder",
      3
      /* Int32 */
    );
  }
  set DisplayOrder(value) {
    this.SetProp("DisplayOrder", 3, value);
  }
  get SafeAreaCompatibility() {
    return this.GetProp(
      "SafeAreaCompatibility",
      18
      /* Enum */
    );
  }
  set SafeAreaCompatibility(value) {
    this.SetProp("SafeAreaCompatibility", 18, value);
  }
  get ScreenInsets() {
    return this.GetProp(
      "ScreenInsets",
      18
      /* Enum */
    );
  }
  set ScreenInsets(value) {
    this.SetProp("ScreenInsets", 18, value);
  }
};
var GuiMain = class extends ScreenGui {
  constructor() {
    super();
    this.addClassName("GuiMain");
    this.Name = "GuiMain";
  }
};
var SurfaceGuiBase = class extends LayerCollector {
  constructor() {
    super();
    this.addClassName("SurfaceGuiBase");
    this.Active = true;
    this.Face = NormalId.Front;
  }
  get Active() {
    return this.GetProp(
      "Active",
      2
      /* Bool */
    );
  }
  set Active(value) {
    this.SetProp("Active", 2, value);
  }
  get Adornee() {
    return this.GetProp(
      "Adornee",
      19
      /* Referent */
    );
  }
  set Adornee(value) {
    this.SetProp("Adornee", 19, value);
  }
  get Face() {
    return this.GetProp(
      "Face",
      18
      /* Enum */
    );
  }
  set Face(value) {
    this.SetProp("Face", 18, value);
  }
};
var AdGui = class extends SurfaceGuiBase {
  constructor() {
    super();
    this.addClassName("AdGui");
    this.Name = "AdGui";
    this.AdShape = AdShape.HorizontalRectangle;
    this.EnableVideoAds = true;
    this.FallbackImage = "";
  }
  get AdShape() {
    return this.GetProp(
      "AdShape",
      18
      /* Enum */
    );
  }
  set AdShape(value) {
    this.SetProp("AdShape", 18, value);
  }
  get EnableVideoAds() {
    return this.GetProp(
      "EnableVideoAds",
      2
      /* Bool */
    );
  }
  set EnableVideoAds(value) {
    this.SetProp("EnableVideoAds", 2, value);
  }
  get FallbackImage() {
    return this.GetProp(
      "FallbackImage",
      1
      /* String */
    );
  }
  set FallbackImage(value) {
    this.SetProp("FallbackImage", 1, value);
  }
};
var SurfaceGui = class extends SurfaceGuiBase {
  constructor() {
    super();
    this.addClassName("SurfaceGui");
    this.Name = "SurfaceGui";
    this.AlwaysOnTop = false;
    this.Brightness = 1;
    this.CanvasSize = new Vector2(800, 600);
    this.ClipsDescendants = false;
    this.LightInfluence = 0;
    this.MaxDistance = 0;
    this.PixelsPerStud = 50;
    this.SizingMode = SurfaceGuiSizingMode.FixedSize;
    this.ToolPunchThroughDistance = 0;
    this.ZOffset = 0;
  }
  get AlwaysOnTop() {
    return this.GetProp(
      "AlwaysOnTop",
      2
      /* Bool */
    );
  }
  set AlwaysOnTop(value) {
    this.SetProp("AlwaysOnTop", 2, value);
  }
  get Brightness() {
    return this.GetProp(
      "Brightness",
      4
      /* Float32 */
    );
  }
  set Brightness(value) {
    this.SetProp("Brightness", 4, value);
  }
  get CanvasSize() {
    return this.GetProp(
      "CanvasSize",
      13
      /* Vector2 */
    );
  }
  set CanvasSize(value) {
    this.SetProp("CanvasSize", 13, value);
  }
  get ClipsDescendants() {
    return this.GetProp(
      "ClipsDescendants",
      2
      /* Bool */
    );
  }
  set ClipsDescendants(value) {
    this.SetProp("ClipsDescendants", 2, value);
  }
  get LightInfluence() {
    return this.GetProp(
      "LightInfluence",
      4
      /* Float32 */
    );
  }
  set LightInfluence(value) {
    this.SetProp("LightInfluence", 4, value);
  }
  get MaxDistance() {
    return this.GetProp(
      "MaxDistance",
      4
      /* Float32 */
    );
  }
  set MaxDistance(value) {
    this.SetProp("MaxDistance", 4, value);
  }
  get PixelsPerStud() {
    return this.GetProp(
      "PixelsPerStud",
      4
      /* Float32 */
    );
  }
  set PixelsPerStud(value) {
    this.SetProp("PixelsPerStud", 4, value);
  }
  get SizingMode() {
    return this.GetProp(
      "SizingMode",
      18
      /* Enum */
    );
  }
  set SizingMode(value) {
    this.SetProp("SizingMode", 18, value);
  }
  get ToolPunchThroughDistance() {
    return this.GetProp(
      "ToolPunchThroughDistance",
      4
      /* Float32 */
    );
  }
  set ToolPunchThroughDistance(value) {
    this.SetProp("ToolPunchThroughDistance", 4, value);
  }
  get ZOffset() {
    return this.GetProp(
      "ZOffset",
      4
      /* Float32 */
    );
  }
  set ZOffset(value) {
    this.SetProp("ZOffset", 4, value);
  }
};
var GuiBase3d = class extends GuiBase {
  constructor() {
    super();
    this.addClassName("GuiBase3d");
    this.Transparency = 0;
    this.Visible = true;
  }
  /**@deprecated Deprecated by Roblox*/
  get Color() {
    return this.GetProp(
      "Color",
      11
      /* BrickColor */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Color(value) {
    this.SetProp("Color", 11, value);
  }
  get Color3() {
    return this.GetProp(
      "Color3",
      12
      /* Color3 */
    );
  }
  set Color3(value) {
    this.SetProp("Color3", 12, value);
  }
  get Transparency() {
    return this.GetProp(
      "Transparency",
      4
      /* Float32 */
    );
  }
  set Transparency(value) {
    this.SetProp("Transparency", 4, value);
  }
  get Visible() {
    return this.GetProp(
      "Visible",
      2
      /* Bool */
    );
  }
  set Visible(value) {
    this.SetProp("Visible", 2, value);
  }
};
var FloorWire = class extends GuiBase3d {
  constructor() {
    super();
    this.addClassName("FloorWire");
    this.Name = "FloorWire";
    this.CycleOffset = 0;
    this.StudsBetweenTextures = 4;
    this.Texture = "";
    this.TextureSize = new Vector2(1, 1);
    this.Velocity = 2;
    this.WireRadius = 0.0625;
    this.Color3 = Color3.FromRGB(13, 105, 172);
  }
  get CycleOffset() {
    return this.GetProp(
      "CycleOffset",
      4
      /* Float32 */
    );
  }
  set CycleOffset(value) {
    this.SetProp("CycleOffset", 4, value);
  }
  get From() {
    return this.GetProp(
      "From",
      19
      /* Referent */
    );
  }
  set From(value) {
    this.SetProp("From", 19, value);
  }
  get StudsBetweenTextures() {
    return this.GetProp(
      "StudsBetweenTextures",
      4
      /* Float32 */
    );
  }
  set StudsBetweenTextures(value) {
    this.SetProp("StudsBetweenTextures", 4, value);
  }
  get Texture() {
    return this.GetProp(
      "Texture",
      1
      /* String */
    );
  }
  set Texture(value) {
    this.SetProp("Texture", 1, value);
  }
  get TextureSize() {
    return this.GetProp(
      "TextureSize",
      13
      /* Vector2 */
    );
  }
  set TextureSize(value) {
    this.SetProp("TextureSize", 13, value);
  }
  get To() {
    return this.GetProp(
      "To",
      19
      /* Referent */
    );
  }
  set To(value) {
    this.SetProp("To", 19, value);
  }
  get Velocity() {
    return this.GetProp(
      "Velocity",
      4
      /* Float32 */
    );
  }
  set Velocity(value) {
    this.SetProp("Velocity", 4, value);
  }
  get WireRadius() {
    return this.GetProp(
      "WireRadius",
      4
      /* Float32 */
    );
  }
  set WireRadius(value) {
    this.SetProp("WireRadius", 4, value);
  }
};
var InstanceAdornment = class extends GuiBase3d {
  constructor() {
    super();
    this.addClassName("InstanceAdornment");
    this.Color3 = Color3.FromRGB(13, 105, 172);
  }
  get Adornee() {
    return this.GetProp(
      "Adornee",
      19
      /* Referent */
    );
  }
  set Adornee(value) {
    this.SetProp("Adornee", 19, value);
  }
};
var SelectionBox = class extends InstanceAdornment {
  constructor() {
    super();
    this.addClassName("SelectionBox");
    this.Name = "SelectionBox";
    this.LineThickness = 0.15;
    this.StudioSelectionBox = false;
    this.SurfaceColor3 = Color3.FromRGB(13, 105, 172);
    this.SurfaceTransparency = 1;
  }
  get LineThickness() {
    return this.GetProp(
      "LineThickness",
      4
      /* Float32 */
    );
  }
  set LineThickness(value) {
    this.SetProp("LineThickness", 4, value);
  }
  get StudioSelectionBox() {
    return this.GetProp(
      "StudioSelectionBox",
      2
      /* Bool */
    );
  }
  set StudioSelectionBox(value) {
    this.SetProp("StudioSelectionBox", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get SurfaceColor() {
    return this.GetProp(
      "SurfaceColor",
      11
      /* BrickColor */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set SurfaceColor(value) {
    this.SetProp("SurfaceColor", 11, value);
  }
  get SurfaceColor3() {
    return this.GetProp(
      "SurfaceColor3",
      12
      /* Color3 */
    );
  }
  set SurfaceColor3(value) {
    this.SetProp("SurfaceColor3", 12, value);
  }
  get SurfaceTransparency() {
    return this.GetProp(
      "SurfaceTransparency",
      4
      /* Float32 */
    );
  }
  set SurfaceTransparency(value) {
    this.SetProp("SurfaceTransparency", 4, value);
  }
};
var PVAdornment = class extends GuiBase3d {
  constructor() {
    super();
    this.addClassName("PVAdornment");
  }
  get Adornee() {
    return this.GetProp(
      "Adornee",
      19
      /* Referent */
    );
  }
  set Adornee(value) {
    this.SetProp("Adornee", 19, value);
  }
};
var HandleAdornment = class extends PVAdornment {
  constructor() {
    super();
    this.addClassName("HandleAdornment");
    this.AdornCullingMode = AdornCullingMode.Automatic;
    this.AlwaysOnTop = false;
    this.CFrame = CFrame.Identity;
    this.SizeRelativeOffset = new Vector3(0, 0, 0);
    this.ZIndex = -1;
  }
  get AdornCullingMode() {
    return this.GetProp(
      "AdornCullingMode",
      18
      /* Enum */
    );
  }
  set AdornCullingMode(value) {
    this.SetProp("AdornCullingMode", 18, value);
  }
  get AlwaysOnTop() {
    return this.GetProp(
      "AlwaysOnTop",
      2
      /* Bool */
    );
  }
  set AlwaysOnTop(value) {
    this.SetProp("AlwaysOnTop", 2, value);
  }
  get CFrame() {
    return this.GetProp(
      "CFrame",
      16
      /* CFrame */
    );
  }
  set CFrame(value) {
    this.SetProp("CFrame", 16, value);
  }
  get SizeRelativeOffset() {
    return this.GetProp(
      "SizeRelativeOffset",
      14
      /* Vector3 */
    );
  }
  set SizeRelativeOffset(value) {
    this.SetProp("SizeRelativeOffset", 14, value);
  }
  get ZIndex() {
    return this.GetProp(
      "ZIndex",
      3
      /* Int32 */
    );
  }
  set ZIndex(value) {
    this.SetProp("ZIndex", 3, value);
  }
};
var BoxHandleAdornment = class extends HandleAdornment {
  constructor() {
    super();
    this.addClassName("BoxHandleAdornment");
    this.Name = "BoxHandleAdornment";
    this.Size = new Vector3(1, 1, 1);
    this.Color3 = Color3.FromRGB(13, 105, 172);
  }
  get Size() {
    return this.GetProp(
      "Size",
      14
      /* Vector3 */
    );
  }
  set Size(value) {
    this.SetProp("Size", 14, value);
  }
};
var ConeHandleAdornment = class extends HandleAdornment {
  constructor() {
    super();
    this.addClassName("ConeHandleAdornment");
    this.Name = "ConeHandleAdornment";
    this.Height = 2;
    this.Radius = 0.5;
    this.Color3 = Color3.FromRGB(13, 105, 172);
  }
  get Height() {
    return this.GetProp(
      "Height",
      4
      /* Float32 */
    );
  }
  set Height(value) {
    this.SetProp("Height", 4, value);
  }
  get Radius() {
    return this.GetProp(
      "Radius",
      4
      /* Float32 */
    );
  }
  set Radius(value) {
    this.SetProp("Radius", 4, value);
  }
};
var CylinderHandleAdornment = class extends HandleAdornment {
  constructor() {
    super();
    this.addClassName("CylinderHandleAdornment");
    this.Name = "CylinderHandleAdornment";
    this.Angle = 360;
    this.Height = 1;
    this.InnerRadius = 0;
    this.Radius = 1;
    this.Color3 = Color3.FromRGB(13, 105, 172);
  }
  get Angle() {
    return this.GetProp(
      "Angle",
      4
      /* Float32 */
    );
  }
  set Angle(value) {
    this.SetProp("Angle", 4, value);
  }
  get Height() {
    return this.GetProp(
      "Height",
      4
      /* Float32 */
    );
  }
  set Height(value) {
    this.SetProp("Height", 4, value);
  }
  get InnerRadius() {
    return this.GetProp(
      "InnerRadius",
      4
      /* Float32 */
    );
  }
  set InnerRadius(value) {
    this.SetProp("InnerRadius", 4, value);
  }
  get Radius() {
    return this.GetProp(
      "Radius",
      4
      /* Float32 */
    );
  }
  set Radius(value) {
    this.SetProp("Radius", 4, value);
  }
};
var ImageHandleAdornment = class extends HandleAdornment {
  constructor() {
    super();
    this.addClassName("ImageHandleAdornment");
    this.Name = "ImageHandleAdornment";
    this.Image = "rbxasset://textures/SurfacesDefault.png";
    this.Size = new Vector2(1, 1);
    this.Color3 = Color3.FromRGB(242, 243, 243);
  }
  get Image() {
    return this.GetProp(
      "Image",
      1
      /* String */
    );
  }
  set Image(value) {
    this.SetProp("Image", 1, value);
  }
  get Size() {
    return this.GetProp(
      "Size",
      13
      /* Vector2 */
    );
  }
  set Size(value) {
    this.SetProp("Size", 13, value);
  }
};
var LineHandleAdornment = class extends HandleAdornment {
  constructor() {
    super();
    this.addClassName("LineHandleAdornment");
    this.Name = "LineHandleAdornment";
    this.Length = 5;
    this.Thickness = 1;
    this.Color3 = Color3.FromRGB(13, 105, 172);
  }
  get Length() {
    return this.GetProp(
      "Length",
      4
      /* Float32 */
    );
  }
  set Length(value) {
    this.SetProp("Length", 4, value);
  }
  get Thickness() {
    return this.GetProp(
      "Thickness",
      4
      /* Float32 */
    );
  }
  set Thickness(value) {
    this.SetProp("Thickness", 4, value);
  }
};
var SphereHandleAdornment = class extends HandleAdornment {
  constructor() {
    super();
    this.addClassName("SphereHandleAdornment");
    this.Name = "SphereHandleAdornment";
    this.Radius = 1;
    this.Color3 = Color3.FromRGB(13, 105, 172);
  }
  get Radius() {
    return this.GetProp(
      "Radius",
      4
      /* Float32 */
    );
  }
  set Radius(value) {
    this.SetProp("Radius", 4, value);
  }
};
var WireframeHandleAdornment = class extends HandleAdornment {
  constructor() {
    super();
    this.addClassName("WireframeHandleAdornment");
    this.Name = "WireframeHandleAdornment";
    this.Scale = new Vector3(1, 1, 1);
    this.Thickness = 1;
    this.Color3 = Color3.FromRGB(13, 105, 172);
  }
  get Scale() {
    return this.GetProp(
      "Scale",
      14
      /* Vector3 */
    );
  }
  set Scale(value) {
    this.SetProp("Scale", 14, value);
  }
  get Thickness() {
    return this.GetProp(
      "Thickness",
      4
      /* Float32 */
    );
  }
  set Thickness(value) {
    this.SetProp("Thickness", 4, value);
  }
};
var ParabolaAdornment = class extends PVAdornment {
  constructor() {
    super();
    this.addClassName("ParabolaAdornment");
    this.Name = "ParabolaAdornment";
  }
};
var SelectionSphere = class extends PVAdornment {
  constructor() {
    super();
    this.addClassName("SelectionSphere");
    this.Name = "SelectionSphere";
    this.SurfaceColor3 = Color3.FromRGB(13, 105, 172);
    this.SurfaceTransparency = 1;
    this.Color3 = Color3.FromRGB(13, 105, 172);
  }
  /**@deprecated Deprecated by Roblox*/
  get SurfaceColor() {
    return this.GetProp(
      "SurfaceColor",
      11
      /* BrickColor */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set SurfaceColor(value) {
    this.SetProp("SurfaceColor", 11, value);
  }
  get SurfaceColor3() {
    return this.GetProp(
      "SurfaceColor3",
      12
      /* Color3 */
    );
  }
  set SurfaceColor3(value) {
    this.SetProp("SurfaceColor3", 12, value);
  }
  get SurfaceTransparency() {
    return this.GetProp(
      "SurfaceTransparency",
      4
      /* Float32 */
    );
  }
  set SurfaceTransparency(value) {
    this.SetProp("SurfaceTransparency", 4, value);
  }
};
var PartAdornment = class extends GuiBase3d {
  constructor() {
    super();
    this.addClassName("PartAdornment");
    this.Color3 = Color3.FromRGB(13, 105, 172);
  }
  get Adornee() {
    return this.GetProp(
      "Adornee",
      19
      /* Referent */
    );
  }
  set Adornee(value) {
    this.SetProp("Adornee", 19, value);
  }
};
var HandlesBase = class extends PartAdornment {
  constructor() {
    super();
    this.addClassName("HandlesBase");
  }
};
var ArcHandles = class extends HandlesBase {
  constructor() {
    super();
    this.addClassName("ArcHandles");
    this.Name = "ArcHandles";
    this.Axes = new Axes(
      1,
      2,
      4
      /* Z */
    );
  }
  get Axes() {
    return this.GetProp(
      "Axes",
      10
      /* Axes */
    );
  }
  set Axes(value) {
    this.SetProp("Axes", 10, value);
  }
};
var Handles = class extends HandlesBase {
  constructor() {
    super();
    this.addClassName("Handles");
    this.Name = "Handles";
    this.Faces = new Faces(
      32,
      16,
      8,
      4,
      2,
      1
      /* Front */
    );
    this.Style = HandlesStyle.Resize;
  }
  get Faces() {
    return this.GetProp(
      "Faces",
      9
      /* Faces */
    );
  }
  set Faces(value) {
    this.SetProp("Faces", 9, value);
  }
  get Style() {
    return this.GetProp(
      "Style",
      18
      /* Enum */
    );
  }
  set Style(value) {
    this.SetProp("Style", 18, value);
  }
};
var SurfaceSelection = class extends PartAdornment {
  constructor() {
    super();
    this.addClassName("SurfaceSelection");
    this.Name = "SurfaceSelection";
    this.TargetSurface = NormalId.Right;
  }
  get TargetSurface() {
    return this.GetProp(
      "TargetSurface",
      18
      /* Enum */
    );
  }
  set TargetSurface(value) {
    this.SetProp("TargetSurface", 18, value);
  }
};
var SelectionLasso = class extends GuiBase3d {
  constructor() {
    super();
    this.addClassName("SelectionLasso");
    this.Color3 = Color3.FromRGB(13, 105, 172);
  }
  get Humanoid() {
    return this.GetProp(
      "Humanoid",
      19
      /* Referent */
    );
  }
  set Humanoid(value) {
    this.SetProp("Humanoid", 19, value);
  }
};
var SelectionPartLasso = class extends SelectionLasso {
  constructor() {
    super();
    this.addClassName("SelectionPartLasso");
    this.Name = "SelectionPartLasso";
  }
  get Part() {
    return this.GetProp(
      "Part",
      19
      /* Referent */
    );
  }
  set Part(value) {
    this.SetProp("Part", 19, value);
  }
};
var SelectionPointLasso = class extends SelectionLasso {
  constructor() {
    super();
    this.addClassName("SelectionPointLasso");
    this.Name = "SelectionPointLasso";
    this.Point = new Vector3(0, 0, 0);
  }
  get Point() {
    return this.GetProp(
      "Point",
      14
      /* Vector3 */
    );
  }
  set Point(value) {
    this.SetProp("Point", 14, value);
  }
};
var Path2D = class extends GuiBase {
  constructor() {
    super();
    this.addClassName("Path2D");
    this.Name = "Path2D";
    this.Closed = false;
    this.Color3 = Color3.FromRGB(0, 0, 0);
    this.PropertiesSerialize = "";
    this.Thickness = 1;
    this.Transparency = 0;
    this.Visible = true;
    this.ZIndex = 1;
  }
  get Closed() {
    return this.GetProp(
      "Closed",
      2
      /* Bool */
    );
  }
  set Closed(value) {
    this.SetProp("Closed", 2, value);
  }
  get Color3() {
    return this.GetProp(
      "Color3",
      12
      /* Color3 */
    );
  }
  set Color3(value) {
    this.SetProp("Color3", 12, value);
  }
  get PropertiesSerialize() {
    return this.GetProp(
      "PropertiesSerialize",
      1
      /* String */
    );
  }
  set PropertiesSerialize(value) {
    this.SetProp("PropertiesSerialize", 1, value);
  }
  get Thickness() {
    return this.GetProp(
      "Thickness",
      4
      /* Float32 */
    );
  }
  set Thickness(value) {
    this.SetProp("Thickness", 4, value);
  }
  get Transparency() {
    return this.GetProp(
      "Transparency",
      4
      /* Float32 */
    );
  }
  set Transparency(value) {
    this.SetProp("Transparency", 4, value);
  }
  get Visible() {
    return this.GetProp(
      "Visible",
      2
      /* Bool */
    );
  }
  set Visible(value) {
    this.SetProp("Visible", 2, value);
  }
  get ZIndex() {
    return this.GetProp(
      "ZIndex",
      3
      /* Int32 */
    );
  }
  set ZIndex(value) {
    this.SetProp("ZIndex", 3, value);
  }
};
var GuiService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("GuiService");
    this.Name = "GuiService";
    this.AutoSelectGuiEnabled = true;
    this.GuiNavigationEnabled = true;
  }
  get AutoSelectGuiEnabled() {
    return this.GetProp(
      "AutoSelectGuiEnabled",
      2
      /* Bool */
    );
  }
  set AutoSelectGuiEnabled(value) {
    this.SetProp("AutoSelectGuiEnabled", 2, value);
  }
  get GuiNavigationEnabled() {
    return this.GetProp(
      "GuiNavigationEnabled",
      2
      /* Bool */
    );
  }
  set GuiNavigationEnabled(value) {
    this.SetProp("GuiNavigationEnabled", 2, value);
  }
  get SelectedObject() {
    return this.GetProp(
      "SelectedObject",
      19
      /* Referent */
    );
  }
  set SelectedObject(value) {
    this.SetProp("SelectedObject", 19, value);
  }
};
var GuidRegistryService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("GuidRegistryService");
    this.Name = "GuidRegistryService";
  }
};
var HapticEffect = class extends Instance {
  constructor() {
    super();
    this.addClassName("HapticEffect");
    this.Name = "HapticEffect";
    this.Looped = false;
    this.Position = new Vector3(0, 0, 0);
    this.Radius = 3;
    this.Type = HapticEffectType.UIClick;
  }
  get Looped() {
    return this.GetProp(
      "Looped",
      2
      /* Bool */
    );
  }
  set Looped(value) {
    this.SetProp("Looped", 2, value);
  }
  get Position() {
    return this.GetProp(
      "Position",
      14
      /* Vector3 */
    );
  }
  set Position(value) {
    this.SetProp("Position", 14, value);
  }
  get Radius() {
    return this.GetProp(
      "Radius",
      4
      /* Float32 */
    );
  }
  set Radius(value) {
    this.SetProp("Radius", 4, value);
  }
  get Type() {
    return this.GetProp(
      "Type",
      18
      /* Enum */
    );
  }
  set Type(value) {
    this.SetProp("Type", 18, value);
  }
  get Waveform() {
    return this.GetProp(
      "Waveform",
      19
      /* Referent */
    );
  }
  set Waveform(value) {
    this.SetProp("Waveform", 19, value);
  }
};
var HapticService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("HapticService");
    this.Name = "HapticService";
  }
};
var HeapProfilerService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("HeapProfilerService");
    this.Name = "HeapProfilerService";
  }
};
var HeatmapService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("HeatmapService");
    this.Name = "HeatmapService";
  }
};
var HeightmapImporterService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("HeightmapImporterService");
    this.Name = "HeightmapImporterService";
  }
};
var HiddenSurfaceRemovalAsset = class extends Instance {
  constructor() {
    super();
    this.addClassName("HiddenSurfaceRemovalAsset");
    this.Name = "HiddenSurfaceRemovalAsset";
    this.HSRData = "";
    this.HSRMeshIdData = "";
  }
  get HSRData() {
    return this.GetProp(
      "HSRData",
      1
      /* String */
    );
  }
  set HSRData(value) {
    this.SetProp("HSRData", 1, value);
  }
  get HSRMeshIdData() {
    return this.GetProp(
      "HSRMeshIdData",
      1
      /* String */
    );
  }
  set HSRMeshIdData(value) {
    this.SetProp("HSRMeshIdData", 1, value);
  }
};
var Highlight = class extends Instance {
  constructor() {
    super();
    this.addClassName("Highlight");
    this.Name = "Highlight";
    this.DepthMode = HighlightDepthMode.AlwaysOnTop;
    this.Enabled = true;
    this.FillColor = Color3.FromRGB(255, 0, 0);
    this.FillTransparency = 0.5;
    this.OutlineColor = Color3.FromRGB(255, 255, 255);
    this.OutlineTransparency = 0;
  }
  get Adornee() {
    return this.GetProp(
      "Adornee",
      19
      /* Referent */
    );
  }
  set Adornee(value) {
    this.SetProp("Adornee", 19, value);
  }
  get DepthMode() {
    return this.GetProp(
      "DepthMode",
      18
      /* Enum */
    );
  }
  set DepthMode(value) {
    this.SetProp("DepthMode", 18, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get FillColor() {
    return this.GetProp(
      "FillColor",
      12
      /* Color3 */
    );
  }
  set FillColor(value) {
    this.SetProp("FillColor", 12, value);
  }
  get FillTransparency() {
    return this.GetProp(
      "FillTransparency",
      4
      /* Float32 */
    );
  }
  set FillTransparency(value) {
    this.SetProp("FillTransparency", 4, value);
  }
  get OutlineColor() {
    return this.GetProp(
      "OutlineColor",
      12
      /* Color3 */
    );
  }
  set OutlineColor(value) {
    this.SetProp("OutlineColor", 12, value);
  }
  get OutlineTransparency() {
    return this.GetProp(
      "OutlineTransparency",
      4
      /* Float32 */
    );
  }
  set OutlineTransparency(value) {
    this.SetProp("OutlineTransparency", 4, value);
  }
};
var Hopper = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("Hopper");
    this.Name = "Hopper";
  }
};
var HttpRbxApiService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("HttpRbxApiService");
    this.Name = "HttpRbxApiService";
  }
};
var HttpService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("HttpService");
    this.Name = "HttpService";
    this.HttpEnabled = false;
  }
  get HttpEnabled() {
    return this.GetProp(
      "HttpEnabled",
      2
      /* Bool */
    );
  }
  set HttpEnabled(value) {
    this.SetProp("HttpEnabled", 2, value);
  }
};
var Humanoid = class extends Instance {
  constructor() {
    super();
    this.addClassName("Humanoid");
    this.Name = "Humanoid";
    this.AutoJumpEnabled = true;
    this.AutoRotate = true;
    this.AutomaticScalingEnabled = true;
    this.BreakJointsOnDeath = true;
    this.CollisionType = HumanoidCollisionType.OuterBox;
    this.DisplayDistanceType = HumanoidDisplayDistanceType.Viewer;
    this.DisplayName = "";
    this.EvaluateStateMachine = true;
    this.HealthDisplayDistance = 100;
    this.HealthDisplayType = HumanoidHealthDisplayType.DisplayWhenDamaged;
    this.HealthXML = 100;
    this.HipHeight = 0;
    this.InternalBodyScale = new Vector3(1, 1, 1);
    this.InternalHeadScale = 1;
    this.JumpHeight = 7.2;
    this.JumpPower = 50;
    this.MaxHealth = 100;
    this.MaxSlopeAngle = 89;
    this.NameDisplayDistance = 100;
    this.NameOcclusion = NameOcclusion.OccludeAll;
    this.RequiresNeck = true;
    this.RigType = HumanoidRigType.R6;
    this.UseJumpPower = true;
    this.WalkSpeed = 16;
  }
  get AutoJumpEnabled() {
    return this.GetProp(
      "AutoJumpEnabled",
      2
      /* Bool */
    );
  }
  set AutoJumpEnabled(value) {
    this.SetProp("AutoJumpEnabled", 2, value);
  }
  get AutoRotate() {
    return this.GetProp(
      "AutoRotate",
      2
      /* Bool */
    );
  }
  set AutoRotate(value) {
    this.SetProp("AutoRotate", 2, value);
  }
  get AutomaticScalingEnabled() {
    return this.GetProp(
      "AutomaticScalingEnabled",
      2
      /* Bool */
    );
  }
  set AutomaticScalingEnabled(value) {
    this.SetProp("AutomaticScalingEnabled", 2, value);
  }
  get BreakJointsOnDeath() {
    return this.GetProp(
      "BreakJointsOnDeath",
      2
      /* Bool */
    );
  }
  set BreakJointsOnDeath(value) {
    this.SetProp("BreakJointsOnDeath", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get CollisionType() {
    return this.GetProp(
      "CollisionType",
      18
      /* Enum */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set CollisionType(value) {
    this.SetProp("CollisionType", 18, value);
  }
  get DisplayDistanceType() {
    return this.GetProp(
      "DisplayDistanceType",
      18
      /* Enum */
    );
  }
  set DisplayDistanceType(value) {
    this.SetProp("DisplayDistanceType", 18, value);
  }
  get DisplayName() {
    return this.GetProp(
      "DisplayName",
      1
      /* String */
    );
  }
  set DisplayName(value) {
    this.SetProp("DisplayName", 1, value);
  }
  get EvaluateStateMachine() {
    return this.GetProp(
      "EvaluateStateMachine",
      2
      /* Bool */
    );
  }
  set EvaluateStateMachine(value) {
    this.SetProp("EvaluateStateMachine", 2, value);
  }
  get HealthDisplayDistance() {
    return this.GetProp(
      "HealthDisplayDistance",
      4
      /* Float32 */
    );
  }
  set HealthDisplayDistance(value) {
    this.SetProp("HealthDisplayDistance", 4, value);
  }
  get HealthDisplayType() {
    return this.GetProp(
      "HealthDisplayType",
      18
      /* Enum */
    );
  }
  set HealthDisplayType(value) {
    this.SetProp("HealthDisplayType", 18, value);
  }
  get HealthXML() {
    return this.GetProp(
      "Health_XML",
      4
      /* Float32 */
    );
  }
  set HealthXML(value) {
    this.SetProp("Health_XML", 4, value);
  }
  get HipHeight() {
    return this.GetProp(
      "HipHeight",
      4
      /* Float32 */
    );
  }
  set HipHeight(value) {
    this.SetProp("HipHeight", 4, value);
  }
  get InternalBodyScale() {
    return this.GetProp(
      "InternalBodyScale",
      14
      /* Vector3 */
    );
  }
  set InternalBodyScale(value) {
    this.SetProp("InternalBodyScale", 14, value);
  }
  get InternalHeadScale() {
    return this.GetProp(
      "InternalHeadScale",
      4
      /* Float32 */
    );
  }
  set InternalHeadScale(value) {
    this.SetProp("InternalHeadScale", 4, value);
  }
  get JumpHeight() {
    return this.GetProp(
      "JumpHeight",
      4
      /* Float32 */
    );
  }
  set JumpHeight(value) {
    this.SetProp("JumpHeight", 4, value);
  }
  get JumpPower() {
    return this.GetProp(
      "JumpPower",
      4
      /* Float32 */
    );
  }
  set JumpPower(value) {
    this.SetProp("JumpPower", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get LeftLeg() {
    return this.GetProp(
      "LeftLeg",
      19
      /* Referent */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set LeftLeg(value) {
    this.SetProp("LeftLeg", 19, value);
  }
  get MaxHealth() {
    return this.GetProp(
      "MaxHealth",
      4
      /* Float32 */
    );
  }
  set MaxHealth(value) {
    this.SetProp("MaxHealth", 4, value);
  }
  get MaxSlopeAngle() {
    return this.GetProp(
      "MaxSlopeAngle",
      4
      /* Float32 */
    );
  }
  set MaxSlopeAngle(value) {
    this.SetProp("MaxSlopeAngle", 4, value);
  }
  get NameDisplayDistance() {
    return this.GetProp(
      "NameDisplayDistance",
      4
      /* Float32 */
    );
  }
  set NameDisplayDistance(value) {
    this.SetProp("NameDisplayDistance", 4, value);
  }
  get NameOcclusion() {
    return this.GetProp(
      "NameOcclusion",
      18
      /* Enum */
    );
  }
  set NameOcclusion(value) {
    this.SetProp("NameOcclusion", 18, value);
  }
  get RequiresNeck() {
    return this.GetProp(
      "RequiresNeck",
      2
      /* Bool */
    );
  }
  set RequiresNeck(value) {
    this.SetProp("RequiresNeck", 2, value);
  }
  get RigType() {
    return this.GetProp(
      "RigType",
      18
      /* Enum */
    );
  }
  set RigType(value) {
    this.SetProp("RigType", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get RightLeg() {
    return this.GetProp(
      "RightLeg",
      19
      /* Referent */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set RightLeg(value) {
    this.SetProp("RightLeg", 19, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Torso() {
    return this.GetProp(
      "Torso",
      19
      /* Referent */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Torso(value) {
    this.SetProp("Torso", 19, value);
  }
  get UseJumpPower() {
    return this.GetProp(
      "UseJumpPower",
      2
      /* Bool */
    );
  }
  set UseJumpPower(value) {
    this.SetProp("UseJumpPower", 2, value);
  }
  get WalkSpeed() {
    return this.GetProp(
      "WalkSpeed",
      4
      /* Float32 */
    );
  }
  set WalkSpeed(value) {
    this.SetProp("WalkSpeed", 4, value);
  }
};
var HumanoidDescription = class extends Instance {
  constructor() {
    super();
    this.addClassName("HumanoidDescription");
    this.Name = "HumanoidDescription";
    this.BodyTypeScale = 0.3;
    this.ClimbAnimation = BigInt(0);
    this.DepthScale = 1;
    this.EmotesDataInternal = "";
    this.EquippedEmotesDataInternal = "";
    this.Face = BigInt(0);
    this.FallAnimation = BigInt(0);
    this.GraphicTShirt = BigInt(0);
    this.HeadScale = 1;
    this.HeightScale = 1;
    this.IdleAnimation = BigInt(0);
    this.JumpAnimation = BigInt(0);
    this.MoodAnimation = BigInt(0);
    this.Pants = BigInt(0);
    this.ProportionScale = 1;
    this.RunAnimation = BigInt(0);
    this.Shirt = BigInt(0);
    this.SwimAnimation = BigInt(0);
    this.WalkAnimation = BigInt(0);
    this.WidthScale = 1;
  }
  get BodyTypeScale() {
    return this.GetProp(
      "BodyTypeScale",
      4
      /* Float32 */
    );
  }
  set BodyTypeScale(value) {
    this.SetProp("BodyTypeScale", 4, value);
  }
  get ClimbAnimation() {
    return this.GetProp(
      "ClimbAnimation",
      27
      /* Int64 */
    );
  }
  set ClimbAnimation(value) {
    this.SetProp("ClimbAnimation", 27, value);
  }
  get DepthScale() {
    return this.GetProp(
      "DepthScale",
      4
      /* Float32 */
    );
  }
  set DepthScale(value) {
    this.SetProp("DepthScale", 4, value);
  }
  get EmotesDataInternal() {
    return this.GetProp(
      "EmotesDataInternal",
      1
      /* String */
    );
  }
  set EmotesDataInternal(value) {
    this.SetProp("EmotesDataInternal", 1, value);
  }
  get EquippedEmotesDataInternal() {
    return this.GetProp(
      "EquippedEmotesDataInternal",
      1
      /* String */
    );
  }
  set EquippedEmotesDataInternal(value) {
    this.SetProp("EquippedEmotesDataInternal", 1, value);
  }
  get Face() {
    return this.GetProp(
      "Face",
      27
      /* Int64 */
    );
  }
  set Face(value) {
    this.SetProp("Face", 27, value);
  }
  get FallAnimation() {
    return this.GetProp(
      "FallAnimation",
      27
      /* Int64 */
    );
  }
  set FallAnimation(value) {
    this.SetProp("FallAnimation", 27, value);
  }
  get GraphicTShirt() {
    return this.GetProp(
      "GraphicTShirt",
      27
      /* Int64 */
    );
  }
  set GraphicTShirt(value) {
    this.SetProp("GraphicTShirt", 27, value);
  }
  get HeadScale() {
    return this.GetProp(
      "HeadScale",
      4
      /* Float32 */
    );
  }
  set HeadScale(value) {
    this.SetProp("HeadScale", 4, value);
  }
  get HeightScale() {
    return this.GetProp(
      "HeightScale",
      4
      /* Float32 */
    );
  }
  set HeightScale(value) {
    this.SetProp("HeightScale", 4, value);
  }
  get IdleAnimation() {
    return this.GetProp(
      "IdleAnimation",
      27
      /* Int64 */
    );
  }
  set IdleAnimation(value) {
    this.SetProp("IdleAnimation", 27, value);
  }
  get JumpAnimation() {
    return this.GetProp(
      "JumpAnimation",
      27
      /* Int64 */
    );
  }
  set JumpAnimation(value) {
    this.SetProp("JumpAnimation", 27, value);
  }
  get MoodAnimation() {
    return this.GetProp(
      "MoodAnimation",
      27
      /* Int64 */
    );
  }
  set MoodAnimation(value) {
    this.SetProp("MoodAnimation", 27, value);
  }
  get Pants() {
    return this.GetProp(
      "Pants",
      27
      /* Int64 */
    );
  }
  set Pants(value) {
    this.SetProp("Pants", 27, value);
  }
  get ProportionScale() {
    return this.GetProp(
      "ProportionScale",
      4
      /* Float32 */
    );
  }
  set ProportionScale(value) {
    this.SetProp("ProportionScale", 4, value);
  }
  get RunAnimation() {
    return this.GetProp(
      "RunAnimation",
      27
      /* Int64 */
    );
  }
  set RunAnimation(value) {
    this.SetProp("RunAnimation", 27, value);
  }
  get Shirt() {
    return this.GetProp(
      "Shirt",
      27
      /* Int64 */
    );
  }
  set Shirt(value) {
    this.SetProp("Shirt", 27, value);
  }
  get SwimAnimation() {
    return this.GetProp(
      "SwimAnimation",
      27
      /* Int64 */
    );
  }
  set SwimAnimation(value) {
    this.SetProp("SwimAnimation", 27, value);
  }
  get WalkAnimation() {
    return this.GetProp(
      "WalkAnimation",
      27
      /* Int64 */
    );
  }
  set WalkAnimation(value) {
    this.SetProp("WalkAnimation", 27, value);
  }
  get WidthScale() {
    return this.GetProp(
      "WidthScale",
      4
      /* Float32 */
    );
  }
  set WidthScale(value) {
    this.SetProp("WidthScale", 4, value);
  }
};
var HumanoidRigDescription = class extends Instance {
  constructor() {
    super();
    this.addClassName("HumanoidRigDescription");
    this.Name = "HumanoidRigDescription";
    this.ChestRangeMax = new Vector3(0, 0, 0);
    this.ChestRangeMin = new Vector3(0, 0, 0);
    this.ChestSize = 0;
    this.HeadRangeMax = new Vector3(0, 0, 0);
    this.HeadRangeMin = new Vector3(0, 0, 0);
    this.HeadSize = 0;
    this.LeftAnkleRangeMax = new Vector3(0, 0, 0);
    this.LeftAnkleRangeMin = new Vector3(0, 0, 0);
    this.LeftAnkleSize = 0;
    this.LeftClavicleRangeMax = new Vector3(0, 0, 0);
    this.LeftClavicleRangeMin = new Vector3(0, 0, 0);
    this.LeftClavicleSize = 0;
    this.LeftElbowRangeMax = new Vector3(0, 0, 0);
    this.LeftElbowRangeMin = new Vector3(0, 0, 0);
    this.LeftElbowSize = 0;
    this.LeftHipRangeMax = new Vector3(0, 0, 0);
    this.LeftHipRangeMin = new Vector3(0, 0, 0);
    this.LeftHipSize = 0;
    this.LeftKneeRangeMax = new Vector3(0, 0, 0);
    this.LeftKneeRangeMin = new Vector3(0, 0, 0);
    this.LeftKneeSize = 0;
    this.LeftShoulderRangeMax = new Vector3(0, 0, 0);
    this.LeftShoulderRangeMin = new Vector3(0, 0, 0);
    this.LeftShoulderSize = 0;
    this.LeftToesRangeMax = new Vector3(0, 0, 0);
    this.LeftToesRangeMin = new Vector3(0, 0, 0);
    this.LeftToesSize = 0;
    this.LeftWristRangeMax = new Vector3(0, 0, 0);
    this.LeftWristRangeMin = new Vector3(0, 0, 0);
    this.LeftWristSize = 0;
    this.NeckRangeMax = new Vector3(0, 0, 0);
    this.NeckRangeMin = new Vector3(0, 0, 0);
    this.NeckSize = 0;
    this.PelvisRangeMax = new Vector3(0, 0, 0);
    this.PelvisRangeMin = new Vector3(0, 0, 0);
    this.PelvisSize = 0;
    this.RightAnkleRangeMax = new Vector3(0, 0, 0);
    this.RightAnkleRangeMin = new Vector3(0, 0, 0);
    this.RightAnkleSize = 0;
    this.RightClavicleRangeMax = new Vector3(0, 0, 0);
    this.RightClavicleRangeMin = new Vector3(0, 0, 0);
    this.RightClavicleSize = 0;
    this.RightElbowRangeMax = new Vector3(0, 0, 0);
    this.RightElbowRangeMin = new Vector3(0, 0, 0);
    this.RightElbowSize = 0;
    this.RightHipRangeMax = new Vector3(0, 0, 0);
    this.RightHipRangeMin = new Vector3(0, 0, 0);
    this.RightHipSize = 0;
    this.RightKneeRangeMax = new Vector3(0, 0, 0);
    this.RightKneeRangeMin = new Vector3(0, 0, 0);
    this.RightKneeSize = 0;
    this.RightShoulderRangeMax = new Vector3(0, 0, 0);
    this.RightShoulderRangeMin = new Vector3(0, 0, 0);
    this.RightShoulderSize = 0;
    this.RightToesRangeMax = new Vector3(0, 0, 0);
    this.RightToesRangeMin = new Vector3(0, 0, 0);
    this.RightToesSize = 0;
    this.RightWristRangeMax = new Vector3(0, 0, 0);
    this.RightWristRangeMin = new Vector3(0, 0, 0);
    this.RightWristSize = 0;
    this.RootRangeMax = new Vector3(0, 0, 0);
    this.RootRangeMin = new Vector3(0, 0, 0);
    this.RootSize = 0;
    this.WaistRangeMax = new Vector3(0, 0, 0);
    this.WaistRangeMin = new Vector3(0, 0, 0);
    this.WaistSize = 0;
  }
  get Chest() {
    return this.GetProp(
      "Chest",
      19
      /* Referent */
    );
  }
  set Chest(value) {
    this.SetProp("Chest", 19, value);
  }
  get ChestRangeMax() {
    return this.GetProp(
      "ChestRangeMax",
      14
      /* Vector3 */
    );
  }
  set ChestRangeMax(value) {
    this.SetProp("ChestRangeMax", 14, value);
  }
  get ChestRangeMin() {
    return this.GetProp(
      "ChestRangeMin",
      14
      /* Vector3 */
    );
  }
  set ChestRangeMin(value) {
    this.SetProp("ChestRangeMin", 14, value);
  }
  get ChestSize() {
    return this.GetProp(
      "ChestSize",
      4
      /* Float32 */
    );
  }
  set ChestSize(value) {
    this.SetProp("ChestSize", 4, value);
  }
  get ChestTposeAdjustment() {
    return this.GetProp(
      "ChestTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set ChestTposeAdjustment(value) {
    this.SetProp("ChestTposeAdjustment", 16, value);
  }
  get Head() {
    return this.GetProp(
      "Head",
      19
      /* Referent */
    );
  }
  set Head(value) {
    this.SetProp("Head", 19, value);
  }
  get HeadRangeMax() {
    return this.GetProp(
      "HeadRangeMax",
      14
      /* Vector3 */
    );
  }
  set HeadRangeMax(value) {
    this.SetProp("HeadRangeMax", 14, value);
  }
  get HeadRangeMin() {
    return this.GetProp(
      "HeadRangeMin",
      14
      /* Vector3 */
    );
  }
  set HeadRangeMin(value) {
    this.SetProp("HeadRangeMin", 14, value);
  }
  get HeadSize() {
    return this.GetProp(
      "HeadSize",
      4
      /* Float32 */
    );
  }
  set HeadSize(value) {
    this.SetProp("HeadSize", 4, value);
  }
  get HeadTposeAdjustment() {
    return this.GetProp(
      "HeadTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set HeadTposeAdjustment(value) {
    this.SetProp("HeadTposeAdjustment", 16, value);
  }
  get LeftAnkle() {
    return this.GetProp(
      "LeftAnkle",
      19
      /* Referent */
    );
  }
  set LeftAnkle(value) {
    this.SetProp("LeftAnkle", 19, value);
  }
  get LeftAnkleRangeMax() {
    return this.GetProp(
      "LeftAnkleRangeMax",
      14
      /* Vector3 */
    );
  }
  set LeftAnkleRangeMax(value) {
    this.SetProp("LeftAnkleRangeMax", 14, value);
  }
  get LeftAnkleRangeMin() {
    return this.GetProp(
      "LeftAnkleRangeMin",
      14
      /* Vector3 */
    );
  }
  set LeftAnkleRangeMin(value) {
    this.SetProp("LeftAnkleRangeMin", 14, value);
  }
  get LeftAnkleSize() {
    return this.GetProp(
      "LeftAnkleSize",
      4
      /* Float32 */
    );
  }
  set LeftAnkleSize(value) {
    this.SetProp("LeftAnkleSize", 4, value);
  }
  get LeftAnkleTposeAdjustment() {
    return this.GetProp(
      "LeftAnkleTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set LeftAnkleTposeAdjustment(value) {
    this.SetProp("LeftAnkleTposeAdjustment", 16, value);
  }
  get LeftClavicle() {
    return this.GetProp(
      "LeftClavicle",
      19
      /* Referent */
    );
  }
  set LeftClavicle(value) {
    this.SetProp("LeftClavicle", 19, value);
  }
  get LeftClavicleRangeMax() {
    return this.GetProp(
      "LeftClavicleRangeMax",
      14
      /* Vector3 */
    );
  }
  set LeftClavicleRangeMax(value) {
    this.SetProp("LeftClavicleRangeMax", 14, value);
  }
  get LeftClavicleRangeMin() {
    return this.GetProp(
      "LeftClavicleRangeMin",
      14
      /* Vector3 */
    );
  }
  set LeftClavicleRangeMin(value) {
    this.SetProp("LeftClavicleRangeMin", 14, value);
  }
  get LeftClavicleSize() {
    return this.GetProp(
      "LeftClavicleSize",
      4
      /* Float32 */
    );
  }
  set LeftClavicleSize(value) {
    this.SetProp("LeftClavicleSize", 4, value);
  }
  get LeftClavicleTposeAdjustment() {
    return this.GetProp(
      "LeftClavicleTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set LeftClavicleTposeAdjustment(value) {
    this.SetProp("LeftClavicleTposeAdjustment", 16, value);
  }
  get LeftElbow() {
    return this.GetProp(
      "LeftElbow",
      19
      /* Referent */
    );
  }
  set LeftElbow(value) {
    this.SetProp("LeftElbow", 19, value);
  }
  get LeftElbowRangeMax() {
    return this.GetProp(
      "LeftElbowRangeMax",
      14
      /* Vector3 */
    );
  }
  set LeftElbowRangeMax(value) {
    this.SetProp("LeftElbowRangeMax", 14, value);
  }
  get LeftElbowRangeMin() {
    return this.GetProp(
      "LeftElbowRangeMin",
      14
      /* Vector3 */
    );
  }
  set LeftElbowRangeMin(value) {
    this.SetProp("LeftElbowRangeMin", 14, value);
  }
  get LeftElbowSize() {
    return this.GetProp(
      "LeftElbowSize",
      4
      /* Float32 */
    );
  }
  set LeftElbowSize(value) {
    this.SetProp("LeftElbowSize", 4, value);
  }
  get LeftElbowTposeAdjustment() {
    return this.GetProp(
      "LeftElbowTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set LeftElbowTposeAdjustment(value) {
    this.SetProp("LeftElbowTposeAdjustment", 16, value);
  }
  get LeftHip() {
    return this.GetProp(
      "LeftHip",
      19
      /* Referent */
    );
  }
  set LeftHip(value) {
    this.SetProp("LeftHip", 19, value);
  }
  get LeftHipRangeMax() {
    return this.GetProp(
      "LeftHipRangeMax",
      14
      /* Vector3 */
    );
  }
  set LeftHipRangeMax(value) {
    this.SetProp("LeftHipRangeMax", 14, value);
  }
  get LeftHipRangeMin() {
    return this.GetProp(
      "LeftHipRangeMin",
      14
      /* Vector3 */
    );
  }
  set LeftHipRangeMin(value) {
    this.SetProp("LeftHipRangeMin", 14, value);
  }
  get LeftHipSize() {
    return this.GetProp(
      "LeftHipSize",
      4
      /* Float32 */
    );
  }
  set LeftHipSize(value) {
    this.SetProp("LeftHipSize", 4, value);
  }
  get LeftHipTposeAdjustment() {
    return this.GetProp(
      "LeftHipTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set LeftHipTposeAdjustment(value) {
    this.SetProp("LeftHipTposeAdjustment", 16, value);
  }
  get LeftKnee() {
    return this.GetProp(
      "LeftKnee",
      19
      /* Referent */
    );
  }
  set LeftKnee(value) {
    this.SetProp("LeftKnee", 19, value);
  }
  get LeftKneeRangeMax() {
    return this.GetProp(
      "LeftKneeRangeMax",
      14
      /* Vector3 */
    );
  }
  set LeftKneeRangeMax(value) {
    this.SetProp("LeftKneeRangeMax", 14, value);
  }
  get LeftKneeRangeMin() {
    return this.GetProp(
      "LeftKneeRangeMin",
      14
      /* Vector3 */
    );
  }
  set LeftKneeRangeMin(value) {
    this.SetProp("LeftKneeRangeMin", 14, value);
  }
  get LeftKneeSize() {
    return this.GetProp(
      "LeftKneeSize",
      4
      /* Float32 */
    );
  }
  set LeftKneeSize(value) {
    this.SetProp("LeftKneeSize", 4, value);
  }
  get LeftKneeTposeAdjustment() {
    return this.GetProp(
      "LeftKneeTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set LeftKneeTposeAdjustment(value) {
    this.SetProp("LeftKneeTposeAdjustment", 16, value);
  }
  get LeftShoulder() {
    return this.GetProp(
      "LeftShoulder",
      19
      /* Referent */
    );
  }
  set LeftShoulder(value) {
    this.SetProp("LeftShoulder", 19, value);
  }
  get LeftShoulderRangeMax() {
    return this.GetProp(
      "LeftShoulderRangeMax",
      14
      /* Vector3 */
    );
  }
  set LeftShoulderRangeMax(value) {
    this.SetProp("LeftShoulderRangeMax", 14, value);
  }
  get LeftShoulderRangeMin() {
    return this.GetProp(
      "LeftShoulderRangeMin",
      14
      /* Vector3 */
    );
  }
  set LeftShoulderRangeMin(value) {
    this.SetProp("LeftShoulderRangeMin", 14, value);
  }
  get LeftShoulderSize() {
    return this.GetProp(
      "LeftShoulderSize",
      4
      /* Float32 */
    );
  }
  set LeftShoulderSize(value) {
    this.SetProp("LeftShoulderSize", 4, value);
  }
  get LeftShoulderTposeAdjustment() {
    return this.GetProp(
      "LeftShoulderTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set LeftShoulderTposeAdjustment(value) {
    this.SetProp("LeftShoulderTposeAdjustment", 16, value);
  }
  get LeftToes() {
    return this.GetProp(
      "LeftToes",
      19
      /* Referent */
    );
  }
  set LeftToes(value) {
    this.SetProp("LeftToes", 19, value);
  }
  get LeftToesRangeMax() {
    return this.GetProp(
      "LeftToesRangeMax",
      14
      /* Vector3 */
    );
  }
  set LeftToesRangeMax(value) {
    this.SetProp("LeftToesRangeMax", 14, value);
  }
  get LeftToesRangeMin() {
    return this.GetProp(
      "LeftToesRangeMin",
      14
      /* Vector3 */
    );
  }
  set LeftToesRangeMin(value) {
    this.SetProp("LeftToesRangeMin", 14, value);
  }
  get LeftToesSize() {
    return this.GetProp(
      "LeftToesSize",
      4
      /* Float32 */
    );
  }
  set LeftToesSize(value) {
    this.SetProp("LeftToesSize", 4, value);
  }
  get LeftToesTposeAdjustment() {
    return this.GetProp(
      "LeftToesTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set LeftToesTposeAdjustment(value) {
    this.SetProp("LeftToesTposeAdjustment", 16, value);
  }
  get LeftWrist() {
    return this.GetProp(
      "LeftWrist",
      19
      /* Referent */
    );
  }
  set LeftWrist(value) {
    this.SetProp("LeftWrist", 19, value);
  }
  get LeftWristRangeMax() {
    return this.GetProp(
      "LeftWristRangeMax",
      14
      /* Vector3 */
    );
  }
  set LeftWristRangeMax(value) {
    this.SetProp("LeftWristRangeMax", 14, value);
  }
  get LeftWristRangeMin() {
    return this.GetProp(
      "LeftWristRangeMin",
      14
      /* Vector3 */
    );
  }
  set LeftWristRangeMin(value) {
    this.SetProp("LeftWristRangeMin", 14, value);
  }
  get LeftWristSize() {
    return this.GetProp(
      "LeftWristSize",
      4
      /* Float32 */
    );
  }
  set LeftWristSize(value) {
    this.SetProp("LeftWristSize", 4, value);
  }
  get LeftWristTposeAdjustment() {
    return this.GetProp(
      "LeftWristTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set LeftWristTposeAdjustment(value) {
    this.SetProp("LeftWristTposeAdjustment", 16, value);
  }
  get Neck() {
    return this.GetProp(
      "Neck",
      19
      /* Referent */
    );
  }
  set Neck(value) {
    this.SetProp("Neck", 19, value);
  }
  get NeckRangeMax() {
    return this.GetProp(
      "NeckRangeMax",
      14
      /* Vector3 */
    );
  }
  set NeckRangeMax(value) {
    this.SetProp("NeckRangeMax", 14, value);
  }
  get NeckRangeMin() {
    return this.GetProp(
      "NeckRangeMin",
      14
      /* Vector3 */
    );
  }
  set NeckRangeMin(value) {
    this.SetProp("NeckRangeMin", 14, value);
  }
  get NeckSize() {
    return this.GetProp(
      "NeckSize",
      4
      /* Float32 */
    );
  }
  set NeckSize(value) {
    this.SetProp("NeckSize", 4, value);
  }
  get NeckTposeAdjustment() {
    return this.GetProp(
      "NeckTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set NeckTposeAdjustment(value) {
    this.SetProp("NeckTposeAdjustment", 16, value);
  }
  get Pelvis() {
    return this.GetProp(
      "Pelvis",
      19
      /* Referent */
    );
  }
  set Pelvis(value) {
    this.SetProp("Pelvis", 19, value);
  }
  get PelvisRangeMax() {
    return this.GetProp(
      "PelvisRangeMax",
      14
      /* Vector3 */
    );
  }
  set PelvisRangeMax(value) {
    this.SetProp("PelvisRangeMax", 14, value);
  }
  get PelvisRangeMin() {
    return this.GetProp(
      "PelvisRangeMin",
      14
      /* Vector3 */
    );
  }
  set PelvisRangeMin(value) {
    this.SetProp("PelvisRangeMin", 14, value);
  }
  get PelvisSize() {
    return this.GetProp(
      "PelvisSize",
      4
      /* Float32 */
    );
  }
  set PelvisSize(value) {
    this.SetProp("PelvisSize", 4, value);
  }
  get PelvisTposeAdjustment() {
    return this.GetProp(
      "PelvisTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set PelvisTposeAdjustment(value) {
    this.SetProp("PelvisTposeAdjustment", 16, value);
  }
  get RightAnkle() {
    return this.GetProp(
      "RightAnkle",
      19
      /* Referent */
    );
  }
  set RightAnkle(value) {
    this.SetProp("RightAnkle", 19, value);
  }
  get RightAnkleRangeMax() {
    return this.GetProp(
      "RightAnkleRangeMax",
      14
      /* Vector3 */
    );
  }
  set RightAnkleRangeMax(value) {
    this.SetProp("RightAnkleRangeMax", 14, value);
  }
  get RightAnkleRangeMin() {
    return this.GetProp(
      "RightAnkleRangeMin",
      14
      /* Vector3 */
    );
  }
  set RightAnkleRangeMin(value) {
    this.SetProp("RightAnkleRangeMin", 14, value);
  }
  get RightAnkleSize() {
    return this.GetProp(
      "RightAnkleSize",
      4
      /* Float32 */
    );
  }
  set RightAnkleSize(value) {
    this.SetProp("RightAnkleSize", 4, value);
  }
  get RightAnkleTposeAdjustment() {
    return this.GetProp(
      "RightAnkleTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set RightAnkleTposeAdjustment(value) {
    this.SetProp("RightAnkleTposeAdjustment", 16, value);
  }
  get RightClavicle() {
    return this.GetProp(
      "RightClavicle",
      19
      /* Referent */
    );
  }
  set RightClavicle(value) {
    this.SetProp("RightClavicle", 19, value);
  }
  get RightClavicleRangeMax() {
    return this.GetProp(
      "RightClavicleRangeMax",
      14
      /* Vector3 */
    );
  }
  set RightClavicleRangeMax(value) {
    this.SetProp("RightClavicleRangeMax", 14, value);
  }
  get RightClavicleRangeMin() {
    return this.GetProp(
      "RightClavicleRangeMin",
      14
      /* Vector3 */
    );
  }
  set RightClavicleRangeMin(value) {
    this.SetProp("RightClavicleRangeMin", 14, value);
  }
  get RightClavicleSize() {
    return this.GetProp(
      "RightClavicleSize",
      4
      /* Float32 */
    );
  }
  set RightClavicleSize(value) {
    this.SetProp("RightClavicleSize", 4, value);
  }
  get RightClavicleTposeAdjustment() {
    return this.GetProp(
      "RightClavicleTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set RightClavicleTposeAdjustment(value) {
    this.SetProp("RightClavicleTposeAdjustment", 16, value);
  }
  get RightElbow() {
    return this.GetProp(
      "RightElbow",
      19
      /* Referent */
    );
  }
  set RightElbow(value) {
    this.SetProp("RightElbow", 19, value);
  }
  get RightElbowRangeMax() {
    return this.GetProp(
      "RightElbowRangeMax",
      14
      /* Vector3 */
    );
  }
  set RightElbowRangeMax(value) {
    this.SetProp("RightElbowRangeMax", 14, value);
  }
  get RightElbowRangeMin() {
    return this.GetProp(
      "RightElbowRangeMin",
      14
      /* Vector3 */
    );
  }
  set RightElbowRangeMin(value) {
    this.SetProp("RightElbowRangeMin", 14, value);
  }
  get RightElbowSize() {
    return this.GetProp(
      "RightElbowSize",
      4
      /* Float32 */
    );
  }
  set RightElbowSize(value) {
    this.SetProp("RightElbowSize", 4, value);
  }
  get RightElbowTposeAdjustment() {
    return this.GetProp(
      "RightElbowTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set RightElbowTposeAdjustment(value) {
    this.SetProp("RightElbowTposeAdjustment", 16, value);
  }
  get RightHip() {
    return this.GetProp(
      "RightHip",
      19
      /* Referent */
    );
  }
  set RightHip(value) {
    this.SetProp("RightHip", 19, value);
  }
  get RightHipRangeMax() {
    return this.GetProp(
      "RightHipRangeMax",
      14
      /* Vector3 */
    );
  }
  set RightHipRangeMax(value) {
    this.SetProp("RightHipRangeMax", 14, value);
  }
  get RightHipRangeMin() {
    return this.GetProp(
      "RightHipRangeMin",
      14
      /* Vector3 */
    );
  }
  set RightHipRangeMin(value) {
    this.SetProp("RightHipRangeMin", 14, value);
  }
  get RightHipSize() {
    return this.GetProp(
      "RightHipSize",
      4
      /* Float32 */
    );
  }
  set RightHipSize(value) {
    this.SetProp("RightHipSize", 4, value);
  }
  get RightHipTposeAdjustment() {
    return this.GetProp(
      "RightHipTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set RightHipTposeAdjustment(value) {
    this.SetProp("RightHipTposeAdjustment", 16, value);
  }
  get RightKnee() {
    return this.GetProp(
      "RightKnee",
      19
      /* Referent */
    );
  }
  set RightKnee(value) {
    this.SetProp("RightKnee", 19, value);
  }
  get RightKneeRangeMax() {
    return this.GetProp(
      "RightKneeRangeMax",
      14
      /* Vector3 */
    );
  }
  set RightKneeRangeMax(value) {
    this.SetProp("RightKneeRangeMax", 14, value);
  }
  get RightKneeRangeMin() {
    return this.GetProp(
      "RightKneeRangeMin",
      14
      /* Vector3 */
    );
  }
  set RightKneeRangeMin(value) {
    this.SetProp("RightKneeRangeMin", 14, value);
  }
  get RightKneeSize() {
    return this.GetProp(
      "RightKneeSize",
      4
      /* Float32 */
    );
  }
  set RightKneeSize(value) {
    this.SetProp("RightKneeSize", 4, value);
  }
  get RightKneeTposeAdjustment() {
    return this.GetProp(
      "RightKneeTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set RightKneeTposeAdjustment(value) {
    this.SetProp("RightKneeTposeAdjustment", 16, value);
  }
  get RightShoulder() {
    return this.GetProp(
      "RightShoulder",
      19
      /* Referent */
    );
  }
  set RightShoulder(value) {
    this.SetProp("RightShoulder", 19, value);
  }
  get RightShoulderRangeMax() {
    return this.GetProp(
      "RightShoulderRangeMax",
      14
      /* Vector3 */
    );
  }
  set RightShoulderRangeMax(value) {
    this.SetProp("RightShoulderRangeMax", 14, value);
  }
  get RightShoulderRangeMin() {
    return this.GetProp(
      "RightShoulderRangeMin",
      14
      /* Vector3 */
    );
  }
  set RightShoulderRangeMin(value) {
    this.SetProp("RightShoulderRangeMin", 14, value);
  }
  get RightShoulderSize() {
    return this.GetProp(
      "RightShoulderSize",
      4
      /* Float32 */
    );
  }
  set RightShoulderSize(value) {
    this.SetProp("RightShoulderSize", 4, value);
  }
  get RightShoulderTposeAdjustment() {
    return this.GetProp(
      "RightShoulderTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set RightShoulderTposeAdjustment(value) {
    this.SetProp("RightShoulderTposeAdjustment", 16, value);
  }
  get RightToes() {
    return this.GetProp(
      "RightToes",
      19
      /* Referent */
    );
  }
  set RightToes(value) {
    this.SetProp("RightToes", 19, value);
  }
  get RightToesRangeMax() {
    return this.GetProp(
      "RightToesRangeMax",
      14
      /* Vector3 */
    );
  }
  set RightToesRangeMax(value) {
    this.SetProp("RightToesRangeMax", 14, value);
  }
  get RightToesRangeMin() {
    return this.GetProp(
      "RightToesRangeMin",
      14
      /* Vector3 */
    );
  }
  set RightToesRangeMin(value) {
    this.SetProp("RightToesRangeMin", 14, value);
  }
  get RightToesSize() {
    return this.GetProp(
      "RightToesSize",
      4
      /* Float32 */
    );
  }
  set RightToesSize(value) {
    this.SetProp("RightToesSize", 4, value);
  }
  get RightToesTposeAdjustment() {
    return this.GetProp(
      "RightToesTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set RightToesTposeAdjustment(value) {
    this.SetProp("RightToesTposeAdjustment", 16, value);
  }
  get RightWrist() {
    return this.GetProp(
      "RightWrist",
      19
      /* Referent */
    );
  }
  set RightWrist(value) {
    this.SetProp("RightWrist", 19, value);
  }
  get RightWristRangeMax() {
    return this.GetProp(
      "RightWristRangeMax",
      14
      /* Vector3 */
    );
  }
  set RightWristRangeMax(value) {
    this.SetProp("RightWristRangeMax", 14, value);
  }
  get RightWristRangeMin() {
    return this.GetProp(
      "RightWristRangeMin",
      14
      /* Vector3 */
    );
  }
  set RightWristRangeMin(value) {
    this.SetProp("RightWristRangeMin", 14, value);
  }
  get RightWristSize() {
    return this.GetProp(
      "RightWristSize",
      4
      /* Float32 */
    );
  }
  set RightWristSize(value) {
    this.SetProp("RightWristSize", 4, value);
  }
  get RightWristTposeAdjustment() {
    return this.GetProp(
      "RightWristTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set RightWristTposeAdjustment(value) {
    this.SetProp("RightWristTposeAdjustment", 16, value);
  }
  get Root() {
    return this.GetProp(
      "Root",
      19
      /* Referent */
    );
  }
  set Root(value) {
    this.SetProp("Root", 19, value);
  }
  get RootRangeMax() {
    return this.GetProp(
      "RootRangeMax",
      14
      /* Vector3 */
    );
  }
  set RootRangeMax(value) {
    this.SetProp("RootRangeMax", 14, value);
  }
  get RootRangeMin() {
    return this.GetProp(
      "RootRangeMin",
      14
      /* Vector3 */
    );
  }
  set RootRangeMin(value) {
    this.SetProp("RootRangeMin", 14, value);
  }
  get RootSize() {
    return this.GetProp(
      "RootSize",
      4
      /* Float32 */
    );
  }
  set RootSize(value) {
    this.SetProp("RootSize", 4, value);
  }
  get RootTposeAdjustment() {
    return this.GetProp(
      "RootTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set RootTposeAdjustment(value) {
    this.SetProp("RootTposeAdjustment", 16, value);
  }
  get Waist() {
    return this.GetProp(
      "Waist",
      19
      /* Referent */
    );
  }
  set Waist(value) {
    this.SetProp("Waist", 19, value);
  }
  get WaistRangeMax() {
    return this.GetProp(
      "WaistRangeMax",
      14
      /* Vector3 */
    );
  }
  set WaistRangeMax(value) {
    this.SetProp("WaistRangeMax", 14, value);
  }
  get WaistRangeMin() {
    return this.GetProp(
      "WaistRangeMin",
      14
      /* Vector3 */
    );
  }
  set WaistRangeMin(value) {
    this.SetProp("WaistRangeMin", 14, value);
  }
  get WaistSize() {
    return this.GetProp(
      "WaistSize",
      4
      /* Float32 */
    );
  }
  set WaistSize(value) {
    this.SetProp("WaistSize", 4, value);
  }
  get WaistTposeAdjustment() {
    return this.GetProp(
      "WaistTposeAdjustment",
      16
      /* CFrame */
    );
  }
  set WaistTposeAdjustment(value) {
    this.SetProp("WaistTposeAdjustment", 16, value);
  }
};
var IKControl = class extends Instance {
  constructor() {
    super();
    this.addClassName("IKControl");
    this.Name = "IKControl";
    this.Enabled = true;
    this.Priority = 0;
    this.SmoothTime = 0.05;
    this.Type = IKControlType.Transform;
    this.Weight = 1;
    this.EndEffectorOffset = CFrame.Identity;
    this.Offset = CFrame.Identity;
  }
  get ChainRoot() {
    return this.GetProp(
      "ChainRoot",
      19
      /* Referent */
    );
  }
  set ChainRoot(value) {
    this.SetProp("ChainRoot", 19, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get EndEffector() {
    return this.GetProp(
      "EndEffector",
      19
      /* Referent */
    );
  }
  set EndEffector(value) {
    this.SetProp("EndEffector", 19, value);
  }
  get EndEffectorOffset() {
    return this.GetProp(
      "EndEffectorOffset",
      16
      /* CFrame */
    );
  }
  set EndEffectorOffset(value) {
    this.SetProp("EndEffectorOffset", 16, value);
  }
  get Offset() {
    return this.GetProp(
      "Offset",
      16
      /* CFrame */
    );
  }
  set Offset(value) {
    this.SetProp("Offset", 16, value);
  }
  get Pole() {
    return this.GetProp(
      "Pole",
      19
      /* Referent */
    );
  }
  set Pole(value) {
    this.SetProp("Pole", 19, value);
  }
  get Priority() {
    return this.GetProp(
      "Priority",
      3
      /* Int32 */
    );
  }
  set Priority(value) {
    this.SetProp("Priority", 3, value);
  }
  get SmoothTime() {
    return this.GetProp(
      "SmoothTime",
      4
      /* Float32 */
    );
  }
  set SmoothTime(value) {
    this.SetProp("SmoothTime", 4, value);
  }
  get Target() {
    return this.GetProp(
      "Target",
      19
      /* Referent */
    );
  }
  set Target(value) {
    this.SetProp("Target", 19, value);
  }
  get Type() {
    return this.GetProp(
      "Type",
      18
      /* Enum */
    );
  }
  set Type(value) {
    this.SetProp("Type", 18, value);
  }
  get Weight() {
    return this.GetProp(
      "Weight",
      4
      /* Float32 */
    );
  }
  set Weight(value) {
    this.SetProp("Weight", 4, value);
  }
};
var ILegacyStudioBridge = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ILegacyStudioBridge");
  }
};
var LegacyStudioBridge = class extends ILegacyStudioBridge {
  constructor() {
    super();
    this.addClassName("LegacyStudioBridge");
    this.Name = "LegacyStudioBridge";
  }
};
var IXPService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("IXPService");
    this.Name = "IXPService";
  }
};
var IncrementalPatchBuilder = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("IncrementalPatchBuilder");
    this.Name = "IncrementalPatchBuilder";
    this.AddPathsToBundle = false;
    this.BuildDebouncePeriod = 0.1;
    this.HighCompression = false;
    this.SerializePatch = true;
    this.ZstdCompression = false;
  }
  get AddPathsToBundle() {
    return this.GetProp(
      "AddPathsToBundle",
      2
      /* Bool */
    );
  }
  set AddPathsToBundle(value) {
    this.SetProp("AddPathsToBundle", 2, value);
  }
  get BuildDebouncePeriod() {
    return this.GetProp(
      "BuildDebouncePeriod",
      5
      /* Float64 */
    );
  }
  set BuildDebouncePeriod(value) {
    this.SetProp("BuildDebouncePeriod", 5, value);
  }
  get HighCompression() {
    return this.GetProp(
      "HighCompression",
      2
      /* Bool */
    );
  }
  set HighCompression(value) {
    this.SetProp("HighCompression", 2, value);
  }
  get SerializePatch() {
    return this.GetProp(
      "SerializePatch",
      2
      /* Bool */
    );
  }
  set SerializePatch(value) {
    this.SetProp("SerializePatch", 2, value);
  }
  get ZstdCompression() {
    return this.GetProp(
      "ZstdCompression",
      2
      /* Bool */
    );
  }
  set ZstdCompression(value) {
    this.SetProp("ZstdCompression", 2, value);
  }
};
var InputAction = class extends Instance {
  constructor() {
    super();
    this.addClassName("InputAction");
    this.Name = "InputAction";
    this.Enabled = true;
    this.Type = InputActionType.Bool;
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Type() {
    return this.GetProp(
      "Type",
      18
      /* Enum */
    );
  }
  set Type(value) {
    this.SetProp("Type", 18, value);
  }
};
var InputBinding = class extends Instance {
  constructor() {
    super();
    this.addClassName("InputBinding");
    this.Name = "InputBinding";
    this.Down = KeyCode.Unknown;
    this.KeyCode = KeyCode.Unknown;
    this.Left = KeyCode.Unknown;
    this.PressedThreshold = 0.5;
    this.ReleasedThreshold = 0.2;
    this.Right = KeyCode.Unknown;
    this.Scale = 1;
    this.Up = KeyCode.Unknown;
    this.Vector2Scale = new Vector2(1, 1);
  }
  get Down() {
    return this.GetProp(
      "Down",
      18
      /* Enum */
    );
  }
  set Down(value) {
    this.SetProp("Down", 18, value);
  }
  get KeyCode() {
    return this.GetProp(
      "KeyCode",
      18
      /* Enum */
    );
  }
  set KeyCode(value) {
    this.SetProp("KeyCode", 18, value);
  }
  get Left() {
    return this.GetProp(
      "Left",
      18
      /* Enum */
    );
  }
  set Left(value) {
    this.SetProp("Left", 18, value);
  }
  get PressedThreshold() {
    return this.GetProp(
      "PressedThreshold",
      4
      /* Float32 */
    );
  }
  set PressedThreshold(value) {
    this.SetProp("PressedThreshold", 4, value);
  }
  get ReleasedThreshold() {
    return this.GetProp(
      "ReleasedThreshold",
      4
      /* Float32 */
    );
  }
  set ReleasedThreshold(value) {
    this.SetProp("ReleasedThreshold", 4, value);
  }
  get Right() {
    return this.GetProp(
      "Right",
      18
      /* Enum */
    );
  }
  set Right(value) {
    this.SetProp("Right", 18, value);
  }
  get Scale() {
    return this.GetProp(
      "Scale",
      4
      /* Float32 */
    );
  }
  set Scale(value) {
    this.SetProp("Scale", 4, value);
  }
  get UIButton() {
    return this.GetProp(
      "UIButton",
      19
      /* Referent */
    );
  }
  set UIButton(value) {
    this.SetProp("UIButton", 19, value);
  }
  get Up() {
    return this.GetProp(
      "Up",
      18
      /* Enum */
    );
  }
  set Up(value) {
    this.SetProp("Up", 18, value);
  }
  get Vector2Scale() {
    return this.GetProp(
      "Vector2Scale",
      13
      /* Vector2 */
    );
  }
  set Vector2Scale(value) {
    this.SetProp("Vector2Scale", 13, value);
  }
};
var InputContext = class extends Instance {
  constructor() {
    super();
    this.addClassName("InputContext");
    this.Name = "InputContext";
    this.Enabled = true;
    this.Priority = 1e3;
    this.Sink = false;
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Priority() {
    return this.GetProp(
      "Priority",
      3
      /* Int32 */
    );
  }
  set Priority(value) {
    this.SetProp("Priority", 3, value);
  }
  get Sink() {
    return this.GetProp(
      "Sink",
      2
      /* Bool */
    );
  }
  set Sink(value) {
    this.SetProp("Sink", 2, value);
  }
};
var InsertService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("InsertService");
    this.Name = "InsertService";
    this.AllowClientInsertModels = false;
    this.AllowInsertFreeModels = false;
  }
  get AllowClientInsertModels() {
    return this.GetProp(
      "AllowClientInsertModels",
      2
      /* Bool */
    );
  }
  set AllowClientInsertModels(value) {
    this.SetProp("AllowClientInsertModels", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get AllowInsertFreeModels() {
    return this.GetProp(
      "AllowInsertFreeModels",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set AllowInsertFreeModels(value) {
    this.SetProp("AllowInsertFreeModels", 2, value);
  }
};
var InternalSyncItem = class extends Instance {
  constructor() {
    super();
    this.addClassName("InternalSyncItem");
    this.Name = "InternalSyncItem";
    this.AutoSync = true;
    this.Enabled = false;
    this.Path = "";
  }
  get AutoSync() {
    return this.GetProp(
      "AutoSync",
      2
      /* Bool */
    );
  }
  set AutoSync(value) {
    this.SetProp("AutoSync", 2, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Path() {
    return this.GetProp(
      "Path",
      1
      /* String */
    );
  }
  set Path(value) {
    this.SetProp("Path", 1, value);
  }
};
var InternalSyncService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("InternalSyncService");
    this.Name = "InternalSyncService";
  }
};
var JointInstance = class extends Instance {
  constructor() {
    super();
    this.addClassName("JointInstance");
    this.C0 = CFrame.Identity;
    this.C1 = CFrame.Identity;
    this.Enabled = true;
  }
  get C0() {
    return this.GetProp(
      "C0",
      16
      /* CFrame */
    );
  }
  set C0(value) {
    this.SetProp("C0", 16, value);
  }
  get C1() {
    return this.GetProp(
      "C1",
      16
      /* CFrame */
    );
  }
  set C1(value) {
    this.SetProp("C1", 16, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Part0() {
    return this.GetProp(
      "Part0",
      19
      /* Referent */
    );
  }
  set Part0(value) {
    this.SetProp("Part0", 19, value);
  }
  get Part1() {
    return this.GetProp(
      "Part1",
      19
      /* Referent */
    );
  }
  set Part1(value) {
    this.SetProp("Part1", 19, value);
  }
};
var DynamicRotate = class extends JointInstance {
  constructor() {
    super();
    this.addClassName("DynamicRotate");
    this.BaseAngle = 0;
  }
  get BaseAngle() {
    return this.GetProp(
      "BaseAngle",
      4
      /* Float32 */
    );
  }
  set BaseAngle(value) {
    this.SetProp("BaseAngle", 4, value);
  }
};
var RotateP = class extends DynamicRotate {
  constructor() {
    super();
    this.addClassName("RotateP");
    this.Name = "RotateP";
  }
};
var RotateV = class extends DynamicRotate {
  constructor() {
    super();
    this.addClassName("RotateV");
    this.Name = "RotateV";
  }
};
var Glue = class extends JointInstance {
  constructor() {
    super();
    this.addClassName("Glue");
    this.Name = "Glue";
    this.F0 = new Vector3(0, 0, 0);
    this.F1 = new Vector3(0, 0, 0);
    this.F2 = new Vector3(0, 0, 0);
    this.F3 = new Vector3(0, 0, 0);
  }
  get F0() {
    return this.GetProp(
      "F0",
      14
      /* Vector3 */
    );
  }
  set F0(value) {
    this.SetProp("F0", 14, value);
  }
  get F1() {
    return this.GetProp(
      "F1",
      14
      /* Vector3 */
    );
  }
  set F1(value) {
    this.SetProp("F1", 14, value);
  }
  get F2() {
    return this.GetProp(
      "F2",
      14
      /* Vector3 */
    );
  }
  set F2(value) {
    this.SetProp("F2", 14, value);
  }
  get F3() {
    return this.GetProp(
      "F3",
      14
      /* Vector3 */
    );
  }
  set F3(value) {
    this.SetProp("F3", 14, value);
  }
};
var ManualSurfaceJointInstance = class extends JointInstance {
  constructor() {
    super();
    this.addClassName("ManualSurfaceJointInstance");
  }
};
var ManualGlue = class extends ManualSurfaceJointInstance {
  constructor() {
    super();
    this.addClassName("ManualGlue");
    this.Name = "ManualGlue";
  }
};
var ManualWeld = class extends ManualSurfaceJointInstance {
  constructor() {
    super();
    this.addClassName("ManualWeld");
    this.Name = "ManualWeld";
  }
};
var Motor = class extends JointInstance {
  constructor() {
    super();
    this.addClassName("Motor");
    this.Name = "Motor";
    this.DesiredAngle = 0;
    this.MaxVelocity = 0;
  }
  get DesiredAngle() {
    return this.GetProp(
      "DesiredAngle",
      4
      /* Float32 */
    );
  }
  set DesiredAngle(value) {
    this.SetProp("DesiredAngle", 4, value);
  }
  get MaxVelocity() {
    return this.GetProp(
      "MaxVelocity",
      4
      /* Float32 */
    );
  }
  set MaxVelocity(value) {
    this.SetProp("MaxVelocity", 4, value);
  }
};
var Motor6D = class extends Motor {
  constructor() {
    super();
    this.addClassName("Motor6D");
    this.Name = "Motor6D";
  }
};
var Rotate = class extends JointInstance {
  constructor() {
    super();
    this.addClassName("Rotate");
    this.Name = "Rotate";
  }
};
var Snap = class extends JointInstance {
  constructor() {
    super();
    this.addClassName("Snap");
    this.Name = "Snap";
  }
};
var VelocityMotor = class extends JointInstance {
  constructor() {
    super();
    this.addClassName("VelocityMotor");
    this.Name = "VelocityMotor";
    this.CurrentAngle = 0;
    this.DesiredAngle = 0;
    this.MaxVelocity = 0;
  }
  get CurrentAngle() {
    return this.GetProp(
      "CurrentAngle",
      4
      /* Float32 */
    );
  }
  set CurrentAngle(value) {
    this.SetProp("CurrentAngle", 4, value);
  }
  get DesiredAngle() {
    return this.GetProp(
      "DesiredAngle",
      4
      /* Float32 */
    );
  }
  set DesiredAngle(value) {
    this.SetProp("DesiredAngle", 4, value);
  }
  get Hole() {
    return this.GetProp(
      "Hole",
      19
      /* Referent */
    );
  }
  set Hole(value) {
    this.SetProp("Hole", 19, value);
  }
  get MaxVelocity() {
    return this.GetProp(
      "MaxVelocity",
      4
      /* Float32 */
    );
  }
  set MaxVelocity(value) {
    this.SetProp("MaxVelocity", 4, value);
  }
};
var Weld = class extends JointInstance {
  constructor() {
    super();
    this.addClassName("Weld");
    this.Name = "Weld";
  }
};
var JointsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("JointsService");
    this.Name = "JointsService";
  }
};
var KeyboardService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("KeyboardService");
    this.Name = "KeyboardService";
  }
};
var Keyframe = class extends Instance {
  constructor() {
    super();
    this.addClassName("Keyframe");
    this.Name = "Keyframe";
    this.Time = 0;
  }
  get Time() {
    return this.GetProp(
      "Time",
      4
      /* Float32 */
    );
  }
  set Time(value) {
    this.SetProp("Time", 4, value);
  }
};
var KeyframeMarker = class extends Instance {
  constructor() {
    super();
    this.addClassName("KeyframeMarker");
    this.Name = "KeyframeMarker";
    this.Value = "";
  }
  get Value() {
    return this.GetProp(
      "Value",
      1
      /* String */
    );
  }
  set Value(value) {
    this.SetProp("Value", 1, value);
  }
};
var KeyframeSequenceProvider = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("KeyframeSequenceProvider");
    this.Name = "KeyframeSequenceProvider";
  }
};
var LSPFileSyncService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LSPFileSyncService");
    this.Name = "LSPFileSyncService";
  }
};
var LanguageService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LanguageService");
    this.Name = "LanguageService";
  }
};
var Light = class extends Instance {
  constructor() {
    super();
    this.addClassName("Light");
    this.Brightness = 1;
    this.Color = Color3.FromRGB(255, 255, 255);
    this.Enabled = true;
    this.Shadows = false;
  }
  get Brightness() {
    return this.GetProp(
      "Brightness",
      4
      /* Float32 */
    );
  }
  set Brightness(value) {
    this.SetProp("Brightness", 4, value);
  }
  get Color() {
    return this.GetProp(
      "Color",
      12
      /* Color3 */
    );
  }
  set Color(value) {
    this.SetProp("Color", 12, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Shadows() {
    return this.GetProp(
      "Shadows",
      2
      /* Bool */
    );
  }
  set Shadows(value) {
    this.SetProp("Shadows", 2, value);
  }
};
var PointLight = class extends Light {
  constructor() {
    super();
    this.addClassName("PointLight");
    this.Name = "PointLight";
    this.Range = 8;
  }
  get Range() {
    return this.GetProp(
      "Range",
      4
      /* Float32 */
    );
  }
  set Range(value) {
    this.SetProp("Range", 4, value);
  }
};
var SpotLight = class extends Light {
  constructor() {
    super();
    this.addClassName("SpotLight");
    this.Name = "SpotLight";
    this.Angle = 90;
    this.Face = NormalId.Front;
    this.Range = 16;
  }
  get Angle() {
    return this.GetProp(
      "Angle",
      4
      /* Float32 */
    );
  }
  set Angle(value) {
    this.SetProp("Angle", 4, value);
  }
  get Face() {
    return this.GetProp(
      "Face",
      18
      /* Enum */
    );
  }
  set Face(value) {
    this.SetProp("Face", 18, value);
  }
  get Range() {
    return this.GetProp(
      "Range",
      4
      /* Float32 */
    );
  }
  set Range(value) {
    this.SetProp("Range", 4, value);
  }
};
var SurfaceLight = class extends Light {
  constructor() {
    super();
    this.addClassName("SurfaceLight");
    this.Name = "SurfaceLight";
    this.Angle = 90;
    this.Face = NormalId.Front;
    this.Range = 16;
  }
  get Angle() {
    return this.GetProp(
      "Angle",
      4
      /* Float32 */
    );
  }
  set Angle(value) {
    this.SetProp("Angle", 4, value);
  }
  get Face() {
    return this.GetProp(
      "Face",
      18
      /* Enum */
    );
  }
  set Face(value) {
    this.SetProp("Face", 18, value);
  }
  get Range() {
    return this.GetProp(
      "Range",
      4
      /* Float32 */
    );
  }
  set Range(value) {
    this.SetProp("Range", 4, value);
  }
};
var Lighting = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("Lighting");
    this.Name = "Lighting";
    this.Ambient = Color3.FromRGB(128, 128, 128);
    this.Brightness = 1;
    this.ColorShiftBottom = Color3.FromRGB(0, 0, 0);
    this.ColorShiftTop = Color3.FromRGB(0, 0, 0);
    this.EnvironmentDiffuseScale = 0;
    this.EnvironmentSpecularScale = 0;
    this.ExposureCompensation = 0;
    this.FogColor = Color3.FromRGB(191, 191, 191);
    this.FogEnd = 1e5;
    this.FogStart = 0;
    this.GeographicLatitude = 41.7333;
    this.GlobalShadows = false;
    this.LightingStyle = LightingStyle.Realistic;
    this.OutdoorAmbient = Color3.FromRGB(128, 128, 128);
    this.Outlines = true;
    this.PrioritizeLightingQuality = true;
    this.ShadowColor = Color3.FromRGB(179, 179, 184);
    this.ShadowSoftness = 0.5;
    this.Technology = Technology.Compatibility;
    this.TimeOfDay = "14:00:00";
  }
  get Ambient() {
    return this.GetProp(
      "Ambient",
      12
      /* Color3 */
    );
  }
  set Ambient(value) {
    this.SetProp("Ambient", 12, value);
  }
  get Brightness() {
    return this.GetProp(
      "Brightness",
      4
      /* Float32 */
    );
  }
  set Brightness(value) {
    this.SetProp("Brightness", 4, value);
  }
  get ColorShiftBottom() {
    return this.GetProp(
      "ColorShift_Bottom",
      12
      /* Color3 */
    );
  }
  set ColorShiftBottom(value) {
    this.SetProp("ColorShift_Bottom", 12, value);
  }
  get ColorShiftTop() {
    return this.GetProp(
      "ColorShift_Top",
      12
      /* Color3 */
    );
  }
  set ColorShiftTop(value) {
    this.SetProp("ColorShift_Top", 12, value);
  }
  get EnvironmentDiffuseScale() {
    return this.GetProp(
      "EnvironmentDiffuseScale",
      4
      /* Float32 */
    );
  }
  set EnvironmentDiffuseScale(value) {
    this.SetProp("EnvironmentDiffuseScale", 4, value);
  }
  get EnvironmentSpecularScale() {
    return this.GetProp(
      "EnvironmentSpecularScale",
      4
      /* Float32 */
    );
  }
  set EnvironmentSpecularScale(value) {
    this.SetProp("EnvironmentSpecularScale", 4, value);
  }
  get ExposureCompensation() {
    return this.GetProp(
      "ExposureCompensation",
      4
      /* Float32 */
    );
  }
  set ExposureCompensation(value) {
    this.SetProp("ExposureCompensation", 4, value);
  }
  get FogColor() {
    return this.GetProp(
      "FogColor",
      12
      /* Color3 */
    );
  }
  set FogColor(value) {
    this.SetProp("FogColor", 12, value);
  }
  get FogEnd() {
    return this.GetProp(
      "FogEnd",
      4
      /* Float32 */
    );
  }
  set FogEnd(value) {
    this.SetProp("FogEnd", 4, value);
  }
  get FogStart() {
    return this.GetProp(
      "FogStart",
      4
      /* Float32 */
    );
  }
  set FogStart(value) {
    this.SetProp("FogStart", 4, value);
  }
  get GeographicLatitude() {
    return this.GetProp(
      "GeographicLatitude",
      4
      /* Float32 */
    );
  }
  set GeographicLatitude(value) {
    this.SetProp("GeographicLatitude", 4, value);
  }
  get GlobalShadows() {
    return this.GetProp(
      "GlobalShadows",
      2
      /* Bool */
    );
  }
  set GlobalShadows(value) {
    this.SetProp("GlobalShadows", 2, value);
  }
  get LightingStyle() {
    return this.GetProp(
      "LightingStyle",
      18
      /* Enum */
    );
  }
  set LightingStyle(value) {
    this.SetProp("LightingStyle", 18, value);
  }
  get OutdoorAmbient() {
    return this.GetProp(
      "OutdoorAmbient",
      12
      /* Color3 */
    );
  }
  set OutdoorAmbient(value) {
    this.SetProp("OutdoorAmbient", 12, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Outlines() {
    return this.GetProp(
      "Outlines",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Outlines(value) {
    this.SetProp("Outlines", 2, value);
  }
  get PrioritizeLightingQuality() {
    return this.GetProp(
      "PrioritizeLightingQuality",
      2
      /* Bool */
    );
  }
  set PrioritizeLightingQuality(value) {
    this.SetProp("PrioritizeLightingQuality", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get ShadowColor() {
    return this.GetProp(
      "ShadowColor",
      12
      /* Color3 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set ShadowColor(value) {
    this.SetProp("ShadowColor", 12, value);
  }
  get ShadowSoftness() {
    return this.GetProp(
      "ShadowSoftness",
      4
      /* Float32 */
    );
  }
  set ShadowSoftness(value) {
    this.SetProp("ShadowSoftness", 4, value);
  }
  get Technology() {
    return this.GetProp(
      "Technology",
      18
      /* Enum */
    );
  }
  set Technology(value) {
    this.SetProp("Technology", 18, value);
  }
  get TimeOfDay() {
    return this.GetProp(
      "TimeOfDay",
      1
      /* String */
    );
  }
  set TimeOfDay(value) {
    this.SetProp("TimeOfDay", 1, value);
  }
};
var LinkingService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LinkingService");
    this.Name = "LinkingService";
  }
};
var LiveScriptingService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LiveScriptingService");
    this.Name = "LiveScriptingService";
  }
};
var LiveSyncService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LiveSyncService");
    this.Name = "LiveSyncService";
  }
};
var LocalStorageService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LocalStorageService");
  }
};
var AppStorageService = class extends LocalStorageService {
  constructor() {
    super();
    this.addClassName("AppStorageService");
    this.Name = "AppStorageService";
  }
};
var UserStorageService = class extends LocalStorageService {
  constructor() {
    super();
    this.addClassName("UserStorageService");
    this.Name = "UserStorageService";
  }
};
var LocalizationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LocalizationService");
    this.Name = "LocalizationService";
  }
};
var LocalizationTable = class extends Instance {
  constructor() {
    super();
    this.addClassName("LocalizationTable");
    this.Name = "LocalizationTable";
    this.Contents = "[]";
    this.DevelopmentLanguage = "en-us";
    this.SourceLocaleId = "en-us";
  }
  get Contents() {
    return this.GetProp(
      "Contents",
      1
      /* String */
    );
  }
  set Contents(value) {
    this.SetProp("Contents", 1, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get DevelopmentLanguage() {
    return this.GetProp(
      "DevelopmentLanguage",
      1
      /* String */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set DevelopmentLanguage(value) {
    this.SetProp("DevelopmentLanguage", 1, value);
  }
  get SourceLocaleId() {
    return this.GetProp(
      "SourceLocaleId",
      1
      /* String */
    );
  }
  set SourceLocaleId(value) {
    this.SetProp("SourceLocaleId", 1, value);
  }
};
var LodDataService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LodDataService");
    this.Name = "LodDataService";
  }
};
var LogReporterService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LogReporterService");
    this.Name = "LogReporterService";
  }
};
var LogService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LogService");
    this.Name = "LogService";
  }
};
var LoginService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LoginService");
    this.Name = "LoginService";
  }
};
var LuaSourceContainer = class extends Instance {
  constructor() {
    super();
    this.addClassName("LuaSourceContainer");
  }
  get ScriptGuid() {
    return this.GetProp(
      "ScriptGuid",
      1
      /* String */
    );
  }
  set ScriptGuid(value) {
    this.SetProp("ScriptGuid", 1, value);
  }
};
var AuroraScript = class extends LuaSourceContainer {
  constructor() {
    super();
    this.addClassName("AuroraScript");
    this.Name = "AuroraScript";
  }
  get EnableCulling() {
    return this.GetProp(
      "EnableCulling",
      2
      /* Bool */
    );
  }
  set EnableCulling(value) {
    this.SetProp("EnableCulling", 2, value);
  }
  get EnableLOD() {
    return this.GetProp(
      "EnableLOD",
      2
      /* Bool */
    );
  }
  set EnableLOD(value) {
    this.SetProp("EnableLOD", 2, value);
  }
  get LODCriticality() {
    return this.GetProp(
      "LODCriticality",
      3
      /* Int32 */
    );
  }
  set LODCriticality(value) {
    this.SetProp("LODCriticality", 3, value);
  }
  get Priority() {
    return this.GetProp(
      "Priority",
      3
      /* Int32 */
    );
  }
  set Priority(value) {
    this.SetProp("Priority", 3, value);
  }
  get Source() {
    return this.GetProp(
      "Source",
      1
      /* String */
    );
  }
  set Source(value) {
    this.SetProp("Source", 1, value);
  }
};
var BaseScript = class extends LuaSourceContainer {
  constructor() {
    super();
    this.addClassName("BaseScript");
    this.Disabled = false;
    this.LinkedSource = "";
    this.RunContext = RunContext.Legacy;
  }
  get Disabled() {
    return this.GetProp(
      "Disabled",
      2
      /* Bool */
    );
  }
  set Disabled(value) {
    this.SetProp("Disabled", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get LinkedSource() {
    return this.GetProp(
      "LinkedSource",
      1
      /* String */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set LinkedSource(value) {
    this.SetProp("LinkedSource", 1, value);
  }
  get RunContext() {
    return this.GetProp(
      "RunContext",
      18
      /* Enum */
    );
  }
  set RunContext(value) {
    this.SetProp("RunContext", 18, value);
  }
};
var Script = class extends BaseScript {
  constructor() {
    super();
    this.addClassName("Script");
    this.Name = "Script";
    this.Source = "";
  }
  get Source() {
    return this.GetProp(
      "Source",
      1
      /* String */
    );
  }
  set Source(value) {
    this.SetProp("Source", 1, value);
  }
};
var LocalScript = class extends Script {
  constructor() {
    super();
    this.addClassName("LocalScript");
    this.Name = "LocalScript";
  }
};
var ModuleScript = class extends LuaSourceContainer {
  constructor() {
    super();
    this.addClassName("ModuleScript");
    this.Name = "ModuleScript";
    this.LinkedSource = "";
    this.Source = "";
  }
  /**@deprecated Deprecated by Roblox*/
  get LinkedSource() {
    return this.GetProp(
      "LinkedSource",
      1
      /* String */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set LinkedSource(value) {
    this.SetProp("LinkedSource", 1, value);
  }
  get Source() {
    return this.GetProp(
      "Source",
      1
      /* String */
    );
  }
  set Source(value) {
    this.SetProp("Source", 1, value);
  }
};
var LuaWebService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LuaWebService");
    this.Name = "LuaWebService";
  }
};
var LuauScriptAnalyzerService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("LuauScriptAnalyzerService");
    this.Name = "LuauScriptAnalyzerService";
  }
};
var MLModelDeliveryService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("MLModelDeliveryService");
    this.Name = "MLModelDeliveryService";
  }
};
var MarkerCurve = class extends Instance {
  constructor() {
    super();
    this.addClassName("MarkerCurve");
    this.Name = "MarkerCurve";
    this.ValuesAndTimes = "";
  }
  get ValuesAndTimes() {
    return this.GetProp(
      "ValuesAndTimes",
      1
      /* String */
    );
  }
  set ValuesAndTimes(value) {
    this.SetProp("ValuesAndTimes", 1, value);
  }
};
var MarketplaceService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("MarketplaceService");
    this.Name = "MarketplaceService";
  }
};
var MatchmakingService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("MatchmakingService");
    this.Name = "MatchmakingService";
  }
};
var MaterialGenerationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("MaterialGenerationService");
    this.Name = "MaterialGenerationService";
  }
};
var MaterialService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("MaterialService");
    this.Name = "MaterialService";
    this.AsphaltName = "Asphalt";
    this.BasaltName = "Basalt";
    this.BrickName = "Brick";
    this.CardboardName = "Cardboard";
    this.CarpetName = "Carpet";
    this.CeramicTilesName = "CeramicTiles";
    this.ClayRoofTilesName = "ClayRoofTiles";
    this.CobblestoneName = "Cobblestone";
    this.ConcreteName = "Concrete";
    this.CorrodedMetalName = "CorrodedMetal";
    this.CrackedLavaName = "CrackedLava";
    this.DiamondPlateName = "DiamondPlate";
    this.FabricName = "Fabric";
    this.FoilName = "Foil";
    this.GlacierName = "Glacier";
    this.GraniteName = "Granite";
    this.GrassName = "Grass";
    this.GroundName = "Ground";
    this.IceName = "Ice";
    this.LeafyGrassName = "LeafyGrass";
    this.LeatherName = "Leather";
    this.LimestoneName = "Limestone";
    this.MarbleName = "Marble";
    this.MetalName = "Metal";
    this.MudName = "Mud";
    this.PavementName = "Pavement";
    this.PebbleName = "Pebble";
    this.PlasterName = "Plaster";
    this.PlasticName = "Plastic";
    this.RockName = "Rock";
    this.RoofShinglesName = "RoofShingles";
    this.RubberName = "Rubber";
    this.SaltName = "Salt";
    this.SandName = "Sand";
    this.SandstoneName = "Sandstone";
    this.SlateName = "Slate";
    this.SmoothPlasticName = "SmoothPlastic";
    this.SnowName = "Snow";
    this.Use2022MaterialsXml = false;
    this.WoodName = "Wood";
    this.WoodPlanksName = "WoodPlanks";
  }
  get AsphaltName() {
    return this.GetProp(
      "AsphaltName",
      1
      /* String */
    );
  }
  set AsphaltName(value) {
    this.SetProp("AsphaltName", 1, value);
  }
  get BasaltName() {
    return this.GetProp(
      "BasaltName",
      1
      /* String */
    );
  }
  set BasaltName(value) {
    this.SetProp("BasaltName", 1, value);
  }
  get BrickName() {
    return this.GetProp(
      "BrickName",
      1
      /* String */
    );
  }
  set BrickName(value) {
    this.SetProp("BrickName", 1, value);
  }
  get CardboardName() {
    return this.GetProp(
      "CardboardName",
      1
      /* String */
    );
  }
  set CardboardName(value) {
    this.SetProp("CardboardName", 1, value);
  }
  get CarpetName() {
    return this.GetProp(
      "CarpetName",
      1
      /* String */
    );
  }
  set CarpetName(value) {
    this.SetProp("CarpetName", 1, value);
  }
  get CeramicTilesName() {
    return this.GetProp(
      "CeramicTilesName",
      1
      /* String */
    );
  }
  set CeramicTilesName(value) {
    this.SetProp("CeramicTilesName", 1, value);
  }
  get ClayRoofTilesName() {
    return this.GetProp(
      "ClayRoofTilesName",
      1
      /* String */
    );
  }
  set ClayRoofTilesName(value) {
    this.SetProp("ClayRoofTilesName", 1, value);
  }
  get CobblestoneName() {
    return this.GetProp(
      "CobblestoneName",
      1
      /* String */
    );
  }
  set CobblestoneName(value) {
    this.SetProp("CobblestoneName", 1, value);
  }
  get ConcreteName() {
    return this.GetProp(
      "ConcreteName",
      1
      /* String */
    );
  }
  set ConcreteName(value) {
    this.SetProp("ConcreteName", 1, value);
  }
  get CorrodedMetalName() {
    return this.GetProp(
      "CorrodedMetalName",
      1
      /* String */
    );
  }
  set CorrodedMetalName(value) {
    this.SetProp("CorrodedMetalName", 1, value);
  }
  get CrackedLavaName() {
    return this.GetProp(
      "CrackedLavaName",
      1
      /* String */
    );
  }
  set CrackedLavaName(value) {
    this.SetProp("CrackedLavaName", 1, value);
  }
  get DiamondPlateName() {
    return this.GetProp(
      "DiamondPlateName",
      1
      /* String */
    );
  }
  set DiamondPlateName(value) {
    this.SetProp("DiamondPlateName", 1, value);
  }
  get FabricName() {
    return this.GetProp(
      "FabricName",
      1
      /* String */
    );
  }
  set FabricName(value) {
    this.SetProp("FabricName", 1, value);
  }
  get FoilName() {
    return this.GetProp(
      "FoilName",
      1
      /* String */
    );
  }
  set FoilName(value) {
    this.SetProp("FoilName", 1, value);
  }
  get GlacierName() {
    return this.GetProp(
      "GlacierName",
      1
      /* String */
    );
  }
  set GlacierName(value) {
    this.SetProp("GlacierName", 1, value);
  }
  get GraniteName() {
    return this.GetProp(
      "GraniteName",
      1
      /* String */
    );
  }
  set GraniteName(value) {
    this.SetProp("GraniteName", 1, value);
  }
  get GrassName() {
    return this.GetProp(
      "GrassName",
      1
      /* String */
    );
  }
  set GrassName(value) {
    this.SetProp("GrassName", 1, value);
  }
  get GroundName() {
    return this.GetProp(
      "GroundName",
      1
      /* String */
    );
  }
  set GroundName(value) {
    this.SetProp("GroundName", 1, value);
  }
  get IceName() {
    return this.GetProp(
      "IceName",
      1
      /* String */
    );
  }
  set IceName(value) {
    this.SetProp("IceName", 1, value);
  }
  get LeafyGrassName() {
    return this.GetProp(
      "LeafyGrassName",
      1
      /* String */
    );
  }
  set LeafyGrassName(value) {
    this.SetProp("LeafyGrassName", 1, value);
  }
  get LeatherName() {
    return this.GetProp(
      "LeatherName",
      1
      /* String */
    );
  }
  set LeatherName(value) {
    this.SetProp("LeatherName", 1, value);
  }
  get LimestoneName() {
    return this.GetProp(
      "LimestoneName",
      1
      /* String */
    );
  }
  set LimestoneName(value) {
    this.SetProp("LimestoneName", 1, value);
  }
  get MarbleName() {
    return this.GetProp(
      "MarbleName",
      1
      /* String */
    );
  }
  set MarbleName(value) {
    this.SetProp("MarbleName", 1, value);
  }
  get MetalName() {
    return this.GetProp(
      "MetalName",
      1
      /* String */
    );
  }
  set MetalName(value) {
    this.SetProp("MetalName", 1, value);
  }
  get MudName() {
    return this.GetProp(
      "MudName",
      1
      /* String */
    );
  }
  set MudName(value) {
    this.SetProp("MudName", 1, value);
  }
  get PavementName() {
    return this.GetProp(
      "PavementName",
      1
      /* String */
    );
  }
  set PavementName(value) {
    this.SetProp("PavementName", 1, value);
  }
  get PebbleName() {
    return this.GetProp(
      "PebbleName",
      1
      /* String */
    );
  }
  set PebbleName(value) {
    this.SetProp("PebbleName", 1, value);
  }
  get PlasterName() {
    return this.GetProp(
      "PlasterName",
      1
      /* String */
    );
  }
  set PlasterName(value) {
    this.SetProp("PlasterName", 1, value);
  }
  get PlasticName() {
    return this.GetProp(
      "PlasticName",
      1
      /* String */
    );
  }
  set PlasticName(value) {
    this.SetProp("PlasticName", 1, value);
  }
  get RockName() {
    return this.GetProp(
      "RockName",
      1
      /* String */
    );
  }
  set RockName(value) {
    this.SetProp("RockName", 1, value);
  }
  get RoofShinglesName() {
    return this.GetProp(
      "RoofShinglesName",
      1
      /* String */
    );
  }
  set RoofShinglesName(value) {
    this.SetProp("RoofShinglesName", 1, value);
  }
  get RubberName() {
    return this.GetProp(
      "RubberName",
      1
      /* String */
    );
  }
  set RubberName(value) {
    this.SetProp("RubberName", 1, value);
  }
  get SaltName() {
    return this.GetProp(
      "SaltName",
      1
      /* String */
    );
  }
  set SaltName(value) {
    this.SetProp("SaltName", 1, value);
  }
  get SandName() {
    return this.GetProp(
      "SandName",
      1
      /* String */
    );
  }
  set SandName(value) {
    this.SetProp("SandName", 1, value);
  }
  get SandstoneName() {
    return this.GetProp(
      "SandstoneName",
      1
      /* String */
    );
  }
  set SandstoneName(value) {
    this.SetProp("SandstoneName", 1, value);
  }
  get SlateName() {
    return this.GetProp(
      "SlateName",
      1
      /* String */
    );
  }
  set SlateName(value) {
    this.SetProp("SlateName", 1, value);
  }
  get SmoothPlasticName() {
    return this.GetProp(
      "SmoothPlasticName",
      1
      /* String */
    );
  }
  set SmoothPlasticName(value) {
    this.SetProp("SmoothPlasticName", 1, value);
  }
  get SnowName() {
    return this.GetProp(
      "SnowName",
      1
      /* String */
    );
  }
  set SnowName(value) {
    this.SetProp("SnowName", 1, value);
  }
  get Use2022MaterialsXml() {
    return this.GetProp(
      "Use2022MaterialsXml",
      2
      /* Bool */
    );
  }
  set Use2022MaterialsXml(value) {
    this.SetProp("Use2022MaterialsXml", 2, value);
  }
  get WoodName() {
    return this.GetProp(
      "WoodName",
      1
      /* String */
    );
  }
  set WoodName(value) {
    this.SetProp("WoodName", 1, value);
  }
  get WoodPlanksName() {
    return this.GetProp(
      "WoodPlanksName",
      1
      /* String */
    );
  }
  set WoodPlanksName(value) {
    this.SetProp("WoodPlanksName", 1, value);
  }
};
var MaterialVariant = class extends Instance {
  constructor() {
    super();
    this.addClassName("MaterialVariant");
    this.Name = "MaterialVariant";
    this.BaseMaterial = Material.Plastic;
    this.ColorMap = "";
    this.MaterialPattern = MaterialPattern.Regular;
    this.MetalnessMap = "";
    this.NormalMap = "";
    this.RoughnessMap = "";
    this.StudsPerTile = 10;
    this.TexturePack = "";
  }
  get BaseMaterial() {
    return this.GetProp(
      "BaseMaterial",
      18
      /* Enum */
    );
  }
  set BaseMaterial(value) {
    this.SetProp("BaseMaterial", 18, value);
  }
  get ColorMap() {
    return this.GetProp(
      "ColorMap",
      1
      /* String */
    );
  }
  set ColorMap(value) {
    this.SetProp("ColorMap", 1, value);
  }
  get CustomPhysicalProperties() {
    return this.GetProp(
      "CustomPhysicalProperties",
      25
      /* PhysicalProperties */
    );
  }
  set CustomPhysicalProperties(value) {
    this.SetProp("CustomPhysicalProperties", 25, value);
  }
  get MaterialPattern() {
    return this.GetProp(
      "MaterialPattern",
      18
      /* Enum */
    );
  }
  set MaterialPattern(value) {
    this.SetProp("MaterialPattern", 18, value);
  }
  get MetalnessMap() {
    return this.GetProp(
      "MetalnessMap",
      1
      /* String */
    );
  }
  set MetalnessMap(value) {
    this.SetProp("MetalnessMap", 1, value);
  }
  get NormalMap() {
    return this.GetProp(
      "NormalMap",
      1
      /* String */
    );
  }
  set NormalMap(value) {
    this.SetProp("NormalMap", 1, value);
  }
  get RoughnessMap() {
    return this.GetProp(
      "RoughnessMap",
      1
      /* String */
    );
  }
  set RoughnessMap(value) {
    this.SetProp("RoughnessMap", 1, value);
  }
  get StudsPerTile() {
    return this.GetProp(
      "StudsPerTile",
      4
      /* Float32 */
    );
  }
  set StudsPerTile(value) {
    this.SetProp("StudsPerTile", 4, value);
  }
  get TexturePack() {
    return this.GetProp(
      "TexturePack",
      1
      /* String */
    );
  }
  set TexturePack(value) {
    this.SetProp("TexturePack", 1, value);
  }
};
var MemStorageService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("MemStorageService");
    this.Name = "MemStorageService";
  }
};
var MemoryStoreService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("MemoryStoreService");
    this.Name = "MemoryStoreService";
  }
};
var Message = class extends Instance {
  constructor() {
    super();
    this.addClassName("Message");
    this.Name = "Message";
    this.Text = "";
  }
  get Text() {
    return this.GetProp(
      "Text",
      1
      /* String */
    );
  }
  set Text(value) {
    this.SetProp("Text", 1, value);
  }
};
var Hint = class extends Message {
  constructor() {
    super();
    this.addClassName("Hint");
    this.Name = "Hint";
  }
};
var MessageBusService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("MessageBusService");
    this.Name = "MessageBusService";
  }
};
var MessagingService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("MessagingService");
    this.Name = "MessagingService";
  }
};
var MetaBreakpointManager = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("MetaBreakpointManager");
    this.Name = "MetaBreakpointManager";
  }
};
var MouseService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("MouseService");
    this.Name = "MouseService";
  }
};
var NetworkPeer = class extends Instance {
  constructor() {
    super();
    this.addClassName("NetworkPeer");
  }
};
var NetworkClient = class extends NetworkPeer {
  constructor() {
    super();
    this._isService = true;
    this.addClassName("NetworkClient");
    this.Name = "NetworkClient";
  }
};
var NetworkServer = class extends NetworkPeer {
  constructor() {
    super();
    this._isService = true;
    this.addClassName("NetworkServer");
    this.Name = "NetworkServer";
  }
};
var NetworkSettings = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("NetworkSettings");
    this.Name = "NetworkSettings";
  }
  get HttpProxyEnabled() {
    return this.GetProp(
      "HttpProxyEnabled",
      2
      /* Bool */
    );
  }
  set HttpProxyEnabled(value) {
    this.SetProp("HttpProxyEnabled", 2, value);
  }
  get HttpProxyURL() {
    return this.GetProp(
      "HttpProxyURL",
      1
      /* String */
    );
  }
  set HttpProxyURL(value) {
    this.SetProp("HttpProxyURL", 1, value);
  }
  get IncomingReplicationLag() {
    return this.GetProp(
      "IncomingReplicationLag",
      5
      /* Float64 */
    );
  }
  set IncomingReplicationLag(value) {
    this.SetProp("IncomingReplicationLag", 5, value);
  }
  get PrintJoinSizeBreakdown() {
    return this.GetProp(
      "PrintJoinSizeBreakdown",
      2
      /* Bool */
    );
  }
  set PrintJoinSizeBreakdown(value) {
    this.SetProp("PrintJoinSizeBreakdown", 2, value);
  }
  get PrintPhysicsErrors() {
    return this.GetProp(
      "PrintPhysicsErrors",
      2
      /* Bool */
    );
  }
  set PrintPhysicsErrors(value) {
    this.SetProp("PrintPhysicsErrors", 2, value);
  }
  get PrintStreamInstanceQuota() {
    return this.GetProp(
      "PrintStreamInstanceQuota",
      2
      /* Bool */
    );
  }
  set PrintStreamInstanceQuota(value) {
    this.SetProp("PrintStreamInstanceQuota", 2, value);
  }
  get RandomizeJoinInstanceOrder() {
    return this.GetProp(
      "RandomizeJoinInstanceOrder",
      2
      /* Bool */
    );
  }
  set RandomizeJoinInstanceOrder(value) {
    this.SetProp("RandomizeJoinInstanceOrder", 2, value);
  }
  get RenderStreamedRegions() {
    return this.GetProp(
      "RenderStreamedRegions",
      2
      /* Bool */
    );
  }
  set RenderStreamedRegions(value) {
    this.SetProp("RenderStreamedRegions", 2, value);
  }
  get ShowActiveAnimationAsset() {
    return this.GetProp(
      "ShowActiveAnimationAsset",
      2
      /* Bool */
    );
  }
  set ShowActiveAnimationAsset(value) {
    this.SetProp("ShowActiveAnimationAsset", 2, value);
  }
};
var NoCollisionConstraint = class extends Instance {
  constructor() {
    super();
    this.addClassName("NoCollisionConstraint");
    this.Name = "NoCollisionConstraint";
    this.Enabled = true;
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Part0() {
    return this.GetProp(
      "Part0",
      19
      /* Referent */
    );
  }
  set Part0(value) {
    this.SetProp("Part0", 19, value);
  }
  get Part1() {
    return this.GetProp(
      "Part1",
      19
      /* Referent */
    );
  }
  set Part1(value) {
    this.SetProp("Part1", 19, value);
  }
};
var Noise = class extends Instance {
  constructor() {
    super();
    this.addClassName("Noise");
    this.Name = "Noise";
    this.NoiseType = NoiseType.SimplexGabor;
    this.Seed = 1234;
  }
  get NoiseType() {
    return this.GetProp(
      "NoiseType",
      18
      /* Enum */
    );
  }
  set NoiseType(value) {
    this.SetProp("NoiseType", 18, value);
  }
  get Seed() {
    return this.GetProp(
      "Seed",
      3
      /* Int32 */
    );
  }
  set Seed(value) {
    this.SetProp("Seed", 3, value);
  }
};
var NotificationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("NotificationService");
    this.Name = "NotificationService";
  }
};
var OmniRecommendationsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("OmniRecommendationsService");
    this.Name = "OmniRecommendationsService";
  }
};
var OpenCloudService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("OpenCloudService");
    this.Name = "OpenCloudService";
  }
};
var OperationGraph = class extends Instance {
  constructor() {
    super();
    this.addClassName("OperationGraph");
    this.Name = "OperationGraph";
  }
};
var PVInstance = class extends Instance {
  constructor() {
    super();
    this.addClassName("PVInstance");
  }
};
var BasePart = class extends PVInstance {
  constructor() {
    super();
    this.addClassName("BasePart");
    this.BackParamA = -0.5;
    this.BackParamB = 0.5;
    this.BackSurfaceInput = InputType.NoInput;
    this.BottomParamA = -0.5;
    this.BottomParamB = 0.5;
    this.BottomSurfaceInput = InputType.NoInput;
    this.CFrame = CFrame.Identity;
    this.CanQuery = true;
    this.CanTouch = true;
    this.CastShadow = true;
    this.CollisionGroup = "Default";
    this.CollisionGroupId = 0;
    this.EnableFluidForces = true;
    this.FrontParamA = -0.5;
    this.FrontParamB = 0.5;
    this.FrontSurfaceInput = InputType.NoInput;
    this.LeftParamA = -0.5;
    this.LeftParamB = 0.5;
    this.LeftSurfaceInput = InputType.NoInput;
    this.Massless = false;
    this.Material = Material.Plastic;
    this.PivotOffset = CFrame.Identity;
    this.Reflectance = 0;
    this.RightParamA = -0.5;
    this.RightParamB = 0.5;
    this.RightSurfaceInput = InputType.NoInput;
    this.RootPriority = 0;
    this.RotVelocity = new Vector3(0, 0, 0);
    this.TopParamA = -0.5;
    this.TopParamB = 0.5;
    this.TopSurfaceInput = InputType.NoInput;
    this.Velocity = new Vector3(0, 0, 0);
  }
  get Anchored() {
    return this.GetProp(
      "Anchored",
      2
      /* Bool */
    );
  }
  set Anchored(value) {
    this.SetProp("Anchored", 2, value);
  }
  get AudioCanCollide() {
    return this.GetProp(
      "AudioCanCollide",
      2
      /* Bool */
    );
  }
  set AudioCanCollide(value) {
    this.SetProp("AudioCanCollide", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get BackParamA() {
    return this.GetProp(
      "BackParamA",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set BackParamA(value) {
    this.SetProp("BackParamA", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get BackParamB() {
    return this.GetProp(
      "BackParamB",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set BackParamB(value) {
    this.SetProp("BackParamB", 4, value);
  }
  get BackSurface() {
    return this.GetProp(
      "BackSurface",
      18
      /* Enum */
    );
  }
  set BackSurface(value) {
    this.SetProp("BackSurface", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get BackSurfaceInput() {
    return this.GetProp(
      "BackSurfaceInput",
      18
      /* Enum */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set BackSurfaceInput(value) {
    this.SetProp("BackSurfaceInput", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get BottomParamA() {
    return this.GetProp(
      "BottomParamA",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set BottomParamA(value) {
    this.SetProp("BottomParamA", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get BottomParamB() {
    return this.GetProp(
      "BottomParamB",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set BottomParamB(value) {
    this.SetProp("BottomParamB", 4, value);
  }
  get BottomSurface() {
    return this.GetProp(
      "BottomSurface",
      18
      /* Enum */
    );
  }
  set BottomSurface(value) {
    this.SetProp("BottomSurface", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get BottomSurfaceInput() {
    return this.GetProp(
      "BottomSurfaceInput",
      18
      /* Enum */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set BottomSurfaceInput(value) {
    this.SetProp("BottomSurfaceInput", 18, value);
  }
  get CFrame() {
    return this.GetProp(
      "CFrame",
      16
      /* CFrame */
    );
  }
  set CFrame(value) {
    this.SetProp("CFrame", 16, value);
  }
  get CanCollide() {
    return this.GetProp(
      "CanCollide",
      2
      /* Bool */
    );
  }
  set CanCollide(value) {
    this.SetProp("CanCollide", 2, value);
  }
  get CanQuery() {
    return this.GetProp(
      "CanQuery",
      2
      /* Bool */
    );
  }
  set CanQuery(value) {
    this.SetProp("CanQuery", 2, value);
  }
  get CanTouch() {
    return this.GetProp(
      "CanTouch",
      2
      /* Bool */
    );
  }
  set CanTouch(value) {
    this.SetProp("CanTouch", 2, value);
  }
  get CastShadow() {
    return this.GetProp(
      "CastShadow",
      2
      /* Bool */
    );
  }
  set CastShadow(value) {
    this.SetProp("CastShadow", 2, value);
  }
  get CollisionGroup() {
    return this.GetProp(
      "CollisionGroup",
      1
      /* String */
    );
  }
  set CollisionGroup(value) {
    this.SetProp("CollisionGroup", 1, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get CollisionGroupId() {
    return this.GetProp(
      "CollisionGroupId",
      3
      /* Int32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set CollisionGroupId(value) {
    this.SetProp("CollisionGroupId", 3, value);
  }
  get Color3uint8() {
    return this.GetProp(
      "Color3uint8",
      26
      /* Color3uint8 */
    );
  }
  set Color3uint8(value) {
    this.SetProp("Color3uint8", 26, value);
  }
  get CustomPhysicalProperties() {
    return this.GetProp(
      "CustomPhysicalProperties",
      25
      /* PhysicalProperties */
    );
  }
  set CustomPhysicalProperties(value) {
    this.SetProp("CustomPhysicalProperties", 25, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Elasticity() {
    return this.GetProp(
      "Elasticity",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Elasticity(value) {
    this.SetProp("Elasticity", 4, value);
  }
  get EnableFluidForces() {
    return this.GetProp(
      "EnableFluidForces",
      2
      /* Bool */
    );
  }
  set EnableFluidForces(value) {
    this.SetProp("EnableFluidForces", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Friction() {
    return this.GetProp(
      "Friction",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Friction(value) {
    this.SetProp("Friction", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get FrontParamA() {
    return this.GetProp(
      "FrontParamA",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set FrontParamA(value) {
    this.SetProp("FrontParamA", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get FrontParamB() {
    return this.GetProp(
      "FrontParamB",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set FrontParamB(value) {
    this.SetProp("FrontParamB", 4, value);
  }
  get FrontSurface() {
    return this.GetProp(
      "FrontSurface",
      18
      /* Enum */
    );
  }
  set FrontSurface(value) {
    this.SetProp("FrontSurface", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get FrontSurfaceInput() {
    return this.GetProp(
      "FrontSurfaceInput",
      18
      /* Enum */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set FrontSurfaceInput(value) {
    this.SetProp("FrontSurfaceInput", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get LeftParamA() {
    return this.GetProp(
      "LeftParamA",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set LeftParamA(value) {
    this.SetProp("LeftParamA", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get LeftParamB() {
    return this.GetProp(
      "LeftParamB",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set LeftParamB(value) {
    this.SetProp("LeftParamB", 4, value);
  }
  get LeftSurface() {
    return this.GetProp(
      "LeftSurface",
      18
      /* Enum */
    );
  }
  set LeftSurface(value) {
    this.SetProp("LeftSurface", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get LeftSurfaceInput() {
    return this.GetProp(
      "LeftSurfaceInput",
      18
      /* Enum */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set LeftSurfaceInput(value) {
    this.SetProp("LeftSurfaceInput", 18, value);
  }
  get Locked() {
    return this.GetProp(
      "Locked",
      2
      /* Bool */
    );
  }
  set Locked(value) {
    this.SetProp("Locked", 2, value);
  }
  get Massless() {
    return this.GetProp(
      "Massless",
      2
      /* Bool */
    );
  }
  set Massless(value) {
    this.SetProp("Massless", 2, value);
  }
  get Material() {
    return this.GetProp(
      "Material",
      18
      /* Enum */
    );
  }
  set Material(value) {
    this.SetProp("Material", 18, value);
  }
  get MaterialVariantSerialized() {
    return this.GetProp(
      "MaterialVariantSerialized",
      1
      /* String */
    );
  }
  set MaterialVariantSerialized(value) {
    this.SetProp("MaterialVariantSerialized", 1, value);
  }
  get PivotOffset() {
    return this.GetProp(
      "PivotOffset",
      16
      /* CFrame */
    );
  }
  set PivotOffset(value) {
    this.SetProp("PivotOffset", 16, value);
  }
  get Reflectance() {
    return this.GetProp(
      "Reflectance",
      4
      /* Float32 */
    );
  }
  set Reflectance(value) {
    this.SetProp("Reflectance", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get RightParamA() {
    return this.GetProp(
      "RightParamA",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set RightParamA(value) {
    this.SetProp("RightParamA", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get RightParamB() {
    return this.GetProp(
      "RightParamB",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set RightParamB(value) {
    this.SetProp("RightParamB", 4, value);
  }
  get RightSurface() {
    return this.GetProp(
      "RightSurface",
      18
      /* Enum */
    );
  }
  set RightSurface(value) {
    this.SetProp("RightSurface", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get RightSurfaceInput() {
    return this.GetProp(
      "RightSurfaceInput",
      18
      /* Enum */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set RightSurfaceInput(value) {
    this.SetProp("RightSurfaceInput", 18, value);
  }
  get RootPriority() {
    return this.GetProp(
      "RootPriority",
      3
      /* Int32 */
    );
  }
  set RootPriority(value) {
    this.SetProp("RootPriority", 3, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get RotVelocity() {
    return this.GetProp(
      "RotVelocity",
      14
      /* Vector3 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set RotVelocity(value) {
    this.SetProp("RotVelocity", 14, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get TopParamA() {
    return this.GetProp(
      "TopParamA",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set TopParamA(value) {
    this.SetProp("TopParamA", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get TopParamB() {
    return this.GetProp(
      "TopParamB",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set TopParamB(value) {
    this.SetProp("TopParamB", 4, value);
  }
  get TopSurface() {
    return this.GetProp(
      "TopSurface",
      18
      /* Enum */
    );
  }
  set TopSurface(value) {
    this.SetProp("TopSurface", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get TopSurfaceInput() {
    return this.GetProp(
      "TopSurfaceInput",
      18
      /* Enum */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set TopSurfaceInput(value) {
    this.SetProp("TopSurfaceInput", 18, value);
  }
  get Transparency() {
    return this.GetProp(
      "Transparency",
      4
      /* Float32 */
    );
  }
  set Transparency(value) {
    this.SetProp("Transparency", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Velocity() {
    return this.GetProp(
      "Velocity",
      14
      /* Vector3 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Velocity(value) {
    this.SetProp("Velocity", 14, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get BrickColor() {
    return this.GetProp(
      "brickColor",
      11
      /* BrickColor */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set BrickColor(value) {
    this.SetProp("brickColor", 11, value);
  }
  get Size() {
    return this.GetProp(
      "size",
      14
      /* Vector3 */
    );
  }
  set Size(value) {
    this.SetProp("size", 14, value);
  }
};
var CornerWedgePart = class extends BasePart {
  constructor() {
    super();
    this.addClassName("CornerWedgePart");
    this.Name = "CornerWedgePart";
    this.Anchored = false;
    this.BackSurface = SurfaceType.Smooth;
    this.BottomSurface = SurfaceType.Smooth;
    this.CanCollide = true;
    this.Color3uint8 = Color3.FromRGB(163, 162, 165);
    this.Elasticity = 0.5;
    this.Friction = 0.3;
    this.FrontSurface = SurfaceType.Smooth;
    this.LeftSurface = SurfaceType.Smooth;
    this.Locked = false;
    this.RightSurface = SurfaceType.Smooth;
    this.TopSurface = SurfaceType.Smooth;
    this.Transparency = 0;
    this.Size = new Vector3(2, 2, 2);
  }
};
var FormFactorPart = class extends BasePart {
  constructor() {
    super();
    this.addClassName("FormFactorPart");
    this.FormFactor = FormFactor.Brick;
    this.Anchored = false;
    this.BackSurface = SurfaceType.Smooth;
    this.BottomSurface = SurfaceType.Inlet;
    this.CanCollide = true;
    this.Color3uint8 = Color3.FromRGB(163, 162, 165);
    this.Elasticity = 0.5;
    this.Friction = 0.3;
    this.FrontSurface = SurfaceType.Smooth;
    this.LeftSurface = SurfaceType.Smooth;
    this.Locked = false;
    this.RightSurface = SurfaceType.Smooth;
    this.Transparency = 0;
    this.Size = new Vector3(4, 1.2, 2);
  }
  /**@deprecated Deprecated by Roblox*/
  get FormFactor() {
    return this.GetProp(
      "FormFactor",
      18
      /* Enum */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set FormFactor(value) {
    this.SetProp("FormFactor", 18, value);
  }
  get FormFactorRaw() {
    return this.GetProp(
      "formFactorRaw",
      18
      /* Enum */
    );
  }
  set FormFactorRaw(value) {
    this.SetProp("formFactorRaw", 18, value);
  }
};
var Part = class extends FormFactorPart {
  constructor() {
    super();
    this.addClassName("Part");
    this.Name = "Part";
    this.Shape = PartType.Block;
    this.TopSurface = SurfaceType.Studs;
  }
  get Shape() {
    return this.GetProp(
      "shape",
      18
      /* Enum */
    );
  }
  set Shape(value) {
    this.SetProp("shape", 18, value);
  }
};
var FlagStand = class extends Part {
  constructor() {
    super();
    this.addClassName("FlagStand");
    this.Name = "FlagStand";
  }
  get TeamColor() {
    return this.GetProp(
      "TeamColor",
      11
      /* BrickColor */
    );
  }
  set TeamColor(value) {
    this.SetProp("TeamColor", 11, value);
  }
};
var Seat = class extends Part {
  constructor() {
    super();
    this.addClassName("Seat");
    this.Name = "Seat";
    this.Disabled = false;
  }
  get Disabled() {
    return this.GetProp(
      "Disabled",
      2
      /* Bool */
    );
  }
  set Disabled(value) {
    this.SetProp("Disabled", 2, value);
  }
};
var SkateboardPlatform = class extends Part {
  constructor() {
    super();
    this.addClassName("SkateboardPlatform");
    this.Name = "SkateboardPlatform";
    this.Steer = 0;
    this.StickyWheels = true;
    this.Throttle = 0;
  }
  get Steer() {
    return this.GetProp(
      "Steer",
      3
      /* Int32 */
    );
  }
  set Steer(value) {
    this.SetProp("Steer", 3, value);
  }
  get StickyWheels() {
    return this.GetProp(
      "StickyWheels",
      2
      /* Bool */
    );
  }
  set StickyWheels(value) {
    this.SetProp("StickyWheels", 2, value);
  }
  get Throttle() {
    return this.GetProp(
      "Throttle",
      3
      /* Int32 */
    );
  }
  set Throttle(value) {
    this.SetProp("Throttle", 3, value);
  }
};
var SpawnLocation = class extends Part {
  constructor() {
    super();
    this.addClassName("SpawnLocation");
    this.Name = "SpawnLocation";
    this.AllowTeamChangeOnTouch = false;
    this.Duration = 10;
    this.Enabled = true;
    this.Neutral = true;
  }
  get AllowTeamChangeOnTouch() {
    return this.GetProp(
      "AllowTeamChangeOnTouch",
      2
      /* Bool */
    );
  }
  set AllowTeamChangeOnTouch(value) {
    this.SetProp("AllowTeamChangeOnTouch", 2, value);
  }
  get Duration() {
    return this.GetProp(
      "Duration",
      3
      /* Int32 */
    );
  }
  set Duration(value) {
    this.SetProp("Duration", 3, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Neutral() {
    return this.GetProp(
      "Neutral",
      2
      /* Bool */
    );
  }
  set Neutral(value) {
    this.SetProp("Neutral", 2, value);
  }
  get TeamColor() {
    return this.GetProp(
      "TeamColor",
      11
      /* BrickColor */
    );
  }
  set TeamColor(value) {
    this.SetProp("TeamColor", 11, value);
  }
};
var WedgePart = class extends FormFactorPart {
  constructor() {
    super();
    this.addClassName("WedgePart");
    this.Name = "WedgePart";
    this.TopSurface = SurfaceType.Smooth;
  }
};
var Terrain = class extends BasePart {
  constructor() {
    super();
    this.addClassName("Terrain");
    this.Name = "Terrain";
    this.AcquisitionMethod = TerrainAcquisitionMethod.None;
    this.Decoration = false;
    this.GrassLength = 0.7;
    this.MaterialColors = "";
    this.PhysicsGrid = "";
    this.ShorelinesUpgraded = true;
    this.SmoothGrid = "";
    this.SmoothVoxelsUpgraded = false;
    this.WaterColor = Color3.FromRGB(13, 84, 92);
    this.WaterReflectance = 1;
    this.WaterTransparency = 0.3;
    this.WaterWaveSize = 0.15;
    this.WaterWaveSpeed = 10;
    this.Anchored = true;
    this.BackSurface = SurfaceType.Smooth;
    this.BottomSurface = SurfaceType.Inlet;
    this.CanCollide = true;
    this.Color3uint8 = Color3.FromRGB(163, 162, 165);
    this.Elasticity = 0.3;
    this.Friction = 0.5;
    this.FrontSurface = SurfaceType.Smooth;
    this.LeftSurface = SurfaceType.Smooth;
    this.Locked = true;
    this.RightSurface = SurfaceType.Smooth;
    this.TopSurface = SurfaceType.Studs;
    this.Transparency = 0;
    this.Size = new Vector3(2044, 252, 2044);
  }
  get AcquisitionMethod() {
    return this.GetProp(
      "AcquisitionMethod",
      18
      /* Enum */
    );
  }
  set AcquisitionMethod(value) {
    this.SetProp("AcquisitionMethod", 18, value);
  }
  get Decoration() {
    return this.GetProp(
      "Decoration",
      2
      /* Bool */
    );
  }
  set Decoration(value) {
    this.SetProp("Decoration", 2, value);
  }
  get GrassLength() {
    return this.GetProp(
      "GrassLength",
      4
      /* Float32 */
    );
  }
  set GrassLength(value) {
    this.SetProp("GrassLength", 4, value);
  }
  get MaterialColors() {
    return this.GetProp(
      "MaterialColors",
      1
      /* String */
    );
  }
  set MaterialColors(value) {
    this.SetProp("MaterialColors", 1, value);
  }
  get PhysicsGrid() {
    return this.GetProp(
      "PhysicsGrid",
      1
      /* String */
    );
  }
  set PhysicsGrid(value) {
    this.SetProp("PhysicsGrid", 1, value);
  }
  get ShorelinesUpgraded() {
    return this.GetProp(
      "ShorelinesUpgraded",
      2
      /* Bool */
    );
  }
  set ShorelinesUpgraded(value) {
    this.SetProp("ShorelinesUpgraded", 2, value);
  }
  get SmoothGrid() {
    return this.GetProp(
      "SmoothGrid",
      1
      /* String */
    );
  }
  set SmoothGrid(value) {
    this.SetProp("SmoothGrid", 1, value);
  }
  get SmoothVoxelsUpgraded() {
    return this.GetProp(
      "SmoothVoxelsUpgraded",
      2
      /* Bool */
    );
  }
  set SmoothVoxelsUpgraded(value) {
    this.SetProp("SmoothVoxelsUpgraded", 2, value);
  }
  get WaterColor() {
    return this.GetProp(
      "WaterColor",
      12
      /* Color3 */
    );
  }
  set WaterColor(value) {
    this.SetProp("WaterColor", 12, value);
  }
  get WaterReflectance() {
    return this.GetProp(
      "WaterReflectance",
      4
      /* Float32 */
    );
  }
  set WaterReflectance(value) {
    this.SetProp("WaterReflectance", 4, value);
  }
  get WaterTransparency() {
    return this.GetProp(
      "WaterTransparency",
      4
      /* Float32 */
    );
  }
  set WaterTransparency(value) {
    this.SetProp("WaterTransparency", 4, value);
  }
  get WaterWaveSize() {
    return this.GetProp(
      "WaterWaveSize",
      4
      /* Float32 */
    );
  }
  set WaterWaveSize(value) {
    this.SetProp("WaterWaveSize", 4, value);
  }
  get WaterWaveSpeed() {
    return this.GetProp(
      "WaterWaveSpeed",
      4
      /* Float32 */
    );
  }
  set WaterWaveSpeed(value) {
    this.SetProp("WaterWaveSpeed", 4, value);
  }
};
var TriangleMeshPart = class extends BasePart {
  constructor() {
    super();
    this.addClassName("TriangleMeshPart");
    this.BackSurface = SurfaceType.Smooth;
    this.BottomSurface = SurfaceType.Smooth;
    this.Elasticity = 0.5;
    this.Friction = 0.3;
    this.FrontSurface = SurfaceType.Smooth;
    this.LeftSurface = SurfaceType.Smooth;
    this.Locked = false;
    this.RightSurface = SurfaceType.Smooth;
    this.TopSurface = SurfaceType.Smooth;
    this.Size = new Vector3(4, 1.2, 2);
  }
  get AeroMeshData() {
    return this.GetProp(
      "AeroMeshData",
      28
      /* SharedString */
    );
  }
  set AeroMeshData(value) {
    this.SetProp("AeroMeshData", 28, value);
  }
  get FluidFidelityInternal() {
    return this.GetProp(
      "FluidFidelityInternal",
      18
      /* Enum */
    );
  }
  set FluidFidelityInternal(value) {
    this.SetProp("FluidFidelityInternal", 18, value);
  }
  get PhysicalConfigData() {
    return this.GetProp(
      "PhysicalConfigData",
      28
      /* SharedString */
    );
  }
  set PhysicalConfigData(value) {
    this.SetProp("PhysicalConfigData", 28, value);
  }
  get UnscaledCofm() {
    return this.GetProp(
      "UnscaledCofm",
      14
      /* Vector3 */
    );
  }
  set UnscaledCofm(value) {
    this.SetProp("UnscaledCofm", 14, value);
  }
  get UnscaledVolInertiaDiags() {
    return this.GetProp(
      "UnscaledVolInertiaDiags",
      14
      /* Vector3 */
    );
  }
  set UnscaledVolInertiaDiags(value) {
    this.SetProp("UnscaledVolInertiaDiags", 14, value);
  }
  get UnscaledVolInertiaOffDiags() {
    return this.GetProp(
      "UnscaledVolInertiaOffDiags",
      14
      /* Vector3 */
    );
  }
  set UnscaledVolInertiaOffDiags(value) {
    this.SetProp("UnscaledVolInertiaOffDiags", 14, value);
  }
  get UnscaledVolume() {
    return this.GetProp(
      "UnscaledVolume",
      4
      /* Float32 */
    );
  }
  set UnscaledVolume(value) {
    this.SetProp("UnscaledVolume", 4, value);
  }
};
var MeshPart = class extends TriangleMeshPart {
  constructor() {
    super();
    this.addClassName("MeshPart");
    this.Name = "MeshPart";
    this.DoubleSided = false;
    this.HasJointOffset = false;
    this.HasSkinnedMesh = false;
    this.InitialSize = new Vector3(0, 0, 0);
    this.JointOffset = new Vector3(0, 0, 0);
    this.MeshID = "";
    this.MeshId = "";
    this.PhysicsData = "";
    this.RenderFidelity = RenderFidelity.Automatic;
    this.TextureID = "";
    this.VertexCount = 0;
    this.Anchored = false;
    this.CanCollide = true;
    this.Color3uint8 = Color3.FromRGB(163, 162, 165);
    this.Transparency = 0;
  }
  get DoubleSided() {
    return this.GetProp(
      "DoubleSided",
      2
      /* Bool */
    );
  }
  set DoubleSided(value) {
    this.SetProp("DoubleSided", 2, value);
  }
  get HasJointOffset() {
    return this.GetProp(
      "HasJointOffset",
      2
      /* Bool */
    );
  }
  set HasJointOffset(value) {
    this.SetProp("HasJointOffset", 2, value);
  }
  get HasSkinnedMesh() {
    return this.GetProp(
      "HasSkinnedMesh",
      2
      /* Bool */
    );
  }
  set HasSkinnedMesh(value) {
    this.SetProp("HasSkinnedMesh", 2, value);
  }
  get InitialSize() {
    return this.GetProp(
      "InitialSize",
      14
      /* Vector3 */
    );
  }
  set InitialSize(value) {
    this.SetProp("InitialSize", 14, value);
  }
  get JointOffset() {
    return this.GetProp(
      "JointOffset",
      14
      /* Vector3 */
    );
  }
  set JointOffset(value) {
    this.SetProp("JointOffset", 14, value);
  }
  get MeshContent() {
    return this.GetProp(
      "MeshContent",
      1
      /* String */
    );
  }
  set MeshContent(value) {
    this.SetProp("MeshContent", 1, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get MeshID() {
    return this.GetProp(
      "MeshID",
      1
      /* String */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set MeshID(value) {
    this.SetProp("MeshID", 1, value);
  }
  get MeshId() {
    return this.GetProp(
      "MeshId",
      1
      /* String */
    );
  }
  set MeshId(value) {
    this.SetProp("MeshId", 1, value);
  }
  get PhysicsData() {
    return this.GetProp(
      "PhysicsData",
      1
      /* String */
    );
  }
  set PhysicsData(value) {
    this.SetProp("PhysicsData", 1, value);
  }
  get RenderFidelity() {
    return this.GetProp(
      "RenderFidelity",
      18
      /* Enum */
    );
  }
  set RenderFidelity(value) {
    this.SetProp("RenderFidelity", 18, value);
  }
  get TextureContent() {
    return this.GetProp(
      "TextureContent",
      1
      /* String */
    );
  }
  set TextureContent(value) {
    this.SetProp("TextureContent", 1, value);
  }
  get TextureID() {
    return this.GetProp(
      "TextureID",
      1
      /* String */
    );
  }
  set TextureID(value) {
    this.SetProp("TextureID", 1, value);
  }
  get VertexCount() {
    return this.GetProp(
      "VertexCount",
      3
      /* Int32 */
    );
  }
  set VertexCount(value) {
    this.SetProp("VertexCount", 3, value);
  }
};
var PartOperation = class extends TriangleMeshPart {
  constructor() {
    super();
    this.addClassName("PartOperation");
    this.Name = "PartOperation";
    this.AssetId = "";
    this.ChildData = "";
    this.ComponentIndex = -1;
    this.FormFactor = FormFactor.Custom;
    this.InitialSize = new Vector3(1, 1, 1);
    this.MeshData = "";
    this.OffCentered = false;
    this.PhysicsData = "";
    this.RenderFidelity = RenderFidelity.Automatic;
    this.SmoothingAngle = 0;
    this.UsePartColor = false;
    this.Color3uint8 = Color3.FromRGB(255, 255, 255);
  }
  get AssetId() {
    return this.GetProp(
      "AssetId",
      1
      /* String */
    );
  }
  set AssetId(value) {
    this.SetProp("AssetId", 1, value);
  }
  get ChildData() {
    return this.GetProp(
      "ChildData",
      1
      /* String */
    );
  }
  set ChildData(value) {
    this.SetProp("ChildData", 1, value);
  }
  get ChildData2() {
    return this.GetProp(
      "ChildData2",
      28
      /* SharedString */
    );
  }
  set ChildData2(value) {
    this.SetProp("ChildData2", 28, value);
  }
  get ComponentIndex() {
    return this.GetProp(
      "ComponentIndex",
      3
      /* Int32 */
    );
  }
  set ComponentIndex(value) {
    this.SetProp("ComponentIndex", 3, value);
  }
  get FormFactor() {
    return this.GetProp(
      "FormFactor",
      18
      /* Enum */
    );
  }
  set FormFactor(value) {
    this.SetProp("FormFactor", 18, value);
  }
  get InitialSize() {
    return this.GetProp(
      "InitialSize",
      14
      /* Vector3 */
    );
  }
  set InitialSize(value) {
    this.SetProp("InitialSize", 14, value);
  }
  get MeshData() {
    return this.GetProp(
      "MeshData",
      1
      /* String */
    );
  }
  set MeshData(value) {
    this.SetProp("MeshData", 1, value);
  }
  get MeshData2() {
    return this.GetProp(
      "MeshData2",
      28
      /* SharedString */
    );
  }
  set MeshData2(value) {
    this.SetProp("MeshData2", 28, value);
  }
  get OffCentered() {
    return this.GetProp(
      "OffCentered",
      2
      /* Bool */
    );
  }
  set OffCentered(value) {
    this.SetProp("OffCentered", 2, value);
  }
  get PhysicsData() {
    return this.GetProp(
      "PhysicsData",
      1
      /* String */
    );
  }
  set PhysicsData(value) {
    this.SetProp("PhysicsData", 1, value);
  }
  get RenderFidelity() {
    return this.GetProp(
      "RenderFidelity",
      18
      /* Enum */
    );
  }
  set RenderFidelity(value) {
    this.SetProp("RenderFidelity", 18, value);
  }
  get SmoothingAngle() {
    return this.GetProp(
      "SmoothingAngle",
      4
      /* Float32 */
    );
  }
  set SmoothingAngle(value) {
    this.SetProp("SmoothingAngle", 4, value);
  }
  get UsePartColor() {
    return this.GetProp(
      "UsePartColor",
      2
      /* Bool */
    );
  }
  set UsePartColor(value) {
    this.SetProp("UsePartColor", 2, value);
  }
};
var IntersectOperation = class extends PartOperation {
  constructor() {
    super();
    this.addClassName("IntersectOperation");
    this.Name = "IntersectOperation";
    this.Anchored = false;
    this.CanCollide = true;
    this.Transparency = 0;
  }
};
var NegateOperation = class extends PartOperation {
  constructor() {
    super();
    this.addClassName("NegateOperation");
    this.Name = "NegateOperation";
    this.Anchored = true;
    this.CanCollide = false;
    this.Transparency = 0.1;
  }
};
var UnionOperation = class extends PartOperation {
  constructor() {
    super();
    this.addClassName("UnionOperation");
    this.Name = "UnionOperation";
    this.Anchored = false;
    this.CanCollide = true;
    this.Transparency = 0;
  }
};
var TrussPart = class extends BasePart {
  constructor() {
    super();
    this.addClassName("TrussPart");
    this.Name = "TrussPart";
    this.Style = Style.AlternatingSupports;
    this.Anchored = false;
    this.BackSurface = SurfaceType.Universal;
    this.BottomSurface = SurfaceType.Universal;
    this.CanCollide = true;
    this.Color3uint8 = Color3.FromRGB(163, 162, 165);
    this.Elasticity = 0.5;
    this.Friction = 0.3;
    this.FrontSurface = SurfaceType.Universal;
    this.LeftSurface = SurfaceType.Universal;
    this.Locked = false;
    this.RightSurface = SurfaceType.Universal;
    this.TopSurface = SurfaceType.Universal;
    this.Transparency = 0;
    this.Size = new Vector3(2, 2, 2);
  }
  get Style() {
    return this.GetProp(
      "style",
      18
      /* Enum */
    );
  }
  set Style(value) {
    this.SetProp("style", 18, value);
  }
};
var VehicleSeat = class extends BasePart {
  constructor() {
    super();
    this.addClassName("VehicleSeat");
    this.Name = "VehicleSeat";
    this.Disabled = false;
    this.HeadsUpDisplay = true;
    this.MaxSpeed = 25;
    this.Steer = 0;
    this.SteerFloat = 0;
    this.Throttle = 0;
    this.ThrottleFloat = 0;
    this.Torque = 10;
    this.TurnSpeed = 1;
    this.Anchored = false;
    this.BackSurface = SurfaceType.Smooth;
    this.BottomSurface = SurfaceType.Inlet;
    this.CanCollide = true;
    this.Color3uint8 = Color3.FromRGB(163, 162, 165);
    this.Elasticity = 0.5;
    this.Friction = 0.3;
    this.FrontSurface = SurfaceType.Smooth;
    this.LeftSurface = SurfaceType.Smooth;
    this.Locked = false;
    this.RightSurface = SurfaceType.Smooth;
    this.TopSurface = SurfaceType.Studs;
    this.Transparency = 0;
    this.Size = new Vector3(4, 1.2, 2);
  }
  get Disabled() {
    return this.GetProp(
      "Disabled",
      2
      /* Bool */
    );
  }
  set Disabled(value) {
    this.SetProp("Disabled", 2, value);
  }
  get HeadsUpDisplay() {
    return this.GetProp(
      "HeadsUpDisplay",
      2
      /* Bool */
    );
  }
  set HeadsUpDisplay(value) {
    this.SetProp("HeadsUpDisplay", 2, value);
  }
  get MaxSpeed() {
    return this.GetProp(
      "MaxSpeed",
      4
      /* Float32 */
    );
  }
  set MaxSpeed(value) {
    this.SetProp("MaxSpeed", 4, value);
  }
  get Steer() {
    return this.GetProp(
      "Steer",
      3
      /* Int32 */
    );
  }
  set Steer(value) {
    this.SetProp("Steer", 3, value);
  }
  get SteerFloat() {
    return this.GetProp(
      "SteerFloat",
      4
      /* Float32 */
    );
  }
  set SteerFloat(value) {
    this.SetProp("SteerFloat", 4, value);
  }
  get Throttle() {
    return this.GetProp(
      "Throttle",
      3
      /* Int32 */
    );
  }
  set Throttle(value) {
    this.SetProp("Throttle", 3, value);
  }
  get ThrottleFloat() {
    return this.GetProp(
      "ThrottleFloat",
      4
      /* Float32 */
    );
  }
  set ThrottleFloat(value) {
    this.SetProp("ThrottleFloat", 4, value);
  }
  get Torque() {
    return this.GetProp(
      "Torque",
      4
      /* Float32 */
    );
  }
  set Torque(value) {
    this.SetProp("Torque", 4, value);
  }
  get TurnSpeed() {
    return this.GetProp(
      "TurnSpeed",
      4
      /* Float32 */
    );
  }
  set TurnSpeed(value) {
    this.SetProp("TurnSpeed", 4, value);
  }
};
var Camera = class extends PVInstance {
  constructor() {
    super();
    this.addClassName("Camera");
    this.Name = "Camera";
    this.CameraType = CameraType.Fixed;
    this.FieldOfView = 70;
    this.FieldOfViewMode = FieldOfViewMode.Vertical;
    this.HeadLocked = true;
    this.HeadScale = 1;
    this.VRTiltAndRollEnabled = false;
    this.CFrame = new CFrame(new Vector3(0, 20, 20), [1, 0, -0, -0, 0.707106829, 0.707106829, 0, -0.707106829, 0.707106829]);
    this.Focus = new CFrame(new Vector3(0, 0, -5), [1, 0, 0, 0, 1, 0, 0, 0, 1]);
  }
  get CFrame() {
    return this.GetProp(
      "CFrame",
      16
      /* CFrame */
    );
  }
  set CFrame(value) {
    this.SetProp("CFrame", 16, value);
  }
  get CameraSubject() {
    return this.GetProp(
      "CameraSubject",
      19
      /* Referent */
    );
  }
  set CameraSubject(value) {
    this.SetProp("CameraSubject", 19, value);
  }
  get CameraType() {
    return this.GetProp(
      "CameraType",
      18
      /* Enum */
    );
  }
  set CameraType(value) {
    this.SetProp("CameraType", 18, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get CoordinateFrame() {
    return this.CFrame;
  }
  /**@deprecated Deprecated by Roblox*/
  set CoordinateFrame(value) {
    this.CFrame = value;
  }
  get FieldOfView() {
    return this.GetProp(
      "FieldOfView",
      4
      /* Float32 */
    );
  }
  set FieldOfView(value) {
    this.SetProp("FieldOfView", 4, value);
  }
  get FieldOfViewMode() {
    return this.GetProp(
      "FieldOfViewMode",
      18
      /* Enum */
    );
  }
  set FieldOfViewMode(value) {
    this.SetProp("FieldOfViewMode", 18, value);
  }
  get Focus() {
    return this.GetProp(
      "Focus",
      16
      /* CFrame */
    );
  }
  set Focus(value) {
    this.SetProp("Focus", 16, value);
  }
  get HeadLocked() {
    return this.GetProp(
      "HeadLocked",
      2
      /* Bool */
    );
  }
  set HeadLocked(value) {
    this.SetProp("HeadLocked", 2, value);
  }
  get HeadScale() {
    return this.GetProp(
      "HeadScale",
      4
      /* Float32 */
    );
  }
  set HeadScale(value) {
    this.SetProp("HeadScale", 4, value);
  }
  get VRTiltAndRollEnabled() {
    return this.GetProp(
      "VRTiltAndRollEnabled",
      2
      /* Bool */
    );
  }
  set VRTiltAndRollEnabled(value) {
    this.SetProp("VRTiltAndRollEnabled", 2, value);
  }
};
var Model = class extends PVInstance {
  constructor() {
    super();
    this.addClassName("Model");
    this.Name = "Model";
    this.LevelOfDetail = ModelLevelOfDetail.Automatic;
    this.ModelMeshSize = new Vector3(0, 0, 0);
    this.ModelStreamingMode = ModelStreamingMode.Default;
    this.NeedsPivotMigration = false;
    this.ScaleFactor = 1;
  }
  get LevelOfDetail() {
    return this.GetProp(
      "LevelOfDetail",
      18
      /* Enum */
    );
  }
  set LevelOfDetail(value) {
    this.SetProp("LevelOfDetail", 18, value);
  }
  get ModelMeshCFrame() {
    return this.GetProp(
      "ModelMeshCFrame",
      16
      /* CFrame */
    );
  }
  set ModelMeshCFrame(value) {
    this.SetProp("ModelMeshCFrame", 16, value);
  }
  get ModelMeshData() {
    return this.GetProp(
      "ModelMeshData",
      28
      /* SharedString */
    );
  }
  set ModelMeshData(value) {
    this.SetProp("ModelMeshData", 28, value);
  }
  get ModelMeshSize() {
    return this.GetProp(
      "ModelMeshSize",
      14
      /* Vector3 */
    );
  }
  set ModelMeshSize(value) {
    this.SetProp("ModelMeshSize", 14, value);
  }
  get ModelStreamingMode() {
    return this.GetProp(
      "ModelStreamingMode",
      18
      /* Enum */
    );
  }
  set ModelStreamingMode(value) {
    this.SetProp("ModelStreamingMode", 18, value);
  }
  get NeedsPivotMigration() {
    return this.GetProp(
      "NeedsPivotMigration",
      2
      /* Bool */
    );
  }
  set NeedsPivotMigration(value) {
    this.SetProp("NeedsPivotMigration", 2, value);
  }
  get PrimaryPart() {
    return this.GetProp(
      "PrimaryPart",
      19
      /* Referent */
    );
  }
  set PrimaryPart(value) {
    this.SetProp("PrimaryPart", 19, value);
  }
  get ScaleFactor() {
    return this.GetProp(
      "ScaleFactor",
      4
      /* Float32 */
    );
  }
  set ScaleFactor(value) {
    this.SetProp("ScaleFactor", 4, value);
  }
  get WorldPivotData() {
    return this.GetProp(
      "WorldPivotData",
      30
      /* OptionalCFrame */
    );
  }
  set WorldPivotData(value) {
    this.SetProp("WorldPivotData", 30, value);
  }
};
var Actor = class extends Model {
  constructor() {
    super();
    this.addClassName("Actor");
    this.Name = "Actor";
  }
};
var BackpackItem = class extends Model {
  constructor() {
    super();
    this.addClassName("BackpackItem");
    this.TextureId = "";
  }
  get TextureId() {
    return this.GetProp(
      "TextureId",
      1
      /* String */
    );
  }
  set TextureId(value) {
    this.SetProp("TextureId", 1, value);
  }
};
var HopperBin = class extends BackpackItem {
  constructor() {
    super();
    this.addClassName("HopperBin");
    this.Name = "HopperBin";
    this.Active = false;
    this.BinType = BinType.Script;
  }
  get Active() {
    return this.GetProp(
      "Active",
      2
      /* Bool */
    );
  }
  set Active(value) {
    this.SetProp("Active", 2, value);
  }
  get BinType() {
    return this.GetProp(
      "BinType",
      18
      /* Enum */
    );
  }
  set BinType(value) {
    this.SetProp("BinType", 18, value);
  }
};
var Tool = class extends BackpackItem {
  constructor() {
    super();
    this.addClassName("Tool");
    this.Name = "Tool";
    this.CanBeDropped = true;
    this.Enabled = true;
    this.ManualActivationOnly = false;
    this.RequiresHandle = true;
    this.ToolTip = "";
    this.Grip = CFrame.Identity;
  }
  get CanBeDropped() {
    return this.GetProp(
      "CanBeDropped",
      2
      /* Bool */
    );
  }
  set CanBeDropped(value) {
    this.SetProp("CanBeDropped", 2, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Grip() {
    return this.GetProp(
      "Grip",
      16
      /* CFrame */
    );
  }
  set Grip(value) {
    this.SetProp("Grip", 16, value);
  }
  get ManualActivationOnly() {
    return this.GetProp(
      "ManualActivationOnly",
      2
      /* Bool */
    );
  }
  set ManualActivationOnly(value) {
    this.SetProp("ManualActivationOnly", 2, value);
  }
  get RequiresHandle() {
    return this.GetProp(
      "RequiresHandle",
      2
      /* Bool */
    );
  }
  set RequiresHandle(value) {
    this.SetProp("RequiresHandle", 2, value);
  }
  get ToolTip() {
    return this.GetProp(
      "ToolTip",
      1
      /* String */
    );
  }
  set ToolTip(value) {
    this.SetProp("ToolTip", 1, value);
  }
};
var Flag = class extends Tool {
  constructor() {
    super();
    this.addClassName("Flag");
    this.Name = "Flag";
  }
  get TeamColor() {
    return this.GetProp(
      "TeamColor",
      11
      /* BrickColor */
    );
  }
  set TeamColor(value) {
    this.SetProp("TeamColor", 11, value);
  }
};
var WorldRoot = class extends Model {
  constructor() {
    super();
    this.addClassName("WorldRoot");
  }
};
var Workspace = class extends WorldRoot {
  constructor() {
    super();
    this._isService = true;
    this.addClassName("Workspace");
    this.Name = "Workspace";
    this.AirDensity = 12e-4;
    this.AllowThirdPartySales = false;
    this.ClientAnimatorThrottling = ClientAnimatorThrottlingMode.Default;
    this.DistributedGameTime = 0;
    this.FallenPartsDestroyHeight = -500;
    this.GlobalWind = new Vector3(0, 0, 0);
    this.Gravity = 196.2;
    this.Retargeting = AnimatorRetargetingMode.Default;
    this.StreamingEnabled = true;
  }
  get AirDensity() {
    return this.GetProp(
      "AirDensity",
      4
      /* Float32 */
    );
  }
  set AirDensity(value) {
    this.SetProp("AirDensity", 4, value);
  }
  get AllowThirdPartySales() {
    return this.GetProp(
      "AllowThirdPartySales",
      2
      /* Bool */
    );
  }
  set AllowThirdPartySales(value) {
    this.SetProp("AllowThirdPartySales", 2, value);
  }
  get AvatarUnificationMode() {
    return this.GetProp(
      "AvatarUnificationMode",
      18
      /* Enum */
    );
  }
  set AvatarUnificationMode(value) {
    this.SetProp("AvatarUnificationMode", 18, value);
  }
  get ClientAnimatorThrottling() {
    return this.GetProp(
      "ClientAnimatorThrottling",
      18
      /* Enum */
    );
  }
  set ClientAnimatorThrottling(value) {
    this.SetProp("ClientAnimatorThrottling", 18, value);
  }
  get CollisionGroupData() {
    return this.GetProp(
      "CollisionGroupData",
      1
      /* String */
    );
  }
  set CollisionGroupData(value) {
    this.SetProp("CollisionGroupData", 1, value);
  }
  get CurrentCamera() {
    return this.GetProp(
      "CurrentCamera",
      19
      /* Referent */
    );
  }
  set CurrentCamera(value) {
    this.SetProp("CurrentCamera", 19, value);
  }
  get DistributedGameTime() {
    return this.GetProp(
      "DistributedGameTime",
      5
      /* Float64 */
    );
  }
  set DistributedGameTime(value) {
    this.SetProp("DistributedGameTime", 5, value);
  }
  get ExplicitAutoJoints() {
    return this.GetProp(
      "ExplicitAutoJoints",
      2
      /* Bool */
    );
  }
  set ExplicitAutoJoints(value) {
    this.SetProp("ExplicitAutoJoints", 2, value);
  }
  get FallHeightEnabled() {
    return this.GetProp(
      "FallHeightEnabled",
      2
      /* Bool */
    );
  }
  set FallHeightEnabled(value) {
    this.SetProp("FallHeightEnabled", 2, value);
  }
  get FallenPartsDestroyHeight() {
    return this.GetProp(
      "FallenPartsDestroyHeight",
      4
      /* Float32 */
    );
  }
  set FallenPartsDestroyHeight(value) {
    this.SetProp("FallenPartsDestroyHeight", 4, value);
  }
  get FluidForces() {
    return this.GetProp(
      "FluidForces",
      18
      /* Enum */
    );
  }
  set FluidForces(value) {
    this.SetProp("FluidForces", 18, value);
  }
  get GlobalWind() {
    return this.GetProp(
      "GlobalWind",
      14
      /* Vector3 */
    );
  }
  set GlobalWind(value) {
    this.SetProp("GlobalWind", 14, value);
  }
  get Gravity() {
    return this.GetProp(
      "Gravity",
      4
      /* Float32 */
    );
  }
  set Gravity(value) {
    this.SetProp("Gravity", 4, value);
  }
  get IKControlConstraintSupport() {
    return this.GetProp(
      "IKControlConstraintSupport",
      18
      /* Enum */
    );
  }
  set IKControlConstraintSupport(value) {
    this.SetProp("IKControlConstraintSupport", 18, value);
  }
  get MeshPartHeadsAndAccessories() {
    return this.GetProp(
      "MeshPartHeadsAndAccessories",
      18
      /* Enum */
    );
  }
  set MeshPartHeadsAndAccessories(value) {
    this.SetProp("MeshPartHeadsAndAccessories", 18, value);
  }
  get ModelStreamingBehavior() {
    return this.GetProp(
      "ModelStreamingBehavior",
      18
      /* Enum */
    );
  }
  set ModelStreamingBehavior(value) {
    this.SetProp("ModelStreamingBehavior", 18, value);
  }
  get MoverConstraintRootBehavior() {
    return this.GetProp(
      "MoverConstraintRootBehavior",
      18
      /* Enum */
    );
  }
  set MoverConstraintRootBehavior(value) {
    this.SetProp("MoverConstraintRootBehavior", 18, value);
  }
  get PathfindingUseImprovedSearch() {
    return this.GetProp(
      "PathfindingUseImprovedSearch",
      18
      /* Enum */
    );
  }
  set PathfindingUseImprovedSearch(value) {
    this.SetProp("PathfindingUseImprovedSearch", 18, value);
  }
  get PhysicsImprovedSleep() {
    return this.GetProp(
      "PhysicsImprovedSleep",
      18
      /* Enum */
    );
  }
  set PhysicsImprovedSleep(value) {
    this.SetProp("PhysicsImprovedSleep", 18, value);
  }
  get PhysicsSteppingMethod() {
    return this.GetProp(
      "PhysicsSteppingMethod",
      18
      /* Enum */
    );
  }
  set PhysicsSteppingMethod(value) {
    this.SetProp("PhysicsSteppingMethod", 18, value);
  }
  get PlayerCharacterDestroyBehavior() {
    return this.GetProp(
      "PlayerCharacterDestroyBehavior",
      18
      /* Enum */
    );
  }
  set PlayerCharacterDestroyBehavior(value) {
    this.SetProp("PlayerCharacterDestroyBehavior", 18, value);
  }
  get PrimalPhysicsSolver() {
    return this.GetProp(
      "PrimalPhysicsSolver",
      18
      /* Enum */
    );
  }
  set PrimalPhysicsSolver(value) {
    this.SetProp("PrimalPhysicsSolver", 18, value);
  }
  get RejectCharacterDeletions() {
    return this.GetProp(
      "RejectCharacterDeletions",
      18
      /* Enum */
    );
  }
  set RejectCharacterDeletions(value) {
    this.SetProp("RejectCharacterDeletions", 18, value);
  }
  get RenderingCacheOptimizations() {
    return this.GetProp(
      "RenderingCacheOptimizations",
      18
      /* Enum */
    );
  }
  set RenderingCacheOptimizations(value) {
    this.SetProp("RenderingCacheOptimizations", 18, value);
  }
  get ReplicateInstanceDestroySetting() {
    return this.GetProp(
      "ReplicateInstanceDestroySetting",
      18
      /* Enum */
    );
  }
  set ReplicateInstanceDestroySetting(value) {
    this.SetProp("ReplicateInstanceDestroySetting", 18, value);
  }
  get Retargeting() {
    return this.GetProp(
      "Retargeting",
      18
      /* Enum */
    );
  }
  set Retargeting(value) {
    this.SetProp("Retargeting", 18, value);
  }
  get SandboxedInstanceMode() {
    return this.GetProp(
      "SandboxedInstanceMode",
      18
      /* Enum */
    );
  }
  set SandboxedInstanceMode(value) {
    this.SetProp("SandboxedInstanceMode", 18, value);
  }
  get SignalBehavior2() {
    return this.GetProp(
      "SignalBehavior2",
      18
      /* Enum */
    );
  }
  set SignalBehavior2(value) {
    this.SetProp("SignalBehavior2", 18, value);
  }
  get StreamOutBehavior() {
    return this.GetProp(
      "StreamOutBehavior",
      18
      /* Enum */
    );
  }
  set StreamOutBehavior(value) {
    this.SetProp("StreamOutBehavior", 18, value);
  }
  get StreamingEnabled() {
    return this.GetProp(
      "StreamingEnabled",
      2
      /* Bool */
    );
  }
  set StreamingEnabled(value) {
    this.SetProp("StreamingEnabled", 2, value);
  }
  get StreamingIntegrityMode() {
    return this.GetProp(
      "StreamingIntegrityMode",
      18
      /* Enum */
    );
  }
  set StreamingIntegrityMode(value) {
    this.SetProp("StreamingIntegrityMode", 18, value);
  }
  get StreamingMinRadius() {
    return this.GetProp(
      "StreamingMinRadius",
      3
      /* Int32 */
    );
  }
  set StreamingMinRadius(value) {
    this.SetProp("StreamingMinRadius", 3, value);
  }
  get StreamingTargetRadius() {
    return this.GetProp(
      "StreamingTargetRadius",
      3
      /* Int32 */
    );
  }
  set StreamingTargetRadius(value) {
    this.SetProp("StreamingTargetRadius", 3, value);
  }
  get TerrainWeldsFixed() {
    return this.GetProp(
      "TerrainWeldsFixed",
      2
      /* Bool */
    );
  }
  set TerrainWeldsFixed(value) {
    this.SetProp("TerrainWeldsFixed", 2, value);
  }
  get TouchEventsUseCollisionGroups() {
    return this.GetProp(
      "TouchEventsUseCollisionGroups",
      18
      /* Enum */
    );
  }
  set TouchEventsUseCollisionGroups(value) {
    this.SetProp("TouchEventsUseCollisionGroups", 18, value);
  }
  get TouchesUseCollisionGroups() {
    return this.GetProp(
      "TouchesUseCollisionGroups",
      2
      /* Bool */
    );
  }
  set TouchesUseCollisionGroups(value) {
    this.SetProp("TouchesUseCollisionGroups", 2, value);
  }
};
var WorldModel = class extends WorldRoot {
  constructor() {
    super();
    this.addClassName("WorldModel");
    this.Name = "WorldModel";
  }
};
var PackageService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PackageService");
    this.Name = "PackageService";
  }
};
var PackageUIService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PackageUIService");
    this.Name = "PackageUIService";
  }
};
var PartOperationAsset = class extends Instance {
  constructor() {
    super();
    this.addClassName("PartOperationAsset");
    this.Name = "PartOperationAsset";
    this.ChildData = "";
    this.MeshData = "";
  }
  get ChildData() {
    return this.GetProp(
      "ChildData",
      1
      /* String */
    );
  }
  set ChildData(value) {
    this.SetProp("ChildData", 1, value);
  }
  get MeshData() {
    return this.GetProp(
      "MeshData",
      1
      /* String */
    );
  }
  set MeshData(value) {
    this.SetProp("MeshData", 1, value);
  }
};
var ParticleEmitter = class extends Instance {
  constructor() {
    super();
    this.addClassName("ParticleEmitter");
    this.Name = "ParticleEmitter";
    this.Acceleration = new Vector3(0, 0, 0);
    this.Brightness = 1;
    this.Color = new ColorSequence(new ColorSequenceKeypoint(0, Color3.FromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.FromRGB(255, 255, 255)));
    this.Drag = 0;
    this.EmissionDirection = NormalId.Top;
    this.Enabled = true;
    this.FlipbookFramerate = new NumberRange(1, 1);
    this.FlipbookIncompatible = "Particle texture must be 1024 by 1024 to use flipbooks.";
    this.FlipbookLayout = ParticleFlipbookLayout.None;
    this.FlipbookMode = ParticleFlipbookMode.Loop;
    this.FlipbookStartRandom = false;
    this.Lifetime = new NumberRange(5, 10);
    this.LightEmission = 0;
    this.LightInfluence = 0;
    this.LockedToPart = false;
    this.Orientation = ParticleOrientation.FacingCamera;
    this.Rate = 20;
    this.RotSpeed = new NumberRange(0, 0);
    this.Rotation = new NumberRange(0, 0);
    this.Shape = ParticleEmitterShape.Box;
    this.ShapeInOut = ParticleEmitterShapeInOut.Outward;
    this.ShapePartial = 1;
    this.ShapeStyle = ParticleEmitterShapeStyle.Volume;
    this.Size = new NumberSequence(new NumberSequenceKeypoint(0, 1, 0), new NumberSequenceKeypoint(1, 1, 0));
    this.Speed = new NumberRange(5, 5);
    this.SpreadAngle = new Vector2(0, 0);
    this.Squash = new NumberSequence(new NumberSequenceKeypoint(0, 0, 0), new NumberSequenceKeypoint(1, 0, 0));
    this.Texture = "rbxasset://textures/particles/sparkles_main.dds";
    this.TimeScale = 1;
    this.Transparency = new NumberSequence(new NumberSequenceKeypoint(0, 0, 0), new NumberSequenceKeypoint(1, 0, 0));
    this.VelocityInheritance = 0;
    this.VelocitySpread = 0;
    this.WindAffectsDrag = false;
    this.ZOffset = 0;
  }
  get Acceleration() {
    return this.GetProp(
      "Acceleration",
      14
      /* Vector3 */
    );
  }
  set Acceleration(value) {
    this.SetProp("Acceleration", 14, value);
  }
  get Brightness() {
    return this.GetProp(
      "Brightness",
      4
      /* Float32 */
    );
  }
  set Brightness(value) {
    this.SetProp("Brightness", 4, value);
  }
  get Color() {
    return this.GetProp(
      "Color",
      22
      /* ColorSequence */
    );
  }
  set Color(value) {
    this.SetProp("Color", 22, value);
  }
  get Drag() {
    return this.GetProp(
      "Drag",
      4
      /* Float32 */
    );
  }
  set Drag(value) {
    this.SetProp("Drag", 4, value);
  }
  get EmissionDirection() {
    return this.GetProp(
      "EmissionDirection",
      18
      /* Enum */
    );
  }
  set EmissionDirection(value) {
    this.SetProp("EmissionDirection", 18, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get FlipbookFramerate() {
    return this.GetProp(
      "FlipbookFramerate",
      23
      /* NumberRange */
    );
  }
  set FlipbookFramerate(value) {
    this.SetProp("FlipbookFramerate", 23, value);
  }
  get FlipbookIncompatible() {
    return this.GetProp(
      "FlipbookIncompatible",
      1
      /* String */
    );
  }
  set FlipbookIncompatible(value) {
    this.SetProp("FlipbookIncompatible", 1, value);
  }
  get FlipbookLayout() {
    return this.GetProp(
      "FlipbookLayout",
      18
      /* Enum */
    );
  }
  set FlipbookLayout(value) {
    this.SetProp("FlipbookLayout", 18, value);
  }
  get FlipbookMode() {
    return this.GetProp(
      "FlipbookMode",
      18
      /* Enum */
    );
  }
  set FlipbookMode(value) {
    this.SetProp("FlipbookMode", 18, value);
  }
  get FlipbookStartRandom() {
    return this.GetProp(
      "FlipbookStartRandom",
      2
      /* Bool */
    );
  }
  set FlipbookStartRandom(value) {
    this.SetProp("FlipbookStartRandom", 2, value);
  }
  get Lifetime() {
    return this.GetProp(
      "Lifetime",
      23
      /* NumberRange */
    );
  }
  set Lifetime(value) {
    this.SetProp("Lifetime", 23, value);
  }
  get LightEmission() {
    return this.GetProp(
      "LightEmission",
      4
      /* Float32 */
    );
  }
  set LightEmission(value) {
    this.SetProp("LightEmission", 4, value);
  }
  get LightInfluence() {
    return this.GetProp(
      "LightInfluence",
      4
      /* Float32 */
    );
  }
  set LightInfluence(value) {
    this.SetProp("LightInfluence", 4, value);
  }
  get LockedToPart() {
    return this.GetProp(
      "LockedToPart",
      2
      /* Bool */
    );
  }
  set LockedToPart(value) {
    this.SetProp("LockedToPart", 2, value);
  }
  get Orientation() {
    return this.GetProp(
      "Orientation",
      18
      /* Enum */
    );
  }
  set Orientation(value) {
    this.SetProp("Orientation", 18, value);
  }
  get Rate() {
    return this.GetProp(
      "Rate",
      4
      /* Float32 */
    );
  }
  set Rate(value) {
    this.SetProp("Rate", 4, value);
  }
  get RotSpeed() {
    return this.GetProp(
      "RotSpeed",
      23
      /* NumberRange */
    );
  }
  set RotSpeed(value) {
    this.SetProp("RotSpeed", 23, value);
  }
  get Rotation() {
    return this.GetProp(
      "Rotation",
      23
      /* NumberRange */
    );
  }
  set Rotation(value) {
    this.SetProp("Rotation", 23, value);
  }
  get Shape() {
    return this.GetProp(
      "Shape",
      18
      /* Enum */
    );
  }
  set Shape(value) {
    this.SetProp("Shape", 18, value);
  }
  get ShapeInOut() {
    return this.GetProp(
      "ShapeInOut",
      18
      /* Enum */
    );
  }
  set ShapeInOut(value) {
    this.SetProp("ShapeInOut", 18, value);
  }
  get ShapePartial() {
    return this.GetProp(
      "ShapePartial",
      4
      /* Float32 */
    );
  }
  set ShapePartial(value) {
    this.SetProp("ShapePartial", 4, value);
  }
  get ShapeStyle() {
    return this.GetProp(
      "ShapeStyle",
      18
      /* Enum */
    );
  }
  set ShapeStyle(value) {
    this.SetProp("ShapeStyle", 18, value);
  }
  get Size() {
    return this.GetProp(
      "Size",
      21
      /* NumberSequence */
    );
  }
  set Size(value) {
    this.SetProp("Size", 21, value);
  }
  get Speed() {
    return this.GetProp(
      "Speed",
      23
      /* NumberRange */
    );
  }
  set Speed(value) {
    this.SetProp("Speed", 23, value);
  }
  get SpreadAngle() {
    return this.GetProp(
      "SpreadAngle",
      13
      /* Vector2 */
    );
  }
  set SpreadAngle(value) {
    this.SetProp("SpreadAngle", 13, value);
  }
  get Squash() {
    return this.GetProp(
      "Squash",
      21
      /* NumberSequence */
    );
  }
  set Squash(value) {
    this.SetProp("Squash", 21, value);
  }
  get Texture() {
    return this.GetProp(
      "Texture",
      1
      /* String */
    );
  }
  set Texture(value) {
    this.SetProp("Texture", 1, value);
  }
  get TimeScale() {
    return this.GetProp(
      "TimeScale",
      4
      /* Float32 */
    );
  }
  set TimeScale(value) {
    this.SetProp("TimeScale", 4, value);
  }
  get Transparency() {
    return this.GetProp(
      "Transparency",
      21
      /* NumberSequence */
    );
  }
  set Transparency(value) {
    this.SetProp("Transparency", 21, value);
  }
  get VelocityInheritance() {
    return this.GetProp(
      "VelocityInheritance",
      4
      /* Float32 */
    );
  }
  set VelocityInheritance(value) {
    this.SetProp("VelocityInheritance", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get VelocitySpread() {
    return this.GetProp(
      "VelocitySpread",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set VelocitySpread(value) {
    this.SetProp("VelocitySpread", 4, value);
  }
  get WindAffectsDrag() {
    return this.GetProp(
      "WindAffectsDrag",
      2
      /* Bool */
    );
  }
  set WindAffectsDrag(value) {
    this.SetProp("WindAffectsDrag", 2, value);
  }
  get ZOffset() {
    return this.GetProp(
      "ZOffset",
      4
      /* Float32 */
    );
  }
  set ZOffset(value) {
    this.SetProp("ZOffset", 4, value);
  }
};
var PatchBundlerFileWatch = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PatchBundlerFileWatch");
    this.Name = "PatchBundlerFileWatch";
  }
};
var PathfindingLink = class extends Instance {
  constructor() {
    super();
    this.addClassName("PathfindingLink");
    this.Name = "PathfindingLink";
    this.IsBidirectional = true;
    this.Label = "";
  }
  get Attachment0() {
    return this.GetProp(
      "Attachment0",
      19
      /* Referent */
    );
  }
  set Attachment0(value) {
    this.SetProp("Attachment0", 19, value);
  }
  get Attachment1() {
    return this.GetProp(
      "Attachment1",
      19
      /* Referent */
    );
  }
  set Attachment1(value) {
    this.SetProp("Attachment1", 19, value);
  }
  get IsBidirectional() {
    return this.GetProp(
      "IsBidirectional",
      2
      /* Bool */
    );
  }
  set IsBidirectional(value) {
    this.SetProp("IsBidirectional", 2, value);
  }
  get Label() {
    return this.GetProp(
      "Label",
      1
      /* String */
    );
  }
  set Label(value) {
    this.SetProp("Label", 1, value);
  }
};
var PathfindingModifier = class extends Instance {
  constructor() {
    super();
    this.addClassName("PathfindingModifier");
    this.Name = "PathfindingModifier";
    this.Label = "";
    this.PassThrough = false;
  }
  get Label() {
    return this.GetProp(
      "Label",
      1
      /* String */
    );
  }
  set Label(value) {
    this.SetProp("Label", 1, value);
  }
  get PassThrough() {
    return this.GetProp(
      "PassThrough",
      2
      /* Bool */
    );
  }
  set PassThrough(value) {
    this.SetProp("PassThrough", 2, value);
  }
};
var PathfindingService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PathfindingService");
    this.Name = "PathfindingService";
    this.EmptyCutoff = 0;
  }
  /**@deprecated Deprecated by Roblox*/
  get EmptyCutoff() {
    return this.GetProp(
      "EmptyCutoff",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set EmptyCutoff(value) {
    this.SetProp("EmptyCutoff", 4, value);
  }
};
var PerformanceControlService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PerformanceControlService");
    this.Name = "PerformanceControlService";
  }
};
var PermissionsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PermissionsService");
    this.Name = "PermissionsService";
  }
};
var PhysicsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PhysicsService");
    this.Name = "PhysicsService";
  }
};
var PlaceAssetIdsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PlaceAssetIdsService");
    this.Name = "PlaceAssetIdsService";
  }
};
var PlaceStatsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PlaceStatsService");
    this.Name = "PlaceStatsService";
  }
};
var PlacesService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PlacesService");
    this.Name = "PlacesService";
  }
};
var PlatformCloudStorageService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PlatformCloudStorageService");
    this.Name = "PlatformCloudStorageService";
  }
};
var PlatformFriendsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PlatformFriendsService");
    this.Name = "PlatformFriendsService";
  }
};
var Player = class extends Instance {
  constructor() {
    super();
    this.addClassName("Player");
    this.Name = "Player";
  }
  get AutoJumpEnabled() {
    return this.GetProp(
      "AutoJumpEnabled",
      2
      /* Bool */
    );
  }
  set AutoJumpEnabled(value) {
    this.SetProp("AutoJumpEnabled", 2, value);
  }
  get CameraMaxZoomDistance() {
    return this.GetProp(
      "CameraMaxZoomDistance",
      4
      /* Float32 */
    );
  }
  set CameraMaxZoomDistance(value) {
    this.SetProp("CameraMaxZoomDistance", 4, value);
  }
  get CameraMinZoomDistance() {
    return this.GetProp(
      "CameraMinZoomDistance",
      4
      /* Float32 */
    );
  }
  set CameraMinZoomDistance(value) {
    this.SetProp("CameraMinZoomDistance", 4, value);
  }
  get CameraMode() {
    return this.GetProp(
      "CameraMode",
      18
      /* Enum */
    );
  }
  set CameraMode(value) {
    this.SetProp("CameraMode", 18, value);
  }
  get Character() {
    return this.GetProp(
      "Character",
      19
      /* Referent */
    );
  }
  set Character(value) {
    this.SetProp("Character", 19, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get CharacterAppearance() {
    return this.GetProp(
      "CharacterAppearance",
      1
      /* String */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set CharacterAppearance(value) {
    this.SetProp("CharacterAppearance", 1, value);
  }
  get CharacterAppearanceId() {
    return this.GetProp(
      "CharacterAppearanceId",
      27
      /* Int64 */
    );
  }
  set CharacterAppearanceId(value) {
    this.SetProp("CharacterAppearanceId", 27, value);
  }
  get DevCameraOcclusionMode() {
    return this.GetProp(
      "DevCameraOcclusionMode",
      18
      /* Enum */
    );
  }
  set DevCameraOcclusionMode(value) {
    this.SetProp("DevCameraOcclusionMode", 18, value);
  }
  get DevComputerCameraMode() {
    return this.GetProp(
      "DevComputerCameraMode",
      18
      /* Enum */
    );
  }
  set DevComputerCameraMode(value) {
    this.SetProp("DevComputerCameraMode", 18, value);
  }
  get DevComputerMovementMode() {
    return this.GetProp(
      "DevComputerMovementMode",
      18
      /* Enum */
    );
  }
  set DevComputerMovementMode(value) {
    this.SetProp("DevComputerMovementMode", 18, value);
  }
  get DevEnableMouseLock() {
    return this.GetProp(
      "DevEnableMouseLock",
      2
      /* Bool */
    );
  }
  set DevEnableMouseLock(value) {
    this.SetProp("DevEnableMouseLock", 2, value);
  }
  get DevTouchCameraMode() {
    return this.GetProp(
      "DevTouchCameraMode",
      18
      /* Enum */
    );
  }
  set DevTouchCameraMode(value) {
    this.SetProp("DevTouchCameraMode", 18, value);
  }
  get DevTouchMovementMode() {
    return this.GetProp(
      "DevTouchMovementMode",
      18
      /* Enum */
    );
  }
  set DevTouchMovementMode(value) {
    this.SetProp("DevTouchMovementMode", 18, value);
  }
  get GameplayPaused() {
    return this.GetProp(
      "GameplayPaused",
      2
      /* Bool */
    );
  }
  set GameplayPaused(value) {
    this.SetProp("GameplayPaused", 2, value);
  }
  get HealthDisplayDistance() {
    return this.GetProp(
      "HealthDisplayDistance",
      4
      /* Float32 */
    );
  }
  set HealthDisplayDistance(value) {
    this.SetProp("HealthDisplayDistance", 4, value);
  }
  get NameDisplayDistance() {
    return this.GetProp(
      "NameDisplayDistance",
      4
      /* Float32 */
    );
  }
  set NameDisplayDistance(value) {
    this.SetProp("NameDisplayDistance", 4, value);
  }
  get Neutral() {
    return this.GetProp(
      "Neutral",
      2
      /* Bool */
    );
  }
  set Neutral(value) {
    this.SetProp("Neutral", 2, value);
  }
  get RawJoinData() {
    return this.GetProp(
      "RawJoinData",
      1
      /* String */
    );
  }
  set RawJoinData(value) {
    this.SetProp("RawJoinData", 1, value);
  }
  get ReplicationFocus() {
    return this.GetProp(
      "ReplicationFocus",
      19
      /* Referent */
    );
  }
  set ReplicationFocus(value) {
    this.SetProp("ReplicationFocus", 19, value);
  }
  get RespawnLocation() {
    return this.GetProp(
      "RespawnLocation",
      19
      /* Referent */
    );
  }
  set RespawnLocation(value) {
    this.SetProp("RespawnLocation", 19, value);
  }
  get StepIdOffset() {
    return this.GetProp(
      "StepIdOffset",
      3
      /* Int32 */
    );
  }
  set StepIdOffset(value) {
    this.SetProp("StepIdOffset", 3, value);
  }
  get Team() {
    return this.GetProp(
      "Team",
      19
      /* Referent */
    );
  }
  set Team(value) {
    this.SetProp("Team", 19, value);
  }
  get TeamColor() {
    return this.GetProp(
      "TeamColor",
      11
      /* BrickColor */
    );
  }
  set TeamColor(value) {
    this.SetProp("TeamColor", 11, value);
  }
  get TeleportedIn() {
    return this.GetProp(
      "TeleportedIn",
      2
      /* Bool */
    );
  }
  set TeleportedIn(value) {
    this.SetProp("TeleportedIn", 2, value);
  }
};
var PlayerDataService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PlayerDataService");
    this.Name = "PlayerDataService";
    this.LoadFailureBehavior = PlayerDataLoadFailureBehavior.Failure;
  }
  get LoadFailureBehavior() {
    return this.GetProp(
      "LoadFailureBehavior",
      18
      /* Enum */
    );
  }
  set LoadFailureBehavior(value) {
    this.SetProp("LoadFailureBehavior", 18, value);
  }
};
var PlayerEmulatorService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PlayerEmulatorService");
    this.Name = "PlayerEmulatorService";
    this.CustomPoliciesEnabled = false;
    this.EmulatedCountryCode = "";
    this.EmulatedGameLocale = "";
    this.PlayerEmulationEnabled = false;
    this.PseudolocalizationEnabled = false;
    this.SerializedEmulatedPolicyInfo = "";
    this.TextElongationFactor = 0;
  }
  get CustomPoliciesEnabled() {
    return this.GetProp(
      "CustomPoliciesEnabled",
      2
      /* Bool */
    );
  }
  set CustomPoliciesEnabled(value) {
    this.SetProp("CustomPoliciesEnabled", 2, value);
  }
  get EmulatedCountryCode() {
    return this.GetProp(
      "EmulatedCountryCode",
      1
      /* String */
    );
  }
  set EmulatedCountryCode(value) {
    this.SetProp("EmulatedCountryCode", 1, value);
  }
  get EmulatedGameLocale() {
    return this.GetProp(
      "EmulatedGameLocale",
      1
      /* String */
    );
  }
  set EmulatedGameLocale(value) {
    this.SetProp("EmulatedGameLocale", 1, value);
  }
  get PlayerEmulationEnabled() {
    return this.GetProp(
      "PlayerEmulationEnabled",
      2
      /* Bool */
    );
  }
  set PlayerEmulationEnabled(value) {
    this.SetProp("PlayerEmulationEnabled", 2, value);
  }
  get PseudolocalizationEnabled() {
    return this.GetProp(
      "PseudolocalizationEnabled",
      2
      /* Bool */
    );
  }
  set PseudolocalizationEnabled(value) {
    this.SetProp("PseudolocalizationEnabled", 2, value);
  }
  get SerializedEmulatedPolicyInfo() {
    return this.GetProp(
      "SerializedEmulatedPolicyInfo",
      1
      /* String */
    );
  }
  set SerializedEmulatedPolicyInfo(value) {
    this.SetProp("SerializedEmulatedPolicyInfo", 1, value);
  }
  get TextElongationFactor() {
    return this.GetProp(
      "TextElongationFactor",
      3
      /* Int32 */
    );
  }
  set TextElongationFactor(value) {
    this.SetProp("TextElongationFactor", 3, value);
  }
};
var PlayerHydrationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PlayerHydrationService");
    this.Name = "PlayerHydrationService";
  }
};
var PlayerViewService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PlayerViewService");
    this.Name = "PlayerViewService";
  }
};
var Players = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("Players");
    this.Name = "Players";
    this.CharacterAutoLoads = true;
    this.RespawnTime = 5;
  }
  get BanningEnabled() {
    return this.GetProp(
      "BanningEnabled",
      2
      /* Bool */
    );
  }
  set BanningEnabled(value) {
    this.SetProp("BanningEnabled", 2, value);
  }
  get CharacterAutoLoads() {
    return this.GetProp(
      "CharacterAutoLoads",
      2
      /* Bool */
    );
  }
  set CharacterAutoLoads(value) {
    this.SetProp("CharacterAutoLoads", 2, value);
  }
  get MaxPlayersInternal() {
    return this.GetProp(
      "MaxPlayersInternal",
      3
      /* Int32 */
    );
  }
  set MaxPlayersInternal(value) {
    this.SetProp("MaxPlayersInternal", 3, value);
  }
  get PreferredPlayersInternal() {
    return this.GetProp(
      "PreferredPlayersInternal",
      3
      /* Int32 */
    );
  }
  set PreferredPlayersInternal(value) {
    this.SetProp("PreferredPlayersInternal", 3, value);
  }
  get RespawnTime() {
    return this.GetProp(
      "RespawnTime",
      4
      /* Float32 */
    );
  }
  set RespawnTime(value) {
    this.SetProp("RespawnTime", 4, value);
  }
  get UseStrafingAnimations() {
    return this.GetProp(
      "UseStrafingAnimations",
      2
      /* Bool */
    );
  }
  set UseStrafingAnimations(value) {
    this.SetProp("UseStrafingAnimations", 2, value);
  }
};
var PluginAction = class extends Instance {
  constructor() {
    super();
    this.addClassName("PluginAction");
    this.Name = "PluginAction";
  }
};
var PluginCapabilities = class extends Instance {
  constructor() {
    super();
    this.addClassName("PluginCapabilities");
    this.Name = "PluginCapabilities";
    this.Manifest = '{"Metadata":{"TargetDataModels": ["Edit", "Server", "Client"]},"Permissions":{}}';
  }
  get Manifest() {
    return this.GetProp(
      "Manifest",
      1
      /* String */
    );
  }
  set Manifest(value) {
    this.SetProp("Manifest", 1, value);
  }
};
var PluginDebugService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PluginDebugService");
    this.Name = "PluginDebugService";
  }
};
var PluginGuiService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PluginGuiService");
    this.Name = "PluginGuiService";
  }
};
var PluginManagementService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PluginManagementService");
    this.Name = "PluginManagementService";
  }
};
var PluginPolicyService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PluginPolicyService");
    this.Name = "PluginPolicyService";
  }
};
var PointsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PointsService");
    this.Name = "PointsService";
  }
};
var PolicyService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PolicyService");
    this.Name = "PolicyService";
    this.IsLuobuServer = TriStateBoolean.Unknown;
    this.LuobuWhitelisted = TriStateBoolean.Unknown;
  }
  get IsLuobuServer() {
    return this.GetProp(
      "IsLuobuServer",
      18
      /* Enum */
    );
  }
  set IsLuobuServer(value) {
    this.SetProp("IsLuobuServer", 18, value);
  }
  get LuobuWhitelisted() {
    return this.GetProp(
      "LuobuWhitelisted",
      18
      /* Enum */
    );
  }
  set LuobuWhitelisted(value) {
    this.SetProp("LuobuWhitelisted", 18, value);
  }
};
var PoseBase = class extends Instance {
  constructor() {
    super();
    this.addClassName("PoseBase");
    this.EasingDirection = PoseEasingDirection.In;
    this.EasingStyle = PoseEasingStyle.Linear;
    this.Weight = 1;
  }
  get EasingDirection() {
    return this.GetProp(
      "EasingDirection",
      18
      /* Enum */
    );
  }
  set EasingDirection(value) {
    this.SetProp("EasingDirection", 18, value);
  }
  get EasingStyle() {
    return this.GetProp(
      "EasingStyle",
      18
      /* Enum */
    );
  }
  set EasingStyle(value) {
    this.SetProp("EasingStyle", 18, value);
  }
  get Weight() {
    return this.GetProp(
      "Weight",
      4
      /* Float32 */
    );
  }
  set Weight(value) {
    this.SetProp("Weight", 4, value);
  }
};
var NumberPose = class extends PoseBase {
  constructor() {
    super();
    this.addClassName("NumberPose");
    this.Name = "NumberPose";
    this.Value = 0;
  }
  get Value() {
    return this.GetProp(
      "Value",
      5
      /* Float64 */
    );
  }
  set Value(value) {
    this.SetProp("Value", 5, value);
  }
};
var Pose = class extends PoseBase {
  constructor() {
    super();
    this.addClassName("Pose");
    this.Name = "Pose";
    this.MaskWeight = 0;
    this.CFrame = CFrame.Identity;
  }
  get CFrame() {
    return this.GetProp(
      "CFrame",
      16
      /* CFrame */
    );
  }
  set CFrame(value) {
    this.SetProp("CFrame", 16, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get MaskWeight() {
    return this.GetProp(
      "MaskWeight",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set MaskWeight(value) {
    this.SetProp("MaskWeight", 4, value);
  }
};
var PostEffect = class extends Instance {
  constructor() {
    super();
    this.addClassName("PostEffect");
    this.Enabled = true;
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
};
var BloomEffect = class extends PostEffect {
  constructor() {
    super();
    this.addClassName("BloomEffect");
    this.Name = "BloomEffect";
    this.Intensity = 0.4;
    this.Size = 24;
    this.Threshold = 0.95;
  }
  get Intensity() {
    return this.GetProp(
      "Intensity",
      4
      /* Float32 */
    );
  }
  set Intensity(value) {
    this.SetProp("Intensity", 4, value);
  }
  get Size() {
    return this.GetProp(
      "Size",
      4
      /* Float32 */
    );
  }
  set Size(value) {
    this.SetProp("Size", 4, value);
  }
  get Threshold() {
    return this.GetProp(
      "Threshold",
      4
      /* Float32 */
    );
  }
  set Threshold(value) {
    this.SetProp("Threshold", 4, value);
  }
};
var BlurEffect = class extends PostEffect {
  constructor() {
    super();
    this.addClassName("BlurEffect");
    this.Name = "BlurEffect";
    this.Size = 24;
  }
  get Size() {
    return this.GetProp(
      "Size",
      4
      /* Float32 */
    );
  }
  set Size(value) {
    this.SetProp("Size", 4, value);
  }
};
var ColorCorrectionEffect = class extends PostEffect {
  constructor() {
    super();
    this.addClassName("ColorCorrectionEffect");
    this.Name = "ColorCorrectionEffect";
    this.Brightness = 0;
    this.Contrast = 0;
    this.Saturation = 0;
    this.TintColor = Color3.FromRGB(255, 255, 255);
  }
  get Brightness() {
    return this.GetProp(
      "Brightness",
      4
      /* Float32 */
    );
  }
  set Brightness(value) {
    this.SetProp("Brightness", 4, value);
  }
  get Contrast() {
    return this.GetProp(
      "Contrast",
      4
      /* Float32 */
    );
  }
  set Contrast(value) {
    this.SetProp("Contrast", 4, value);
  }
  get Saturation() {
    return this.GetProp(
      "Saturation",
      4
      /* Float32 */
    );
  }
  set Saturation(value) {
    this.SetProp("Saturation", 4, value);
  }
  get TintColor() {
    return this.GetProp(
      "TintColor",
      12
      /* Color3 */
    );
  }
  set TintColor(value) {
    this.SetProp("TintColor", 12, value);
  }
};
var ColorGradingEffect = class extends PostEffect {
  constructor() {
    super();
    this.addClassName("ColorGradingEffect");
    this.Name = "ColorGradingEffect";
    this.TonemapperPreset = TonemapperPreset.Default;
  }
  get TonemapperPreset() {
    return this.GetProp(
      "TonemapperPreset",
      18
      /* Enum */
    );
  }
  set TonemapperPreset(value) {
    this.SetProp("TonemapperPreset", 18, value);
  }
};
var DepthOfFieldEffect = class extends PostEffect {
  constructor() {
    super();
    this.addClassName("DepthOfFieldEffect");
    this.Name = "DepthOfFieldEffect";
    this.FarIntensity = 0.75;
    this.FocusDistance = 0.05;
    this.InFocusRadius = 10;
    this.NearIntensity = 0.75;
  }
  get FarIntensity() {
    return this.GetProp(
      "FarIntensity",
      4
      /* Float32 */
    );
  }
  set FarIntensity(value) {
    this.SetProp("FarIntensity", 4, value);
  }
  get FocusDistance() {
    return this.GetProp(
      "FocusDistance",
      4
      /* Float32 */
    );
  }
  set FocusDistance(value) {
    this.SetProp("FocusDistance", 4, value);
  }
  get InFocusRadius() {
    return this.GetProp(
      "InFocusRadius",
      4
      /* Float32 */
    );
  }
  set InFocusRadius(value) {
    this.SetProp("InFocusRadius", 4, value);
  }
  get NearIntensity() {
    return this.GetProp(
      "NearIntensity",
      4
      /* Float32 */
    );
  }
  set NearIntensity(value) {
    this.SetProp("NearIntensity", 4, value);
  }
};
var SunRaysEffect = class extends PostEffect {
  constructor() {
    super();
    this.addClassName("SunRaysEffect");
    this.Name = "SunRaysEffect";
    this.Intensity = 0.25;
    this.Spread = 1;
  }
  get Intensity() {
    return this.GetProp(
      "Intensity",
      4
      /* Float32 */
    );
  }
  set Intensity(value) {
    this.SetProp("Intensity", 4, value);
  }
  get Spread() {
    return this.GetProp(
      "Spread",
      4
      /* Float32 */
    );
  }
  set Spread(value) {
    this.SetProp("Spread", 4, value);
  }
};
var ProcessInstancePhysicsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ProcessInstancePhysicsService");
    this.Name = "ProcessInstancePhysicsService";
  }
};
var ProximityPrompt = class extends Instance {
  constructor() {
    super();
    this.addClassName("ProximityPrompt");
    this.Name = "ProximityPrompt";
    this.ActionText = "Interact";
    this.AutoLocalize = true;
    this.ClickablePrompt = true;
    this.Enabled = true;
    this.Exclusivity = ProximityPromptExclusivity.OnePerButton;
    this.GamepadKeyCode = KeyCode.ButtonX;
    this.HoldDuration = 0;
    this.KeyboardKeyCode = KeyCode.E;
    this.MaxActivationDistance = 10;
    this.ObjectText = "";
    this.RequiresLineOfSight = true;
    this.Style = ProximityPromptStyle.Default;
    this.UIOffset = new Vector2(0, 0);
  }
  get ActionText() {
    return this.GetProp(
      "ActionText",
      1
      /* String */
    );
  }
  set ActionText(value) {
    this.SetProp("ActionText", 1, value);
  }
  get AutoLocalize() {
    return this.GetProp(
      "AutoLocalize",
      2
      /* Bool */
    );
  }
  set AutoLocalize(value) {
    this.SetProp("AutoLocalize", 2, value);
  }
  get ClickablePrompt() {
    return this.GetProp(
      "ClickablePrompt",
      2
      /* Bool */
    );
  }
  set ClickablePrompt(value) {
    this.SetProp("ClickablePrompt", 2, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Exclusivity() {
    return this.GetProp(
      "Exclusivity",
      18
      /* Enum */
    );
  }
  set Exclusivity(value) {
    this.SetProp("Exclusivity", 18, value);
  }
  get GamepadKeyCode() {
    return this.GetProp(
      "GamepadKeyCode",
      18
      /* Enum */
    );
  }
  set GamepadKeyCode(value) {
    this.SetProp("GamepadKeyCode", 18, value);
  }
  get HoldDuration() {
    return this.GetProp(
      "HoldDuration",
      4
      /* Float32 */
    );
  }
  set HoldDuration(value) {
    this.SetProp("HoldDuration", 4, value);
  }
  get KeyboardKeyCode() {
    return this.GetProp(
      "KeyboardKeyCode",
      18
      /* Enum */
    );
  }
  set KeyboardKeyCode(value) {
    this.SetProp("KeyboardKeyCode", 18, value);
  }
  get MaxActivationDistance() {
    return this.GetProp(
      "MaxActivationDistance",
      4
      /* Float32 */
    );
  }
  set MaxActivationDistance(value) {
    this.SetProp("MaxActivationDistance", 4, value);
  }
  get ObjectText() {
    return this.GetProp(
      "ObjectText",
      1
      /* String */
    );
  }
  set ObjectText(value) {
    this.SetProp("ObjectText", 1, value);
  }
  get RequiresLineOfSight() {
    return this.GetProp(
      "RequiresLineOfSight",
      2
      /* Bool */
    );
  }
  set RequiresLineOfSight(value) {
    this.SetProp("RequiresLineOfSight", 2, value);
  }
  get RootLocalizationTable() {
    return this.GetProp(
      "RootLocalizationTable",
      19
      /* Referent */
    );
  }
  set RootLocalizationTable(value) {
    this.SetProp("RootLocalizationTable", 19, value);
  }
  get Style() {
    return this.GetProp(
      "Style",
      18
      /* Enum */
    );
  }
  set Style(value) {
    this.SetProp("Style", 18, value);
  }
  get UIOffset() {
    return this.GetProp(
      "UIOffset",
      13
      /* Vector2 */
    );
  }
  set UIOffset(value) {
    this.SetProp("UIOffset", 13, value);
  }
};
var ProximityPromptService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ProximityPromptService");
    this.Name = "ProximityPromptService";
    this.Enabled = true;
    this.MaxPromptsVisible = 16;
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get MaxPromptsVisible() {
    return this.GetProp(
      "MaxPromptsVisible",
      3
      /* Int32 */
    );
  }
  set MaxPromptsVisible(value) {
    this.SetProp("MaxPromptsVisible", 3, value);
  }
};
var PublishService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("PublishService");
    this.Name = "PublishService";
  }
};
var RTAnimationTracker = class extends Instance {
  constructor() {
    super();
    this.addClassName("RTAnimationTracker");
    this.Name = "RTAnimationTracker";
  }
};
var RbxAnalyticsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RbxAnalyticsService");
    this.Name = "RbxAnalyticsService";
  }
};
var ReflectionMetadata = class extends Instance {
  constructor() {
    super();
    this.addClassName("ReflectionMetadata");
    this.Name = "ReflectionMetadata";
  }
};
var ReflectionMetadataCallbacks = class extends Instance {
  constructor() {
    super();
    this.addClassName("ReflectionMetadataCallbacks");
    this.Name = "ReflectionMetadataCallbacks";
  }
};
var ReflectionMetadataClasses = class extends Instance {
  constructor() {
    super();
    this.addClassName("ReflectionMetadataClasses");
    this.Name = "ReflectionMetadataClasses";
  }
};
var ReflectionMetadataEnums = class extends Instance {
  constructor() {
    super();
    this.addClassName("ReflectionMetadataEnums");
    this.Name = "ReflectionMetadataEnums";
  }
};
var ReflectionMetadataEvents = class extends Instance {
  constructor() {
    super();
    this.addClassName("ReflectionMetadataEvents");
    this.Name = "ReflectionMetadataEvents";
  }
};
var ReflectionMetadataFunctions = class extends Instance {
  constructor() {
    super();
    this.addClassName("ReflectionMetadataFunctions");
    this.Name = "ReflectionMetadataFunctions";
  }
};
var ReflectionMetadataItem = class extends Instance {
  constructor() {
    super();
    this.addClassName("ReflectionMetadataItem");
    this.Browsable = true;
    this.ClassCategory = "";
    this.ClientOnly = false;
    this.Constraint = "";
    this.Deprecated = false;
    this.EditingDisabled = false;
    this.EditorType = "";
    this.FFlag = "";
    this.IsBackend = false;
    this.PropertyOrder = 5e3;
    this.ScriptContext = "";
    this.ServerOnly = false;
    this.SliderScaling = "";
    this.UIMaximum = 0;
    this.UIMinimum = 0;
    this.UINumTicks = 0;
  }
  get Browsable() {
    return this.GetProp(
      "Browsable",
      2
      /* Bool */
    );
  }
  set Browsable(value) {
    this.SetProp("Browsable", 2, value);
  }
  get ClassCategory() {
    return this.GetProp(
      "ClassCategory",
      1
      /* String */
    );
  }
  set ClassCategory(value) {
    this.SetProp("ClassCategory", 1, value);
  }
  get ClientOnly() {
    return this.GetProp(
      "ClientOnly",
      2
      /* Bool */
    );
  }
  set ClientOnly(value) {
    this.SetProp("ClientOnly", 2, value);
  }
  get Constraint() {
    return this.GetProp(
      "Constraint",
      1
      /* String */
    );
  }
  set Constraint(value) {
    this.SetProp("Constraint", 1, value);
  }
  get Deprecated() {
    return this.GetProp(
      "Deprecated",
      2
      /* Bool */
    );
  }
  set Deprecated(value) {
    this.SetProp("Deprecated", 2, value);
  }
  get EditingDisabled() {
    return this.GetProp(
      "EditingDisabled",
      2
      /* Bool */
    );
  }
  set EditingDisabled(value) {
    this.SetProp("EditingDisabled", 2, value);
  }
  get EditorType() {
    return this.GetProp(
      "EditorType",
      1
      /* String */
    );
  }
  set EditorType(value) {
    this.SetProp("EditorType", 1, value);
  }
  get FFlag() {
    return this.GetProp(
      "FFlag",
      1
      /* String */
    );
  }
  set FFlag(value) {
    this.SetProp("FFlag", 1, value);
  }
  get IsBackend() {
    return this.GetProp(
      "IsBackend",
      2
      /* Bool */
    );
  }
  set IsBackend(value) {
    this.SetProp("IsBackend", 2, value);
  }
  get PropertyOrder() {
    return this.GetProp(
      "PropertyOrder",
      3
      /* Int32 */
    );
  }
  set PropertyOrder(value) {
    this.SetProp("PropertyOrder", 3, value);
  }
  get ScriptContext() {
    return this.GetProp(
      "ScriptContext",
      1
      /* String */
    );
  }
  set ScriptContext(value) {
    this.SetProp("ScriptContext", 1, value);
  }
  get ServerOnly() {
    return this.GetProp(
      "ServerOnly",
      2
      /* Bool */
    );
  }
  set ServerOnly(value) {
    this.SetProp("ServerOnly", 2, value);
  }
  get SliderScaling() {
    return this.GetProp(
      "SliderScaling",
      1
      /* String */
    );
  }
  set SliderScaling(value) {
    this.SetProp("SliderScaling", 1, value);
  }
  get UIMaximum() {
    return this.GetProp(
      "UIMaximum",
      5
      /* Float64 */
    );
  }
  set UIMaximum(value) {
    this.SetProp("UIMaximum", 5, value);
  }
  get UIMinimum() {
    return this.GetProp(
      "UIMinimum",
      5
      /* Float64 */
    );
  }
  set UIMinimum(value) {
    this.SetProp("UIMinimum", 5, value);
  }
  get UINumTicks() {
    return this.GetProp(
      "UINumTicks",
      5
      /* Float64 */
    );
  }
  set UINumTicks(value) {
    this.SetProp("UINumTicks", 5, value);
  }
};
var ReflectionMetadataClass = class extends ReflectionMetadataItem {
  constructor() {
    super();
    this.addClassName("ReflectionMetadataClass");
    this.Name = "ReflectionMetadataClass";
    this.ExplorerImageIndex = 0;
    this.ExplorerOrder = 2147483647;
    this.Insertable = true;
    this.PreferredParent = "";
    this.ServiceVisibility = ServiceVisibility.Always;
  }
  get ExplorerImageIndex() {
    return this.GetProp(
      "ExplorerImageIndex",
      3
      /* Int32 */
    );
  }
  set ExplorerImageIndex(value) {
    this.SetProp("ExplorerImageIndex", 3, value);
  }
  get ExplorerOrder() {
    return this.GetProp(
      "ExplorerOrder",
      3
      /* Int32 */
    );
  }
  set ExplorerOrder(value) {
    this.SetProp("ExplorerOrder", 3, value);
  }
  get Insertable() {
    return this.GetProp(
      "Insertable",
      2
      /* Bool */
    );
  }
  set Insertable(value) {
    this.SetProp("Insertable", 2, value);
  }
  get PreferredParent() {
    return this.GetProp(
      "PreferredParent",
      1
      /* String */
    );
  }
  set PreferredParent(value) {
    this.SetProp("PreferredParent", 1, value);
  }
  get ServiceVisibility() {
    return this.GetProp(
      "ServiceVisibility",
      18
      /* Enum */
    );
  }
  set ServiceVisibility(value) {
    this.SetProp("ServiceVisibility", 18, value);
  }
};
var ReflectionMetadataEnum = class extends ReflectionMetadataItem {
  constructor() {
    super();
    this.addClassName("ReflectionMetadataEnum");
    this.Name = "ReflectionMetadataEnum";
  }
};
var ReflectionMetadataEnumItem = class extends ReflectionMetadataItem {
  constructor() {
    super();
    this.addClassName("ReflectionMetadataEnumItem");
    this.Name = "ReflectionMetadataEnumItem";
  }
};
var ReflectionMetadataMember = class extends ReflectionMetadataItem {
  constructor() {
    super();
    this.addClassName("ReflectionMetadataMember");
    this.Name = "ReflectionMetadataMember";
  }
};
var ReflectionMetadataProperties = class extends Instance {
  constructor() {
    super();
    this.addClassName("ReflectionMetadataProperties");
    this.Name = "ReflectionMetadataProperties";
  }
};
var ReflectionMetadataYieldFunctions = class extends Instance {
  constructor() {
    super();
    this.addClassName("ReflectionMetadataYieldFunctions");
    this.Name = "ReflectionMetadataYieldFunctions";
  }
};
var ReflectionService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ReflectionService");
    this.Name = "ReflectionService";
  }
};
var RemoteCursorService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RemoteCursorService");
    this.Name = "RemoteCursorService";
  }
};
var RemoteDebuggerServer = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RemoteDebuggerServer");
    this.Name = "RemoteDebuggerServer";
  }
};
var RemoteFunction = class extends Instance {
  constructor() {
    super();
    this.addClassName("RemoteFunction");
    this.Name = "RemoteFunction";
  }
};
var RenderSettings = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RenderSettings");
    this.Name = "RenderSettings";
  }
  get AutoFRMLevel() {
    return this.GetProp(
      "AutoFRMLevel",
      3
      /* Int32 */
    );
  }
  set AutoFRMLevel(value) {
    this.SetProp("AutoFRMLevel", 3, value);
  }
  get EagerBulkExecution() {
    return this.GetProp(
      "EagerBulkExecution",
      2
      /* Bool */
    );
  }
  set EagerBulkExecution(value) {
    this.SetProp("EagerBulkExecution", 2, value);
  }
  get EditQualityLevel() {
    return this.GetProp(
      "EditQualityLevel",
      18
      /* Enum */
    );
  }
  set EditQualityLevel(value) {
    this.SetProp("EditQualityLevel", 18, value);
  }
  get EnableVRMode() {
    return this.GetProp(
      "Enable VR Mode",
      2
      /* Bool */
    );
  }
  set EnableVRMode(value) {
    this.SetProp("Enable VR Mode", 2, value);
  }
  get ExportMergeByMaterial() {
    return this.GetProp(
      "ExportMergeByMaterial",
      2
      /* Bool */
    );
  }
  set ExportMergeByMaterial(value) {
    this.SetProp("ExportMergeByMaterial", 2, value);
  }
  get FrameRateManager() {
    return this.GetProp(
      "FrameRateManager",
      18
      /* Enum */
    );
  }
  set FrameRateManager(value) {
    this.SetProp("FrameRateManager", 18, value);
  }
  get GraphicsMode() {
    return this.GetProp(
      "GraphicsMode",
      18
      /* Enum */
    );
  }
  set GraphicsMode(value) {
    this.SetProp("GraphicsMode", 18, value);
  }
  get MeshCacheSize() {
    return this.GetProp(
      "MeshCacheSize",
      3
      /* Int32 */
    );
  }
  set MeshCacheSize(value) {
    this.SetProp("MeshCacheSize", 3, value);
  }
  get MeshPartDetailLevel() {
    return this.GetProp(
      "MeshPartDetailLevel",
      18
      /* Enum */
    );
  }
  set MeshPartDetailLevel(value) {
    this.SetProp("MeshPartDetailLevel", 18, value);
  }
  get QualityLevel() {
    return this.GetProp(
      "QualityLevel",
      18
      /* Enum */
    );
  }
  set QualityLevel(value) {
    this.SetProp("QualityLevel", 18, value);
  }
  get ReloadAssets() {
    return this.GetProp(
      "ReloadAssets",
      2
      /* Bool */
    );
  }
  set ReloadAssets(value) {
    this.SetProp("ReloadAssets", 2, value);
  }
  get RenderCSGTrianglesDebug() {
    return this.GetProp(
      "RenderCSGTrianglesDebug",
      2
      /* Bool */
    );
  }
  set RenderCSGTrianglesDebug(value) {
    this.SetProp("RenderCSGTrianglesDebug", 2, value);
  }
  get ShowBoundingBoxes() {
    return this.GetProp(
      "ShowBoundingBoxes",
      2
      /* Bool */
    );
  }
  set ShowBoundingBoxes(value) {
    this.SetProp("ShowBoundingBoxes", 2, value);
  }
  get ViewMode() {
    return this.GetProp(
      "ViewMode",
      18
      /* Enum */
    );
  }
  set ViewMode(value) {
    this.SetProp("ViewMode", 18, value);
  }
};
var RenderingTest = class extends Instance {
  constructor() {
    super();
    this.addClassName("RenderingTest");
    this.Name = "RenderingTest";
    this.ComparisonDiffThreshold = 10;
    this.ComparisonMethod = RenderingTestComparisonMethod.psnr;
    this.ComparisonPsnrThreshold = 50;
    this.Description = "";
    this.FieldOfView = 70;
    this.PerfTest = false;
    this.QualityAuto = false;
    this.QualityLevel = 21;
    this.RenderingTestFrameCount = 20;
    this.ShouldSkip = false;
    this.Ticket = "";
    this.Timeout = 30;
    this.CFrame = CFrame.Identity;
  }
  get CFrame() {
    return this.GetProp(
      "CFrame",
      16
      /* CFrame */
    );
  }
  set CFrame(value) {
    this.SetProp("CFrame", 16, value);
  }
  get ComparisonDiffThreshold() {
    return this.GetProp(
      "ComparisonDiffThreshold",
      3
      /* Int32 */
    );
  }
  set ComparisonDiffThreshold(value) {
    this.SetProp("ComparisonDiffThreshold", 3, value);
  }
  get ComparisonMethod() {
    return this.GetProp(
      "ComparisonMethod",
      18
      /* Enum */
    );
  }
  set ComparisonMethod(value) {
    this.SetProp("ComparisonMethod", 18, value);
  }
  get ComparisonPsnrThreshold() {
    return this.GetProp(
      "ComparisonPsnrThreshold",
      4
      /* Float32 */
    );
  }
  set ComparisonPsnrThreshold(value) {
    this.SetProp("ComparisonPsnrThreshold", 4, value);
  }
  get Description() {
    return this.GetProp(
      "Description",
      1
      /* String */
    );
  }
  set Description(value) {
    this.SetProp("Description", 1, value);
  }
  get FieldOfView() {
    return this.GetProp(
      "FieldOfView",
      4
      /* Float32 */
    );
  }
  set FieldOfView(value) {
    this.SetProp("FieldOfView", 4, value);
  }
  get PerfTest() {
    return this.GetProp(
      "PerfTest",
      2
      /* Bool */
    );
  }
  set PerfTest(value) {
    this.SetProp("PerfTest", 2, value);
  }
  get QualityAuto() {
    return this.GetProp(
      "QualityAuto",
      2
      /* Bool */
    );
  }
  set QualityAuto(value) {
    this.SetProp("QualityAuto", 2, value);
  }
  get QualityLevel() {
    return this.GetProp(
      "QualityLevel",
      3
      /* Int32 */
    );
  }
  set QualityLevel(value) {
    this.SetProp("QualityLevel", 3, value);
  }
  get RenderingTestFrameCount() {
    return this.GetProp(
      "RenderingTestFrameCount",
      3
      /* Int32 */
    );
  }
  set RenderingTestFrameCount(value) {
    this.SetProp("RenderingTestFrameCount", 3, value);
  }
  get ShouldSkip() {
    return this.GetProp(
      "ShouldSkip",
      2
      /* Bool */
    );
  }
  set ShouldSkip(value) {
    this.SetProp("ShouldSkip", 2, value);
  }
  get Ticket() {
    return this.GetProp(
      "Ticket",
      1
      /* String */
    );
  }
  set Ticket(value) {
    this.SetProp("Ticket", 1, value);
  }
  get Timeout() {
    return this.GetProp(
      "Timeout",
      3
      /* Int32 */
    );
  }
  set Timeout(value) {
    this.SetProp("Timeout", 3, value);
  }
};
var ReplicatedFirst = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ReplicatedFirst");
    this.Name = "ReplicatedFirst";
  }
};
var ReplicatedStorage = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ReplicatedStorage");
    this.Name = "ReplicatedStorage";
  }
};
var RibbonNotificationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RibbonNotificationService");
    this.Name = "RibbonNotificationService";
  }
};
var RobloxPluginGuiService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RobloxPluginGuiService");
    this.Name = "RobloxPluginGuiService";
  }
};
var RobloxReplicatedStorage = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RobloxReplicatedStorage");
    this.Name = "RobloxReplicatedStorage";
  }
};
var RobloxServerStorage = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RobloxServerStorage");
    this.Name = "RobloxServerStorage";
  }
};
var RomarkRbxAnalyticsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RomarkRbxAnalyticsService");
    this.Name = "RomarkRbxAnalyticsService";
  }
};
var RomarkService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RomarkService");
    this.Name = "RomarkService";
  }
};
var RotationCurve = class extends Instance {
  constructor() {
    super();
    this.addClassName("RotationCurve");
    this.Name = "RotationCurve";
    this.ValuesAndTimes = "";
  }
  get ValuesAndTimes() {
    return this.GetProp(
      "ValuesAndTimes",
      1
      /* String */
    );
  }
  set ValuesAndTimes(value) {
    this.SetProp("ValuesAndTimes", 1, value);
  }
};
var RtMessagingService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RtMessagingService");
    this.Name = "RtMessagingService";
  }
};
var RunService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RunService");
    this.Name = "RunService";
  }
};
var RuntimeScriptService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("RuntimeScriptService");
    this.Name = "RuntimeScriptService";
  }
};
var SafetyService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("SafetyService");
    this.Name = "SafetyService";
    this.IsCaptureModeForReport = false;
  }
  get IsCaptureModeForReport() {
    return this.GetProp(
      "IsCaptureModeForReport",
      2
      /* Bool */
    );
  }
  set IsCaptureModeForReport(value) {
    this.SetProp("IsCaptureModeForReport", 2, value);
  }
};
var ScriptChangeService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ScriptChangeService");
    this.Name = "ScriptChangeService";
  }
};
var ScriptCloneWatcher = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ScriptCloneWatcher");
    this.Name = "ScriptCloneWatcher";
  }
};
var ScriptCloneWatcherHelper = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ScriptCloneWatcherHelper");
    this.Name = "ScriptCloneWatcherHelper";
  }
};
var ScriptCommitService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ScriptCommitService");
    this.Name = "ScriptCommitService";
  }
};
var ScriptContext = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ScriptContext");
    this.Name = "ScriptContext";
  }
};
var ScriptEditorService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ScriptEditorService");
    this.Name = "ScriptEditorService";
  }
};
var ScriptProfilerService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ScriptProfilerService");
    this.Name = "ScriptProfilerService";
  }
};
var ScriptRegistrationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ScriptRegistrationService");
    this.Name = "ScriptRegistrationService";
  }
};
var ScriptService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ScriptService");
    this.Name = "ScriptService";
  }
};
var Selection = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("Selection");
    this.Name = "Selection";
  }
};
var SelectionHighlightManager = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("SelectionHighlightManager");
    this.Name = "SelectionHighlightManager";
  }
};
var SensorBase = class extends Instance {
  constructor() {
    super();
    this.addClassName("SensorBase");
    this.UpdateType = SensorUpdateType.OnRead;
  }
  get UpdateType() {
    return this.GetProp(
      "UpdateType",
      18
      /* Enum */
    );
  }
  set UpdateType(value) {
    this.SetProp("UpdateType", 18, value);
  }
};
var AtmosphereSensor = class extends SensorBase {
  constructor() {
    super();
    this.addClassName("AtmosphereSensor");
    this.Name = "AtmosphereSensor";
  }
};
var BuoyancySensor = class extends SensorBase {
  constructor() {
    super();
    this.addClassName("BuoyancySensor");
    this.Name = "BuoyancySensor";
    this.FullySubmerged = false;
    this.TouchingSurface = false;
  }
  get FullySubmerged() {
    return this.GetProp(
      "FullySubmerged",
      2
      /* Bool */
    );
  }
  set FullySubmerged(value) {
    this.SetProp("FullySubmerged", 2, value);
  }
  get TouchingSurface() {
    return this.GetProp(
      "TouchingSurface",
      2
      /* Bool */
    );
  }
  set TouchingSurface(value) {
    this.SetProp("TouchingSurface", 2, value);
  }
};
var ControllerSensor = class extends SensorBase {
  constructor() {
    super();
    this.addClassName("ControllerSensor");
  }
};
var ControllerPartSensor = class extends ControllerSensor {
  constructor() {
    super();
    this.addClassName("ControllerPartSensor");
    this.Name = "ControllerPartSensor";
    this.HitNormal = new Vector3(0, 0, 0);
    this.SearchDistance = 0;
    this.SensorMode = SensorMode.Floor;
    this.HitFrame = CFrame.Identity;
  }
  get HitFrame() {
    return this.GetProp(
      "HitFrame",
      16
      /* CFrame */
    );
  }
  set HitFrame(value) {
    this.SetProp("HitFrame", 16, value);
  }
  get HitNormal() {
    return this.GetProp(
      "HitNormal",
      14
      /* Vector3 */
    );
  }
  set HitNormal(value) {
    this.SetProp("HitNormal", 14, value);
  }
  get SearchDistance() {
    return this.GetProp(
      "SearchDistance",
      4
      /* Float32 */
    );
  }
  set SearchDistance(value) {
    this.SetProp("SearchDistance", 4, value);
  }
  get SensedPart() {
    return this.GetProp(
      "SensedPart",
      19
      /* Referent */
    );
  }
  set SensedPart(value) {
    this.SetProp("SensedPart", 19, value);
  }
  get SensorMode() {
    return this.GetProp(
      "SensorMode",
      18
      /* Enum */
    );
  }
  set SensorMode(value) {
    this.SetProp("SensorMode", 18, value);
  }
};
var FluidForceSensor = class extends SensorBase {
  constructor() {
    super();
    this.addClassName("FluidForceSensor");
    this.Name = "FluidForceSensor";
  }
};
var SerializationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("SerializationService");
    this.Name = "SerializationService";
  }
};
var ServerScriptService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ServerScriptService");
    this.Name = "ServerScriptService";
    this.LoadStringEnabled = false;
  }
  get LoadStringEnabled() {
    return this.GetProp(
      "LoadStringEnabled",
      2
      /* Bool */
    );
  }
  set LoadStringEnabled(value) {
    this.SetProp("LoadStringEnabled", 2, value);
  }
};
var ServerStorage = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ServerStorage");
    this.Name = "ServerStorage";
  }
};
var ServiceVisibilityService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ServiceVisibilityService");
    this.Name = "ServiceVisibilityService";
    this.HiddenServices = "";
    this.VisibleServices = "";
  }
  get HiddenServices() {
    return this.GetProp(
      "HiddenServices",
      1
      /* String */
    );
  }
  set HiddenServices(value) {
    this.SetProp("HiddenServices", 1, value);
  }
  get VisibleServices() {
    return this.GetProp(
      "VisibleServices",
      1
      /* String */
    );
  }
  set VisibleServices(value) {
    this.SetProp("VisibleServices", 1, value);
  }
};
var SessionService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("SessionService");
    this.Name = "SessionService";
  }
};
var SharedTableRegistry = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("SharedTableRegistry");
    this.Name = "SharedTableRegistry";
  }
};
var Sky = class extends Instance {
  constructor() {
    super();
    this.addClassName("Sky");
    this.Name = "Sky";
    this.CelestialBodiesShown = true;
    this.MoonAngularSize = 11;
    this.MoonTextureId = "rbxasset://sky/moon.jpg";
    this.SkyboxBk = "rbxasset://textures/sky/sky512_bk.tex";
    this.SkyboxDn = "rbxasset://textures/sky/sky512_dn.tex";
    this.SkyboxFt = "rbxasset://textures/sky/sky512_ft.tex";
    this.SkyboxLf = "rbxasset://textures/sky/sky512_lf.tex";
    this.SkyboxOrientation = new Vector3(0, 0, 0);
    this.SkyboxRt = "rbxasset://textures/sky/sky512_rt.tex";
    this.SkyboxUp = "rbxasset://textures/sky/sky512_up.tex";
    this.StarCount = 3e3;
    this.SunAngularSize = 21;
    this.SunTextureId = "rbxasset://sky/sun.jpg";
  }
  get CelestialBodiesShown() {
    return this.GetProp(
      "CelestialBodiesShown",
      2
      /* Bool */
    );
  }
  set CelestialBodiesShown(value) {
    this.SetProp("CelestialBodiesShown", 2, value);
  }
  get MoonAngularSize() {
    return this.GetProp(
      "MoonAngularSize",
      4
      /* Float32 */
    );
  }
  set MoonAngularSize(value) {
    this.SetProp("MoonAngularSize", 4, value);
  }
  get MoonTextureId() {
    return this.GetProp(
      "MoonTextureId",
      1
      /* String */
    );
  }
  set MoonTextureId(value) {
    this.SetProp("MoonTextureId", 1, value);
  }
  get SkyboxBk() {
    return this.GetProp(
      "SkyboxBk",
      1
      /* String */
    );
  }
  set SkyboxBk(value) {
    this.SetProp("SkyboxBk", 1, value);
  }
  get SkyboxDn() {
    return this.GetProp(
      "SkyboxDn",
      1
      /* String */
    );
  }
  set SkyboxDn(value) {
    this.SetProp("SkyboxDn", 1, value);
  }
  get SkyboxFt() {
    return this.GetProp(
      "SkyboxFt",
      1
      /* String */
    );
  }
  set SkyboxFt(value) {
    this.SetProp("SkyboxFt", 1, value);
  }
  get SkyboxLf() {
    return this.GetProp(
      "SkyboxLf",
      1
      /* String */
    );
  }
  set SkyboxLf(value) {
    this.SetProp("SkyboxLf", 1, value);
  }
  get SkyboxOrientation() {
    return this.GetProp(
      "SkyboxOrientation",
      14
      /* Vector3 */
    );
  }
  set SkyboxOrientation(value) {
    this.SetProp("SkyboxOrientation", 14, value);
  }
  get SkyboxRt() {
    return this.GetProp(
      "SkyboxRt",
      1
      /* String */
    );
  }
  set SkyboxRt(value) {
    this.SetProp("SkyboxRt", 1, value);
  }
  get SkyboxUp() {
    return this.GetProp(
      "SkyboxUp",
      1
      /* String */
    );
  }
  set SkyboxUp(value) {
    this.SetProp("SkyboxUp", 1, value);
  }
  get StarCount() {
    return this.GetProp(
      "StarCount",
      3
      /* Int32 */
    );
  }
  set StarCount(value) {
    this.SetProp("StarCount", 3, value);
  }
  get SunAngularSize() {
    return this.GetProp(
      "SunAngularSize",
      4
      /* Float32 */
    );
  }
  set SunAngularSize(value) {
    this.SetProp("SunAngularSize", 4, value);
  }
  get SunTextureId() {
    return this.GetProp(
      "SunTextureId",
      1
      /* String */
    );
  }
  set SunTextureId(value) {
    this.SetProp("SunTextureId", 1, value);
  }
};
var Smoke = class extends Instance {
  constructor() {
    super();
    this.addClassName("Smoke");
    this.Name = "Smoke";
    this.Color = Color3.FromRGB(255, 255, 255);
    this.Enabled = true;
    this.TimeScale = 1;
    this.Opacityxml = 0.5;
    this.RiseVelocityxml = 1;
    this.Sizexml = 1;
  }
  get Color() {
    return this.GetProp(
      "Color",
      12
      /* Color3 */
    );
  }
  set Color(value) {
    this.SetProp("Color", 12, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get TimeScale() {
    return this.GetProp(
      "TimeScale",
      4
      /* Float32 */
    );
  }
  set TimeScale(value) {
    this.SetProp("TimeScale", 4, value);
  }
  get Opacityxml() {
    return this.GetProp(
      "opacity_xml",
      4
      /* Float32 */
    );
  }
  set Opacityxml(value) {
    this.SetProp("opacity_xml", 4, value);
  }
  get RiseVelocityxml() {
    return this.GetProp(
      "riseVelocity_xml",
      4
      /* Float32 */
    );
  }
  set RiseVelocityxml(value) {
    this.SetProp("riseVelocity_xml", 4, value);
  }
  get Sizexml() {
    return this.GetProp(
      "size_xml",
      4
      /* Float32 */
    );
  }
  set Sizexml(value) {
    this.SetProp("size_xml", 4, value);
  }
};
var SmoothVoxelsUpgraderService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("SmoothVoxelsUpgraderService");
    this.Name = "SmoothVoxelsUpgraderService";
  }
};
var SnippetService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("SnippetService");
    this.Name = "SnippetService";
  }
};
var SocialService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("SocialService");
    this.Name = "SocialService";
  }
};
var Sound = class extends Instance {
  constructor() {
    super();
    this.addClassName("Sound");
    this.Name = "Sound";
    this.EmitterSize = 10;
    this.LoopRegion = new NumberRange(0, 6e4);
    this.Looped = false;
    this.MinDistance = 10;
    this.Pitch = 1;
    this.PlayOnRemove = false;
    this.PlaybackRegion = new NumberRange(0, 6e4);
    this.PlaybackRegionsEnabled = false;
    this.PlaybackSpeed = 1;
    this.Playing = false;
    this.RollOffMaxDistance = 1e4;
    this.RollOffMinDistance = 10;
    this.RollOffMode = RollOffMode.Inverse;
    this.SoundId = "";
    this.TimePosition = 0;
    this.Volume = 0.5;
    this.XmlReadMaxDistance3 = 1e4;
    this.XmlReadMinDistance3 = 10;
  }
  get EmitterSize() {
    return this.GetProp(
      "EmitterSize",
      4
      /* Float32 */
    );
  }
  set EmitterSize(value) {
    this.SetProp("EmitterSize", 4, value);
  }
  get LoopRegion() {
    return this.GetProp(
      "LoopRegion",
      23
      /* NumberRange */
    );
  }
  set LoopRegion(value) {
    this.SetProp("LoopRegion", 23, value);
  }
  get Looped() {
    return this.GetProp(
      "Looped",
      2
      /* Bool */
    );
  }
  set Looped(value) {
    this.SetProp("Looped", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get MinDistance() {
    return this.GetProp(
      "MinDistance",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set MinDistance(value) {
    this.SetProp("MinDistance", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Pitch() {
    return this.GetProp(
      "Pitch",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Pitch(value) {
    this.SetProp("Pitch", 4, value);
  }
  get PlayOnRemove() {
    return this.GetProp(
      "PlayOnRemove",
      2
      /* Bool */
    );
  }
  set PlayOnRemove(value) {
    this.SetProp("PlayOnRemove", 2, value);
  }
  get PlaybackRegion() {
    return this.GetProp(
      "PlaybackRegion",
      23
      /* NumberRange */
    );
  }
  set PlaybackRegion(value) {
    this.SetProp("PlaybackRegion", 23, value);
  }
  get PlaybackRegionsEnabled() {
    return this.GetProp(
      "PlaybackRegionsEnabled",
      2
      /* Bool */
    );
  }
  set PlaybackRegionsEnabled(value) {
    this.SetProp("PlaybackRegionsEnabled", 2, value);
  }
  get PlaybackSpeed() {
    return this.GetProp(
      "PlaybackSpeed",
      4
      /* Float32 */
    );
  }
  set PlaybackSpeed(value) {
    this.SetProp("PlaybackSpeed", 4, value);
  }
  get Playing() {
    return this.GetProp(
      "Playing",
      2
      /* Bool */
    );
  }
  set Playing(value) {
    this.SetProp("Playing", 2, value);
  }
  get RollOffMaxDistance() {
    return this.GetProp(
      "RollOffMaxDistance",
      4
      /* Float32 */
    );
  }
  set RollOffMaxDistance(value) {
    this.SetProp("RollOffMaxDistance", 4, value);
  }
  get RollOffMinDistance() {
    return this.GetProp(
      "RollOffMinDistance",
      4
      /* Float32 */
    );
  }
  set RollOffMinDistance(value) {
    this.SetProp("RollOffMinDistance", 4, value);
  }
  get RollOffMode() {
    return this.GetProp(
      "RollOffMode",
      18
      /* Enum */
    );
  }
  set RollOffMode(value) {
    this.SetProp("RollOffMode", 18, value);
  }
  get SoundGroup() {
    return this.GetProp(
      "SoundGroup",
      19
      /* Referent */
    );
  }
  set SoundGroup(value) {
    this.SetProp("SoundGroup", 19, value);
  }
  get SoundId() {
    return this.GetProp(
      "SoundId",
      1
      /* String */
    );
  }
  set SoundId(value) {
    this.SetProp("SoundId", 1, value);
  }
  get TimePosition() {
    return this.GetProp(
      "TimePosition",
      5
      /* Float64 */
    );
  }
  set TimePosition(value) {
    this.SetProp("TimePosition", 5, value);
  }
  get Volume() {
    return this.GetProp(
      "Volume",
      4
      /* Float32 */
    );
  }
  set Volume(value) {
    this.SetProp("Volume", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get XmlReadMaxDistance3() {
    return this.GetProp(
      "xmlRead_MaxDistance_3",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set XmlReadMaxDistance3(value) {
    this.SetProp("xmlRead_MaxDistance_3", 4, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get XmlReadMinDistance3() {
    return this.GetProp(
      "xmlRead_MinDistance_3",
      4
      /* Float32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set XmlReadMinDistance3(value) {
    this.SetProp("xmlRead_MinDistance_3", 4, value);
  }
};
var SoundEffect = class extends Instance {
  constructor() {
    super();
    this.addClassName("SoundEffect");
    this.Enabled = true;
    this.Priority = 0;
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Priority() {
    return this.GetProp(
      "Priority",
      3
      /* Int32 */
    );
  }
  set Priority(value) {
    this.SetProp("Priority", 3, value);
  }
};
var ChorusSoundEffect = class extends SoundEffect {
  constructor() {
    super();
    this.addClassName("ChorusSoundEffect");
    this.Name = "ChorusSoundEffect";
    this.Depth = 0.15;
    this.Mix = 0.5;
    this.Rate = 0.5;
  }
  get Depth() {
    return this.GetProp(
      "Depth",
      4
      /* Float32 */
    );
  }
  set Depth(value) {
    this.SetProp("Depth", 4, value);
  }
  get Mix() {
    return this.GetProp(
      "Mix",
      4
      /* Float32 */
    );
  }
  set Mix(value) {
    this.SetProp("Mix", 4, value);
  }
  get Rate() {
    return this.GetProp(
      "Rate",
      4
      /* Float32 */
    );
  }
  set Rate(value) {
    this.SetProp("Rate", 4, value);
  }
};
var CompressorSoundEffect = class extends SoundEffect {
  constructor() {
    super();
    this.addClassName("CompressorSoundEffect");
    this.Name = "CompressorSoundEffect";
    this.Attack = 0.1;
    this.GainMakeup = 0;
    this.Ratio = 40;
    this.Release = 0.1;
    this.Threshold = -40;
  }
  get Attack() {
    return this.GetProp(
      "Attack",
      4
      /* Float32 */
    );
  }
  set Attack(value) {
    this.SetProp("Attack", 4, value);
  }
  get GainMakeup() {
    return this.GetProp(
      "GainMakeup",
      4
      /* Float32 */
    );
  }
  set GainMakeup(value) {
    this.SetProp("GainMakeup", 4, value);
  }
  get Ratio() {
    return this.GetProp(
      "Ratio",
      4
      /* Float32 */
    );
  }
  set Ratio(value) {
    this.SetProp("Ratio", 4, value);
  }
  get Release() {
    return this.GetProp(
      "Release",
      4
      /* Float32 */
    );
  }
  set Release(value) {
    this.SetProp("Release", 4, value);
  }
  get SideChain() {
    return this.GetProp(
      "SideChain",
      19
      /* Referent */
    );
  }
  set SideChain(value) {
    this.SetProp("SideChain", 19, value);
  }
  get Threshold() {
    return this.GetProp(
      "Threshold",
      4
      /* Float32 */
    );
  }
  set Threshold(value) {
    this.SetProp("Threshold", 4, value);
  }
};
var DistortionSoundEffect = class extends SoundEffect {
  constructor() {
    super();
    this.addClassName("DistortionSoundEffect");
    this.Name = "DistortionSoundEffect";
    this.Level = 0.75;
  }
  get Level() {
    return this.GetProp(
      "Level",
      4
      /* Float32 */
    );
  }
  set Level(value) {
    this.SetProp("Level", 4, value);
  }
};
var EchoSoundEffect = class extends SoundEffect {
  constructor() {
    super();
    this.addClassName("EchoSoundEffect");
    this.Name = "EchoSoundEffect";
    this.Delay = 1;
    this.DryLevel = 0;
    this.Feedback = 0.5;
    this.WetLevel = 0;
  }
  get Delay() {
    return this.GetProp(
      "Delay",
      4
      /* Float32 */
    );
  }
  set Delay(value) {
    this.SetProp("Delay", 4, value);
  }
  get DryLevel() {
    return this.GetProp(
      "DryLevel",
      4
      /* Float32 */
    );
  }
  set DryLevel(value) {
    this.SetProp("DryLevel", 4, value);
  }
  get Feedback() {
    return this.GetProp(
      "Feedback",
      4
      /* Float32 */
    );
  }
  set Feedback(value) {
    this.SetProp("Feedback", 4, value);
  }
  get WetLevel() {
    return this.GetProp(
      "WetLevel",
      4
      /* Float32 */
    );
  }
  set WetLevel(value) {
    this.SetProp("WetLevel", 4, value);
  }
};
var EqualizerSoundEffect = class extends SoundEffect {
  constructor() {
    super();
    this.addClassName("EqualizerSoundEffect");
    this.Name = "EqualizerSoundEffect";
    this.HighGain = 0;
    this.LowGain = -20;
    this.MidGain = -10;
  }
  get HighGain() {
    return this.GetProp(
      "HighGain",
      4
      /* Float32 */
    );
  }
  set HighGain(value) {
    this.SetProp("HighGain", 4, value);
  }
  get LowGain() {
    return this.GetProp(
      "LowGain",
      4
      /* Float32 */
    );
  }
  set LowGain(value) {
    this.SetProp("LowGain", 4, value);
  }
  get MidGain() {
    return this.GetProp(
      "MidGain",
      4
      /* Float32 */
    );
  }
  set MidGain(value) {
    this.SetProp("MidGain", 4, value);
  }
};
var FlangeSoundEffect = class extends SoundEffect {
  constructor() {
    super();
    this.addClassName("FlangeSoundEffect");
    this.Name = "FlangeSoundEffect";
    this.Depth = 0.45;
    this.Mix = 0.85;
    this.Rate = 5;
  }
  get Depth() {
    return this.GetProp(
      "Depth",
      4
      /* Float32 */
    );
  }
  set Depth(value) {
    this.SetProp("Depth", 4, value);
  }
  get Mix() {
    return this.GetProp(
      "Mix",
      4
      /* Float32 */
    );
  }
  set Mix(value) {
    this.SetProp("Mix", 4, value);
  }
  get Rate() {
    return this.GetProp(
      "Rate",
      4
      /* Float32 */
    );
  }
  set Rate(value) {
    this.SetProp("Rate", 4, value);
  }
};
var PitchShiftSoundEffect = class extends SoundEffect {
  constructor() {
    super();
    this.addClassName("PitchShiftSoundEffect");
    this.Name = "PitchShiftSoundEffect";
    this.Octave = 1.25;
  }
  get Octave() {
    return this.GetProp(
      "Octave",
      4
      /* Float32 */
    );
  }
  set Octave(value) {
    this.SetProp("Octave", 4, value);
  }
};
var ReverbSoundEffect = class extends SoundEffect {
  constructor() {
    super();
    this.addClassName("ReverbSoundEffect");
    this.Name = "ReverbSoundEffect";
    this.DecayTime = 1.5;
    this.Density = 1;
    this.Diffusion = 1;
    this.DryLevel = -6;
    this.WetLevel = 0;
  }
  get DecayTime() {
    return this.GetProp(
      "DecayTime",
      4
      /* Float32 */
    );
  }
  set DecayTime(value) {
    this.SetProp("DecayTime", 4, value);
  }
  get Density() {
    return this.GetProp(
      "Density",
      4
      /* Float32 */
    );
  }
  set Density(value) {
    this.SetProp("Density", 4, value);
  }
  get Diffusion() {
    return this.GetProp(
      "Diffusion",
      4
      /* Float32 */
    );
  }
  set Diffusion(value) {
    this.SetProp("Diffusion", 4, value);
  }
  get DryLevel() {
    return this.GetProp(
      "DryLevel",
      4
      /* Float32 */
    );
  }
  set DryLevel(value) {
    this.SetProp("DryLevel", 4, value);
  }
  get WetLevel() {
    return this.GetProp(
      "WetLevel",
      4
      /* Float32 */
    );
  }
  set WetLevel(value) {
    this.SetProp("WetLevel", 4, value);
  }
};
var TremoloSoundEffect = class extends SoundEffect {
  constructor() {
    super();
    this.addClassName("TremoloSoundEffect");
    this.Name = "TremoloSoundEffect";
    this.Depth = 1;
    this.Duty = 0.5;
    this.Frequency = 5;
  }
  get Depth() {
    return this.GetProp(
      "Depth",
      4
      /* Float32 */
    );
  }
  set Depth(value) {
    this.SetProp("Depth", 4, value);
  }
  get Duty() {
    return this.GetProp(
      "Duty",
      4
      /* Float32 */
    );
  }
  set Duty(value) {
    this.SetProp("Duty", 4, value);
  }
  get Frequency() {
    return this.GetProp(
      "Frequency",
      4
      /* Float32 */
    );
  }
  set Frequency(value) {
    this.SetProp("Frequency", 4, value);
  }
};
var SoundGroup = class extends Instance {
  constructor() {
    super();
    this.addClassName("SoundGroup");
    this.Name = "SoundGroup";
    this.Volume = 0.5;
  }
  get Volume() {
    return this.GetProp(
      "Volume",
      4
      /* Float32 */
    );
  }
  set Volume(value) {
    this.SetProp("Volume", 4, value);
  }
};
var SoundService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("SoundService");
    this.Name = "SoundService";
    this.AmbientReverb = ReverbType.NoReverb;
    this.AudioApiByDefault = RolloutState.Default;
    this.CharacterSoundsUseNewApi = RolloutState.Default;
    this.DefaultListenerLocation = ListenerLocation.Default;
    this.DistanceFactor = 3.33;
    this.DopplerScale = 1;
    this.IsNewExpForAudioApiByDefault = false;
    this.RespectFilteringEnabled = false;
    this.RolloffScale = 1;
    this.VolumetricAudio = VolumetricAudio.Automatic;
  }
  get AmbientReverb() {
    return this.GetProp(
      "AmbientReverb",
      18
      /* Enum */
    );
  }
  set AmbientReverb(value) {
    this.SetProp("AmbientReverb", 18, value);
  }
  get AudioApiByDefault() {
    return this.GetProp(
      "AudioApiByDefault",
      18
      /* Enum */
    );
  }
  set AudioApiByDefault(value) {
    this.SetProp("AudioApiByDefault", 18, value);
  }
  get CharacterSoundsUseNewApi() {
    return this.GetProp(
      "CharacterSoundsUseNewApi",
      18
      /* Enum */
    );
  }
  set CharacterSoundsUseNewApi(value) {
    this.SetProp("CharacterSoundsUseNewApi", 18, value);
  }
  get DefaultListenerLocation() {
    return this.GetProp(
      "DefaultListenerLocation",
      18
      /* Enum */
    );
  }
  set DefaultListenerLocation(value) {
    this.SetProp("DefaultListenerLocation", 18, value);
  }
  get DistanceFactor() {
    return this.GetProp(
      "DistanceFactor",
      4
      /* Float32 */
    );
  }
  set DistanceFactor(value) {
    this.SetProp("DistanceFactor", 4, value);
  }
  get DopplerScale() {
    return this.GetProp(
      "DopplerScale",
      4
      /* Float32 */
    );
  }
  set DopplerScale(value) {
    this.SetProp("DopplerScale", 4, value);
  }
  get IsNewExpForAudioApiByDefault() {
    return this.GetProp(
      "IsNewExpForAudioApiByDefault",
      2
      /* Bool */
    );
  }
  set IsNewExpForAudioApiByDefault(value) {
    this.SetProp("IsNewExpForAudioApiByDefault", 2, value);
  }
  get RespectFilteringEnabled() {
    return this.GetProp(
      "RespectFilteringEnabled",
      2
      /* Bool */
    );
  }
  set RespectFilteringEnabled(value) {
    this.SetProp("RespectFilteringEnabled", 2, value);
  }
  get RolloffScale() {
    return this.GetProp(
      "RolloffScale",
      4
      /* Float32 */
    );
  }
  set RolloffScale(value) {
    this.SetProp("RolloffScale", 4, value);
  }
  get VolumetricAudio() {
    return this.GetProp(
      "VolumetricAudio",
      18
      /* Enum */
    );
  }
  set VolumetricAudio(value) {
    this.SetProp("VolumetricAudio", 18, value);
  }
};
var Sparkles = class extends Instance {
  constructor() {
    super();
    this.addClassName("Sparkles");
    this.Name = "Sparkles";
    this.Enabled = true;
    this.SparkleColor = Color3.FromRGB(144, 25, 255);
    this.TimeScale = 1;
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get SparkleColor() {
    return this.GetProp(
      "SparkleColor",
      12
      /* Color3 */
    );
  }
  set SparkleColor(value) {
    this.SetProp("SparkleColor", 12, value);
  }
  get TimeScale() {
    return this.GetProp(
      "TimeScale",
      4
      /* Float32 */
    );
  }
  set TimeScale(value) {
    this.SetProp("TimeScale", 4, value);
  }
};
var SpawnerService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("SpawnerService");
    this.Name = "SpawnerService";
  }
};
var StandalonePluginScripts = class extends Instance {
  constructor() {
    super();
    this.addClassName("StandalonePluginScripts");
    this.Name = "StandalonePluginScripts";
  }
};
var StartPageService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StartPageService");
    this.Name = "StartPageService";
  }
};
var StarterGear = class extends Instance {
  constructor() {
    super();
    this.addClassName("StarterGear");
    this.Name = "StarterGear";
  }
};
var StarterPack = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StarterPack");
    this.Name = "StarterPack";
  }
};
var StarterPlayer = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StarterPlayer");
    this.Name = "StarterPlayer";
    this.AllowCustomAnimations = true;
    this.AutoJumpEnabled = true;
    this.AvatarJointUpgradeSerializedRollout = RolloutState.Default;
    this.CameraMaxZoomDistance = 400;
    this.CameraMinZoomDistance = 0.5;
    this.CameraMode = CameraMode.Classic;
    this.CharacterJumpHeight = 7.2;
    this.CharacterJumpPower = 50;
    this.CharacterMaxSlopeAngle = 89;
    this.CharacterUseJumpPower = true;
    this.CharacterWalkSpeed = 16;
    this.ClassicDeath = true;
    this.DevCameraOcclusionMode = DevCameraOcclusionMode.Zoom;
    this.DevComputerCameraMovementMode = DevComputerCameraMovementMode.UserChoice;
    this.DevComputerMovementMode = DevComputerMovementMode.UserChoice;
    this.DevTouchCameraMovementMode = DevTouchCameraMovementMode.UserChoice;
    this.DevTouchMovementMode = DevTouchMovementMode.UserChoice;
    this.EnableDynamicHeads = LoadDynamicHeads.Default;
    this.EnableMouseLockOption = true;
    this.GameSettingsAssetIDFace = BigInt(0);
    this.GameSettingsAssetIDHead = BigInt(0);
    this.GameSettingsAssetIDLeftArm = BigInt(0);
    this.GameSettingsAssetIDLeftLeg = BigInt(0);
    this.GameSettingsAssetIDPants = BigInt(0);
    this.GameSettingsAssetIDRightArm = BigInt(0);
    this.GameSettingsAssetIDRightLeg = BigInt(0);
    this.GameSettingsAssetIDShirt = BigInt(0);
    this.GameSettingsAssetIDTeeShirt = BigInt(0);
    this.GameSettingsAssetIDTorso = BigInt(0);
    this.GameSettingsAvatar = GameAvatarType.R15;
    this.GameSettingsR15Collision = R15CollisionType.OuterBox;
    this.GameSettingsScaleRangeBodyType = new NumberRange(0, 1);
    this.GameSettingsScaleRangeHead = new NumberRange(0.95, 1);
    this.GameSettingsScaleRangeHeight = new NumberRange(0.9, 1.05);
    this.GameSettingsScaleRangeProportion = new NumberRange(0, 1);
    this.GameSettingsScaleRangeWidth = new NumberRange(0.7, 1);
    this.HealthDisplayDistance = 100;
    this.LoadCharacterAppearance = true;
    this.LoadCharacterLayeredClothing = LoadCharacterLayeredClothing.Default;
    this.LuaCharacterController = CharacterControlMode.Default;
    this.NameDisplayDistance = 100;
    this.RagdollDeath = true;
    this.UserEmotesEnabled = true;
  }
  get AllowCustomAnimations() {
    return this.GetProp(
      "AllowCustomAnimations",
      2
      /* Bool */
    );
  }
  set AllowCustomAnimations(value) {
    this.SetProp("AllowCustomAnimations", 2, value);
  }
  get AutoJumpEnabled() {
    return this.GetProp(
      "AutoJumpEnabled",
      2
      /* Bool */
    );
  }
  set AutoJumpEnabled(value) {
    this.SetProp("AutoJumpEnabled", 2, value);
  }
  get AvatarJointUpgradeSerializedRollout() {
    return this.GetProp(
      "AvatarJointUpgrade_SerializedRollout",
      18
      /* Enum */
    );
  }
  set AvatarJointUpgradeSerializedRollout(value) {
    this.SetProp("AvatarJointUpgrade_SerializedRollout", 18, value);
  }
  get CameraMaxZoomDistance() {
    return this.GetProp(
      "CameraMaxZoomDistance",
      4
      /* Float32 */
    );
  }
  set CameraMaxZoomDistance(value) {
    this.SetProp("CameraMaxZoomDistance", 4, value);
  }
  get CameraMinZoomDistance() {
    return this.GetProp(
      "CameraMinZoomDistance",
      4
      /* Float32 */
    );
  }
  set CameraMinZoomDistance(value) {
    this.SetProp("CameraMinZoomDistance", 4, value);
  }
  get CameraMode() {
    return this.GetProp(
      "CameraMode",
      18
      /* Enum */
    );
  }
  set CameraMode(value) {
    this.SetProp("CameraMode", 18, value);
  }
  get CharacterJumpHeight() {
    return this.GetProp(
      "CharacterJumpHeight",
      4
      /* Float32 */
    );
  }
  set CharacterJumpHeight(value) {
    this.SetProp("CharacterJumpHeight", 4, value);
  }
  get CharacterJumpPower() {
    return this.GetProp(
      "CharacterJumpPower",
      4
      /* Float32 */
    );
  }
  set CharacterJumpPower(value) {
    this.SetProp("CharacterJumpPower", 4, value);
  }
  get CharacterMaxSlopeAngle() {
    return this.GetProp(
      "CharacterMaxSlopeAngle",
      4
      /* Float32 */
    );
  }
  set CharacterMaxSlopeAngle(value) {
    this.SetProp("CharacterMaxSlopeAngle", 4, value);
  }
  get CharacterUseJumpPower() {
    return this.GetProp(
      "CharacterUseJumpPower",
      2
      /* Bool */
    );
  }
  set CharacterUseJumpPower(value) {
    this.SetProp("CharacterUseJumpPower", 2, value);
  }
  get CharacterWalkSpeed() {
    return this.GetProp(
      "CharacterWalkSpeed",
      4
      /* Float32 */
    );
  }
  set CharacterWalkSpeed(value) {
    this.SetProp("CharacterWalkSpeed", 4, value);
  }
  get ClassicDeath() {
    return this.GetProp(
      "ClassicDeath",
      2
      /* Bool */
    );
  }
  set ClassicDeath(value) {
    this.SetProp("ClassicDeath", 2, value);
  }
  get DevCameraOcclusionMode() {
    return this.GetProp(
      "DevCameraOcclusionMode",
      18
      /* Enum */
    );
  }
  set DevCameraOcclusionMode(value) {
    this.SetProp("DevCameraOcclusionMode", 18, value);
  }
  get DevComputerCameraMovementMode() {
    return this.GetProp(
      "DevComputerCameraMovementMode",
      18
      /* Enum */
    );
  }
  set DevComputerCameraMovementMode(value) {
    this.SetProp("DevComputerCameraMovementMode", 18, value);
  }
  get DevComputerMovementMode() {
    return this.GetProp(
      "DevComputerMovementMode",
      18
      /* Enum */
    );
  }
  set DevComputerMovementMode(value) {
    this.SetProp("DevComputerMovementMode", 18, value);
  }
  get DevTouchCameraMovementMode() {
    return this.GetProp(
      "DevTouchCameraMovementMode",
      18
      /* Enum */
    );
  }
  set DevTouchCameraMovementMode(value) {
    this.SetProp("DevTouchCameraMovementMode", 18, value);
  }
  get DevTouchMovementMode() {
    return this.GetProp(
      "DevTouchMovementMode",
      18
      /* Enum */
    );
  }
  set DevTouchMovementMode(value) {
    this.SetProp("DevTouchMovementMode", 18, value);
  }
  get EnableDynamicHeads() {
    return this.GetProp(
      "EnableDynamicHeads",
      18
      /* Enum */
    );
  }
  set EnableDynamicHeads(value) {
    this.SetProp("EnableDynamicHeads", 18, value);
  }
  get EnableMouseLockOption() {
    return this.GetProp(
      "EnableMouseLockOption",
      2
      /* Bool */
    );
  }
  set EnableMouseLockOption(value) {
    this.SetProp("EnableMouseLockOption", 2, value);
  }
  get GameSettingsAssetIDFace() {
    return this.GetProp(
      "GameSettingsAssetIDFace",
      27
      /* Int64 */
    );
  }
  set GameSettingsAssetIDFace(value) {
    this.SetProp("GameSettingsAssetIDFace", 27, value);
  }
  get GameSettingsAssetIDHead() {
    return this.GetProp(
      "GameSettingsAssetIDHead",
      27
      /* Int64 */
    );
  }
  set GameSettingsAssetIDHead(value) {
    this.SetProp("GameSettingsAssetIDHead", 27, value);
  }
  get GameSettingsAssetIDLeftArm() {
    return this.GetProp(
      "GameSettingsAssetIDLeftArm",
      27
      /* Int64 */
    );
  }
  set GameSettingsAssetIDLeftArm(value) {
    this.SetProp("GameSettingsAssetIDLeftArm", 27, value);
  }
  get GameSettingsAssetIDLeftLeg() {
    return this.GetProp(
      "GameSettingsAssetIDLeftLeg",
      27
      /* Int64 */
    );
  }
  set GameSettingsAssetIDLeftLeg(value) {
    this.SetProp("GameSettingsAssetIDLeftLeg", 27, value);
  }
  get GameSettingsAssetIDPants() {
    return this.GetProp(
      "GameSettingsAssetIDPants",
      27
      /* Int64 */
    );
  }
  set GameSettingsAssetIDPants(value) {
    this.SetProp("GameSettingsAssetIDPants", 27, value);
  }
  get GameSettingsAssetIDRightArm() {
    return this.GetProp(
      "GameSettingsAssetIDRightArm",
      27
      /* Int64 */
    );
  }
  set GameSettingsAssetIDRightArm(value) {
    this.SetProp("GameSettingsAssetIDRightArm", 27, value);
  }
  get GameSettingsAssetIDRightLeg() {
    return this.GetProp(
      "GameSettingsAssetIDRightLeg",
      27
      /* Int64 */
    );
  }
  set GameSettingsAssetIDRightLeg(value) {
    this.SetProp("GameSettingsAssetIDRightLeg", 27, value);
  }
  get GameSettingsAssetIDShirt() {
    return this.GetProp(
      "GameSettingsAssetIDShirt",
      27
      /* Int64 */
    );
  }
  set GameSettingsAssetIDShirt(value) {
    this.SetProp("GameSettingsAssetIDShirt", 27, value);
  }
  get GameSettingsAssetIDTeeShirt() {
    return this.GetProp(
      "GameSettingsAssetIDTeeShirt",
      27
      /* Int64 */
    );
  }
  set GameSettingsAssetIDTeeShirt(value) {
    this.SetProp("GameSettingsAssetIDTeeShirt", 27, value);
  }
  get GameSettingsAssetIDTorso() {
    return this.GetProp(
      "GameSettingsAssetIDTorso",
      27
      /* Int64 */
    );
  }
  set GameSettingsAssetIDTorso(value) {
    this.SetProp("GameSettingsAssetIDTorso", 27, value);
  }
  get GameSettingsAvatar() {
    return this.GetProp(
      "GameSettingsAvatar",
      18
      /* Enum */
    );
  }
  set GameSettingsAvatar(value) {
    this.SetProp("GameSettingsAvatar", 18, value);
  }
  get GameSettingsR15Collision() {
    return this.GetProp(
      "GameSettingsR15Collision",
      18
      /* Enum */
    );
  }
  set GameSettingsR15Collision(value) {
    this.SetProp("GameSettingsR15Collision", 18, value);
  }
  get GameSettingsScaleRangeBodyType() {
    return this.GetProp(
      "GameSettingsScaleRangeBodyType",
      23
      /* NumberRange */
    );
  }
  set GameSettingsScaleRangeBodyType(value) {
    this.SetProp("GameSettingsScaleRangeBodyType", 23, value);
  }
  get GameSettingsScaleRangeHead() {
    return this.GetProp(
      "GameSettingsScaleRangeHead",
      23
      /* NumberRange */
    );
  }
  set GameSettingsScaleRangeHead(value) {
    this.SetProp("GameSettingsScaleRangeHead", 23, value);
  }
  get GameSettingsScaleRangeHeight() {
    return this.GetProp(
      "GameSettingsScaleRangeHeight",
      23
      /* NumberRange */
    );
  }
  set GameSettingsScaleRangeHeight(value) {
    this.SetProp("GameSettingsScaleRangeHeight", 23, value);
  }
  get GameSettingsScaleRangeProportion() {
    return this.GetProp(
      "GameSettingsScaleRangeProportion",
      23
      /* NumberRange */
    );
  }
  set GameSettingsScaleRangeProportion(value) {
    this.SetProp("GameSettingsScaleRangeProportion", 23, value);
  }
  get GameSettingsScaleRangeWidth() {
    return this.GetProp(
      "GameSettingsScaleRangeWidth",
      23
      /* NumberRange */
    );
  }
  set GameSettingsScaleRangeWidth(value) {
    this.SetProp("GameSettingsScaleRangeWidth", 23, value);
  }
  get HealthDisplayDistance() {
    return this.GetProp(
      "HealthDisplayDistance",
      4
      /* Float32 */
    );
  }
  set HealthDisplayDistance(value) {
    this.SetProp("HealthDisplayDistance", 4, value);
  }
  get LoadCharacterAppearance() {
    return this.GetProp(
      "LoadCharacterAppearance",
      2
      /* Bool */
    );
  }
  set LoadCharacterAppearance(value) {
    this.SetProp("LoadCharacterAppearance", 2, value);
  }
  get LoadCharacterLayeredClothing() {
    return this.GetProp(
      "LoadCharacterLayeredClothing",
      18
      /* Enum */
    );
  }
  set LoadCharacterLayeredClothing(value) {
    this.SetProp("LoadCharacterLayeredClothing", 18, value);
  }
  get LuaCharacterController() {
    return this.GetProp(
      "LuaCharacterController",
      18
      /* Enum */
    );
  }
  set LuaCharacterController(value) {
    this.SetProp("LuaCharacterController", 18, value);
  }
  get NameDisplayDistance() {
    return this.GetProp(
      "NameDisplayDistance",
      4
      /* Float32 */
    );
  }
  set NameDisplayDistance(value) {
    this.SetProp("NameDisplayDistance", 4, value);
  }
  get RagdollDeath() {
    return this.GetProp(
      "RagdollDeath",
      2
      /* Bool */
    );
  }
  set RagdollDeath(value) {
    this.SetProp("RagdollDeath", 2, value);
  }
  get UserEmotesEnabled() {
    return this.GetProp(
      "UserEmotesEnabled",
      2
      /* Bool */
    );
  }
  set UserEmotesEnabled(value) {
    this.SetProp("UserEmotesEnabled", 2, value);
  }
};
var StarterPlayerScripts = class extends Instance {
  constructor() {
    super();
    this.addClassName("StarterPlayerScripts");
    this.Name = "StarterPlayerScripts";
  }
};
var StarterCharacterScripts = class extends StarterPlayerScripts {
  constructor() {
    super();
    this.addClassName("StarterCharacterScripts");
    this.Name = "StarterCharacterScripts";
  }
};
var StartupMessageService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StartupMessageService");
    this.Name = "StartupMessageService";
  }
};
var Stats = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("Stats");
    this.Name = "Stats";
  }
};
var StopWatchReporter = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StopWatchReporter");
    this.Name = "StopWatchReporter";
  }
};
var StreamingService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StreamingService");
    this.Name = "StreamingService";
  }
};
var StudioAssetService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StudioAssetService");
    this.Name = "StudioAssetService";
  }
};
var StudioAttachment = class extends Instance {
  constructor() {
    super();
    this.addClassName("StudioAttachment");
    this.Name = "StudioAttachment";
    this.AutoHideParent = false;
    this.IsArrowVisible = false;
    this.Offset = new Vector2(0, 0);
    this.SourceAnchorPoint = new Vector2(0, 0);
    this.TargetAnchorPoint = new Vector2(0, 0);
  }
  get AutoHideParent() {
    return this.GetProp(
      "AutoHideParent",
      2
      /* Bool */
    );
  }
  set AutoHideParent(value) {
    this.SetProp("AutoHideParent", 2, value);
  }
  get IsArrowVisible() {
    return this.GetProp(
      "IsArrowVisible",
      2
      /* Bool */
    );
  }
  set IsArrowVisible(value) {
    this.SetProp("IsArrowVisible", 2, value);
  }
  get Offset() {
    return this.GetProp(
      "Offset",
      13
      /* Vector2 */
    );
  }
  set Offset(value) {
    this.SetProp("Offset", 13, value);
  }
  get SourceAnchorPoint() {
    return this.GetProp(
      "SourceAnchorPoint",
      13
      /* Vector2 */
    );
  }
  set SourceAnchorPoint(value) {
    this.SetProp("SourceAnchorPoint", 13, value);
  }
  get TargetAnchorPoint() {
    return this.GetProp(
      "TargetAnchorPoint",
      13
      /* Vector2 */
    );
  }
  set TargetAnchorPoint(value) {
    this.SetProp("TargetAnchorPoint", 13, value);
  }
};
var StudioCallout = class extends Instance {
  constructor() {
    super();
    this.addClassName("StudioCallout");
    this.Name = "StudioCallout";
  }
};
var StudioCameraService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StudioCameraService");
    this.Name = "StudioCameraService";
    this.LockCameraSpeed = false;
  }
  get LockCameraSpeed() {
    return this.GetProp(
      "LockCameraSpeed",
      2
      /* Bool */
    );
  }
  set LockCameraSpeed(value) {
    this.SetProp("LockCameraSpeed", 2, value);
  }
};
var StudioData = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StudioData");
    this.Name = "StudioData";
    this.EnableScriptCollabByDefaultOnLoad = false;
  }
  get EnableScriptCollabByDefaultOnLoad() {
    return this.GetProp(
      "EnableScriptCollabByDefaultOnLoad",
      2
      /* Bool */
    );
  }
  set EnableScriptCollabByDefaultOnLoad(value) {
    this.SetProp("EnableScriptCollabByDefaultOnLoad", 2, value);
  }
};
var StudioDeviceEmulatorService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StudioDeviceEmulatorService");
    this.Name = "StudioDeviceEmulatorService";
  }
};
var StudioPublishService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StudioPublishService");
    this.Name = "StudioPublishService";
    this.PublishLocked = false;
  }
  get PublishLocked() {
    return this.GetProp(
      "PublishLocked",
      2
      /* Bool */
    );
  }
  set PublishLocked(value) {
    this.SetProp("PublishLocked", 2, value);
  }
};
var StudioScriptDebugEventListener = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StudioScriptDebugEventListener");
    this.Name = "StudioScriptDebugEventListener";
  }
};
var StudioSdkService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StudioSdkService");
    this.Name = "StudioSdkService";
  }
};
var StudioService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StudioService");
    this.Name = "StudioService";
  }
  get Secrets() {
    return this.GetProp(
      "Secrets",
      1
      /* String */
    );
  }
  set Secrets(value) {
    this.SetProp("Secrets", 1, value);
  }
};
var StudioUserService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StudioUserService");
    this.Name = "StudioUserService";
  }
};
var StudioWidgetsService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StudioWidgetsService");
    this.Name = "StudioWidgetsService";
  }
};
var StyleBase = class extends Instance {
  constructor() {
    super();
    this.addClassName("StyleBase");
  }
};
var StyleRule = class extends StyleBase {
  constructor() {
    super();
    this.addClassName("StyleRule");
    this.Name = "StyleRule";
    this.Priority = 0;
    this.PropertiesSerialize = "";
    this.Selector = "";
  }
  get Priority() {
    return this.GetProp(
      "Priority",
      3
      /* Int32 */
    );
  }
  set Priority(value) {
    this.SetProp("Priority", 3, value);
  }
  get PropertiesSerialize() {
    return this.GetProp(
      "PropertiesSerialize",
      1
      /* String */
    );
  }
  set PropertiesSerialize(value) {
    this.SetProp("PropertiesSerialize", 1, value);
  }
  get Selector() {
    return this.GetProp(
      "Selector",
      1
      /* String */
    );
  }
  set Selector(value) {
    this.SetProp("Selector", 1, value);
  }
};
var StyleSheet = class extends StyleBase {
  constructor() {
    super();
    this.addClassName("StyleSheet");
    this.Name = "StyleSheet";
  }
};
var StyleDerive = class extends Instance {
  constructor() {
    super();
    this.addClassName("StyleDerive");
    this.Name = "StyleDerive";
    this.Priority = 0;
  }
  get Priority() {
    return this.GetProp(
      "Priority",
      3
      /* Int32 */
    );
  }
  set Priority(value) {
    this.SetProp("Priority", 3, value);
  }
  get StyleSheet() {
    return this.GetProp(
      "StyleSheet",
      19
      /* Referent */
    );
  }
  set StyleSheet(value) {
    this.SetProp("StyleSheet", 19, value);
  }
};
var StyleLink = class extends Instance {
  constructor() {
    super();
    this.addClassName("StyleLink");
    this.Name = "StyleLink";
  }
  get StyleSheet() {
    return this.GetProp(
      "StyleSheet",
      19
      /* Referent */
    );
  }
  set StyleSheet(value) {
    this.SetProp("StyleSheet", 19, value);
  }
};
var StylingService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("StylingService");
    this.Name = "StylingService";
  }
};
var SurfaceAppearance = class extends Instance {
  constructor() {
    super();
    this.addClassName("SurfaceAppearance");
    this.Name = "SurfaceAppearance";
    this.AlphaMode = AlphaMode.Overlay;
    this.Color = Color3.FromRGB(255, 255, 255);
    this.ColorMap = "";
    this.MetalnessMap = "";
    this.NormalMap = "";
    this.RoughnessMap = "";
    this.TexturePack = "";
  }
  get AlphaMode() {
    return this.GetProp(
      "AlphaMode",
      18
      /* Enum */
    );
  }
  set AlphaMode(value) {
    this.SetProp("AlphaMode", 18, value);
  }
  get Color() {
    return this.GetProp(
      "Color",
      12
      /* Color3 */
    );
  }
  set Color(value) {
    this.SetProp("Color", 12, value);
  }
  get ColorMap() {
    return this.GetProp(
      "ColorMap",
      1
      /* String */
    );
  }
  set ColorMap(value) {
    this.SetProp("ColorMap", 1, value);
  }
  get ColorMapContent() {
    return this.GetProp(
      "ColorMapContent",
      1
      /* String */
    );
  }
  set ColorMapContent(value) {
    this.SetProp("ColorMapContent", 1, value);
  }
  get MetalnessMap() {
    return this.GetProp(
      "MetalnessMap",
      1
      /* String */
    );
  }
  set MetalnessMap(value) {
    this.SetProp("MetalnessMap", 1, value);
  }
  get MetalnessMapContent() {
    return this.GetProp(
      "MetalnessMapContent",
      1
      /* String */
    );
  }
  set MetalnessMapContent(value) {
    this.SetProp("MetalnessMapContent", 1, value);
  }
  get NormalMap() {
    return this.GetProp(
      "NormalMap",
      1
      /* String */
    );
  }
  set NormalMap(value) {
    this.SetProp("NormalMap", 1, value);
  }
  get NormalMapContent() {
    return this.GetProp(
      "NormalMapContent",
      1
      /* String */
    );
  }
  set NormalMapContent(value) {
    this.SetProp("NormalMapContent", 1, value);
  }
  get RoughnessMap() {
    return this.GetProp(
      "RoughnessMap",
      1
      /* String */
    );
  }
  set RoughnessMap(value) {
    this.SetProp("RoughnessMap", 1, value);
  }
  get RoughnessMapContent() {
    return this.GetProp(
      "RoughnessMapContent",
      1
      /* String */
    );
  }
  set RoughnessMapContent(value) {
    this.SetProp("RoughnessMapContent", 1, value);
  }
  get TexturePack() {
    return this.GetProp(
      "TexturePack",
      1
      /* String */
    );
  }
  set TexturePack(value) {
    this.SetProp("TexturePack", 1, value);
  }
};
var SystemThemeService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("SystemThemeService");
    this.Name = "SystemThemeService";
  }
};
var TaskScheduler = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TaskScheduler");
    this.Name = "TaskScheduler";
  }
  get ThreadPoolConfig() {
    return this.GetProp(
      "ThreadPoolConfig",
      18
      /* Enum */
    );
  }
  set ThreadPoolConfig(value) {
    this.SetProp("ThreadPoolConfig", 18, value);
  }
};
var Team = class extends Instance {
  constructor() {
    super();
    this.addClassName("Team");
    this.Name = "Team";
    this.AutoAssignable = true;
    this.AutoColorCharacters = true;
    this.Score = 0;
  }
  get AutoAssignable() {
    return this.GetProp(
      "AutoAssignable",
      2
      /* Bool */
    );
  }
  set AutoAssignable(value) {
    this.SetProp("AutoAssignable", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get AutoColorCharacters() {
    return this.GetProp(
      "AutoColorCharacters",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set AutoColorCharacters(value) {
    this.SetProp("AutoColorCharacters", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Score() {
    return this.GetProp(
      "Score",
      3
      /* Int32 */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Score(value) {
    this.SetProp("Score", 3, value);
  }
  get TeamColor() {
    return this.GetProp(
      "TeamColor",
      11
      /* BrickColor */
    );
  }
  set TeamColor(value) {
    this.SetProp("TeamColor", 11, value);
  }
};
var TeamCreateData = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TeamCreateData");
    this.Name = "TeamCreateData";
  }
};
var TeamCreatePublishService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TeamCreatePublishService");
    this.Name = "TeamCreatePublishService";
  }
};
var TeamCreateService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TeamCreateService");
    this.Name = "TeamCreateService";
  }
};
var Teams = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("Teams");
    this.Name = "Teams";
  }
};
var TelemetryService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TelemetryService");
    this.Name = "TelemetryService";
  }
};
var TeleportOptions = class extends Instance {
  constructor() {
    super();
    this.addClassName("TeleportOptions");
    this.Name = "TeleportOptions";
    this.ReservedServerAccessCode = "";
    this.ServerInstanceId = "";
    this.ShouldReserveServer = false;
  }
  get ReservedServerAccessCode() {
    return this.GetProp(
      "ReservedServerAccessCode",
      1
      /* String */
    );
  }
  set ReservedServerAccessCode(value) {
    this.SetProp("ReservedServerAccessCode", 1, value);
  }
  get ServerInstanceId() {
    return this.GetProp(
      "ServerInstanceId",
      1
      /* String */
    );
  }
  set ServerInstanceId(value) {
    this.SetProp("ServerInstanceId", 1, value);
  }
  get ShouldReserveServer() {
    return this.GetProp(
      "ShouldReserveServer",
      2
      /* Bool */
    );
  }
  set ShouldReserveServer(value) {
    this.SetProp("ShouldReserveServer", 2, value);
  }
};
var TeleportService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TeleportService");
    this.Name = "TeleportService";
    this.CustomizedTeleportUI = false;
  }
  /**@deprecated Deprecated by Roblox*/
  get CustomizedTeleportUI() {
    return this.GetProp(
      "CustomizedTeleportUI",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set CustomizedTeleportUI(value) {
    this.SetProp("CustomizedTeleportUI", 2, value);
  }
};
var TemporaryCageMeshProvider = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TemporaryCageMeshProvider");
    this.Name = "TemporaryCageMeshProvider";
  }
};
var TemporaryScriptService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TemporaryScriptService");
    this.Name = "TemporaryScriptService";
  }
};
var TerrainDetail = class extends Instance {
  constructor() {
    super();
    this.addClassName("TerrainDetail");
    this.Name = "TerrainDetail";
    this.ColorMap = "";
    this.Face = TerrainFace.Side;
    this.MaterialPattern = MaterialPattern.Regular;
    this.MetalnessMap = "";
    this.NormalMap = "";
    this.RoughnessMap = "";
    this.StudsPerTile = 10;
    this.TexturePack = "";
  }
  get ColorMap() {
    return this.GetProp(
      "ColorMap",
      1
      /* String */
    );
  }
  set ColorMap(value) {
    this.SetProp("ColorMap", 1, value);
  }
  get Face() {
    return this.GetProp(
      "Face",
      18
      /* Enum */
    );
  }
  set Face(value) {
    this.SetProp("Face", 18, value);
  }
  get MaterialPattern() {
    return this.GetProp(
      "MaterialPattern",
      18
      /* Enum */
    );
  }
  set MaterialPattern(value) {
    this.SetProp("MaterialPattern", 18, value);
  }
  get MetalnessMap() {
    return this.GetProp(
      "MetalnessMap",
      1
      /* String */
    );
  }
  set MetalnessMap(value) {
    this.SetProp("MetalnessMap", 1, value);
  }
  get NormalMap() {
    return this.GetProp(
      "NormalMap",
      1
      /* String */
    );
  }
  set NormalMap(value) {
    this.SetProp("NormalMap", 1, value);
  }
  get RoughnessMap() {
    return this.GetProp(
      "RoughnessMap",
      1
      /* String */
    );
  }
  set RoughnessMap(value) {
    this.SetProp("RoughnessMap", 1, value);
  }
  get StudsPerTile() {
    return this.GetProp(
      "StudsPerTile",
      4
      /* Float32 */
    );
  }
  set StudsPerTile(value) {
    this.SetProp("StudsPerTile", 4, value);
  }
  get TexturePack() {
    return this.GetProp(
      "TexturePack",
      1
      /* String */
    );
  }
  set TexturePack(value) {
    this.SetProp("TexturePack", 1, value);
  }
};
var TerrainRegion = class extends Instance {
  constructor() {
    super();
    this.addClassName("TerrainRegion");
    this.Name = "TerrainRegion";
    this.ExtentsMax = new Vector3(0, 0, 0);
    this.ExtentsMin = new Vector3(0, 0, 0);
    this.SmoothGrid = "";
  }
  get ExtentsMax() {
    return this.GetProp(
      "ExtentsMax",
      20
      /* Vector3int16 */
    );
  }
  set ExtentsMax(value) {
    this.SetProp("ExtentsMax", 20, value);
  }
  get ExtentsMin() {
    return this.GetProp(
      "ExtentsMin",
      20
      /* Vector3int16 */
    );
  }
  set ExtentsMin(value) {
    this.SetProp("ExtentsMin", 20, value);
  }
  get SmoothGrid() {
    return this.GetProp(
      "SmoothGrid",
      1
      /* String */
    );
  }
  set SmoothGrid(value) {
    this.SetProp("SmoothGrid", 1, value);
  }
};
var TestService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TestService");
    this.Name = "TestService";
    this.AutoRuns = true;
    this.Description = "";
    this.ExecuteWithStudioRun = false;
    this.Is30FpsThrottleEnabled = true;
    this.IsPhysicsEnvironmentalThrottled = true;
    this.IsSleepAllowed = true;
    this.NumberOfPlayers = 0;
    this.SimulateSecondsLag = 0;
    this.ThrottlePhysicsToRealtime = true;
    this.Timeout = 10;
  }
  get AutoRuns() {
    return this.GetProp(
      "AutoRuns",
      2
      /* Bool */
    );
  }
  set AutoRuns(value) {
    this.SetProp("AutoRuns", 2, value);
  }
  get Description() {
    return this.GetProp(
      "Description",
      1
      /* String */
    );
  }
  set Description(value) {
    this.SetProp("Description", 1, value);
  }
  get ExecuteWithStudioRun() {
    return this.GetProp(
      "ExecuteWithStudioRun",
      2
      /* Bool */
    );
  }
  set ExecuteWithStudioRun(value) {
    this.SetProp("ExecuteWithStudioRun", 2, value);
  }
  /**@deprecated Deprecated by Roblox*/
  get Is30FpsThrottleEnabled() {
    return this.GetProp(
      "Is30FpsThrottleEnabled",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set Is30FpsThrottleEnabled(value) {
    this.SetProp("Is30FpsThrottleEnabled", 2, value);
  }
  get IsPhysicsEnvironmentalThrottled() {
    return this.GetProp(
      "IsPhysicsEnvironmentalThrottled",
      2
      /* Bool */
    );
  }
  set IsPhysicsEnvironmentalThrottled(value) {
    this.SetProp("IsPhysicsEnvironmentalThrottled", 2, value);
  }
  get IsSleepAllowed() {
    return this.GetProp(
      "IsSleepAllowed",
      2
      /* Bool */
    );
  }
  set IsSleepAllowed(value) {
    this.SetProp("IsSleepAllowed", 2, value);
  }
  get NumberOfPlayers() {
    return this.GetProp(
      "NumberOfPlayers",
      3
      /* Int32 */
    );
  }
  set NumberOfPlayers(value) {
    this.SetProp("NumberOfPlayers", 3, value);
  }
  get SimulateSecondsLag() {
    return this.GetProp(
      "SimulateSecondsLag",
      5
      /* Float64 */
    );
  }
  set SimulateSecondsLag(value) {
    this.SetProp("SimulateSecondsLag", 5, value);
  }
  get ThrottlePhysicsToRealtime() {
    return this.GetProp(
      "ThrottlePhysicsToRealtime",
      2
      /* Bool */
    );
  }
  set ThrottlePhysicsToRealtime(value) {
    this.SetProp("ThrottlePhysicsToRealtime", 2, value);
  }
  get Timeout() {
    return this.GetProp(
      "Timeout",
      5
      /* Float64 */
    );
  }
  set Timeout(value) {
    this.SetProp("Timeout", 5, value);
  }
};
var TextBoxService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TextBoxService");
    this.Name = "TextBoxService";
  }
};
var TextChannel = class extends Instance {
  constructor() {
    super();
    this.addClassName("TextChannel");
    this.Name = "TextChannel";
  }
};
var TextChatCommand = class extends Instance {
  constructor() {
    super();
    this.addClassName("TextChatCommand");
    this.Name = "TextChatCommand";
    this.AutocompleteVisible = true;
    this.Enabled = true;
    this.PrimaryAlias = "";
    this.SecondaryAlias = "";
  }
  get AutocompleteVisible() {
    return this.GetProp(
      "AutocompleteVisible",
      2
      /* Bool */
    );
  }
  set AutocompleteVisible(value) {
    this.SetProp("AutocompleteVisible", 2, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get PrimaryAlias() {
    return this.GetProp(
      "PrimaryAlias",
      1
      /* String */
    );
  }
  set PrimaryAlias(value) {
    this.SetProp("PrimaryAlias", 1, value);
  }
  get SecondaryAlias() {
    return this.GetProp(
      "SecondaryAlias",
      1
      /* String */
    );
  }
  set SecondaryAlias(value) {
    this.SetProp("SecondaryAlias", 1, value);
  }
};
var TextChatConfigurations = class extends Instance {
  constructor() {
    super();
    this.addClassName("TextChatConfigurations");
  }
};
var BubbleChatConfiguration = class extends TextChatConfigurations {
  constructor() {
    super();
    this.addClassName("BubbleChatConfiguration");
    this.Name = "BubbleChatConfiguration";
    this.AdorneeName = "HumanoidRootPart";
    this.BackgroundColor3 = Color3.FromRGB(250, 250, 250);
    this.BackgroundTransparency = 0.1;
    this.BubbleDuration = 15;
    this.BubblesSpacing = 6;
    this.Enabled = true;
    this.Font = Font.GothamMedium;
    this.LocalPlayerStudsOffset = new Vector3(0, 0, 0);
    this.MaxBubbles = 3;
    this.MaxDistance = 100;
    this.MinimizeDistance = 40;
    this.TailVisible = true;
    this.TextColor3 = Color3.FromRGB(57, 59, 61);
    this.TextSize = BigInt(16);
    this.VerticalStudsOffset = 0;
    this.FontFace = new RBXMFont(
      "rbxasset://fonts/families/BuilderSans.json",
      500,
      0
      /* Normal */
    );
  }
  get AdorneeName() {
    return this.GetProp(
      "AdorneeName",
      1
      /* String */
    );
  }
  set AdorneeName(value) {
    this.SetProp("AdorneeName", 1, value);
  }
  get BackgroundColor3() {
    return this.GetProp(
      "BackgroundColor3",
      12
      /* Color3 */
    );
  }
  set BackgroundColor3(value) {
    this.SetProp("BackgroundColor3", 12, value);
  }
  get BackgroundTransparency() {
    return this.GetProp(
      "BackgroundTransparency",
      5
      /* Float64 */
    );
  }
  set BackgroundTransparency(value) {
    this.SetProp("BackgroundTransparency", 5, value);
  }
  get BubbleDuration() {
    return this.GetProp(
      "BubbleDuration",
      4
      /* Float32 */
    );
  }
  set BubbleDuration(value) {
    this.SetProp("BubbleDuration", 4, value);
  }
  get BubblesSpacing() {
    return this.GetProp(
      "BubblesSpacing",
      4
      /* Float32 */
    );
  }
  set BubblesSpacing(value) {
    this.SetProp("BubblesSpacing", 4, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Font() {
    return this.GetProp(
      "Font",
      18
      /* Enum */
    );
  }
  set Font(value) {
    this.SetProp("Font", 18, value);
  }
  get FontFace() {
    return this.GetProp(
      "FontFace",
      32
      /* Font */
    );
  }
  set FontFace(value) {
    this.SetProp("FontFace", 32, value);
  }
  get LocalPlayerStudsOffset() {
    return this.GetProp(
      "LocalPlayerStudsOffset",
      14
      /* Vector3 */
    );
  }
  set LocalPlayerStudsOffset(value) {
    this.SetProp("LocalPlayerStudsOffset", 14, value);
  }
  get MaxBubbles() {
    return this.GetProp(
      "MaxBubbles",
      4
      /* Float32 */
    );
  }
  set MaxBubbles(value) {
    this.SetProp("MaxBubbles", 4, value);
  }
  get MaxDistance() {
    return this.GetProp(
      "MaxDistance",
      4
      /* Float32 */
    );
  }
  set MaxDistance(value) {
    this.SetProp("MaxDistance", 4, value);
  }
  get MinimizeDistance() {
    return this.GetProp(
      "MinimizeDistance",
      4
      /* Float32 */
    );
  }
  set MinimizeDistance(value) {
    this.SetProp("MinimizeDistance", 4, value);
  }
  get TailVisible() {
    return this.GetProp(
      "TailVisible",
      2
      /* Bool */
    );
  }
  set TailVisible(value) {
    this.SetProp("TailVisible", 2, value);
  }
  get TextColor3() {
    return this.GetProp(
      "TextColor3",
      12
      /* Color3 */
    );
  }
  set TextColor3(value) {
    this.SetProp("TextColor3", 12, value);
  }
  get TextSize() {
    return this.GetProp(
      "TextSize",
      27
      /* Int64 */
    );
  }
  set TextSize(value) {
    this.SetProp("TextSize", 27, value);
  }
  get VerticalStudsOffset() {
    return this.GetProp(
      "VerticalStudsOffset",
      4
      /* Float32 */
    );
  }
  set VerticalStudsOffset(value) {
    this.SetProp("VerticalStudsOffset", 4, value);
  }
};
var ChatInputBarConfiguration = class extends TextChatConfigurations {
  constructor() {
    super();
    this.addClassName("ChatInputBarConfiguration");
    this.Name = "ChatInputBarConfiguration";
    this.AutocompleteEnabled = true;
    this.BackgroundColor3 = Color3.FromRGB(25, 27, 29);
    this.BackgroundTransparency = 0.2;
    this.Enabled = true;
    this.KeyboardKeyCode = KeyCode.Slash;
    this.PlaceholderColor3 = Color3.FromRGB(178, 178, 178);
    this.TextColor3 = Color3.FromRGB(255, 255, 255);
    this.TextSize = BigInt(14);
    this.TextStrokeColor3 = Color3.FromRGB(0, 0, 0);
    this.TextStrokeTransparency = 0.5;
    this.FontFace = new RBXMFont(
      "rbxasset://fonts/families/BuilderSans.json",
      500,
      0
      /* Normal */
    );
  }
  get AutocompleteEnabled() {
    return this.GetProp(
      "AutocompleteEnabled",
      2
      /* Bool */
    );
  }
  set AutocompleteEnabled(value) {
    this.SetProp("AutocompleteEnabled", 2, value);
  }
  get BackgroundColor3() {
    return this.GetProp(
      "BackgroundColor3",
      12
      /* Color3 */
    );
  }
  set BackgroundColor3(value) {
    this.SetProp("BackgroundColor3", 12, value);
  }
  get BackgroundTransparency() {
    return this.GetProp(
      "BackgroundTransparency",
      5
      /* Float64 */
    );
  }
  set BackgroundTransparency(value) {
    this.SetProp("BackgroundTransparency", 5, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get FontFace() {
    return this.GetProp(
      "FontFace",
      32
      /* Font */
    );
  }
  set FontFace(value) {
    this.SetProp("FontFace", 32, value);
  }
  get KeyboardKeyCode() {
    return this.GetProp(
      "KeyboardKeyCode",
      18
      /* Enum */
    );
  }
  set KeyboardKeyCode(value) {
    this.SetProp("KeyboardKeyCode", 18, value);
  }
  get PlaceholderColor3() {
    return this.GetProp(
      "PlaceholderColor3",
      12
      /* Color3 */
    );
  }
  set PlaceholderColor3(value) {
    this.SetProp("PlaceholderColor3", 12, value);
  }
  get TargetTextChannel() {
    return this.GetProp(
      "TargetTextChannel",
      19
      /* Referent */
    );
  }
  set TargetTextChannel(value) {
    this.SetProp("TargetTextChannel", 19, value);
  }
  get TextColor3() {
    return this.GetProp(
      "TextColor3",
      12
      /* Color3 */
    );
  }
  set TextColor3(value) {
    this.SetProp("TextColor3", 12, value);
  }
  get TextSize() {
    return this.GetProp(
      "TextSize",
      27
      /* Int64 */
    );
  }
  set TextSize(value) {
    this.SetProp("TextSize", 27, value);
  }
  get TextStrokeColor3() {
    return this.GetProp(
      "TextStrokeColor3",
      12
      /* Color3 */
    );
  }
  set TextStrokeColor3(value) {
    this.SetProp("TextStrokeColor3", 12, value);
  }
  get TextStrokeTransparency() {
    return this.GetProp(
      "TextStrokeTransparency",
      5
      /* Float64 */
    );
  }
  set TextStrokeTransparency(value) {
    this.SetProp("TextStrokeTransparency", 5, value);
  }
};
var ChatWindowConfiguration = class extends TextChatConfigurations {
  constructor() {
    super();
    this.addClassName("ChatWindowConfiguration");
    this.Name = "ChatWindowConfiguration";
    this.BackgroundColor3 = Color3.FromRGB(25, 27, 29);
    this.BackgroundTransparency = 0.3;
    this.Enabled = true;
    this.HeightScale = 1;
    this.HorizontalAlignment = HorizontalAlignment.Left;
    this.TextColor3 = Color3.FromRGB(255, 255, 255);
    this.TextSize = BigInt(14);
    this.TextStrokeColor3 = Color3.FromRGB(0, 0, 0);
    this.TextStrokeTransparency = 0.5;
    this.VerticalAlignment = VerticalAlignment.Top;
    this.WidthScale = 1;
    this.FontFace = new RBXMFont(
      "rbxasset://fonts/families/BuilderSans.json",
      500,
      0
      /* Normal */
    );
  }
  get BackgroundColor3() {
    return this.GetProp(
      "BackgroundColor3",
      12
      /* Color3 */
    );
  }
  set BackgroundColor3(value) {
    this.SetProp("BackgroundColor3", 12, value);
  }
  get BackgroundTransparency() {
    return this.GetProp(
      "BackgroundTransparency",
      5
      /* Float64 */
    );
  }
  set BackgroundTransparency(value) {
    this.SetProp("BackgroundTransparency", 5, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get FontFace() {
    return this.GetProp(
      "FontFace",
      32
      /* Font */
    );
  }
  set FontFace(value) {
    this.SetProp("FontFace", 32, value);
  }
  get HeightScale() {
    return this.GetProp(
      "HeightScale",
      4
      /* Float32 */
    );
  }
  set HeightScale(value) {
    this.SetProp("HeightScale", 4, value);
  }
  get HorizontalAlignment() {
    return this.GetProp(
      "HorizontalAlignment",
      18
      /* Enum */
    );
  }
  set HorizontalAlignment(value) {
    this.SetProp("HorizontalAlignment", 18, value);
  }
  get TextColor3() {
    return this.GetProp(
      "TextColor3",
      12
      /* Color3 */
    );
  }
  set TextColor3(value) {
    this.SetProp("TextColor3", 12, value);
  }
  get TextSize() {
    return this.GetProp(
      "TextSize",
      27
      /* Int64 */
    );
  }
  set TextSize(value) {
    this.SetProp("TextSize", 27, value);
  }
  get TextStrokeColor3() {
    return this.GetProp(
      "TextStrokeColor3",
      12
      /* Color3 */
    );
  }
  set TextStrokeColor3(value) {
    this.SetProp("TextStrokeColor3", 12, value);
  }
  get TextStrokeTransparency() {
    return this.GetProp(
      "TextStrokeTransparency",
      5
      /* Float64 */
    );
  }
  set TextStrokeTransparency(value) {
    this.SetProp("TextStrokeTransparency", 5, value);
  }
  get VerticalAlignment() {
    return this.GetProp(
      "VerticalAlignment",
      18
      /* Enum */
    );
  }
  set VerticalAlignment(value) {
    this.SetProp("VerticalAlignment", 18, value);
  }
  get WidthScale() {
    return this.GetProp(
      "WidthScale",
      4
      /* Float32 */
    );
  }
  set WidthScale(value) {
    this.SetProp("WidthScale", 4, value);
  }
};
var TextChatMessageProperties = class extends Instance {
  constructor() {
    super();
    this.addClassName("TextChatMessageProperties");
    this.Name = "TextChatMessageProperties";
  }
};
var BubbleChatMessageProperties = class extends TextChatMessageProperties {
  constructor() {
    super();
    this.addClassName("BubbleChatMessageProperties");
    this.Name = "BubbleChatMessageProperties";
  }
};
var TextChatService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TextChatService");
    this.Name = "TextChatService";
    this.ChatTranslationFTUXShown = false;
    this.ChatTranslationToggleEnabled = false;
    this.ChatVersion = ChatVersion.LegacyChatService;
    this.CreateDefaultCommands = true;
    this.CreateDefaultTextChannels = true;
    this.HasSeenDeprecationDialog = false;
  }
  get ChatTranslationFTUXShown() {
    return this.GetProp(
      "ChatTranslationFTUXShown",
      2
      /* Bool */
    );
  }
  set ChatTranslationFTUXShown(value) {
    this.SetProp("ChatTranslationFTUXShown", 2, value);
  }
  get ChatTranslationToggleEnabled() {
    return this.GetProp(
      "ChatTranslationToggleEnabled",
      2
      /* Bool */
    );
  }
  set ChatTranslationToggleEnabled(value) {
    this.SetProp("ChatTranslationToggleEnabled", 2, value);
  }
  get ChatVersion() {
    return this.GetProp(
      "ChatVersion",
      18
      /* Enum */
    );
  }
  set ChatVersion(value) {
    this.SetProp("ChatVersion", 18, value);
  }
  get CreateDefaultCommands() {
    return this.GetProp(
      "CreateDefaultCommands",
      2
      /* Bool */
    );
  }
  set CreateDefaultCommands(value) {
    this.SetProp("CreateDefaultCommands", 2, value);
  }
  get CreateDefaultTextChannels() {
    return this.GetProp(
      "CreateDefaultTextChannels",
      2
      /* Bool */
    );
  }
  set CreateDefaultTextChannels(value) {
    this.SetProp("CreateDefaultTextChannels", 2, value);
  }
  get HasSeenDeprecationDialog() {
    return this.GetProp(
      "HasSeenDeprecationDialog",
      2
      /* Bool */
    );
  }
  set HasSeenDeprecationDialog(value) {
    this.SetProp("HasSeenDeprecationDialog", 2, value);
  }
};
var TextService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TextService");
    this.Name = "TextService";
  }
};
var TextureGenerationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TextureGenerationService");
    this.Name = "TextureGenerationService";
  }
};
var ThirdPartyUserService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ThirdPartyUserService");
    this.Name = "ThirdPartyUserService";
  }
};
var TimerService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TimerService");
    this.Name = "TimerService";
  }
};
var ToastNotificationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("ToastNotificationService");
    this.Name = "ToastNotificationService";
  }
};
var TouchInputService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TouchInputService");
    this.Name = "TouchInputService";
  }
};
var TracerService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TracerService");
    this.Name = "TracerService";
  }
};
var TrackerStreamAnimation = class extends Instance {
  constructor() {
    super();
    this.addClassName("TrackerStreamAnimation");
    this.Name = "TrackerStreamAnimation";
  }
};
var Trail = class extends Instance {
  constructor() {
    super();
    this.addClassName("Trail");
    this.Name = "Trail";
    this.Brightness = 1;
    this.Color = new ColorSequence(new ColorSequenceKeypoint(0, Color3.FromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.FromRGB(255, 255, 255)));
    this.Enabled = true;
    this.FaceCamera = false;
    this.Lifetime = 2;
    this.LightEmission = 0;
    this.LightInfluence = 0;
    this.MaxLength = 0;
    this.MinLength = 0.1;
    this.Texture = "";
    this.TextureLength = 1;
    this.TextureMode = TextureMode.Stretch;
    this.Transparency = new NumberSequence(new NumberSequenceKeypoint(0, 0.5, 0), new NumberSequenceKeypoint(1, 0.5, 0));
    this.WidthScale = new NumberSequence(new NumberSequenceKeypoint(0, 1, 0), new NumberSequenceKeypoint(1, 1, 0));
  }
  get Attachment0() {
    return this.GetProp(
      "Attachment0",
      19
      /* Referent */
    );
  }
  set Attachment0(value) {
    this.SetProp("Attachment0", 19, value);
  }
  get Attachment1() {
    return this.GetProp(
      "Attachment1",
      19
      /* Referent */
    );
  }
  set Attachment1(value) {
    this.SetProp("Attachment1", 19, value);
  }
  get Brightness() {
    return this.GetProp(
      "Brightness",
      4
      /* Float32 */
    );
  }
  set Brightness(value) {
    this.SetProp("Brightness", 4, value);
  }
  get Color() {
    return this.GetProp(
      "Color",
      22
      /* ColorSequence */
    );
  }
  set Color(value) {
    this.SetProp("Color", 22, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get FaceCamera() {
    return this.GetProp(
      "FaceCamera",
      2
      /* Bool */
    );
  }
  set FaceCamera(value) {
    this.SetProp("FaceCamera", 2, value);
  }
  get Lifetime() {
    return this.GetProp(
      "Lifetime",
      4
      /* Float32 */
    );
  }
  set Lifetime(value) {
    this.SetProp("Lifetime", 4, value);
  }
  get LightEmission() {
    return this.GetProp(
      "LightEmission",
      4
      /* Float32 */
    );
  }
  set LightEmission(value) {
    this.SetProp("LightEmission", 4, value);
  }
  get LightInfluence() {
    return this.GetProp(
      "LightInfluence",
      4
      /* Float32 */
    );
  }
  set LightInfluence(value) {
    this.SetProp("LightInfluence", 4, value);
  }
  get MaxLength() {
    return this.GetProp(
      "MaxLength",
      4
      /* Float32 */
    );
  }
  set MaxLength(value) {
    this.SetProp("MaxLength", 4, value);
  }
  get MinLength() {
    return this.GetProp(
      "MinLength",
      4
      /* Float32 */
    );
  }
  set MinLength(value) {
    this.SetProp("MinLength", 4, value);
  }
  get Texture() {
    return this.GetProp(
      "Texture",
      1
      /* String */
    );
  }
  set Texture(value) {
    this.SetProp("Texture", 1, value);
  }
  get TextureLength() {
    return this.GetProp(
      "TextureLength",
      4
      /* Float32 */
    );
  }
  set TextureLength(value) {
    this.SetProp("TextureLength", 4, value);
  }
  get TextureMode() {
    return this.GetProp(
      "TextureMode",
      18
      /* Enum */
    );
  }
  set TextureMode(value) {
    this.SetProp("TextureMode", 18, value);
  }
  get Transparency() {
    return this.GetProp(
      "Transparency",
      21
      /* NumberSequence */
    );
  }
  set Transparency(value) {
    this.SetProp("Transparency", 21, value);
  }
  get WidthScale() {
    return this.GetProp(
      "WidthScale",
      21
      /* NumberSequence */
    );
  }
  set WidthScale(value) {
    this.SetProp("WidthScale", 21, value);
  }
};
var TutorialService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TutorialService");
    this.Name = "TutorialService";
  }
};
var TweenBase = class extends Instance {
  constructor() {
    super();
    this.addClassName("TweenBase");
  }
};
var Tween = class extends TweenBase {
  constructor() {
    super();
    this.addClassName("Tween");
    this.Name = "Tween";
  }
};
var TweenService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("TweenService");
    this.Name = "TweenService";
  }
};
var UGCAvatarService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("UGCAvatarService");
    this.Name = "UGCAvatarService";
  }
};
var UGCValidationService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("UGCValidationService");
    this.Name = "UGCValidationService";
  }
};
var UIBase = class extends Instance {
  constructor() {
    super();
    this.addClassName("UIBase");
  }
};
var UIComponent = class extends UIBase {
  constructor() {
    super();
    this.addClassName("UIComponent");
  }
};
var UIConstraint = class extends UIComponent {
  constructor() {
    super();
    this.addClassName("UIConstraint");
  }
};
var UIAspectRatioConstraint = class extends UIConstraint {
  constructor() {
    super();
    this.addClassName("UIAspectRatioConstraint");
    this.Name = "UIAspectRatioConstraint";
    this.AspectRatio = 1;
    this.AspectType = AspectType.FitWithinMaxSize;
    this.DominantAxis = DominantAxis.Width;
  }
  get AspectRatio() {
    return this.GetProp(
      "AspectRatio",
      4
      /* Float32 */
    );
  }
  set AspectRatio(value) {
    this.SetProp("AspectRatio", 4, value);
  }
  get AspectType() {
    return this.GetProp(
      "AspectType",
      18
      /* Enum */
    );
  }
  set AspectType(value) {
    this.SetProp("AspectType", 18, value);
  }
  get DominantAxis() {
    return this.GetProp(
      "DominantAxis",
      18
      /* Enum */
    );
  }
  set DominantAxis(value) {
    this.SetProp("DominantAxis", 18, value);
  }
};
var UISizeConstraint = class extends UIConstraint {
  constructor() {
    super();
    this.addClassName("UISizeConstraint");
    this.Name = "UISizeConstraint";
    this.MaxSize = new Vector2(Infinity, Infinity);
    this.MinSize = new Vector2(0, 0);
  }
  get MaxSize() {
    return this.GetProp(
      "MaxSize",
      13
      /* Vector2 */
    );
  }
  set MaxSize(value) {
    this.SetProp("MaxSize", 13, value);
  }
  get MinSize() {
    return this.GetProp(
      "MinSize",
      13
      /* Vector2 */
    );
  }
  set MinSize(value) {
    this.SetProp("MinSize", 13, value);
  }
};
var UITextSizeConstraint = class extends UIConstraint {
  constructor() {
    super();
    this.addClassName("UITextSizeConstraint");
    this.Name = "UITextSizeConstraint";
    this.MaxTextSize = 100;
    this.MinTextSize = 1;
  }
  get MaxTextSize() {
    return this.GetProp(
      "MaxTextSize",
      3
      /* Int32 */
    );
  }
  set MaxTextSize(value) {
    this.SetProp("MaxTextSize", 3, value);
  }
  get MinTextSize() {
    return this.GetProp(
      "MinTextSize",
      3
      /* Int32 */
    );
  }
  set MinTextSize(value) {
    this.SetProp("MinTextSize", 3, value);
  }
};
var UICorner = class extends UIComponent {
  constructor() {
    super();
    this.addClassName("UICorner");
    this.Name = "UICorner";
    this.CornerRadius = new UDim(0, 8);
  }
  get CornerRadius() {
    return this.GetProp(
      "CornerRadius",
      6
      /* UDim */
    );
  }
  set CornerRadius(value) {
    this.SetProp("CornerRadius", 6, value);
  }
};
var UIDragDetector = class extends UIComponent {
  constructor() {
    super();
    this.addClassName("UIDragDetector");
    this.Name = "UIDragDetector";
    this.ActivatedCursorIcon = "";
    this.BoundingBehavior = UIDragDetectorBoundingBehavior.Automatic;
    this.CursorIcon = "";
    this.DragAxis = new Vector2(1, 0);
    this.DragRelativity = UIDragDetectorDragRelativity.Absolute;
    this.DragRotation = 0;
    this.DragSpace = UIDragDetectorDragSpace.Parent;
    this.DragStyle = UIDragDetectorDragStyle.TranslatePlane;
    this.DragUDim2 = new UDim2(new UDim(0, 0), new UDim(0, 0));
    this.Enabled = true;
    this.MaxDragAngle = 0;
    this.MaxDragTranslation = new UDim2(new UDim(0, 0), new UDim(0, 0));
    this.MinDragAngle = 0;
    this.MinDragTranslation = new UDim2(new UDim(0, 0), new UDim(0, 0));
    this.ResponseStyle = UIDragDetectorResponseStyle.Offset;
    this.SelectionModeDragSpeed = new UDim2(new UDim(0, 300), new UDim(0, 300));
    this.SelectionModeRotateSpeed = 90;
    this.UIDragSpeedAxisMapping = UIDragSpeedAxisMapping.XY;
  }
  get ActivatedCursorIcon() {
    return this.GetProp(
      "ActivatedCursorIcon",
      1
      /* String */
    );
  }
  set ActivatedCursorIcon(value) {
    this.SetProp("ActivatedCursorIcon", 1, value);
  }
  get BoundingBehavior() {
    return this.GetProp(
      "BoundingBehavior",
      18
      /* Enum */
    );
  }
  set BoundingBehavior(value) {
    this.SetProp("BoundingBehavior", 18, value);
  }
  get BoundingUI() {
    return this.GetProp(
      "BoundingUI",
      19
      /* Referent */
    );
  }
  set BoundingUI(value) {
    this.SetProp("BoundingUI", 19, value);
  }
  get CursorIcon() {
    return this.GetProp(
      "CursorIcon",
      1
      /* String */
    );
  }
  set CursorIcon(value) {
    this.SetProp("CursorIcon", 1, value);
  }
  get DragAxis() {
    return this.GetProp(
      "DragAxis",
      13
      /* Vector2 */
    );
  }
  set DragAxis(value) {
    this.SetProp("DragAxis", 13, value);
  }
  get DragRelativity() {
    return this.GetProp(
      "DragRelativity",
      18
      /* Enum */
    );
  }
  set DragRelativity(value) {
    this.SetProp("DragRelativity", 18, value);
  }
  get DragRotation() {
    return this.GetProp(
      "DragRotation",
      4
      /* Float32 */
    );
  }
  set DragRotation(value) {
    this.SetProp("DragRotation", 4, value);
  }
  get DragSpace() {
    return this.GetProp(
      "DragSpace",
      18
      /* Enum */
    );
  }
  set DragSpace(value) {
    this.SetProp("DragSpace", 18, value);
  }
  get DragStyle() {
    return this.GetProp(
      "DragStyle",
      18
      /* Enum */
    );
  }
  set DragStyle(value) {
    this.SetProp("DragStyle", 18, value);
  }
  get DragUDim2() {
    return this.GetProp(
      "DragUDim2",
      7
      /* UDim2 */
    );
  }
  set DragUDim2(value) {
    this.SetProp("DragUDim2", 7, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get MaxDragAngle() {
    return this.GetProp(
      "MaxDragAngle",
      4
      /* Float32 */
    );
  }
  set MaxDragAngle(value) {
    this.SetProp("MaxDragAngle", 4, value);
  }
  get MaxDragTranslation() {
    return this.GetProp(
      "MaxDragTranslation",
      7
      /* UDim2 */
    );
  }
  set MaxDragTranslation(value) {
    this.SetProp("MaxDragTranslation", 7, value);
  }
  get MinDragAngle() {
    return this.GetProp(
      "MinDragAngle",
      4
      /* Float32 */
    );
  }
  set MinDragAngle(value) {
    this.SetProp("MinDragAngle", 4, value);
  }
  get MinDragTranslation() {
    return this.GetProp(
      "MinDragTranslation",
      7
      /* UDim2 */
    );
  }
  set MinDragTranslation(value) {
    this.SetProp("MinDragTranslation", 7, value);
  }
  get ReferenceUIInstance() {
    return this.GetProp(
      "ReferenceUIInstance",
      19
      /* Referent */
    );
  }
  set ReferenceUIInstance(value) {
    this.SetProp("ReferenceUIInstance", 19, value);
  }
  get ResponseStyle() {
    return this.GetProp(
      "ResponseStyle",
      18
      /* Enum */
    );
  }
  set ResponseStyle(value) {
    this.SetProp("ResponseStyle", 18, value);
  }
  get SelectionModeDragSpeed() {
    return this.GetProp(
      "SelectionModeDragSpeed",
      7
      /* UDim2 */
    );
  }
  set SelectionModeDragSpeed(value) {
    this.SetProp("SelectionModeDragSpeed", 7, value);
  }
  get SelectionModeRotateSpeed() {
    return this.GetProp(
      "SelectionModeRotateSpeed",
      4
      /* Float32 */
    );
  }
  set SelectionModeRotateSpeed(value) {
    this.SetProp("SelectionModeRotateSpeed", 4, value);
  }
  get UIDragSpeedAxisMapping() {
    return this.GetProp(
      "UIDragSpeedAxisMapping",
      18
      /* Enum */
    );
  }
  set UIDragSpeedAxisMapping(value) {
    this.SetProp("UIDragSpeedAxisMapping", 18, value);
  }
};
var UIFlexItem = class extends UIComponent {
  constructor() {
    super();
    this.addClassName("UIFlexItem");
    this.Name = "UIFlexItem";
    this.FlexMode = UIFlexMode.None;
    this.GrowRatio = 0;
    this.ItemLineAlignment = ItemLineAlignment.Automatic;
    this.ShrinkRatio = 0;
  }
  get FlexMode() {
    return this.GetProp(
      "FlexMode",
      18
      /* Enum */
    );
  }
  set FlexMode(value) {
    this.SetProp("FlexMode", 18, value);
  }
  get GrowRatio() {
    return this.GetProp(
      "GrowRatio",
      4
      /* Float32 */
    );
  }
  set GrowRatio(value) {
    this.SetProp("GrowRatio", 4, value);
  }
  get ItemLineAlignment() {
    return this.GetProp(
      "ItemLineAlignment",
      18
      /* Enum */
    );
  }
  set ItemLineAlignment(value) {
    this.SetProp("ItemLineAlignment", 18, value);
  }
  get ShrinkRatio() {
    return this.GetProp(
      "ShrinkRatio",
      4
      /* Float32 */
    );
  }
  set ShrinkRatio(value) {
    this.SetProp("ShrinkRatio", 4, value);
  }
};
var UIGradient = class extends UIComponent {
  constructor() {
    super();
    this.addClassName("UIGradient");
    this.Name = "UIGradient";
    this.Color = new ColorSequence(new ColorSequenceKeypoint(0, Color3.FromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.FromRGB(255, 255, 255)));
    this.Enabled = true;
    this.Offset = new Vector2(0, 0);
    this.Rotation = 0;
    this.Transparency = new NumberSequence(new NumberSequenceKeypoint(0, 0, 0), new NumberSequenceKeypoint(1, 0, 0));
  }
  get Color() {
    return this.GetProp(
      "Color",
      22
      /* ColorSequence */
    );
  }
  set Color(value) {
    this.SetProp("Color", 22, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Offset() {
    return this.GetProp(
      "Offset",
      13
      /* Vector2 */
    );
  }
  set Offset(value) {
    this.SetProp("Offset", 13, value);
  }
  get Rotation() {
    return this.GetProp(
      "Rotation",
      4
      /* Float32 */
    );
  }
  set Rotation(value) {
    this.SetProp("Rotation", 4, value);
  }
  get Transparency() {
    return this.GetProp(
      "Transparency",
      21
      /* NumberSequence */
    );
  }
  set Transparency(value) {
    this.SetProp("Transparency", 21, value);
  }
};
var UILayout = class extends UIComponent {
  constructor() {
    super();
    this.addClassName("UILayout");
  }
};
var UIGridStyleLayout = class extends UILayout {
  constructor() {
    super();
    this.addClassName("UIGridStyleLayout");
    this.HorizontalAlignment = HorizontalAlignment.Left;
    this.SortOrder = SortOrder.Name;
    this.VerticalAlignment = VerticalAlignment.Top;
  }
  get FillDirection() {
    return this.GetProp(
      "FillDirection",
      18
      /* Enum */
    );
  }
  set FillDirection(value) {
    this.SetProp("FillDirection", 18, value);
  }
  get HorizontalAlignment() {
    return this.GetProp(
      "HorizontalAlignment",
      18
      /* Enum */
    );
  }
  set HorizontalAlignment(value) {
    this.SetProp("HorizontalAlignment", 18, value);
  }
  get SortOrder() {
    return this.GetProp(
      "SortOrder",
      18
      /* Enum */
    );
  }
  set SortOrder(value) {
    this.SetProp("SortOrder", 18, value);
  }
  get VerticalAlignment() {
    return this.GetProp(
      "VerticalAlignment",
      18
      /* Enum */
    );
  }
  set VerticalAlignment(value) {
    this.SetProp("VerticalAlignment", 18, value);
  }
};
var UIGridLayout = class extends UIGridStyleLayout {
  constructor() {
    super();
    this.addClassName("UIGridLayout");
    this.Name = "UIGridLayout";
    this.CellPadding = new UDim2(new UDim(0, 5), new UDim(0, 5));
    this.CellSize = new UDim2(new UDim(0, 100), new UDim(0, 100));
    this.FillDirectionMaxCells = 0;
    this.StartCorner = StartCorner.TopLeft;
    this.FillDirection = FillDirection.Horizontal;
  }
  get CellPadding() {
    return this.GetProp(
      "CellPadding",
      7
      /* UDim2 */
    );
  }
  set CellPadding(value) {
    this.SetProp("CellPadding", 7, value);
  }
  get CellSize() {
    return this.GetProp(
      "CellSize",
      7
      /* UDim2 */
    );
  }
  set CellSize(value) {
    this.SetProp("CellSize", 7, value);
  }
  get FillDirectionMaxCells() {
    return this.GetProp(
      "FillDirectionMaxCells",
      3
      /* Int32 */
    );
  }
  set FillDirectionMaxCells(value) {
    this.SetProp("FillDirectionMaxCells", 3, value);
  }
  get StartCorner() {
    return this.GetProp(
      "StartCorner",
      18
      /* Enum */
    );
  }
  set StartCorner(value) {
    this.SetProp("StartCorner", 18, value);
  }
};
var UIListLayout = class extends UIGridStyleLayout {
  constructor() {
    super();
    this.addClassName("UIListLayout");
    this.Name = "UIListLayout";
    this.HorizontalFlex = UIFlexAlignment.None;
    this.ItemLineAlignment = ItemLineAlignment.Automatic;
    this.Padding = new UDim(0, 0);
    this.VerticalFlex = UIFlexAlignment.None;
    this.Wraps = false;
    this.FillDirection = FillDirection.Vertical;
  }
  get HorizontalFlex() {
    return this.GetProp(
      "HorizontalFlex",
      18
      /* Enum */
    );
  }
  set HorizontalFlex(value) {
    this.SetProp("HorizontalFlex", 18, value);
  }
  get ItemLineAlignment() {
    return this.GetProp(
      "ItemLineAlignment",
      18
      /* Enum */
    );
  }
  set ItemLineAlignment(value) {
    this.SetProp("ItemLineAlignment", 18, value);
  }
  get Padding() {
    return this.GetProp(
      "Padding",
      6
      /* UDim */
    );
  }
  set Padding(value) {
    this.SetProp("Padding", 6, value);
  }
  get VerticalFlex() {
    return this.GetProp(
      "VerticalFlex",
      18
      /* Enum */
    );
  }
  set VerticalFlex(value) {
    this.SetProp("VerticalFlex", 18, value);
  }
  get Wraps() {
    return this.GetProp(
      "Wraps",
      2
      /* Bool */
    );
  }
  set Wraps(value) {
    this.SetProp("Wraps", 2, value);
  }
};
var UIPageLayout = class extends UIGridStyleLayout {
  constructor() {
    super();
    this.addClassName("UIPageLayout");
    this.Name = "UIPageLayout";
    this.Animated = true;
    this.Circular = false;
    this.EasingDirection = EasingDirection.Out;
    this.EasingStyle = EasingStyle.Back;
    this.GamepadInputEnabled = true;
    this.Padding = new UDim(0, 0);
    this.ScrollWheelInputEnabled = true;
    this.TouchInputEnabled = true;
    this.TweenTime = 1;
    this.FillDirection = FillDirection.Horizontal;
  }
  get Animated() {
    return this.GetProp(
      "Animated",
      2
      /* Bool */
    );
  }
  set Animated(value) {
    this.SetProp("Animated", 2, value);
  }
  get Circular() {
    return this.GetProp(
      "Circular",
      2
      /* Bool */
    );
  }
  set Circular(value) {
    this.SetProp("Circular", 2, value);
  }
  get EasingDirection() {
    return this.GetProp(
      "EasingDirection",
      18
      /* Enum */
    );
  }
  set EasingDirection(value) {
    this.SetProp("EasingDirection", 18, value);
  }
  get EasingStyle() {
    return this.GetProp(
      "EasingStyle",
      18
      /* Enum */
    );
  }
  set EasingStyle(value) {
    this.SetProp("EasingStyle", 18, value);
  }
  get GamepadInputEnabled() {
    return this.GetProp(
      "GamepadInputEnabled",
      2
      /* Bool */
    );
  }
  set GamepadInputEnabled(value) {
    this.SetProp("GamepadInputEnabled", 2, value);
  }
  get Padding() {
    return this.GetProp(
      "Padding",
      6
      /* UDim */
    );
  }
  set Padding(value) {
    this.SetProp("Padding", 6, value);
  }
  get ScrollWheelInputEnabled() {
    return this.GetProp(
      "ScrollWheelInputEnabled",
      2
      /* Bool */
    );
  }
  set ScrollWheelInputEnabled(value) {
    this.SetProp("ScrollWheelInputEnabled", 2, value);
  }
  get TouchInputEnabled() {
    return this.GetProp(
      "TouchInputEnabled",
      2
      /* Bool */
    );
  }
  set TouchInputEnabled(value) {
    this.SetProp("TouchInputEnabled", 2, value);
  }
  get TweenTime() {
    return this.GetProp(
      "TweenTime",
      4
      /* Float32 */
    );
  }
  set TweenTime(value) {
    this.SetProp("TweenTime", 4, value);
  }
};
var UITableLayout = class extends UIGridStyleLayout {
  constructor() {
    super();
    this.addClassName("UITableLayout");
    this.Name = "UITableLayout";
    this.FillEmptySpaceColumns = false;
    this.FillEmptySpaceRows = false;
    this.MajorAxis = TableMajorAxis.RowMajor;
    this.Padding = new UDim2(new UDim(0, 0), new UDim(0, 0));
    this.FillDirection = FillDirection.Vertical;
  }
  get FillEmptySpaceColumns() {
    return this.GetProp(
      "FillEmptySpaceColumns",
      2
      /* Bool */
    );
  }
  set FillEmptySpaceColumns(value) {
    this.SetProp("FillEmptySpaceColumns", 2, value);
  }
  get FillEmptySpaceRows() {
    return this.GetProp(
      "FillEmptySpaceRows",
      2
      /* Bool */
    );
  }
  set FillEmptySpaceRows(value) {
    this.SetProp("FillEmptySpaceRows", 2, value);
  }
  get MajorAxis() {
    return this.GetProp(
      "MajorAxis",
      18
      /* Enum */
    );
  }
  set MajorAxis(value) {
    this.SetProp("MajorAxis", 18, value);
  }
  get Padding() {
    return this.GetProp(
      "Padding",
      7
      /* UDim2 */
    );
  }
  set Padding(value) {
    this.SetProp("Padding", 7, value);
  }
};
var UIPadding = class extends UIComponent {
  constructor() {
    super();
    this.addClassName("UIPadding");
    this.Name = "UIPadding";
    this.PaddingBottom = new UDim(0, 0);
    this.PaddingLeft = new UDim(0, 0);
    this.PaddingRight = new UDim(0, 0);
    this.PaddingTop = new UDim(0, 0);
  }
  get PaddingBottom() {
    return this.GetProp(
      "PaddingBottom",
      6
      /* UDim */
    );
  }
  set PaddingBottom(value) {
    this.SetProp("PaddingBottom", 6, value);
  }
  get PaddingLeft() {
    return this.GetProp(
      "PaddingLeft",
      6
      /* UDim */
    );
  }
  set PaddingLeft(value) {
    this.SetProp("PaddingLeft", 6, value);
  }
  get PaddingRight() {
    return this.GetProp(
      "PaddingRight",
      6
      /* UDim */
    );
  }
  set PaddingRight(value) {
    this.SetProp("PaddingRight", 6, value);
  }
  get PaddingTop() {
    return this.GetProp(
      "PaddingTop",
      6
      /* UDim */
    );
  }
  set PaddingTop(value) {
    this.SetProp("PaddingTop", 6, value);
  }
};
var UIScale = class extends UIComponent {
  constructor() {
    super();
    this.addClassName("UIScale");
    this.Name = "UIScale";
    this.Scale = 1;
  }
  get Scale() {
    return this.GetProp(
      "Scale",
      4
      /* Float32 */
    );
  }
  set Scale(value) {
    this.SetProp("Scale", 4, value);
  }
};
var UIStroke = class extends UIComponent {
  constructor() {
    super();
    this.addClassName("UIStroke");
    this.Name = "UIStroke";
    this.ApplyStrokeMode = ApplyStrokeMode.Contextual;
    this.Color = Color3.FromRGB(0, 0, 0);
    this.Enabled = true;
    this.LineJoinMode = LineJoinMode.Round;
    this.Thickness = 1;
    this.Transparency = 0;
  }
  get ApplyStrokeMode() {
    return this.GetProp(
      "ApplyStrokeMode",
      18
      /* Enum */
    );
  }
  set ApplyStrokeMode(value) {
    this.SetProp("ApplyStrokeMode", 18, value);
  }
  get Color() {
    return this.GetProp(
      "Color",
      12
      /* Color3 */
    );
  }
  set Color(value) {
    this.SetProp("Color", 12, value);
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get LineJoinMode() {
    return this.GetProp(
      "LineJoinMode",
      18
      /* Enum */
    );
  }
  set LineJoinMode(value) {
    this.SetProp("LineJoinMode", 18, value);
  }
  get Thickness() {
    return this.GetProp(
      "Thickness",
      4
      /* Float32 */
    );
  }
  set Thickness(value) {
    this.SetProp("Thickness", 4, value);
  }
  get Transparency() {
    return this.GetProp(
      "Transparency",
      4
      /* Float32 */
    );
  }
  set Transparency(value) {
    this.SetProp("Transparency", 4, value);
  }
};
var UIDragDetectorService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("UIDragDetectorService");
    this.Name = "UIDragDetectorService";
  }
};
var UniqueIdLookupService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("UniqueIdLookupService");
    this.Name = "UniqueIdLookupService";
  }
};
var UnvalidatedAssetService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("UnvalidatedAssetService");
    this.Name = "UnvalidatedAssetService";
    this.CachedData = '{"lastSaveTime":0,"lastKnownPublishRequest":0,"users":[]}';
  }
  get CachedData() {
    return this.GetProp(
      "CachedData",
      1
      /* String */
    );
  }
  set CachedData(value) {
    this.SetProp("CachedData", 1, value);
  }
};
var UserInputService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("UserInputService");
    this.Name = "UserInputService";
    this.MouseBehavior = MouseBehavior.Default;
    this.MouseIcon = "";
    this.MouseIconEnabled = true;
  }
  /**@deprecated Deprecated by Roblox*/
  get LegacyInputEventsEnabled() {
    return this.GetProp(
      "LegacyInputEventsEnabled",
      2
      /* Bool */
    );
  }
  /**@deprecated Deprecated by Roblox*/
  set LegacyInputEventsEnabled(value) {
    this.SetProp("LegacyInputEventsEnabled", 2, value);
  }
  get MouseBehavior() {
    return this.GetProp(
      "MouseBehavior",
      18
      /* Enum */
    );
  }
  set MouseBehavior(value) {
    this.SetProp("MouseBehavior", 18, value);
  }
  get MouseIcon() {
    return this.GetProp(
      "MouseIcon",
      1
      /* String */
    );
  }
  set MouseIcon(value) {
    this.SetProp("MouseIcon", 1, value);
  }
  get MouseIconEnabled() {
    return this.GetProp(
      "MouseIconEnabled",
      2
      /* Bool */
    );
  }
  set MouseIconEnabled(value) {
    this.SetProp("MouseIconEnabled", 2, value);
  }
};
var UserService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("UserService");
    this.Name = "UserService";
  }
};
var VRService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("VRService");
    this.Name = "VRService";
    this.AutomaticScaling = VRScaling.World;
    this.AvatarGestures = false;
    this.ControllerModels = VRControllerModelMode.Transparent;
    this.FadeOutViewOnCollision = true;
    this.LaserPointer = VRLaserPointerMode.Pointer;
  }
  get AutomaticScaling() {
    return this.GetProp(
      "AutomaticScaling",
      18
      /* Enum */
    );
  }
  set AutomaticScaling(value) {
    this.SetProp("AutomaticScaling", 18, value);
  }
  get AvatarGestures() {
    return this.GetProp(
      "AvatarGestures",
      2
      /* Bool */
    );
  }
  set AvatarGestures(value) {
    this.SetProp("AvatarGestures", 2, value);
  }
  get ControllerModels() {
    return this.GetProp(
      "ControllerModels",
      18
      /* Enum */
    );
  }
  set ControllerModels(value) {
    this.SetProp("ControllerModels", 18, value);
  }
  get FadeOutViewOnCollision() {
    return this.GetProp(
      "FadeOutViewOnCollision",
      2
      /* Bool */
    );
  }
  set FadeOutViewOnCollision(value) {
    this.SetProp("FadeOutViewOnCollision", 2, value);
  }
  get LaserPointer() {
    return this.GetProp(
      "LaserPointer",
      18
      /* Enum */
    );
  }
  set LaserPointer(value) {
    this.SetProp("LaserPointer", 18, value);
  }
};
var VRStatusService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("VRStatusService");
    this.Name = "VRStatusService";
  }
};
var ValueBase = class extends Instance {
  constructor() {
    super();
    this.addClassName("ValueBase");
  }
};
var BinaryStringValue = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("BinaryStringValue");
    this.Name = "BinaryStringValue";
    this.Value = "";
  }
  get Value() {
    return this.GetProp(
      "Value",
      1
      /* String */
    );
  }
  set Value(value) {
    this.SetProp("Value", 1, value);
  }
};
var BoolValue = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("BoolValue");
    this.Name = "BoolValue";
    this.Value = false;
  }
  get Value() {
    return this.GetProp(
      "Value",
      2
      /* Bool */
    );
  }
  set Value(value) {
    this.SetProp("Value", 2, value);
  }
};
var BrickColorValue = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("BrickColorValue");
    this.Name = "BrickColorValue";
  }
  get Value() {
    return this.GetProp(
      "Value",
      11
      /* BrickColor */
    );
  }
  set Value(value) {
    this.SetProp("Value", 11, value);
  }
};
var CFrameValue = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("CFrameValue");
    this.Name = "CFrameValue";
    this.Value = CFrame.Identity;
  }
  get Value() {
    return this.GetProp(
      "Value",
      16
      /* CFrame */
    );
  }
  set Value(value) {
    this.SetProp("Value", 16, value);
  }
};
var Color3Value = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("Color3Value");
    this.Name = "Color3Value";
    this.Value = Color3.FromRGB(0, 0, 0);
  }
  get Value() {
    return this.GetProp(
      "Value",
      12
      /* Color3 */
    );
  }
  set Value(value) {
    this.SetProp("Value", 12, value);
  }
};
var DoubleConstrainedValue = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("DoubleConstrainedValue");
    this.Name = "DoubleConstrainedValue";
    this.MaxValue = 1;
    this.MinValue = 0;
    this.Value = 0;
  }
  get MaxValue() {
    return this.GetProp(
      "MaxValue",
      5
      /* Float64 */
    );
  }
  set MaxValue(value) {
    this.SetProp("MaxValue", 5, value);
  }
  get MinValue() {
    return this.GetProp(
      "MinValue",
      5
      /* Float64 */
    );
  }
  set MinValue(value) {
    this.SetProp("MinValue", 5, value);
  }
  get Value() {
    return this.GetProp(
      "value",
      5
      /* Float64 */
    );
  }
  set Value(value) {
    this.SetProp("value", 5, value);
  }
};
var IntConstrainedValue = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("IntConstrainedValue");
    this.Name = "IntConstrainedValue";
    this.MaxValue = BigInt(10);
    this.MinValue = BigInt(0);
    this.Value = BigInt(0);
  }
  get MaxValue() {
    return this.GetProp(
      "MaxValue",
      27
      /* Int64 */
    );
  }
  set MaxValue(value) {
    this.SetProp("MaxValue", 27, value);
  }
  get MinValue() {
    return this.GetProp(
      "MinValue",
      27
      /* Int64 */
    );
  }
  set MinValue(value) {
    this.SetProp("MinValue", 27, value);
  }
  get Value() {
    return this.GetProp(
      "value",
      27
      /* Int64 */
    );
  }
  set Value(value) {
    this.SetProp("value", 27, value);
  }
};
var IntValue = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("IntValue");
    this.Name = "IntValue";
    this.Value = BigInt(0);
  }
  get Value() {
    return this.GetProp(
      "Value",
      27
      /* Int64 */
    );
  }
  set Value(value) {
    this.SetProp("Value", 27, value);
  }
};
var NumberValue = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("NumberValue");
    this.Name = "NumberValue";
    this.Value = 0;
  }
  get Value() {
    return this.GetProp(
      "Value",
      5
      /* Float64 */
    );
  }
  set Value(value) {
    this.SetProp("Value", 5, value);
  }
};
var ObjectValue = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("ObjectValue");
    this.Name = "ObjectValue";
  }
  get Value() {
    return this.GetProp(
      "Value",
      19
      /* Referent */
    );
  }
  set Value(value) {
    this.SetProp("Value", 19, value);
  }
};
var RayValue = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("RayValue");
    this.Name = "RayValue";
    this.Value = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
  }
  get Value() {
    return this.GetProp(
      "Value",
      8
      /* Ray */
    );
  }
  set Value(value) {
    this.SetProp("Value", 8, value);
  }
};
var StringValue = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("StringValue");
    this.Name = "StringValue";
    this.Value = "";
  }
  get Value() {
    return this.GetProp(
      "Value",
      1
      /* String */
    );
  }
  set Value(value) {
    this.SetProp("Value", 1, value);
  }
};
var Vector3Value = class extends ValueBase {
  constructor() {
    super();
    this.addClassName("Vector3Value");
    this.Name = "Vector3Value";
    this.Value = new Vector3(0, 0, 0);
  }
  get Value() {
    return this.GetProp(
      "Value",
      14
      /* Vector3 */
    );
  }
  set Value(value) {
    this.SetProp("Value", 14, value);
  }
};
var Vector3Curve = class extends Instance {
  constructor() {
    super();
    this.addClassName("Vector3Curve");
    this.Name = "Vector3Curve";
  }
};
var VersionControlService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("VersionControlService");
    this.Name = "VersionControlService";
  }
};
var VideoCaptureService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("VideoCaptureService");
    this.Name = "VideoCaptureService";
  }
};
var VideoDeviceInput = class extends Instance {
  constructor() {
    super();
    this.addClassName("VideoDeviceInput");
    this.Name = "VideoDeviceInput";
    this.Active = false;
    this.CameraId = "";
    this.CaptureQuality = VideoDeviceCaptureQuality.Default;
  }
  get Active() {
    return this.GetProp(
      "Active",
      2
      /* Bool */
    );
  }
  set Active(value) {
    this.SetProp("Active", 2, value);
  }
  get CameraId() {
    return this.GetProp(
      "CameraId",
      1
      /* String */
    );
  }
  set CameraId(value) {
    this.SetProp("CameraId", 1, value);
  }
  get CaptureQuality() {
    return this.GetProp(
      "CaptureQuality",
      18
      /* Enum */
    );
  }
  set CaptureQuality(value) {
    this.SetProp("CaptureQuality", 18, value);
  }
};
var VideoPlayer = class extends Instance {
  constructor() {
    super();
    this.addClassName("VideoPlayer");
    this.Name = "VideoPlayer";
    this.Asset = "";
    this.Looping = false;
    this.PlaybackSpeed = 1;
    this.TimePosition = 0;
    this.Volume = 1;
  }
  get Asset() {
    return this.GetProp(
      "Asset",
      1
      /* String */
    );
  }
  set Asset(value) {
    this.SetProp("Asset", 1, value);
  }
  get Looping() {
    return this.GetProp(
      "Looping",
      2
      /* Bool */
    );
  }
  set Looping(value) {
    this.SetProp("Looping", 2, value);
  }
  get PlaybackSpeed() {
    return this.GetProp(
      "PlaybackSpeed",
      4
      /* Float32 */
    );
  }
  set PlaybackSpeed(value) {
    this.SetProp("PlaybackSpeed", 4, value);
  }
  get TimePosition() {
    return this.GetProp(
      "TimePosition",
      5
      /* Float64 */
    );
  }
  set TimePosition(value) {
    this.SetProp("TimePosition", 5, value);
  }
  get Volume() {
    return this.GetProp(
      "Volume",
      4
      /* Float32 */
    );
  }
  set Volume(value) {
    this.SetProp("Volume", 4, value);
  }
};
var VideoService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("VideoService");
    this.Name = "VideoService";
  }
};
var VirtualInputManager = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("VirtualInputManager");
    this.Name = "VirtualInputManager";
  }
};
var VirtualUser = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("VirtualUser");
    this.Name = "VirtualUser";
  }
};
var VisibilityCheckDispatcher = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("VisibilityCheckDispatcher");
    this.Name = "VisibilityCheckDispatcher";
  }
};
var Visit = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("Visit");
    this.Name = "Visit";
  }
};
var VisualizationMode = class extends Instance {
  constructor() {
    super();
    this.addClassName("VisualizationMode");
    this.Name = "VisualizationMode";
    this.Enabled = false;
    this.Title = "";
    this.ToolTip = "";
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Title() {
    return this.GetProp(
      "Title",
      1
      /* String */
    );
  }
  set Title(value) {
    this.SetProp("Title", 1, value);
  }
  get ToolTip() {
    return this.GetProp(
      "ToolTip",
      1
      /* String */
    );
  }
  set ToolTip(value) {
    this.SetProp("ToolTip", 1, value);
  }
};
var VisualizationModeCategory = class extends Instance {
  constructor() {
    super();
    this.addClassName("VisualizationModeCategory");
    this.Name = "VisualizationModeCategory";
    this.Enabled = false;
    this.Title = "";
  }
  get Enabled() {
    return this.GetProp(
      "Enabled",
      2
      /* Bool */
    );
  }
  set Enabled(value) {
    this.SetProp("Enabled", 2, value);
  }
  get Title() {
    return this.GetProp(
      "Title",
      1
      /* String */
    );
  }
  set Title(value) {
    this.SetProp("Title", 1, value);
  }
};
var VisualizationModeService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("VisualizationModeService");
    this.Name = "VisualizationModeService";
  }
};
var VoiceChatInternal = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("VoiceChatInternal");
    this.Name = "VoiceChatInternal";
  }
};
var VoiceChatService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("VoiceChatService");
    this.Name = "VoiceChatService";
    this.DefaultDistanceAttenuation = VoiceChatDistanceAttenuationType.Inverse;
    this.EnableDefaultVoice = true;
    this.UseAudioApi = AudioApiRollout.Automatic;
  }
  get DefaultDistanceAttenuation() {
    return this.GetProp(
      "DefaultDistanceAttenuation",
      18
      /* Enum */
    );
  }
  set DefaultDistanceAttenuation(value) {
    this.SetProp("DefaultDistanceAttenuation", 18, value);
  }
  get EnableDefaultVoice() {
    return this.GetProp(
      "EnableDefaultVoice",
      2
      /* Bool */
    );
  }
  set EnableDefaultVoice(value) {
    this.SetProp("EnableDefaultVoice", 2, value);
  }
  get UseAudioApi() {
    return this.GetProp(
      "UseAudioApi",
      18
      /* Enum */
    );
  }
  set UseAudioApi(value) {
    this.SetProp("UseAudioApi", 18, value);
  }
};
var WebSocketService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("WebSocketService");
    this.Name = "WebSocketService";
  }
};
var WebViewService = class extends Instance {
  constructor() {
    super(true);
    this.addClassName("WebViewService");
    this.Name = "WebViewService";
  }
};
var WeldConstraint = class extends Instance {
  constructor() {
    super();
    this.addClassName("WeldConstraint");
    this.Name = "WeldConstraint";
    this.State = 3;
  }
  get CFrame0() {
    return this.GetProp(
      "CFrame0",
      16
      /* CFrame */
    );
  }
  set CFrame0(value) {
    this.SetProp("CFrame0", 16, value);
  }
  get Part0Internal() {
    return this.GetProp(
      "Part0Internal",
      19
      /* Referent */
    );
  }
  set Part0Internal(value) {
    this.SetProp("Part0Internal", 19, value);
  }
  get Part1Internal() {
    return this.GetProp(
      "Part1Internal",
      19
      /* Referent */
    );
  }
  set Part1Internal(value) {
    this.SetProp("Part1Internal", 19, value);
  }
  get State() {
    return this.GetProp(
      "State",
      3
      /* Int32 */
    );
  }
  set State(value) {
    this.SetProp("State", 3, value);
  }
};
var Wire = class extends Instance {
  constructor() {
    super();
    this.addClassName("Wire");
    this.Name = "Wire";
    this.SourceName = "Output";
    this.TargetName = "Input";
  }
  get SourceInstance() {
    return this.GetProp(
      "SourceInstance",
      19
      /* Referent */
    );
  }
  set SourceInstance(value) {
    this.SetProp("SourceInstance", 19, value);
  }
  get SourceName() {
    return this.GetProp(
      "SourceName",
      1
      /* String */
    );
  }
  set SourceName(value) {
    this.SetProp("SourceName", 1, value);
  }
  get TargetInstance() {
    return this.GetProp(
      "TargetInstance",
      19
      /* Referent */
    );
  }
  set TargetInstance(value) {
    this.SetProp("TargetInstance", 19, value);
  }
  get TargetName() {
    return this.GetProp(
      "TargetName",
      1
      /* String */
    );
  }
  set TargetName(value) {
    this.SetProp("TargetName", 1, value);
  }
};
var ClassMap = class {
  _map = getClassMap();
  getFactory(className) {
    return this._map.get(className);
  }
};
function getClassMap() {
  const map = /* @__PURE__ */ new Map();
  map.set("AccessoryDescription", () => new AccessoryDescription());
  map.set("AccountService", () => new AccountService());
  map.set("Accoutrement", () => new Accoutrement());
  map.set("Accessory", () => new Accessory());
  map.set("Hat", () => new Hat());
  map.set("AchievementService", () => new AchievementService());
  map.set("ActivityHistoryEventService", () => new ActivityHistoryEventService());
  map.set("AdPortal", () => new AdPortal());
  map.set("AdService", () => new AdService());
  map.set("AdvancedDragger", () => new AdvancedDragger());
  map.set("AnalyticsService", () => new AnalyticsService());
  map.set("Animation", () => new Animation());
  map.set("CurveAnimation", () => new CurveAnimation());
  map.set("KeyframeSequence", () => new KeyframeSequence());
  map.set("AnimationClipProvider", () => new AnimationClipProvider());
  map.set("AnimationController", () => new AnimationController());
  map.set("AnimationFromVideoCreatorService", () => new AnimationFromVideoCreatorService());
  map.set("AnimationFromVideoCreatorStudioService", () => new AnimationFromVideoCreatorStudioService());
  map.set("AnimationRigData", () => new AnimationRigData());
  map.set("Animator", () => new Animator());
  map.set("Annotation", () => new Annotation());
  map.set("WorkspaceAnnotation", () => new WorkspaceAnnotation());
  map.set("AnnotationsService", () => new AnnotationsService());
  map.set("AppLifecycleObserverService", () => new AppLifecycleObserverService());
  map.set("AppUpdateService", () => new AppUpdateService());
  map.set("AssetCounterService", () => new AssetCounterService());
  map.set("AssetDeliveryProxy", () => new AssetDeliveryProxy());
  map.set("AssetImportService", () => new AssetImportService());
  map.set("AssetManagerService", () => new AssetManagerService());
  map.set("AssetService", () => new AssetService());
  map.set("Atmosphere", () => new Atmosphere());
  map.set("Attachment", () => new Attachment());
  map.set("Bone", () => new Bone());
  map.set("AudioAnalyzer", () => new AudioAnalyzer());
  map.set("AudioChannelMixer", () => new AudioChannelMixer());
  map.set("AudioChannelSplitter", () => new AudioChannelSplitter());
  map.set("AudioChorus", () => new AudioChorus());
  map.set("AudioCompressor", () => new AudioCompressor());
  map.set("AudioDeviceInput", () => new AudioDeviceInput());
  map.set("AudioDeviceOutput", () => new AudioDeviceOutput());
  map.set("AudioDistortion", () => new AudioDistortion());
  map.set("AudioEcho", () => new AudioEcho());
  map.set("AudioEmitter", () => new AudioEmitter());
  map.set("AudioEqualizer", () => new AudioEqualizer());
  map.set("AudioFader", () => new AudioFader());
  map.set("AudioFilter", () => new AudioFilter());
  map.set("AudioFlanger", () => new AudioFlanger());
  map.set("AudioFocusService", () => new AudioFocusService());
  map.set("AudioLimiter", () => new AudioLimiter());
  map.set("AudioListener", () => new AudioListener());
  map.set("AudioPitchShifter", () => new AudioPitchShifter());
  map.set("AudioPlayer", () => new AudioPlayer());
  map.set("AudioRecorder", () => new AudioRecorder());
  map.set("AudioReverb", () => new AudioReverb());
  map.set("AudioSearchParams", () => new AudioSearchParams());
  map.set("AudioTextToSpeech", () => new AudioTextToSpeech());
  map.set("AuroraScriptService", () => new AuroraScriptService());
  map.set("AuroraService", () => new AuroraService());
  map.set("AvatarAccessoryRules", () => new AvatarAccessoryRules());
  map.set("AvatarAnimationRules", () => new AvatarAnimationRules());
  map.set("AvatarBodyRules", () => new AvatarBodyRules());
  map.set("AvatarChatService", () => new AvatarChatService());
  map.set("AvatarClothingRules", () => new AvatarClothingRules());
  map.set("AvatarCollisionRules", () => new AvatarCollisionRules());
  map.set("AvatarCreationService", () => new AvatarCreationService());
  map.set("AvatarEditorService", () => new AvatarEditorService());
  map.set("AvatarImportService", () => new AvatarImportService());
  map.set("AvatarPreloader", () => new AvatarPreloader());
  map.set("AvatarRules", () => new AvatarRules());
  map.set("AvatarSettings", () => new AvatarSettings());
  map.set("Backpack", () => new Backpack());
  map.set("BadgeService", () => new BadgeService());
  map.set("CoreGui", () => new CoreGui());
  map.set("StarterGui", () => new StarterGui());
  map.set("RemoteEvent", () => new RemoteEvent());
  map.set("UnreliableRemoteEvent", () => new UnreliableRemoteEvent());
  map.set("WrapDeformer", () => new WrapDeformer());
  map.set("WrapLayer", () => new WrapLayer());
  map.set("WrapTarget", () => new WrapTarget());
  map.set("Beam", () => new Beam());
  map.set("BindableEvent", () => new BindableEvent());
  map.set("BindableFunction", () => new BindableFunction());
  map.set("BodyAngularVelocity", () => new BodyAngularVelocity());
  map.set("BodyForce", () => new BodyForce());
  map.set("BodyGyro", () => new BodyGyro());
  map.set("BodyPosition", () => new BodyPosition());
  map.set("BodyThrust", () => new BodyThrust());
  map.set("BodyVelocity", () => new BodyVelocity());
  map.set("RocketPropulsion", () => new RocketPropulsion());
  map.set("BodyPartDescription", () => new BodyPartDescription());
  map.set("Breakpoint", () => new Breakpoint());
  map.set("BrowserService", () => new BrowserService());
  map.set("BugReporterService", () => new BugReporterService());
  map.set("BulkImportService", () => new BulkImportService());
  map.set("HSRDataContentProvider", () => new HSRDataContentProvider());
  map.set("MeshContentProvider", () => new MeshContentProvider());
  map.set("SolidModelContentProvider", () => new SolidModelContentProvider());
  map.set("CalloutService", () => new CalloutService());
  map.set("CaptureService", () => new CaptureService());
  map.set("ChangeHistoryService", () => new ChangeHistoryService());
  map.set("BodyColors", () => new BodyColors());
  map.set("CharacterMesh", () => new CharacterMesh());
  map.set("Pants", () => new Pants());
  map.set("Shirt", () => new Shirt());
  map.set("ShirtGraphic", () => new ShirtGraphic());
  map.set("Skin", () => new Skin());
  map.set("Chat", () => new Chat());
  map.set("ChatbotUIService", () => new ChatbotUIService());
  map.set("ClickDetector", () => new ClickDetector());
  map.set("DragDetector", () => new DragDetector());
  map.set("CloudCRUDService", () => new CloudCRUDService());
  map.set("Clouds", () => new Clouds());
  map.set("ClusterPacketCache", () => new ClusterPacketCache());
  map.set("CollaboratorsService", () => new CollaboratorsService());
  map.set("CollectionService", () => new CollectionService());
  map.set("CommandService", () => new CommandService());
  map.set("CommerceService", () => new CommerceService());
  map.set("ConfigService", () => new ConfigService());
  map.set("Configuration", () => new Configuration());
  map.set("ConfigureServerService", () => new ConfigureServerService());
  map.set("ConnectivityService", () => new ConnectivityService());
  map.set("AlignOrientation", () => new AlignOrientation());
  map.set("AlignPosition", () => new AlignPosition());
  map.set("AngularVelocity", () => new AngularVelocity());
  map.set("AnimationConstraint", () => new AnimationConstraint());
  map.set("BallSocketConstraint", () => new BallSocketConstraint());
  map.set("HingeConstraint", () => new HingeConstraint());
  map.set("LineForce", () => new LineForce());
  map.set("LinearVelocity", () => new LinearVelocity());
  map.set("PlaneConstraint", () => new PlaneConstraint());
  map.set("Plane", () => new Plane());
  map.set("RigidConstraint", () => new RigidConstraint());
  map.set("RodConstraint", () => new RodConstraint());
  map.set("RopeConstraint", () => new RopeConstraint());
  map.set("CylindricalConstraint", () => new CylindricalConstraint());
  map.set("PrismaticConstraint", () => new PrismaticConstraint());
  map.set("SpringConstraint", () => new SpringConstraint());
  map.set("Torque", () => new Torque());
  map.set("TorsionSpringConstraint", () => new TorsionSpringConstraint());
  map.set("UniversalConstraint", () => new UniversalConstraint());
  map.set("VectorForce", () => new VectorForce());
  map.set("ContentProvider", () => new ContentProvider());
  map.set("ContextActionService", () => new ContextActionService());
  map.set("HumanoidController", () => new HumanoidController());
  map.set("SkateboardController", () => new SkateboardController());
  map.set("VehicleController", () => new VehicleController());
  map.set("AirController", () => new AirController());
  map.set("ClimbController", () => new ClimbController());
  map.set("GroundController", () => new GroundController());
  map.set("SwimController", () => new SwimController());
  map.set("ControllerManager", () => new ControllerManager());
  map.set("ControllerService", () => new ControllerService());
  map.set("ConversationalAIAcceptanceService", () => new ConversationalAIAcceptanceService());
  map.set("CookiesService", () => new CookiesService());
  map.set("CorePackages", () => new CorePackages());
  map.set("CoreScriptDebuggingManagerHelper", () => new CoreScriptDebuggingManagerHelper());
  map.set("CoreScriptSyncService", () => new CoreScriptSyncService());
  map.set("CreationDBService", () => new CreationDBService());
  map.set("CreatorStoreService", () => new CreatorStoreService());
  map.set("CrossDMScriptChangeListener", () => new CrossDMScriptChangeListener());
  map.set("CustomEvent", () => new CustomEvent());
  map.set("CustomEventReceiver", () => new CustomEventReceiver());
  map.set("CustomLog", () => new CustomLog());
  map.set("BlockMesh", () => new BlockMesh());
  map.set("CylinderMesh", () => new CylinderMesh());
  map.set("FileMesh", () => new FileMesh());
  map.set("SpecialMesh", () => new SpecialMesh());
  map.set("DataModelPatchService", () => new DataModelPatchService());
  map.set("DataStoreGetOptions", () => new DataStoreGetOptions());
  map.set("DataStoreIncrementOptions", () => new DataStoreIncrementOptions());
  map.set("DataStoreOptions", () => new DataStoreOptions());
  map.set("DataStoreService", () => new DataStoreService());
  map.set("DataStoreSetOptions", () => new DataStoreSetOptions());
  map.set("Debris", () => new Debris());
  map.set("DebuggablePluginWatcher", () => new DebuggablePluginWatcher());
  map.set("DebuggerConnectionManager", () => new DebuggerConnectionManager());
  map.set("DebuggerManager", () => new DebuggerManager());
  map.set("DebuggerUIService", () => new DebuggerUIService());
  map.set("DebuggerWatch", () => new DebuggerWatch());
  map.set("DeviceIdService", () => new DeviceIdService());
  map.set("Dialog", () => new Dialog());
  map.set("DialogChoice", () => new DialogChoice());
  map.set("DraftsService", () => new DraftsService());
  map.set("Dragger", () => new Dragger());
  map.set("DraggerService", () => new DraggerService());
  map.set("EditableService", () => new EditableService());
  map.set("EulerRotationCurve", () => new EulerRotationCurve());
  map.set("EventIngestService", () => new EventIngestService());
  map.set("ExampleService", () => new ExampleService());
  map.set("ExperienceAuthService", () => new ExperienceAuthService());
  map.set("ExperienceInviteOptions", () => new ExperienceInviteOptions());
  map.set("ExperienceNotificationService", () => new ExperienceNotificationService());
  map.set("ExperienceService", () => new ExperienceService());
  map.set("ExperienceStateCaptureService", () => new ExperienceStateCaptureService());
  map.set("ExplorerFilter", () => new ExplorerFilter());
  map.set("ExplorerServiceVisibilityService", () => new ExplorerServiceVisibilityService());
  map.set("Explosion", () => new Explosion());
  map.set("FaceAnimatorService", () => new FaceAnimatorService());
  map.set("FaceControls", () => new FaceControls());
  map.set("Decal", () => new Decal());
  map.set("Texture", () => new Texture());
  map.set("FacialAgeEstimationService", () => new FacialAgeEstimationService());
  map.set("FacialAnimationRecordingService", () => new FacialAnimationRecordingService());
  map.set("FacialAnimationStreamingServiceV2", () => new FacialAnimationStreamingServiceV2());
  map.set("Hole", () => new Hole());
  map.set("MotorFeature", () => new MotorFeature());
  map.set("FeatureRestrictionManager", () => new FeatureRestrictionManager());
  map.set("FeedService", () => new FeedService());
  map.set("Fire", () => new Fire());
  map.set("FlagStandService", () => new FlagStandService());
  map.set("FloatCurve", () => new FloatCurve());
  map.set("FlyweightService", () => new FlyweightService());
  map.set("CSGDictionaryService", () => new CSGDictionaryService());
  map.set("NonReplicatedCSGDictionaryService", () => new NonReplicatedCSGDictionaryService());
  map.set("Folder", () => new Folder());
  map.set("ForceField", () => new ForceField());
  map.set("FriendService", () => new FriendService());
  map.set("FunctionalTest", () => new FunctionalTest());
  map.set("GamePassService", () => new GamePassService());
  map.set("GamepadService", () => new GamepadService());
  map.set("GenerationService", () => new GenerationService());
  map.set("GenericChallengeService", () => new GenericChallengeService());
  map.set("Geometry", () => new Geometry());
  map.set("GeometryService", () => new GeometryService());
  map.set("GetTextBoundsParams", () => new GetTextBoundsParams());
  map.set("GoogleAnalyticsConfiguration", () => new GoogleAnalyticsConfiguration());
  map.set("GroupService", () => new GroupService());
  map.set("CanvasGroup", () => new CanvasGroup());
  map.set("Frame", () => new Frame());
  map.set("ImageButton", () => new ImageButton());
  map.set("TextButton", () => new TextButton());
  map.set("ImageLabel", () => new ImageLabel());
  map.set("TextLabel", () => new TextLabel());
  map.set("RelativeGui", () => new RelativeGui());
  map.set("ScrollingFrame", () => new ScrollingFrame());
  map.set("TextBox", () => new TextBox());
  map.set("VideoDisplay", () => new VideoDisplay());
  map.set("VideoFrame", () => new VideoFrame());
  map.set("ViewportFrame", () => new ViewportFrame());
  map.set("BillboardGui", () => new BillboardGui());
  map.set("ScreenGui", () => new ScreenGui());
  map.set("GuiMain", () => new GuiMain());
  map.set("AdGui", () => new AdGui());
  map.set("SurfaceGui", () => new SurfaceGui());
  map.set("FloorWire", () => new FloorWire());
  map.set("SelectionBox", () => new SelectionBox());
  map.set("BoxHandleAdornment", () => new BoxHandleAdornment());
  map.set("ConeHandleAdornment", () => new ConeHandleAdornment());
  map.set("CylinderHandleAdornment", () => new CylinderHandleAdornment());
  map.set("ImageHandleAdornment", () => new ImageHandleAdornment());
  map.set("LineHandleAdornment", () => new LineHandleAdornment());
  map.set("SphereHandleAdornment", () => new SphereHandleAdornment());
  map.set("WireframeHandleAdornment", () => new WireframeHandleAdornment());
  map.set("ParabolaAdornment", () => new ParabolaAdornment());
  map.set("SelectionSphere", () => new SelectionSphere());
  map.set("ArcHandles", () => new ArcHandles());
  map.set("Handles", () => new Handles());
  map.set("SurfaceSelection", () => new SurfaceSelection());
  map.set("SelectionPartLasso", () => new SelectionPartLasso());
  map.set("SelectionPointLasso", () => new SelectionPointLasso());
  map.set("Path2D", () => new Path2D());
  map.set("GuiService", () => new GuiService());
  map.set("GuidRegistryService", () => new GuidRegistryService());
  map.set("HapticEffect", () => new HapticEffect());
  map.set("HapticService", () => new HapticService());
  map.set("HeapProfilerService", () => new HeapProfilerService());
  map.set("HeatmapService", () => new HeatmapService());
  map.set("HeightmapImporterService", () => new HeightmapImporterService());
  map.set("HiddenSurfaceRemovalAsset", () => new HiddenSurfaceRemovalAsset());
  map.set("Highlight", () => new Highlight());
  map.set("Hopper", () => new Hopper());
  map.set("HttpRbxApiService", () => new HttpRbxApiService());
  map.set("HttpService", () => new HttpService());
  map.set("Humanoid", () => new Humanoid());
  map.set("HumanoidDescription", () => new HumanoidDescription());
  map.set("HumanoidRigDescription", () => new HumanoidRigDescription());
  map.set("IKControl", () => new IKControl());
  map.set("LegacyStudioBridge", () => new LegacyStudioBridge());
  map.set("IXPService", () => new IXPService());
  map.set("IncrementalPatchBuilder", () => new IncrementalPatchBuilder());
  map.set("InputAction", () => new InputAction());
  map.set("InputBinding", () => new InputBinding());
  map.set("InputContext", () => new InputContext());
  map.set("InsertService", () => new InsertService());
  map.set("InternalSyncItem", () => new InternalSyncItem());
  map.set("InternalSyncService", () => new InternalSyncService());
  map.set("RotateP", () => new RotateP());
  map.set("RotateV", () => new RotateV());
  map.set("Glue", () => new Glue());
  map.set("ManualGlue", () => new ManualGlue());
  map.set("ManualWeld", () => new ManualWeld());
  map.set("Motor", () => new Motor());
  map.set("Motor6D", () => new Motor6D());
  map.set("Rotate", () => new Rotate());
  map.set("Snap", () => new Snap());
  map.set("VelocityMotor", () => new VelocityMotor());
  map.set("Weld", () => new Weld());
  map.set("JointsService", () => new JointsService());
  map.set("KeyboardService", () => new KeyboardService());
  map.set("Keyframe", () => new Keyframe());
  map.set("KeyframeMarker", () => new KeyframeMarker());
  map.set("KeyframeSequenceProvider", () => new KeyframeSequenceProvider());
  map.set("LSPFileSyncService", () => new LSPFileSyncService());
  map.set("LanguageService", () => new LanguageService());
  map.set("PointLight", () => new PointLight());
  map.set("SpotLight", () => new SpotLight());
  map.set("SurfaceLight", () => new SurfaceLight());
  map.set("Lighting", () => new Lighting());
  map.set("LinkingService", () => new LinkingService());
  map.set("LiveScriptingService", () => new LiveScriptingService());
  map.set("LiveSyncService", () => new LiveSyncService());
  map.set("AppStorageService", () => new AppStorageService());
  map.set("UserStorageService", () => new UserStorageService());
  map.set("LocalizationService", () => new LocalizationService());
  map.set("LocalizationTable", () => new LocalizationTable());
  map.set("LodDataService", () => new LodDataService());
  map.set("LogReporterService", () => new LogReporterService());
  map.set("LogService", () => new LogService());
  map.set("LoginService", () => new LoginService());
  map.set("AuroraScript", () => new AuroraScript());
  map.set("Script", () => new Script());
  map.set("LocalScript", () => new LocalScript());
  map.set("ModuleScript", () => new ModuleScript());
  map.set("LuaWebService", () => new LuaWebService());
  map.set("LuauScriptAnalyzerService", () => new LuauScriptAnalyzerService());
  map.set("MLModelDeliveryService", () => new MLModelDeliveryService());
  map.set("MarkerCurve", () => new MarkerCurve());
  map.set("MarketplaceService", () => new MarketplaceService());
  map.set("MatchmakingService", () => new MatchmakingService());
  map.set("MaterialGenerationService", () => new MaterialGenerationService());
  map.set("MaterialService", () => new MaterialService());
  map.set("MaterialVariant", () => new MaterialVariant());
  map.set("MemStorageService", () => new MemStorageService());
  map.set("MemoryStoreService", () => new MemoryStoreService());
  map.set("Message", () => new Message());
  map.set("Hint", () => new Hint());
  map.set("MessageBusService", () => new MessageBusService());
  map.set("MessagingService", () => new MessagingService());
  map.set("MetaBreakpointManager", () => new MetaBreakpointManager());
  map.set("MouseService", () => new MouseService());
  map.set("NetworkClient", () => new NetworkClient());
  map.set("NetworkServer", () => new NetworkServer());
  map.set("NetworkSettings", () => new NetworkSettings());
  map.set("NoCollisionConstraint", () => new NoCollisionConstraint());
  map.set("Noise", () => new Noise());
  map.set("NotificationService", () => new NotificationService());
  map.set("OmniRecommendationsService", () => new OmniRecommendationsService());
  map.set("OpenCloudService", () => new OpenCloudService());
  map.set("OperationGraph", () => new OperationGraph());
  map.set("CornerWedgePart", () => new CornerWedgePart());
  map.set("Part", () => new Part());
  map.set("FlagStand", () => new FlagStand());
  map.set("Seat", () => new Seat());
  map.set("SkateboardPlatform", () => new SkateboardPlatform());
  map.set("SpawnLocation", () => new SpawnLocation());
  map.set("WedgePart", () => new WedgePart());
  map.set("Terrain", () => new Terrain());
  map.set("MeshPart", () => new MeshPart());
  map.set("PartOperation", () => new PartOperation());
  map.set("IntersectOperation", () => new IntersectOperation());
  map.set("NegateOperation", () => new NegateOperation());
  map.set("UnionOperation", () => new UnionOperation());
  map.set("TrussPart", () => new TrussPart());
  map.set("VehicleSeat", () => new VehicleSeat());
  map.set("Camera", () => new Camera());
  map.set("Model", () => new Model());
  map.set("Actor", () => new Actor());
  map.set("HopperBin", () => new HopperBin());
  map.set("Tool", () => new Tool());
  map.set("Flag", () => new Flag());
  map.set("Workspace", () => new Workspace());
  map.set("WorldModel", () => new WorldModel());
  map.set("PackageService", () => new PackageService());
  map.set("PackageUIService", () => new PackageUIService());
  map.set("PartOperationAsset", () => new PartOperationAsset());
  map.set("ParticleEmitter", () => new ParticleEmitter());
  map.set("PatchBundlerFileWatch", () => new PatchBundlerFileWatch());
  map.set("PathfindingLink", () => new PathfindingLink());
  map.set("PathfindingModifier", () => new PathfindingModifier());
  map.set("PathfindingService", () => new PathfindingService());
  map.set("PerformanceControlService", () => new PerformanceControlService());
  map.set("PermissionsService", () => new PermissionsService());
  map.set("PhysicsService", () => new PhysicsService());
  map.set("PlaceAssetIdsService", () => new PlaceAssetIdsService());
  map.set("PlaceStatsService", () => new PlaceStatsService());
  map.set("PlacesService", () => new PlacesService());
  map.set("PlatformCloudStorageService", () => new PlatformCloudStorageService());
  map.set("PlatformFriendsService", () => new PlatformFriendsService());
  map.set("Player", () => new Player());
  map.set("PlayerDataService", () => new PlayerDataService());
  map.set("PlayerEmulatorService", () => new PlayerEmulatorService());
  map.set("PlayerHydrationService", () => new PlayerHydrationService());
  map.set("PlayerViewService", () => new PlayerViewService());
  map.set("Players", () => new Players());
  map.set("PluginAction", () => new PluginAction());
  map.set("PluginCapabilities", () => new PluginCapabilities());
  map.set("PluginDebugService", () => new PluginDebugService());
  map.set("PluginGuiService", () => new PluginGuiService());
  map.set("PluginManagementService", () => new PluginManagementService());
  map.set("PluginPolicyService", () => new PluginPolicyService());
  map.set("PointsService", () => new PointsService());
  map.set("PolicyService", () => new PolicyService());
  map.set("NumberPose", () => new NumberPose());
  map.set("Pose", () => new Pose());
  map.set("BloomEffect", () => new BloomEffect());
  map.set("BlurEffect", () => new BlurEffect());
  map.set("ColorCorrectionEffect", () => new ColorCorrectionEffect());
  map.set("ColorGradingEffect", () => new ColorGradingEffect());
  map.set("DepthOfFieldEffect", () => new DepthOfFieldEffect());
  map.set("SunRaysEffect", () => new SunRaysEffect());
  map.set("ProcessInstancePhysicsService", () => new ProcessInstancePhysicsService());
  map.set("ProximityPrompt", () => new ProximityPrompt());
  map.set("ProximityPromptService", () => new ProximityPromptService());
  map.set("PublishService", () => new PublishService());
  map.set("RTAnimationTracker", () => new RTAnimationTracker());
  map.set("RbxAnalyticsService", () => new RbxAnalyticsService());
  map.set("ReflectionMetadata", () => new ReflectionMetadata());
  map.set("ReflectionMetadataCallbacks", () => new ReflectionMetadataCallbacks());
  map.set("ReflectionMetadataClasses", () => new ReflectionMetadataClasses());
  map.set("ReflectionMetadataEnums", () => new ReflectionMetadataEnums());
  map.set("ReflectionMetadataEvents", () => new ReflectionMetadataEvents());
  map.set("ReflectionMetadataFunctions", () => new ReflectionMetadataFunctions());
  map.set("ReflectionMetadataClass", () => new ReflectionMetadataClass());
  map.set("ReflectionMetadataEnum", () => new ReflectionMetadataEnum());
  map.set("ReflectionMetadataEnumItem", () => new ReflectionMetadataEnumItem());
  map.set("ReflectionMetadataMember", () => new ReflectionMetadataMember());
  map.set("ReflectionMetadataProperties", () => new ReflectionMetadataProperties());
  map.set("ReflectionMetadataYieldFunctions", () => new ReflectionMetadataYieldFunctions());
  map.set("ReflectionService", () => new ReflectionService());
  map.set("RemoteCursorService", () => new RemoteCursorService());
  map.set("RemoteDebuggerServer", () => new RemoteDebuggerServer());
  map.set("RemoteFunction", () => new RemoteFunction());
  map.set("RenderSettings", () => new RenderSettings());
  map.set("RenderingTest", () => new RenderingTest());
  map.set("ReplicatedFirst", () => new ReplicatedFirst());
  map.set("ReplicatedStorage", () => new ReplicatedStorage());
  map.set("RibbonNotificationService", () => new RibbonNotificationService());
  map.set("RobloxPluginGuiService", () => new RobloxPluginGuiService());
  map.set("RobloxReplicatedStorage", () => new RobloxReplicatedStorage());
  map.set("RobloxServerStorage", () => new RobloxServerStorage());
  map.set("RomarkRbxAnalyticsService", () => new RomarkRbxAnalyticsService());
  map.set("RomarkService", () => new RomarkService());
  map.set("RotationCurve", () => new RotationCurve());
  map.set("RtMessagingService", () => new RtMessagingService());
  map.set("RunService", () => new RunService());
  map.set("RuntimeScriptService", () => new RuntimeScriptService());
  map.set("SafetyService", () => new SafetyService());
  map.set("ScriptChangeService", () => new ScriptChangeService());
  map.set("ScriptCloneWatcher", () => new ScriptCloneWatcher());
  map.set("ScriptCloneWatcherHelper", () => new ScriptCloneWatcherHelper());
  map.set("ScriptCommitService", () => new ScriptCommitService());
  map.set("ScriptContext", () => new ScriptContext());
  map.set("ScriptEditorService", () => new ScriptEditorService());
  map.set("ScriptProfilerService", () => new ScriptProfilerService());
  map.set("ScriptRegistrationService", () => new ScriptRegistrationService());
  map.set("ScriptService", () => new ScriptService());
  map.set("Selection", () => new Selection());
  map.set("SelectionHighlightManager", () => new SelectionHighlightManager());
  map.set("AtmosphereSensor", () => new AtmosphereSensor());
  map.set("BuoyancySensor", () => new BuoyancySensor());
  map.set("ControllerPartSensor", () => new ControllerPartSensor());
  map.set("FluidForceSensor", () => new FluidForceSensor());
  map.set("SerializationService", () => new SerializationService());
  map.set("ServerScriptService", () => new ServerScriptService());
  map.set("ServerStorage", () => new ServerStorage());
  map.set("ServiceVisibilityService", () => new ServiceVisibilityService());
  map.set("SessionService", () => new SessionService());
  map.set("SharedTableRegistry", () => new SharedTableRegistry());
  map.set("Sky", () => new Sky());
  map.set("Smoke", () => new Smoke());
  map.set("SmoothVoxelsUpgraderService", () => new SmoothVoxelsUpgraderService());
  map.set("SnippetService", () => new SnippetService());
  map.set("SocialService", () => new SocialService());
  map.set("Sound", () => new Sound());
  map.set("ChorusSoundEffect", () => new ChorusSoundEffect());
  map.set("CompressorSoundEffect", () => new CompressorSoundEffect());
  map.set("DistortionSoundEffect", () => new DistortionSoundEffect());
  map.set("EchoSoundEffect", () => new EchoSoundEffect());
  map.set("EqualizerSoundEffect", () => new EqualizerSoundEffect());
  map.set("FlangeSoundEffect", () => new FlangeSoundEffect());
  map.set("PitchShiftSoundEffect", () => new PitchShiftSoundEffect());
  map.set("ReverbSoundEffect", () => new ReverbSoundEffect());
  map.set("TremoloSoundEffect", () => new TremoloSoundEffect());
  map.set("SoundGroup", () => new SoundGroup());
  map.set("SoundService", () => new SoundService());
  map.set("Sparkles", () => new Sparkles());
  map.set("SpawnerService", () => new SpawnerService());
  map.set("StandalonePluginScripts", () => new StandalonePluginScripts());
  map.set("StartPageService", () => new StartPageService());
  map.set("StarterGear", () => new StarterGear());
  map.set("StarterPack", () => new StarterPack());
  map.set("StarterPlayer", () => new StarterPlayer());
  map.set("StarterPlayerScripts", () => new StarterPlayerScripts());
  map.set("StarterCharacterScripts", () => new StarterCharacterScripts());
  map.set("StartupMessageService", () => new StartupMessageService());
  map.set("Stats", () => new Stats());
  map.set("StopWatchReporter", () => new StopWatchReporter());
  map.set("StreamingService", () => new StreamingService());
  map.set("StudioAssetService", () => new StudioAssetService());
  map.set("StudioAttachment", () => new StudioAttachment());
  map.set("StudioCallout", () => new StudioCallout());
  map.set("StudioCameraService", () => new StudioCameraService());
  map.set("StudioData", () => new StudioData());
  map.set("StudioDeviceEmulatorService", () => new StudioDeviceEmulatorService());
  map.set("StudioPublishService", () => new StudioPublishService());
  map.set("StudioScriptDebugEventListener", () => new StudioScriptDebugEventListener());
  map.set("StudioSdkService", () => new StudioSdkService());
  map.set("StudioService", () => new StudioService());
  map.set("StudioUserService", () => new StudioUserService());
  map.set("StudioWidgetsService", () => new StudioWidgetsService());
  map.set("StyleRule", () => new StyleRule());
  map.set("StyleSheet", () => new StyleSheet());
  map.set("StyleDerive", () => new StyleDerive());
  map.set("StyleLink", () => new StyleLink());
  map.set("StylingService", () => new StylingService());
  map.set("SurfaceAppearance", () => new SurfaceAppearance());
  map.set("SystemThemeService", () => new SystemThemeService());
  map.set("TaskScheduler", () => new TaskScheduler());
  map.set("Team", () => new Team());
  map.set("TeamCreateData", () => new TeamCreateData());
  map.set("TeamCreatePublishService", () => new TeamCreatePublishService());
  map.set("TeamCreateService", () => new TeamCreateService());
  map.set("Teams", () => new Teams());
  map.set("TelemetryService", () => new TelemetryService());
  map.set("TeleportOptions", () => new TeleportOptions());
  map.set("TeleportService", () => new TeleportService());
  map.set("TemporaryCageMeshProvider", () => new TemporaryCageMeshProvider());
  map.set("TemporaryScriptService", () => new TemporaryScriptService());
  map.set("TerrainDetail", () => new TerrainDetail());
  map.set("TerrainRegion", () => new TerrainRegion());
  map.set("TestService", () => new TestService());
  map.set("TextBoxService", () => new TextBoxService());
  map.set("TextChannel", () => new TextChannel());
  map.set("TextChatCommand", () => new TextChatCommand());
  map.set("BubbleChatConfiguration", () => new BubbleChatConfiguration());
  map.set("ChatInputBarConfiguration", () => new ChatInputBarConfiguration());
  map.set("ChatWindowConfiguration", () => new ChatWindowConfiguration());
  map.set("TextChatMessageProperties", () => new TextChatMessageProperties());
  map.set("BubbleChatMessageProperties", () => new BubbleChatMessageProperties());
  map.set("TextChatService", () => new TextChatService());
  map.set("TextService", () => new TextService());
  map.set("TextureGenerationService", () => new TextureGenerationService());
  map.set("ThirdPartyUserService", () => new ThirdPartyUserService());
  map.set("TimerService", () => new TimerService());
  map.set("ToastNotificationService", () => new ToastNotificationService());
  map.set("TouchInputService", () => new TouchInputService());
  map.set("TracerService", () => new TracerService());
  map.set("TrackerStreamAnimation", () => new TrackerStreamAnimation());
  map.set("Trail", () => new Trail());
  map.set("TutorialService", () => new TutorialService());
  map.set("Tween", () => new Tween());
  map.set("TweenService", () => new TweenService());
  map.set("UGCAvatarService", () => new UGCAvatarService());
  map.set("UGCValidationService", () => new UGCValidationService());
  map.set("UIAspectRatioConstraint", () => new UIAspectRatioConstraint());
  map.set("UISizeConstraint", () => new UISizeConstraint());
  map.set("UITextSizeConstraint", () => new UITextSizeConstraint());
  map.set("UICorner", () => new UICorner());
  map.set("UIDragDetector", () => new UIDragDetector());
  map.set("UIFlexItem", () => new UIFlexItem());
  map.set("UIGradient", () => new UIGradient());
  map.set("UIGridLayout", () => new UIGridLayout());
  map.set("UIListLayout", () => new UIListLayout());
  map.set("UIPageLayout", () => new UIPageLayout());
  map.set("UITableLayout", () => new UITableLayout());
  map.set("UIPadding", () => new UIPadding());
  map.set("UIScale", () => new UIScale());
  map.set("UIStroke", () => new UIStroke());
  map.set("UIDragDetectorService", () => new UIDragDetectorService());
  map.set("UniqueIdLookupService", () => new UniqueIdLookupService());
  map.set("UnvalidatedAssetService", () => new UnvalidatedAssetService());
  map.set("UserInputService", () => new UserInputService());
  map.set("UserService", () => new UserService());
  map.set("VRService", () => new VRService());
  map.set("VRStatusService", () => new VRStatusService());
  map.set("BinaryStringValue", () => new BinaryStringValue());
  map.set("BoolValue", () => new BoolValue());
  map.set("BrickColorValue", () => new BrickColorValue());
  map.set("CFrameValue", () => new CFrameValue());
  map.set("Color3Value", () => new Color3Value());
  map.set("DoubleConstrainedValue", () => new DoubleConstrainedValue());
  map.set("IntConstrainedValue", () => new IntConstrainedValue());
  map.set("IntValue", () => new IntValue());
  map.set("NumberValue", () => new NumberValue());
  map.set("ObjectValue", () => new ObjectValue());
  map.set("RayValue", () => new RayValue());
  map.set("StringValue", () => new StringValue());
  map.set("Vector3Value", () => new Vector3Value());
  map.set("Vector3Curve", () => new Vector3Curve());
  map.set("VersionControlService", () => new VersionControlService());
  map.set("VideoCaptureService", () => new VideoCaptureService());
  map.set("VideoDeviceInput", () => new VideoDeviceInput());
  map.set("VideoPlayer", () => new VideoPlayer());
  map.set("VideoService", () => new VideoService());
  map.set("VirtualInputManager", () => new VirtualInputManager());
  map.set("VirtualUser", () => new VirtualUser());
  map.set("VisibilityCheckDispatcher", () => new VisibilityCheckDispatcher());
  map.set("Visit", () => new Visit());
  map.set("VisualizationMode", () => new VisualizationMode());
  map.set("VisualizationModeCategory", () => new VisualizationModeCategory());
  map.set("VisualizationModeService", () => new VisualizationModeService());
  map.set("VoiceChatInternal", () => new VoiceChatInternal());
  map.set("VoiceChatService", () => new VoiceChatService());
  map.set("WebSocketService", () => new WebSocketService());
  map.set("WebViewService", () => new WebViewService());
  map.set("WeldConstraint", () => new WeldConstraint());
  map.set("Wire", () => new Wire());
  return map;
}
var AccessModifierType = class _AccessModifierType extends EnumItem {
  static Allow = new _AccessModifierType("Allow", 0);
  static Deny = new _AccessModifierType("Deny", 1);
  static get Items() {
    return [_AccessModifierType.Allow, _AccessModifierType.Deny];
  }
  static FromValue(value) {
    return _AccessModifierType.Items.find((item) => item._value === value);
  }
};
var AccessoryType = class _AccessoryType extends EnumItem {
  static Unknown = new _AccessoryType("Unknown", 0);
  static Hat = new _AccessoryType("Hat", 1);
  static Hair = new _AccessoryType("Hair", 2);
  static Face = new _AccessoryType("Face", 3);
  static Neck = new _AccessoryType("Neck", 4);
  static Shoulder = new _AccessoryType("Shoulder", 5);
  static Front = new _AccessoryType("Front", 6);
  static Back = new _AccessoryType("Back", 7);
  static Waist = new _AccessoryType("Waist", 8);
  static TShirt = new _AccessoryType("TShirt", 9);
  static Shirt = new _AccessoryType("Shirt", 10);
  static Pants = new _AccessoryType("Pants", 11);
  static Jacket = new _AccessoryType("Jacket", 12);
  static Sweater = new _AccessoryType("Sweater", 13);
  static Shorts = new _AccessoryType("Shorts", 14);
  static LeftShoe = new _AccessoryType("LeftShoe", 15);
  static RightShoe = new _AccessoryType("RightShoe", 16);
  static DressSkirt = new _AccessoryType("DressSkirt", 17);
  static Eyebrow = new _AccessoryType("Eyebrow", 18);
  static Eyelash = new _AccessoryType("Eyelash", 19);
  static get Items() {
    return [_AccessoryType.Unknown, _AccessoryType.Hat, _AccessoryType.Hair, _AccessoryType.Face, _AccessoryType.Neck, _AccessoryType.Shoulder, _AccessoryType.Front, _AccessoryType.Back, _AccessoryType.Waist, _AccessoryType.TShirt, _AccessoryType.Shirt, _AccessoryType.Pants, _AccessoryType.Jacket, _AccessoryType.Sweater, _AccessoryType.Shorts, _AccessoryType.LeftShoe, _AccessoryType.RightShoe, _AccessoryType.DressSkirt, _AccessoryType.Eyebrow, _AccessoryType.Eyelash];
  }
  static FromValue(value) {
    return _AccessoryType.Items.find((item) => item._value === value);
  }
};
var ActuatorRelativeTo = class _ActuatorRelativeTo extends EnumItem {
  static Attachment0 = new _ActuatorRelativeTo("Attachment0", 0);
  static Attachment1 = new _ActuatorRelativeTo("Attachment1", 1);
  static World = new _ActuatorRelativeTo("World", 2);
  static get Items() {
    return [_ActuatorRelativeTo.Attachment0, _ActuatorRelativeTo.Attachment1, _ActuatorRelativeTo.World];
  }
  static FromValue(value) {
    return _ActuatorRelativeTo.Items.find((item) => item._value === value);
  }
};
var ActuatorType = class _ActuatorType extends EnumItem {
  static None = new _ActuatorType("None", 0);
  static Motor = new _ActuatorType("Motor", 1);
  static Servo = new _ActuatorType("Servo", 2);
  static get Items() {
    return [_ActuatorType.None, _ActuatorType.Motor, _ActuatorType.Servo];
  }
  static FromValue(value) {
    return _ActuatorType.Items.find((item) => item._value === value);
  }
};
var AdShape = class _AdShape extends EnumItem {
  static HorizontalRectangle = new _AdShape("HorizontalRectangle", 1);
  static get Items() {
    return [_AdShape.HorizontalRectangle];
  }
  static FromValue(value) {
    return _AdShape.Items.find((item) => item._value === value);
  }
};
var AdornCullingMode = class _AdornCullingMode extends EnumItem {
  static Automatic = new _AdornCullingMode("Automatic", 0);
  static Never = new _AdornCullingMode("Never", 1);
  static get Items() {
    return [_AdornCullingMode.Automatic, _AdornCullingMode.Never];
  }
  static FromValue(value) {
    return _AdornCullingMode.Items.find((item) => item._value === value);
  }
};
var AlignType = class _AlignType extends EnumItem {
  static PrimaryAxisParallel = new _AlignType("PrimaryAxisParallel", 2);
  static PrimaryAxisPerpendicular = new _AlignType("PrimaryAxisPerpendicular", 3);
  static PrimaryAxisLookAt = new _AlignType("PrimaryAxisLookAt", 4);
  static AllAxes = new _AlignType("AllAxes", 5);
  static Parallel = new _AlignType("Parallel", 0);
  static Perpendicular = new _AlignType("Perpendicular", 1);
  static get Items() {
    return [_AlignType.PrimaryAxisParallel, _AlignType.PrimaryAxisPerpendicular, _AlignType.PrimaryAxisLookAt, _AlignType.AllAxes, _AlignType.Parallel, _AlignType.Perpendicular];
  }
  static FromValue(value) {
    return _AlignType.Items.find((item) => item._value === value);
  }
};
var AlphaMode = class _AlphaMode extends EnumItem {
  static Overlay = new _AlphaMode("Overlay", 0);
  static Transparency = new _AlphaMode("Transparency", 1);
  static TintMask = new _AlphaMode("TintMask", 2);
  static get Items() {
    return [_AlphaMode.Overlay, _AlphaMode.Transparency, _AlphaMode.TintMask];
  }
  static FromValue(value) {
    return _AlphaMode.Items.find((item) => item._value === value);
  }
};
var AnimationPriority = class _AnimationPriority extends EnumItem {
  static Core = new _AnimationPriority("Core", 1e3);
  static Idle = new _AnimationPriority("Idle", 0);
  static Movement = new _AnimationPriority("Movement", 1);
  static Action = new _AnimationPriority("Action", 2);
  static Action2 = new _AnimationPriority("Action2", 3);
  static Action3 = new _AnimationPriority("Action3", 4);
  static Action4 = new _AnimationPriority("Action4", 5);
  static get Items() {
    return [_AnimationPriority.Core, _AnimationPriority.Idle, _AnimationPriority.Movement, _AnimationPriority.Action, _AnimationPriority.Action2, _AnimationPriority.Action3, _AnimationPriority.Action4];
  }
  static FromValue(value) {
    return _AnimationPriority.Items.find((item) => item._value === value);
  }
};
var AnimatorRetargetingMode = class _AnimatorRetargetingMode extends EnumItem {
  static Default = new _AnimatorRetargetingMode("Default", 0);
  static Disabled = new _AnimatorRetargetingMode("Disabled", 1);
  static Enabled = new _AnimatorRetargetingMode("Enabled", 2);
  static get Items() {
    return [_AnimatorRetargetingMode.Default, _AnimatorRetargetingMode.Disabled, _AnimatorRetargetingMode.Enabled];
  }
  static FromValue(value) {
    return _AnimatorRetargetingMode.Items.find((item) => item._value === value);
  }
};
var ApplyStrokeMode = class _ApplyStrokeMode extends EnumItem {
  static Contextual = new _ApplyStrokeMode("Contextual", 0);
  static Border = new _ApplyStrokeMode("Border", 1);
  static get Items() {
    return [_ApplyStrokeMode.Contextual, _ApplyStrokeMode.Border];
  }
  static FromValue(value) {
    return _ApplyStrokeMode.Items.find((item) => item._value === value);
  }
};
var AspectType = class _AspectType extends EnumItem {
  static FitWithinMaxSize = new _AspectType("FitWithinMaxSize", 0);
  static ScaleWithParentSize = new _AspectType("ScaleWithParentSize", 1);
  static get Items() {
    return [_AspectType.FitWithinMaxSize, _AspectType.ScaleWithParentSize];
  }
  static FromValue(value) {
    return _AspectType.Items.find((item) => item._value === value);
  }
};
var AudioApiRollout = class _AudioApiRollout extends EnumItem {
  static Disabled = new _AudioApiRollout("Disabled", 0);
  static Automatic = new _AudioApiRollout("Automatic", 1);
  static Enabled = new _AudioApiRollout("Enabled", 2);
  static get Items() {
    return [_AudioApiRollout.Disabled, _AudioApiRollout.Automatic, _AudioApiRollout.Enabled];
  }
  static FromValue(value) {
    return _AudioApiRollout.Items.find((item) => item._value === value);
  }
};
var AudioChannelLayout = class _AudioChannelLayout extends EnumItem {
  static Mono = new _AudioChannelLayout("Mono", 0);
  static Stereo = new _AudioChannelLayout("Stereo", 1);
  static Quad = new _AudioChannelLayout("Quad", 2);
  static Surround_5 = new _AudioChannelLayout("Surround_5", 3);
  static Surround_5_1 = new _AudioChannelLayout("Surround_5_1", 4);
  static Surround_7_1 = new _AudioChannelLayout("Surround_7_1", 5);
  static Surround_7_1_4 = new _AudioChannelLayout("Surround_7_1_4", 6);
  static get Items() {
    return [_AudioChannelLayout.Mono, _AudioChannelLayout.Stereo, _AudioChannelLayout.Quad, _AudioChannelLayout.Surround_5, _AudioChannelLayout.Surround_5_1, _AudioChannelLayout.Surround_7_1, _AudioChannelLayout.Surround_7_1_4];
  }
  static FromValue(value) {
    return _AudioChannelLayout.Items.find((item) => item._value === value);
  }
};
var AudioFilterType = class _AudioFilterType extends EnumItem {
  static Peak = new _AudioFilterType("Peak", 0);
  static LowShelf = new _AudioFilterType("LowShelf", 1);
  static HighShelf = new _AudioFilterType("HighShelf", 2);
  static Lowpass12dB = new _AudioFilterType("Lowpass12dB", 3);
  static Lowpass24dB = new _AudioFilterType("Lowpass24dB", 4);
  static Lowpass48dB = new _AudioFilterType("Lowpass48dB", 5);
  static Highpass12dB = new _AudioFilterType("Highpass12dB", 6);
  static Highpass24dB = new _AudioFilterType("Highpass24dB", 7);
  static Highpass48dB = new _AudioFilterType("Highpass48dB", 8);
  static Bandpass = new _AudioFilterType("Bandpass", 9);
  static Notch = new _AudioFilterType("Notch", 10);
  static Lowpass6dB = new _AudioFilterType("Lowpass6dB", 11);
  static get Items() {
    return [_AudioFilterType.Peak, _AudioFilterType.LowShelf, _AudioFilterType.HighShelf, _AudioFilterType.Lowpass12dB, _AudioFilterType.Lowpass24dB, _AudioFilterType.Lowpass48dB, _AudioFilterType.Highpass12dB, _AudioFilterType.Highpass24dB, _AudioFilterType.Highpass48dB, _AudioFilterType.Bandpass, _AudioFilterType.Notch, _AudioFilterType.Lowpass6dB];
  }
  static FromValue(value) {
    return _AudioFilterType.Items.find((item) => item._value === value);
  }
};
var AudioSimulationFidelity = class _AudioSimulationFidelity extends EnumItem {
  static None = new _AudioSimulationFidelity("None", 0);
  static Automatic = new _AudioSimulationFidelity("Automatic", 1);
  static get Items() {
    return [_AudioSimulationFidelity.None, _AudioSimulationFidelity.Automatic];
  }
  static FromValue(value) {
    return _AudioSimulationFidelity.Items.find((item) => item._value === value);
  }
};
var AudioSubType = class _AudioSubType extends EnumItem {
  static Music = new _AudioSubType("Music", 1);
  static SoundEffect = new _AudioSubType("SoundEffect", 2);
  static get Items() {
    return [_AudioSubType.Music, _AudioSubType.SoundEffect];
  }
  static FromValue(value) {
    return _AudioSubType.Items.find((item) => item._value === value);
  }
};
var AudioWindowSize = class _AudioWindowSize extends EnumItem {
  static Small = new _AudioWindowSize("Small", 0);
  static Medium = new _AudioWindowSize("Medium", 1);
  static Large = new _AudioWindowSize("Large", 2);
  static get Items() {
    return [_AudioWindowSize.Small, _AudioWindowSize.Medium, _AudioWindowSize.Large];
  }
  static FromValue(value) {
    return _AudioWindowSize.Items.find((item) => item._value === value);
  }
};
var AutomaticSize = class _AutomaticSize extends EnumItem {
  static None = new _AutomaticSize("None", 0);
  static X = new _AutomaticSize("X", 1);
  static Y = new _AutomaticSize("Y", 2);
  static XY = new _AutomaticSize("XY", 3);
  static get Items() {
    return [_AutomaticSize.None, _AutomaticSize.X, _AutomaticSize.Y, _AutomaticSize.XY];
  }
  static FromValue(value) {
    return _AutomaticSize.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsAccessoryLimitMethod = class _AvatarSettingsAccessoryLimitMethod extends EnumItem {
  static Scale = new _AvatarSettingsAccessoryLimitMethod("Scale", 0);
  static Remove = new _AvatarSettingsAccessoryLimitMethod("Remove", 1);
  static get Items() {
    return [_AvatarSettingsAccessoryLimitMethod.Scale, _AvatarSettingsAccessoryLimitMethod.Remove];
  }
  static FromValue(value) {
    return _AvatarSettingsAccessoryLimitMethod.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsAccessoryMode = class _AvatarSettingsAccessoryMode extends EnumItem {
  static PlayerChoice = new _AvatarSettingsAccessoryMode("PlayerChoice", 0);
  static CustomLimit = new _AvatarSettingsAccessoryMode("CustomLimit", 1);
  static get Items() {
    return [_AvatarSettingsAccessoryMode.PlayerChoice, _AvatarSettingsAccessoryMode.CustomLimit];
  }
  static FromValue(value) {
    return _AvatarSettingsAccessoryMode.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsAnimationClipsMode = class _AvatarSettingsAnimationClipsMode extends EnumItem {
  static PlayerChoice = new _AvatarSettingsAnimationClipsMode("PlayerChoice", 0);
  static CustomClips = new _AvatarSettingsAnimationClipsMode("CustomClips", 1);
  static get Items() {
    return [_AvatarSettingsAnimationClipsMode.PlayerChoice, _AvatarSettingsAnimationClipsMode.CustomClips];
  }
  static FromValue(value) {
    return _AvatarSettingsAnimationClipsMode.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsAnimationPacksMode = class _AvatarSettingsAnimationPacksMode extends EnumItem {
  static PlayerChoice = new _AvatarSettingsAnimationPacksMode("PlayerChoice", 0);
  static StandardR15 = new _AvatarSettingsAnimationPacksMode("StandardR15", 1);
  static StandardR6 = new _AvatarSettingsAnimationPacksMode("StandardR6", 2);
  static get Items() {
    return [_AvatarSettingsAnimationPacksMode.PlayerChoice, _AvatarSettingsAnimationPacksMode.StandardR15, _AvatarSettingsAnimationPacksMode.StandardR6];
  }
  static FromValue(value) {
    return _AvatarSettingsAnimationPacksMode.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsAppearanceMode = class _AvatarSettingsAppearanceMode extends EnumItem {
  static PlayerChoice = new _AvatarSettingsAppearanceMode("PlayerChoice", 0);
  static CustomParts = new _AvatarSettingsAppearanceMode("CustomParts", 1);
  static CustomBody = new _AvatarSettingsAppearanceMode("CustomBody", 2);
  static get Items() {
    return [_AvatarSettingsAppearanceMode.PlayerChoice, _AvatarSettingsAppearanceMode.CustomParts, _AvatarSettingsAppearanceMode.CustomBody];
  }
  static FromValue(value) {
    return _AvatarSettingsAppearanceMode.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsBuildMode = class _AvatarSettingsBuildMode extends EnumItem {
  static PlayerChoice = new _AvatarSettingsBuildMode("PlayerChoice", 0);
  static CustomBuild = new _AvatarSettingsBuildMode("CustomBuild", 1);
  static get Items() {
    return [_AvatarSettingsBuildMode.PlayerChoice, _AvatarSettingsBuildMode.CustomBuild];
  }
  static FromValue(value) {
    return _AvatarSettingsBuildMode.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsClothingMode = class _AvatarSettingsClothingMode extends EnumItem {
  static PlayerChoice = new _AvatarSettingsClothingMode("PlayerChoice", 0);
  static CustomLimit = new _AvatarSettingsClothingMode("CustomLimit", 1);
  static get Items() {
    return [_AvatarSettingsClothingMode.PlayerChoice, _AvatarSettingsClothingMode.CustomLimit];
  }
  static FromValue(value) {
    return _AvatarSettingsClothingMode.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsCollisionMode = class _AvatarSettingsCollisionMode extends EnumItem {
  static Default = new _AvatarSettingsCollisionMode("Default", 0);
  static SingleCollider = new _AvatarSettingsCollisionMode("SingleCollider", 1);
  static Legacy = new _AvatarSettingsCollisionMode("Legacy", 2);
  static get Items() {
    return [_AvatarSettingsCollisionMode.Default, _AvatarSettingsCollisionMode.SingleCollider, _AvatarSettingsCollisionMode.Legacy];
  }
  static FromValue(value) {
    return _AvatarSettingsCollisionMode.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsCustomAccessoryMode = class _AvatarSettingsCustomAccessoryMode extends EnumItem {
  static PlayerChoice = new _AvatarSettingsCustomAccessoryMode("PlayerChoice", 0);
  static CustomAccessories = new _AvatarSettingsCustomAccessoryMode("CustomAccessories", 1);
  static get Items() {
    return [_AvatarSettingsCustomAccessoryMode.PlayerChoice, _AvatarSettingsCustomAccessoryMode.CustomAccessories];
  }
  static FromValue(value) {
    return _AvatarSettingsCustomAccessoryMode.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsCustomBodyType = class _AvatarSettingsCustomBodyType extends EnumItem {
  static AvatarReference = new _AvatarSettingsCustomBodyType("AvatarReference", 0);
  static BundleId = new _AvatarSettingsCustomBodyType("BundleId", 1);
  static get Items() {
    return [_AvatarSettingsCustomBodyType.AvatarReference, _AvatarSettingsCustomBodyType.BundleId];
  }
  static FromValue(value) {
    return _AvatarSettingsCustomBodyType.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsCustomClothingMode = class _AvatarSettingsCustomClothingMode extends EnumItem {
  static PlayerChoice = new _AvatarSettingsCustomClothingMode("PlayerChoice", 0);
  static CustomClothing = new _AvatarSettingsCustomClothingMode("CustomClothing", 1);
  static get Items() {
    return [_AvatarSettingsCustomClothingMode.PlayerChoice, _AvatarSettingsCustomClothingMode.CustomClothing];
  }
  static FromValue(value) {
    return _AvatarSettingsCustomClothingMode.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsHitAndTouchDetectionMode = class _AvatarSettingsHitAndTouchDetectionMode extends EnumItem {
  static UseParts = new _AvatarSettingsHitAndTouchDetectionMode("UseParts", 0);
  static UseCollider = new _AvatarSettingsHitAndTouchDetectionMode("UseCollider", 1);
  static get Items() {
    return [_AvatarSettingsHitAndTouchDetectionMode.UseParts, _AvatarSettingsHitAndTouchDetectionMode.UseCollider];
  }
  static FromValue(value) {
    return _AvatarSettingsHitAndTouchDetectionMode.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsLegacyCollisionMode = class _AvatarSettingsLegacyCollisionMode extends EnumItem {
  static R6Colliders = new _AvatarSettingsLegacyCollisionMode("R6Colliders", 0);
  static InnerBoxColliders = new _AvatarSettingsLegacyCollisionMode("InnerBoxColliders", 1);
  static get Items() {
    return [_AvatarSettingsLegacyCollisionMode.R6Colliders, _AvatarSettingsLegacyCollisionMode.InnerBoxColliders];
  }
  static FromValue(value) {
    return _AvatarSettingsLegacyCollisionMode.Items.find((item) => item._value === value);
  }
};
var AvatarSettingsScaleMode = class _AvatarSettingsScaleMode extends EnumItem {
  static PlayerChoice = new _AvatarSettingsScaleMode("PlayerChoice", 0);
  static CustomScale = new _AvatarSettingsScaleMode("CustomScale", 1);
  static get Items() {
    return [_AvatarSettingsScaleMode.PlayerChoice, _AvatarSettingsScaleMode.CustomScale];
  }
  static FromValue(value) {
    return _AvatarSettingsScaleMode.Items.find((item) => item._value === value);
  }
};
var AvatarUnificationMode = class _AvatarUnificationMode extends EnumItem {
  static Default = new _AvatarUnificationMode("Default", 0);
  static Disabled = new _AvatarUnificationMode("Disabled", 1);
  static Enabled = new _AvatarUnificationMode("Enabled", 2);
  static get Items() {
    return [_AvatarUnificationMode.Default, _AvatarUnificationMode.Disabled, _AvatarUnificationMode.Enabled];
  }
  static FromValue(value) {
    return _AvatarUnificationMode.Items.find((item) => item._value === value);
  }
};
var BinType = class _BinType extends EnumItem {
  static Script = new _BinType("Script", 0);
  static GameTool = new _BinType("GameTool", 1);
  static Grab = new _BinType("Grab", 2);
  static Clone = new _BinType("Clone", 3);
  static Hammer = new _BinType("Hammer", 4);
  static get Items() {
    return [_BinType.Script, _BinType.GameTool, _BinType.Grab, _BinType.Clone, _BinType.Hammer];
  }
  static FromValue(value) {
    return _BinType.Items.find((item) => item._value === value);
  }
};
var BodyPart = class _BodyPart extends EnumItem {
  static Head = new _BodyPart("Head", 0);
  static Torso = new _BodyPart("Torso", 1);
  static LeftArm = new _BodyPart("LeftArm", 2);
  static RightArm = new _BodyPart("RightArm", 3);
  static LeftLeg = new _BodyPart("LeftLeg", 4);
  static RightLeg = new _BodyPart("RightLeg", 5);
  static get Items() {
    return [_BodyPart.Head, _BodyPart.Torso, _BodyPart.LeftArm, _BodyPart.RightArm, _BodyPart.LeftLeg, _BodyPart.RightLeg];
  }
  static FromValue(value) {
    return _BodyPart.Items.find((item) => item._value === value);
  }
};
var BorderMode = class _BorderMode extends EnumItem {
  static Outline = new _BorderMode("Outline", 0);
  static Middle = new _BorderMode("Middle", 1);
  static Inset = new _BorderMode("Inset", 2);
  static get Items() {
    return [_BorderMode.Outline, _BorderMode.Middle, _BorderMode.Inset];
  }
  static FromValue(value) {
    return _BorderMode.Items.find((item) => item._value === value);
  }
};
var ButtonStyle = class _ButtonStyle extends EnumItem {
  static Custom = new _ButtonStyle("Custom", 0);
  static RobloxButtonDefault = new _ButtonStyle("RobloxButtonDefault", 1);
  static RobloxButton = new _ButtonStyle("RobloxButton", 2);
  static RobloxRoundButton = new _ButtonStyle("RobloxRoundButton", 3);
  static RobloxRoundDefaultButton = new _ButtonStyle("RobloxRoundDefaultButton", 4);
  static RobloxRoundDropdownButton = new _ButtonStyle("RobloxRoundDropdownButton", 5);
  static get Items() {
    return [_ButtonStyle.Custom, _ButtonStyle.RobloxButtonDefault, _ButtonStyle.RobloxButton, _ButtonStyle.RobloxRoundButton, _ButtonStyle.RobloxRoundDefaultButton, _ButtonStyle.RobloxRoundDropdownButton];
  }
  static FromValue(value) {
    return _ButtonStyle.Items.find((item) => item._value === value);
  }
};
var CameraMode = class _CameraMode extends EnumItem {
  static Classic = new _CameraMode("Classic", 0);
  static LockFirstPerson = new _CameraMode("LockFirstPerson", 1);
  static get Items() {
    return [_CameraMode.Classic, _CameraMode.LockFirstPerson];
  }
  static FromValue(value) {
    return _CameraMode.Items.find((item) => item._value === value);
  }
};
var CameraType = class _CameraType extends EnumItem {
  static Fixed = new _CameraType("Fixed", 0);
  static Attach = new _CameraType("Attach", 1);
  static Watch = new _CameraType("Watch", 2);
  static Track = new _CameraType("Track", 3);
  static Follow = new _CameraType("Follow", 4);
  static Custom = new _CameraType("Custom", 5);
  static Scriptable = new _CameraType("Scriptable", 6);
  static Orbital = new _CameraType("Orbital", 7);
  static get Items() {
    return [_CameraType.Fixed, _CameraType.Attach, _CameraType.Watch, _CameraType.Track, _CameraType.Follow, _CameraType.Custom, _CameraType.Scriptable, _CameraType.Orbital];
  }
  static FromValue(value) {
    return _CameraType.Items.find((item) => item._value === value);
  }
};
var CharacterControlMode = class _CharacterControlMode extends EnumItem {
  static Default = new _CharacterControlMode("Default", 0);
  static Legacy = new _CharacterControlMode("Legacy", 1);
  static NoCharacterController = new _CharacterControlMode("NoCharacterController", 2);
  static LuaCharacterController = new _CharacterControlMode("LuaCharacterController", 3);
  static get Items() {
    return [_CharacterControlMode.Default, _CharacterControlMode.Legacy, _CharacterControlMode.NoCharacterController, _CharacterControlMode.LuaCharacterController];
  }
  static FromValue(value) {
    return _CharacterControlMode.Items.find((item) => item._value === value);
  }
};
var ChatVersion = class _ChatVersion extends EnumItem {
  static LegacyChatService = new _ChatVersion("LegacyChatService", 0);
  static TextChatService = new _ChatVersion("TextChatService", 1);
  static get Items() {
    return [_ChatVersion.LegacyChatService, _ChatVersion.TextChatService];
  }
  static FromValue(value) {
    return _ChatVersion.Items.find((item) => item._value === value);
  }
};
var ClientAnimatorThrottlingMode = class _ClientAnimatorThrottlingMode extends EnumItem {
  static Default = new _ClientAnimatorThrottlingMode("Default", 0);
  static Disabled = new _ClientAnimatorThrottlingMode("Disabled", 1);
  static Enabled = new _ClientAnimatorThrottlingMode("Enabled", 2);
  static get Items() {
    return [_ClientAnimatorThrottlingMode.Default, _ClientAnimatorThrottlingMode.Disabled, _ClientAnimatorThrottlingMode.Enabled];
  }
  static FromValue(value) {
    return _ClientAnimatorThrottlingMode.Items.find((item) => item._value === value);
  }
};
var DevCameraOcclusionMode = class _DevCameraOcclusionMode extends EnumItem {
  static Zoom = new _DevCameraOcclusionMode("Zoom", 0);
  static Invisicam = new _DevCameraOcclusionMode("Invisicam", 1);
  static get Items() {
    return [_DevCameraOcclusionMode.Zoom, _DevCameraOcclusionMode.Invisicam];
  }
  static FromValue(value) {
    return _DevCameraOcclusionMode.Items.find((item) => item._value === value);
  }
};
var DevComputerCameraMovementMode = class _DevComputerCameraMovementMode extends EnumItem {
  static UserChoice = new _DevComputerCameraMovementMode("UserChoice", 0);
  static Classic = new _DevComputerCameraMovementMode("Classic", 1);
  static Follow = new _DevComputerCameraMovementMode("Follow", 2);
  static Orbital = new _DevComputerCameraMovementMode("Orbital", 3);
  static CameraToggle = new _DevComputerCameraMovementMode("CameraToggle", 4);
  static get Items() {
    return [_DevComputerCameraMovementMode.UserChoice, _DevComputerCameraMovementMode.Classic, _DevComputerCameraMovementMode.Follow, _DevComputerCameraMovementMode.Orbital, _DevComputerCameraMovementMode.CameraToggle];
  }
  static FromValue(value) {
    return _DevComputerCameraMovementMode.Items.find((item) => item._value === value);
  }
};
var DevComputerMovementMode = class _DevComputerMovementMode extends EnumItem {
  static UserChoice = new _DevComputerMovementMode("UserChoice", 0);
  static KeyboardMouse = new _DevComputerMovementMode("KeyboardMouse", 1);
  static ClickToMove = new _DevComputerMovementMode("ClickToMove", 2);
  static Scriptable = new _DevComputerMovementMode("Scriptable", 3);
  static get Items() {
    return [_DevComputerMovementMode.UserChoice, _DevComputerMovementMode.KeyboardMouse, _DevComputerMovementMode.ClickToMove, _DevComputerMovementMode.Scriptable];
  }
  static FromValue(value) {
    return _DevComputerMovementMode.Items.find((item) => item._value === value);
  }
};
var DevTouchCameraMovementMode = class _DevTouchCameraMovementMode extends EnumItem {
  static UserChoice = new _DevTouchCameraMovementMode("UserChoice", 0);
  static Classic = new _DevTouchCameraMovementMode("Classic", 1);
  static Follow = new _DevTouchCameraMovementMode("Follow", 2);
  static Orbital = new _DevTouchCameraMovementMode("Orbital", 3);
  static get Items() {
    return [_DevTouchCameraMovementMode.UserChoice, _DevTouchCameraMovementMode.Classic, _DevTouchCameraMovementMode.Follow, _DevTouchCameraMovementMode.Orbital];
  }
  static FromValue(value) {
    return _DevTouchCameraMovementMode.Items.find((item) => item._value === value);
  }
};
var DevTouchMovementMode = class _DevTouchMovementMode extends EnumItem {
  static UserChoice = new _DevTouchMovementMode("UserChoice", 0);
  static Thumbstick = new _DevTouchMovementMode("Thumbstick", 1);
  static DPad = new _DevTouchMovementMode("DPad", 2);
  static Thumbpad = new _DevTouchMovementMode("Thumbpad", 3);
  static ClickToMove = new _DevTouchMovementMode("ClickToMove", 4);
  static Scriptable = new _DevTouchMovementMode("Scriptable", 5);
  static DynamicThumbstick = new _DevTouchMovementMode("DynamicThumbstick", 6);
  static get Items() {
    return [_DevTouchMovementMode.UserChoice, _DevTouchMovementMode.Thumbstick, _DevTouchMovementMode.DPad, _DevTouchMovementMode.Thumbpad, _DevTouchMovementMode.ClickToMove, _DevTouchMovementMode.Scriptable, _DevTouchMovementMode.DynamicThumbstick];
  }
  static FromValue(value) {
    return _DevTouchMovementMode.Items.find((item) => item._value === value);
  }
};
var DialogBehaviorType = class _DialogBehaviorType extends EnumItem {
  static SinglePlayer = new _DialogBehaviorType("SinglePlayer", 0);
  static MultiplePlayers = new _DialogBehaviorType("MultiplePlayers", 1);
  static get Items() {
    return [_DialogBehaviorType.SinglePlayer, _DialogBehaviorType.MultiplePlayers];
  }
  static FromValue(value) {
    return _DialogBehaviorType.Items.find((item) => item._value === value);
  }
};
var DialogPurpose = class _DialogPurpose extends EnumItem {
  static Quest = new _DialogPurpose("Quest", 0);
  static Help = new _DialogPurpose("Help", 1);
  static Shop = new _DialogPurpose("Shop", 2);
  static get Items() {
    return [_DialogPurpose.Quest, _DialogPurpose.Help, _DialogPurpose.Shop];
  }
  static FromValue(value) {
    return _DialogPurpose.Items.find((item) => item._value === value);
  }
};
var DialogTone = class _DialogTone extends EnumItem {
  static Neutral = new _DialogTone("Neutral", 0);
  static Friendly = new _DialogTone("Friendly", 1);
  static Enemy = new _DialogTone("Enemy", 2);
  static get Items() {
    return [_DialogTone.Neutral, _DialogTone.Friendly, _DialogTone.Enemy];
  }
  static FromValue(value) {
    return _DialogTone.Items.find((item) => item._value === value);
  }
};
var DominantAxis = class _DominantAxis extends EnumItem {
  static Width = new _DominantAxis("Width", 0);
  static Height = new _DominantAxis("Height", 1);
  static get Items() {
    return [_DominantAxis.Width, _DominantAxis.Height];
  }
  static FromValue(value) {
    return _DominantAxis.Items.find((item) => item._value === value);
  }
};
var DragDetectorDragStyle = class _DragDetectorDragStyle extends EnumItem {
  static TranslateLine = new _DragDetectorDragStyle("TranslateLine", 0);
  static TranslatePlane = new _DragDetectorDragStyle("TranslatePlane", 1);
  static TranslatePlaneOrLine = new _DragDetectorDragStyle("TranslatePlaneOrLine", 2);
  static TranslateLineOrPlane = new _DragDetectorDragStyle("TranslateLineOrPlane", 3);
  static TranslateViewPlane = new _DragDetectorDragStyle("TranslateViewPlane", 4);
  static RotateAxis = new _DragDetectorDragStyle("RotateAxis", 5);
  static RotateTrackball = new _DragDetectorDragStyle("RotateTrackball", 6);
  static Scriptable = new _DragDetectorDragStyle("Scriptable", 7);
  static BestForDevice = new _DragDetectorDragStyle("BestForDevice", 8);
  static get Items() {
    return [_DragDetectorDragStyle.TranslateLine, _DragDetectorDragStyle.TranslatePlane, _DragDetectorDragStyle.TranslatePlaneOrLine, _DragDetectorDragStyle.TranslateLineOrPlane, _DragDetectorDragStyle.TranslateViewPlane, _DragDetectorDragStyle.RotateAxis, _DragDetectorDragStyle.RotateTrackball, _DragDetectorDragStyle.Scriptable, _DragDetectorDragStyle.BestForDevice];
  }
  static FromValue(value) {
    return _DragDetectorDragStyle.Items.find((item) => item._value === value);
  }
};
var DragDetectorPermissionPolicy = class _DragDetectorPermissionPolicy extends EnumItem {
  static Nobody = new _DragDetectorPermissionPolicy("Nobody", 0);
  static Everybody = new _DragDetectorPermissionPolicy("Everybody", 1);
  static Scriptable = new _DragDetectorPermissionPolicy("Scriptable", 2);
  static get Items() {
    return [_DragDetectorPermissionPolicy.Nobody, _DragDetectorPermissionPolicy.Everybody, _DragDetectorPermissionPolicy.Scriptable];
  }
  static FromValue(value) {
    return _DragDetectorPermissionPolicy.Items.find((item) => item._value === value);
  }
};
var DragDetectorResponseStyle = class _DragDetectorResponseStyle extends EnumItem {
  static Geometric = new _DragDetectorResponseStyle("Geometric", 0);
  static Physical = new _DragDetectorResponseStyle("Physical", 1);
  static Custom = new _DragDetectorResponseStyle("Custom", 2);
  static get Items() {
    return [_DragDetectorResponseStyle.Geometric, _DragDetectorResponseStyle.Physical, _DragDetectorResponseStyle.Custom];
  }
  static FromValue(value) {
    return _DragDetectorResponseStyle.Items.find((item) => item._value === value);
  }
};
var EasingDirection = class _EasingDirection extends EnumItem {
  static In = new _EasingDirection("In", 0);
  static Out = new _EasingDirection("Out", 1);
  static InOut = new _EasingDirection("InOut", 2);
  static get Items() {
    return [_EasingDirection.In, _EasingDirection.Out, _EasingDirection.InOut];
  }
  static FromValue(value) {
    return _EasingDirection.Items.find((item) => item._value === value);
  }
};
var EasingStyle = class _EasingStyle extends EnumItem {
  static Linear = new _EasingStyle("Linear", 0);
  static Sine = new _EasingStyle("Sine", 1);
  static Back = new _EasingStyle("Back", 2);
  static Quad = new _EasingStyle("Quad", 3);
  static Quart = new _EasingStyle("Quart", 4);
  static Quint = new _EasingStyle("Quint", 5);
  static Bounce = new _EasingStyle("Bounce", 6);
  static Elastic = new _EasingStyle("Elastic", 7);
  static Exponential = new _EasingStyle("Exponential", 8);
  static Circular = new _EasingStyle("Circular", 9);
  static Cubic = new _EasingStyle("Cubic", 10);
  static get Items() {
    return [_EasingStyle.Linear, _EasingStyle.Sine, _EasingStyle.Back, _EasingStyle.Quad, _EasingStyle.Quart, _EasingStyle.Quint, _EasingStyle.Bounce, _EasingStyle.Elastic, _EasingStyle.Exponential, _EasingStyle.Circular, _EasingStyle.Cubic];
  }
  static FromValue(value) {
    return _EasingStyle.Items.find((item) => item._value === value);
  }
};
var ElasticBehavior = class _ElasticBehavior extends EnumItem {
  static WhenScrollable = new _ElasticBehavior("WhenScrollable", 0);
  static Always = new _ElasticBehavior("Always", 1);
  static Never = new _ElasticBehavior("Never", 2);
  static get Items() {
    return [_ElasticBehavior.WhenScrollable, _ElasticBehavior.Always, _ElasticBehavior.Never];
  }
  static FromValue(value) {
    return _ElasticBehavior.Items.find((item) => item._value === value);
  }
};
var ExplosionType = class _ExplosionType extends EnumItem {
  static NoCraters = new _ExplosionType("NoCraters", 0);
  static Craters = new _ExplosionType("Craters", 1);
  static get Items() {
    return [_ExplosionType.NoCraters, _ExplosionType.Craters];
  }
  static FromValue(value) {
    return _ExplosionType.Items.find((item) => item._value === value);
  }
};
var FieldOfViewMode = class _FieldOfViewMode extends EnumItem {
  static Vertical = new _FieldOfViewMode("Vertical", 0);
  static Diagonal = new _FieldOfViewMode("Diagonal", 1);
  static MaxAxis = new _FieldOfViewMode("MaxAxis", 2);
  static get Items() {
    return [_FieldOfViewMode.Vertical, _FieldOfViewMode.Diagonal, _FieldOfViewMode.MaxAxis];
  }
  static FromValue(value) {
    return _FieldOfViewMode.Items.find((item) => item._value === value);
  }
};
var FillDirection = class _FillDirection extends EnumItem {
  static Horizontal = new _FillDirection("Horizontal", 0);
  static Vertical = new _FillDirection("Vertical", 1);
  static get Items() {
    return [_FillDirection.Horizontal, _FillDirection.Vertical];
  }
  static FromValue(value) {
    return _FillDirection.Items.find((item) => item._value === value);
  }
};
var FluidFidelity = class _FluidFidelity extends EnumItem {
  static Automatic = new _FluidFidelity("Automatic", 0);
  static UseCollisionGeometry = new _FluidFidelity("UseCollisionGeometry", 1);
  static UsePreciseGeometry = new _FluidFidelity("UsePreciseGeometry", 2);
  static get Items() {
    return [_FluidFidelity.Automatic, _FluidFidelity.UseCollisionGeometry, _FluidFidelity.UsePreciseGeometry];
  }
  static FromValue(value) {
    return _FluidFidelity.Items.find((item) => item._value === value);
  }
};
var FluidForces = class _FluidForces extends EnumItem {
  static Default = new _FluidForces("Default", 0);
  static Experimental = new _FluidForces("Experimental", 1);
  static get Items() {
    return [_FluidForces.Default, _FluidForces.Experimental];
  }
  static FromValue(value) {
    return _FluidForces.Items.find((item) => item._value === value);
  }
};
var Font = class _Font extends EnumItem {
  static Legacy = new _Font("Legacy", 0);
  static Arial = new _Font("Arial", 1);
  static ArialBold = new _Font("ArialBold", 2);
  static SourceSans = new _Font("SourceSans", 3);
  static SourceSansBold = new _Font("SourceSansBold", 4);
  static SourceSansLight = new _Font("SourceSansLight", 5);
  static SourceSansItalic = new _Font("SourceSansItalic", 6);
  static Bodoni = new _Font("Bodoni", 7);
  static Garamond = new _Font("Garamond", 8);
  static Cartoon = new _Font("Cartoon", 9);
  static Code = new _Font("Code", 10);
  static Highway = new _Font("Highway", 11);
  static SciFi = new _Font("SciFi", 12);
  static Arcade = new _Font("Arcade", 13);
  static Fantasy = new _Font("Fantasy", 14);
  static Antique = new _Font("Antique", 15);
  static SourceSansSemibold = new _Font("SourceSansSemibold", 16);
  static Gotham = new _Font("Gotham", 17);
  static GothamMedium = new _Font("GothamMedium", 18);
  static GothamBold = new _Font("GothamBold", 19);
  static GothamBlack = new _Font("GothamBlack", 20);
  static AmaticSC = new _Font("AmaticSC", 21);
  static Bangers = new _Font("Bangers", 22);
  static Creepster = new _Font("Creepster", 23);
  static DenkOne = new _Font("DenkOne", 24);
  static Fondamento = new _Font("Fondamento", 25);
  static FredokaOne = new _Font("FredokaOne", 26);
  static GrenzeGotisch = new _Font("GrenzeGotisch", 27);
  static IndieFlower = new _Font("IndieFlower", 28);
  static JosefinSans = new _Font("JosefinSans", 29);
  static Jura = new _Font("Jura", 30);
  static Kalam = new _Font("Kalam", 31);
  static LuckiestGuy = new _Font("LuckiestGuy", 32);
  static Merriweather = new _Font("Merriweather", 33);
  static Michroma = new _Font("Michroma", 34);
  static Nunito = new _Font("Nunito", 35);
  static Oswald = new _Font("Oswald", 36);
  static PatrickHand = new _Font("PatrickHand", 37);
  static PermanentMarker = new _Font("PermanentMarker", 38);
  static Roboto = new _Font("Roboto", 39);
  static RobotoCondensed = new _Font("RobotoCondensed", 40);
  static RobotoMono = new _Font("RobotoMono", 41);
  static Sarpanch = new _Font("Sarpanch", 42);
  static SpecialElite = new _Font("SpecialElite", 43);
  static TitilliumWeb = new _Font("TitilliumWeb", 44);
  static Ubuntu = new _Font("Ubuntu", 45);
  static BuilderSans = new _Font("BuilderSans", 46);
  static BuilderSansMedium = new _Font("BuilderSansMedium", 47);
  static BuilderSansBold = new _Font("BuilderSansBold", 48);
  static BuilderSansExtraBold = new _Font("BuilderSansExtraBold", 49);
  static Arimo = new _Font("Arimo", 50);
  static ArimoBold = new _Font("ArimoBold", 51);
  static Unknown = new _Font("Unknown", 100);
  static get Items() {
    return [_Font.Legacy, _Font.Arial, _Font.ArialBold, _Font.SourceSans, _Font.SourceSansBold, _Font.SourceSansLight, _Font.SourceSansItalic, _Font.Bodoni, _Font.Garamond, _Font.Cartoon, _Font.Code, _Font.Highway, _Font.SciFi, _Font.Arcade, _Font.Fantasy, _Font.Antique, _Font.SourceSansSemibold, _Font.Gotham, _Font.GothamMedium, _Font.GothamBold, _Font.GothamBlack, _Font.AmaticSC, _Font.Bangers, _Font.Creepster, _Font.DenkOne, _Font.Fondamento, _Font.FredokaOne, _Font.GrenzeGotisch, _Font.IndieFlower, _Font.JosefinSans, _Font.Jura, _Font.Kalam, _Font.LuckiestGuy, _Font.Merriweather, _Font.Michroma, _Font.Nunito, _Font.Oswald, _Font.PatrickHand, _Font.PermanentMarker, _Font.Roboto, _Font.RobotoCondensed, _Font.RobotoMono, _Font.Sarpanch, _Font.SpecialElite, _Font.TitilliumWeb, _Font.Ubuntu, _Font.BuilderSans, _Font.BuilderSansMedium, _Font.BuilderSansBold, _Font.BuilderSansExtraBold, _Font.Arimo, _Font.ArimoBold, _Font.Unknown];
  }
  static FromValue(value) {
    return _Font.Items.find((item) => item._value === value);
  }
};
var FontSize = class _FontSize extends EnumItem {
  static Size8 = new _FontSize("Size8", 0);
  static Size9 = new _FontSize("Size9", 1);
  static Size10 = new _FontSize("Size10", 2);
  static Size11 = new _FontSize("Size11", 3);
  static Size12 = new _FontSize("Size12", 4);
  static Size14 = new _FontSize("Size14", 5);
  static Size18 = new _FontSize("Size18", 6);
  static Size24 = new _FontSize("Size24", 7);
  static Size36 = new _FontSize("Size36", 8);
  static Size48 = new _FontSize("Size48", 9);
  static Size28 = new _FontSize("Size28", 10);
  static Size32 = new _FontSize("Size32", 11);
  static Size42 = new _FontSize("Size42", 12);
  static Size60 = new _FontSize("Size60", 13);
  static Size96 = new _FontSize("Size96", 14);
  static get Items() {
    return [_FontSize.Size8, _FontSize.Size9, _FontSize.Size10, _FontSize.Size11, _FontSize.Size12, _FontSize.Size14, _FontSize.Size18, _FontSize.Size24, _FontSize.Size36, _FontSize.Size48, _FontSize.Size28, _FontSize.Size32, _FontSize.Size42, _FontSize.Size60, _FontSize.Size96];
  }
  static FromValue(value) {
    return _FontSize.Items.find((item) => item._value === value);
  }
};
var ForceLimitMode = class _ForceLimitMode extends EnumItem {
  static Magnitude = new _ForceLimitMode("Magnitude", 0);
  static PerAxis = new _ForceLimitMode("PerAxis", 1);
  static get Items() {
    return [_ForceLimitMode.Magnitude, _ForceLimitMode.PerAxis];
  }
  static FromValue(value) {
    return _ForceLimitMode.Items.find((item) => item._value === value);
  }
};
var FormFactor = class _FormFactor extends EnumItem {
  static Symmetric = new _FormFactor("Symmetric", 0);
  static Brick = new _FormFactor("Brick", 1);
  static Plate = new _FormFactor("Plate", 2);
  static Custom = new _FormFactor("Custom", 3);
  static get Items() {
    return [_FormFactor.Symmetric, _FormFactor.Brick, _FormFactor.Plate, _FormFactor.Custom];
  }
  static FromValue(value) {
    return _FormFactor.Items.find((item) => item._value === value);
  }
};
var FrameStyle = class _FrameStyle extends EnumItem {
  static Custom = new _FrameStyle("Custom", 0);
  static ChatBlue = new _FrameStyle("ChatBlue", 1);
  static RobloxSquare = new _FrameStyle("RobloxSquare", 2);
  static RobloxRound = new _FrameStyle("RobloxRound", 3);
  static ChatGreen = new _FrameStyle("ChatGreen", 4);
  static ChatRed = new _FrameStyle("ChatRed", 5);
  static DropShadow = new _FrameStyle("DropShadow", 6);
  static get Items() {
    return [_FrameStyle.Custom, _FrameStyle.ChatBlue, _FrameStyle.RobloxSquare, _FrameStyle.RobloxRound, _FrameStyle.ChatGreen, _FrameStyle.ChatRed, _FrameStyle.DropShadow];
  }
  static FromValue(value) {
    return _FrameStyle.Items.find((item) => item._value === value);
  }
};
var FramerateManagerMode = class _FramerateManagerMode extends EnumItem {
  static Automatic = new _FramerateManagerMode("Automatic", 0);
  static On = new _FramerateManagerMode("On", 1);
  static Off = new _FramerateManagerMode("Off", 2);
  static get Items() {
    return [_FramerateManagerMode.Automatic, _FramerateManagerMode.On, _FramerateManagerMode.Off];
  }
  static FromValue(value) {
    return _FramerateManagerMode.Items.find((item) => item._value === value);
  }
};
var GameAvatarType = class _GameAvatarType extends EnumItem {
  static R6 = new _GameAvatarType("R6", 0);
  static R15 = new _GameAvatarType("R15", 1);
  static PlayerChoice = new _GameAvatarType("PlayerChoice", 2);
  static get Items() {
    return [_GameAvatarType.R6, _GameAvatarType.R15, _GameAvatarType.PlayerChoice];
  }
  static FromValue(value) {
    return _GameAvatarType.Items.find((item) => item._value === value);
  }
};
var GraphicsMode = class _GraphicsMode extends EnumItem {
  static Automatic = new _GraphicsMode("Automatic", 1);
  static Direct3D11 = new _GraphicsMode("Direct3D11", 2);
  static OpenGL = new _GraphicsMode("OpenGL", 4);
  static Metal = new _GraphicsMode("Metal", 5);
  static Vulkan = new _GraphicsMode("Vulkan", 6);
  static NoGraphics = new _GraphicsMode("NoGraphics", 9);
  static get Items() {
    return [_GraphicsMode.Automatic, _GraphicsMode.Direct3D11, _GraphicsMode.OpenGL, _GraphicsMode.Metal, _GraphicsMode.Vulkan, _GraphicsMode.NoGraphics];
  }
  static FromValue(value) {
    return _GraphicsMode.Items.find((item) => item._value === value);
  }
};
var HandlesStyle = class _HandlesStyle extends EnumItem {
  static Resize = new _HandlesStyle("Resize", 0);
  static Movement = new _HandlesStyle("Movement", 1);
  static get Items() {
    return [_HandlesStyle.Resize, _HandlesStyle.Movement];
  }
  static FromValue(value) {
    return _HandlesStyle.Items.find((item) => item._value === value);
  }
};
var HapticEffectType = class _HapticEffectType extends EnumItem {
  static Custom = new _HapticEffectType("Custom", 0);
  static UIHover = new _HapticEffectType("UIHover", 1);
  static UIClick = new _HapticEffectType("UIClick", 2);
  static UINotification = new _HapticEffectType("UINotification", 3);
  static GameplayExplosion = new _HapticEffectType("GameplayExplosion", 4);
  static GameplayCollision = new _HapticEffectType("GameplayCollision", 5);
  static get Items() {
    return [_HapticEffectType.Custom, _HapticEffectType.UIHover, _HapticEffectType.UIClick, _HapticEffectType.UINotification, _HapticEffectType.GameplayExplosion, _HapticEffectType.GameplayCollision];
  }
  static FromValue(value) {
    return _HapticEffectType.Items.find((item) => item._value === value);
  }
};
var HighlightDepthMode = class _HighlightDepthMode extends EnumItem {
  static AlwaysOnTop = new _HighlightDepthMode("AlwaysOnTop", 0);
  static Occluded = new _HighlightDepthMode("Occluded", 1);
  static get Items() {
    return [_HighlightDepthMode.AlwaysOnTop, _HighlightDepthMode.Occluded];
  }
  static FromValue(value) {
    return _HighlightDepthMode.Items.find((item) => item._value === value);
  }
};
var HorizontalAlignment = class _HorizontalAlignment extends EnumItem {
  static Center = new _HorizontalAlignment("Center", 0);
  static Left = new _HorizontalAlignment("Left", 1);
  static Right = new _HorizontalAlignment("Right", 2);
  static get Items() {
    return [_HorizontalAlignment.Center, _HorizontalAlignment.Left, _HorizontalAlignment.Right];
  }
  static FromValue(value) {
    return _HorizontalAlignment.Items.find((item) => item._value === value);
  }
};
var HumanoidCollisionType = class _HumanoidCollisionType extends EnumItem {
  static OuterBox = new _HumanoidCollisionType("OuterBox", 0);
  static InnerBox = new _HumanoidCollisionType("InnerBox", 1);
  static get Items() {
    return [_HumanoidCollisionType.OuterBox, _HumanoidCollisionType.InnerBox];
  }
  static FromValue(value) {
    return _HumanoidCollisionType.Items.find((item) => item._value === value);
  }
};
var HumanoidDisplayDistanceType = class _HumanoidDisplayDistanceType extends EnumItem {
  static Viewer = new _HumanoidDisplayDistanceType("Viewer", 0);
  static Subject = new _HumanoidDisplayDistanceType("Subject", 1);
  static None = new _HumanoidDisplayDistanceType("None", 2);
  static get Items() {
    return [_HumanoidDisplayDistanceType.Viewer, _HumanoidDisplayDistanceType.Subject, _HumanoidDisplayDistanceType.None];
  }
  static FromValue(value) {
    return _HumanoidDisplayDistanceType.Items.find((item) => item._value === value);
  }
};
var HumanoidHealthDisplayType = class _HumanoidHealthDisplayType extends EnumItem {
  static DisplayWhenDamaged = new _HumanoidHealthDisplayType("DisplayWhenDamaged", 0);
  static AlwaysOn = new _HumanoidHealthDisplayType("AlwaysOn", 1);
  static AlwaysOff = new _HumanoidHealthDisplayType("AlwaysOff", 2);
  static get Items() {
    return [_HumanoidHealthDisplayType.DisplayWhenDamaged, _HumanoidHealthDisplayType.AlwaysOn, _HumanoidHealthDisplayType.AlwaysOff];
  }
  static FromValue(value) {
    return _HumanoidHealthDisplayType.Items.find((item) => item._value === value);
  }
};
var HumanoidRigType = class _HumanoidRigType extends EnumItem {
  static R6 = new _HumanoidRigType("R6", 0);
  static R15 = new _HumanoidRigType("R15", 1);
  static get Items() {
    return [_HumanoidRigType.R6, _HumanoidRigType.R15];
  }
  static FromValue(value) {
    return _HumanoidRigType.Items.find((item) => item._value === value);
  }
};
var IKControlConstraintSupport = class _IKControlConstraintSupport extends EnumItem {
  static Default = new _IKControlConstraintSupport("Default", 0);
  static Disabled = new _IKControlConstraintSupport("Disabled", 1);
  static Enabled = new _IKControlConstraintSupport("Enabled", 2);
  static get Items() {
    return [_IKControlConstraintSupport.Default, _IKControlConstraintSupport.Disabled, _IKControlConstraintSupport.Enabled];
  }
  static FromValue(value) {
    return _IKControlConstraintSupport.Items.find((item) => item._value === value);
  }
};
var IKControlType = class _IKControlType extends EnumItem {
  static Transform = new _IKControlType("Transform", 0);
  static Position = new _IKControlType("Position", 1);
  static Rotation = new _IKControlType("Rotation", 2);
  static LookAt = new _IKControlType("LookAt", 3);
  static get Items() {
    return [_IKControlType.Transform, _IKControlType.Position, _IKControlType.Rotation, _IKControlType.LookAt];
  }
  static FromValue(value) {
    return _IKControlType.Items.find((item) => item._value === value);
  }
};
var InOut = class _InOut extends EnumItem {
  static Edge = new _InOut("Edge", 0);
  static Inset = new _InOut("Inset", 1);
  static Center = new _InOut("Center", 2);
  static get Items() {
    return [_InOut.Edge, _InOut.Inset, _InOut.Center];
  }
  static FromValue(value) {
    return _InOut.Items.find((item) => item._value === value);
  }
};
var InputActionType = class _InputActionType extends EnumItem {
  static Bool = new _InputActionType("Bool", 0);
  static Direction1D = new _InputActionType("Direction1D", 1);
  static Direction2D = new _InputActionType("Direction2D", 2);
  static get Items() {
    return [_InputActionType.Bool, _InputActionType.Direction1D, _InputActionType.Direction2D];
  }
  static FromValue(value) {
    return _InputActionType.Items.find((item) => item._value === value);
  }
};
var InputType = class _InputType extends EnumItem {
  static NoInput = new _InputType("NoInput", 0);
  static Constant = new _InputType("Constant", 12);
  static Sin = new _InputType("Sin", 13);
  static get Items() {
    return [_InputType.NoInput, _InputType.Constant, _InputType.Sin];
  }
  static FromValue(value) {
    return _InputType.Items.find((item) => item._value === value);
  }
};
var ItemLineAlignment = class _ItemLineAlignment extends EnumItem {
  static Automatic = new _ItemLineAlignment("Automatic", 0);
  static Start = new _ItemLineAlignment("Start", 1);
  static Center = new _ItemLineAlignment("Center", 2);
  static End = new _ItemLineAlignment("End", 3);
  static Stretch = new _ItemLineAlignment("Stretch", 4);
  static get Items() {
    return [_ItemLineAlignment.Automatic, _ItemLineAlignment.Start, _ItemLineAlignment.Center, _ItemLineAlignment.End, _ItemLineAlignment.Stretch];
  }
  static FromValue(value) {
    return _ItemLineAlignment.Items.find((item) => item._value === value);
  }
};
var KeyCode = class _KeyCode extends EnumItem {
  static Unknown = new _KeyCode("Unknown", 0);
  static Backspace = new _KeyCode("Backspace", 8);
  static Tab = new _KeyCode("Tab", 9);
  static Clear = new _KeyCode("Clear", 12);
  static Return = new _KeyCode("Return", 13);
  static Pause = new _KeyCode("Pause", 19);
  static Escape = new _KeyCode("Escape", 27);
  static Space = new _KeyCode("Space", 32);
  static QuotedDouble = new _KeyCode("QuotedDouble", 34);
  static Hash = new _KeyCode("Hash", 35);
  static Dollar = new _KeyCode("Dollar", 36);
  static Percent = new _KeyCode("Percent", 37);
  static Ampersand = new _KeyCode("Ampersand", 38);
  static Quote = new _KeyCode("Quote", 39);
  static LeftParenthesis = new _KeyCode("LeftParenthesis", 40);
  static RightParenthesis = new _KeyCode("RightParenthesis", 41);
  static Asterisk = new _KeyCode("Asterisk", 42);
  static Plus = new _KeyCode("Plus", 43);
  static Comma = new _KeyCode("Comma", 44);
  static Minus = new _KeyCode("Minus", 45);
  static Period = new _KeyCode("Period", 46);
  static Slash = new _KeyCode("Slash", 47);
  static Zero = new _KeyCode("Zero", 48);
  static One = new _KeyCode("One", 49);
  static Two = new _KeyCode("Two", 50);
  static Three = new _KeyCode("Three", 51);
  static Four = new _KeyCode("Four", 52);
  static Five = new _KeyCode("Five", 53);
  static Six = new _KeyCode("Six", 54);
  static Seven = new _KeyCode("Seven", 55);
  static Eight = new _KeyCode("Eight", 56);
  static Nine = new _KeyCode("Nine", 57);
  static Colon = new _KeyCode("Colon", 58);
  static Semicolon = new _KeyCode("Semicolon", 59);
  static LessThan = new _KeyCode("LessThan", 60);
  static Equals = new _KeyCode("Equals", 61);
  static GreaterThan = new _KeyCode("GreaterThan", 62);
  static Question = new _KeyCode("Question", 63);
  static At = new _KeyCode("At", 64);
  static LeftBracket = new _KeyCode("LeftBracket", 91);
  static BackSlash = new _KeyCode("BackSlash", 92);
  static RightBracket = new _KeyCode("RightBracket", 93);
  static Caret = new _KeyCode("Caret", 94);
  static Underscore = new _KeyCode("Underscore", 95);
  static Backquote = new _KeyCode("Backquote", 96);
  static A = new _KeyCode("A", 97);
  static B = new _KeyCode("B", 98);
  static C = new _KeyCode("C", 99);
  static D = new _KeyCode("D", 100);
  static E = new _KeyCode("E", 101);
  static F = new _KeyCode("F", 102);
  static G = new _KeyCode("G", 103);
  static H = new _KeyCode("H", 104);
  static I = new _KeyCode("I", 105);
  static J = new _KeyCode("J", 106);
  static K = new _KeyCode("K", 107);
  static L = new _KeyCode("L", 108);
  static M = new _KeyCode("M", 109);
  static N = new _KeyCode("N", 110);
  static O = new _KeyCode("O", 111);
  static P = new _KeyCode("P", 112);
  static Q = new _KeyCode("Q", 113);
  static R = new _KeyCode("R", 114);
  static S = new _KeyCode("S", 115);
  static T = new _KeyCode("T", 116);
  static U = new _KeyCode("U", 117);
  static V = new _KeyCode("V", 118);
  static W = new _KeyCode("W", 119);
  static X = new _KeyCode("X", 120);
  static Y = new _KeyCode("Y", 121);
  static Z = new _KeyCode("Z", 122);
  static LeftCurly = new _KeyCode("LeftCurly", 123);
  static Pipe = new _KeyCode("Pipe", 124);
  static RightCurly = new _KeyCode("RightCurly", 125);
  static Tilde = new _KeyCode("Tilde", 126);
  static Delete = new _KeyCode("Delete", 127);
  static KeypadZero = new _KeyCode("KeypadZero", 256);
  static KeypadOne = new _KeyCode("KeypadOne", 257);
  static KeypadTwo = new _KeyCode("KeypadTwo", 258);
  static KeypadThree = new _KeyCode("KeypadThree", 259);
  static KeypadFour = new _KeyCode("KeypadFour", 260);
  static KeypadFive = new _KeyCode("KeypadFive", 261);
  static KeypadSix = new _KeyCode("KeypadSix", 262);
  static KeypadSeven = new _KeyCode("KeypadSeven", 263);
  static KeypadEight = new _KeyCode("KeypadEight", 264);
  static KeypadNine = new _KeyCode("KeypadNine", 265);
  static KeypadPeriod = new _KeyCode("KeypadPeriod", 266);
  static KeypadDivide = new _KeyCode("KeypadDivide", 267);
  static KeypadMultiply = new _KeyCode("KeypadMultiply", 268);
  static KeypadMinus = new _KeyCode("KeypadMinus", 269);
  static KeypadPlus = new _KeyCode("KeypadPlus", 270);
  static KeypadEnter = new _KeyCode("KeypadEnter", 271);
  static KeypadEquals = new _KeyCode("KeypadEquals", 272);
  static Up = new _KeyCode("Up", 273);
  static Down = new _KeyCode("Down", 274);
  static Right = new _KeyCode("Right", 275);
  static Left = new _KeyCode("Left", 276);
  static Insert = new _KeyCode("Insert", 277);
  static Home = new _KeyCode("Home", 278);
  static End = new _KeyCode("End", 279);
  static PageUp = new _KeyCode("PageUp", 280);
  static PageDown = new _KeyCode("PageDown", 281);
  static F1 = new _KeyCode("F1", 282);
  static F2 = new _KeyCode("F2", 283);
  static F3 = new _KeyCode("F3", 284);
  static F4 = new _KeyCode("F4", 285);
  static F5 = new _KeyCode("F5", 286);
  static F6 = new _KeyCode("F6", 287);
  static F7 = new _KeyCode("F7", 288);
  static F8 = new _KeyCode("F8", 289);
  static F9 = new _KeyCode("F9", 290);
  static F10 = new _KeyCode("F10", 291);
  static F11 = new _KeyCode("F11", 292);
  static F12 = new _KeyCode("F12", 293);
  static F13 = new _KeyCode("F13", 294);
  static F14 = new _KeyCode("F14", 295);
  static F15 = new _KeyCode("F15", 296);
  static NumLock = new _KeyCode("NumLock", 300);
  static CapsLock = new _KeyCode("CapsLock", 301);
  static ScrollLock = new _KeyCode("ScrollLock", 302);
  static RightShift = new _KeyCode("RightShift", 303);
  static LeftShift = new _KeyCode("LeftShift", 304);
  static RightControl = new _KeyCode("RightControl", 305);
  static LeftControl = new _KeyCode("LeftControl", 306);
  static RightAlt = new _KeyCode("RightAlt", 307);
  static LeftAlt = new _KeyCode("LeftAlt", 308);
  static RightMeta = new _KeyCode("RightMeta", 309);
  static LeftMeta = new _KeyCode("LeftMeta", 310);
  static LeftSuper = new _KeyCode("LeftSuper", 311);
  static RightSuper = new _KeyCode("RightSuper", 312);
  static Mode = new _KeyCode("Mode", 313);
  static Compose = new _KeyCode("Compose", 314);
  static Help = new _KeyCode("Help", 315);
  static Print = new _KeyCode("Print", 316);
  static SysReq = new _KeyCode("SysReq", 317);
  static Break = new _KeyCode("Break", 318);
  static Menu = new _KeyCode("Menu", 319);
  static Power = new _KeyCode("Power", 320);
  static Euro = new _KeyCode("Euro", 321);
  static Undo = new _KeyCode("Undo", 322);
  static ButtonX = new _KeyCode("ButtonX", 1e3);
  static ButtonY = new _KeyCode("ButtonY", 1001);
  static ButtonA = new _KeyCode("ButtonA", 1002);
  static ButtonB = new _KeyCode("ButtonB", 1003);
  static ButtonR1 = new _KeyCode("ButtonR1", 1004);
  static ButtonL1 = new _KeyCode("ButtonL1", 1005);
  static ButtonR2 = new _KeyCode("ButtonR2", 1006);
  static ButtonL2 = new _KeyCode("ButtonL2", 1007);
  static ButtonR3 = new _KeyCode("ButtonR3", 1008);
  static ButtonL3 = new _KeyCode("ButtonL3", 1009);
  static ButtonStart = new _KeyCode("ButtonStart", 1010);
  static ButtonSelect = new _KeyCode("ButtonSelect", 1011);
  static DPadLeft = new _KeyCode("DPadLeft", 1012);
  static DPadRight = new _KeyCode("DPadRight", 1013);
  static DPadUp = new _KeyCode("DPadUp", 1014);
  static DPadDown = new _KeyCode("DPadDown", 1015);
  static Thumbstick1 = new _KeyCode("Thumbstick1", 1016);
  static Thumbstick2 = new _KeyCode("Thumbstick2", 1017);
  static World0 = new _KeyCode("World0", 160);
  static World1 = new _KeyCode("World1", 161);
  static World2 = new _KeyCode("World2", 162);
  static World3 = new _KeyCode("World3", 163);
  static World4 = new _KeyCode("World4", 164);
  static World5 = new _KeyCode("World5", 165);
  static World6 = new _KeyCode("World6", 166);
  static World7 = new _KeyCode("World7", 167);
  static World8 = new _KeyCode("World8", 168);
  static World9 = new _KeyCode("World9", 169);
  static World10 = new _KeyCode("World10", 170);
  static World11 = new _KeyCode("World11", 171);
  static World12 = new _KeyCode("World12", 172);
  static World13 = new _KeyCode("World13", 173);
  static World14 = new _KeyCode("World14", 174);
  static World15 = new _KeyCode("World15", 175);
  static World16 = new _KeyCode("World16", 176);
  static World17 = new _KeyCode("World17", 177);
  static World18 = new _KeyCode("World18", 178);
  static World19 = new _KeyCode("World19", 179);
  static World20 = new _KeyCode("World20", 180);
  static World21 = new _KeyCode("World21", 181);
  static World22 = new _KeyCode("World22", 182);
  static World23 = new _KeyCode("World23", 183);
  static World24 = new _KeyCode("World24", 184);
  static World25 = new _KeyCode("World25", 185);
  static World26 = new _KeyCode("World26", 186);
  static World27 = new _KeyCode("World27", 187);
  static World28 = new _KeyCode("World28", 188);
  static World29 = new _KeyCode("World29", 189);
  static World30 = new _KeyCode("World30", 190);
  static World31 = new _KeyCode("World31", 191);
  static World32 = new _KeyCode("World32", 192);
  static World33 = new _KeyCode("World33", 193);
  static World34 = new _KeyCode("World34", 194);
  static World35 = new _KeyCode("World35", 195);
  static World36 = new _KeyCode("World36", 196);
  static World37 = new _KeyCode("World37", 197);
  static World38 = new _KeyCode("World38", 198);
  static World39 = new _KeyCode("World39", 199);
  static World40 = new _KeyCode("World40", 200);
  static World41 = new _KeyCode("World41", 201);
  static World42 = new _KeyCode("World42", 202);
  static World43 = new _KeyCode("World43", 203);
  static World44 = new _KeyCode("World44", 204);
  static World45 = new _KeyCode("World45", 205);
  static World46 = new _KeyCode("World46", 206);
  static World47 = new _KeyCode("World47", 207);
  static World48 = new _KeyCode("World48", 208);
  static World49 = new _KeyCode("World49", 209);
  static World50 = new _KeyCode("World50", 210);
  static World51 = new _KeyCode("World51", 211);
  static World52 = new _KeyCode("World52", 212);
  static World53 = new _KeyCode("World53", 213);
  static World54 = new _KeyCode("World54", 214);
  static World55 = new _KeyCode("World55", 215);
  static World56 = new _KeyCode("World56", 216);
  static World57 = new _KeyCode("World57", 217);
  static World58 = new _KeyCode("World58", 218);
  static World59 = new _KeyCode("World59", 219);
  static World60 = new _KeyCode("World60", 220);
  static World61 = new _KeyCode("World61", 221);
  static World62 = new _KeyCode("World62", 222);
  static World63 = new _KeyCode("World63", 223);
  static World64 = new _KeyCode("World64", 224);
  static World65 = new _KeyCode("World65", 225);
  static World66 = new _KeyCode("World66", 226);
  static World67 = new _KeyCode("World67", 227);
  static World68 = new _KeyCode("World68", 228);
  static World69 = new _KeyCode("World69", 229);
  static World70 = new _KeyCode("World70", 230);
  static World71 = new _KeyCode("World71", 231);
  static World72 = new _KeyCode("World72", 232);
  static World73 = new _KeyCode("World73", 233);
  static World74 = new _KeyCode("World74", 234);
  static World75 = new _KeyCode("World75", 235);
  static World76 = new _KeyCode("World76", 236);
  static World77 = new _KeyCode("World77", 237);
  static World78 = new _KeyCode("World78", 238);
  static World79 = new _KeyCode("World79", 239);
  static World80 = new _KeyCode("World80", 240);
  static World81 = new _KeyCode("World81", 241);
  static World82 = new _KeyCode("World82", 242);
  static World83 = new _KeyCode("World83", 243);
  static World84 = new _KeyCode("World84", 244);
  static World85 = new _KeyCode("World85", 245);
  static World86 = new _KeyCode("World86", 246);
  static World87 = new _KeyCode("World87", 247);
  static World88 = new _KeyCode("World88", 248);
  static World89 = new _KeyCode("World89", 249);
  static World90 = new _KeyCode("World90", 250);
  static World91 = new _KeyCode("World91", 251);
  static World92 = new _KeyCode("World92", 252);
  static World93 = new _KeyCode("World93", 253);
  static World94 = new _KeyCode("World94", 254);
  static World95 = new _KeyCode("World95", 255);
  static MouseLeftButton = new _KeyCode("MouseLeftButton", 1018);
  static MouseRightButton = new _KeyCode("MouseRightButton", 1019);
  static MouseMiddleButton = new _KeyCode("MouseMiddleButton", 1020);
  static MouseBackButton = new _KeyCode("MouseBackButton", 1021);
  static MouseNoButton = new _KeyCode("MouseNoButton", 1022);
  static MouseX = new _KeyCode("MouseX", 1023);
  static MouseY = new _KeyCode("MouseY", 1024);
  static get Items() {
    return [_KeyCode.Unknown, _KeyCode.Backspace, _KeyCode.Tab, _KeyCode.Clear, _KeyCode.Return, _KeyCode.Pause, _KeyCode.Escape, _KeyCode.Space, _KeyCode.QuotedDouble, _KeyCode.Hash, _KeyCode.Dollar, _KeyCode.Percent, _KeyCode.Ampersand, _KeyCode.Quote, _KeyCode.LeftParenthesis, _KeyCode.RightParenthesis, _KeyCode.Asterisk, _KeyCode.Plus, _KeyCode.Comma, _KeyCode.Minus, _KeyCode.Period, _KeyCode.Slash, _KeyCode.Zero, _KeyCode.One, _KeyCode.Two, _KeyCode.Three, _KeyCode.Four, _KeyCode.Five, _KeyCode.Six, _KeyCode.Seven, _KeyCode.Eight, _KeyCode.Nine, _KeyCode.Colon, _KeyCode.Semicolon, _KeyCode.LessThan, _KeyCode.Equals, _KeyCode.GreaterThan, _KeyCode.Question, _KeyCode.At, _KeyCode.LeftBracket, _KeyCode.BackSlash, _KeyCode.RightBracket, _KeyCode.Caret, _KeyCode.Underscore, _KeyCode.Backquote, _KeyCode.A, _KeyCode.B, _KeyCode.C, _KeyCode.D, _KeyCode.E, _KeyCode.F, _KeyCode.G, _KeyCode.H, _KeyCode.I, _KeyCode.J, _KeyCode.K, _KeyCode.L, _KeyCode.M, _KeyCode.N, _KeyCode.O, _KeyCode.P, _KeyCode.Q, _KeyCode.R, _KeyCode.S, _KeyCode.T, _KeyCode.U, _KeyCode.V, _KeyCode.W, _KeyCode.X, _KeyCode.Y, _KeyCode.Z, _KeyCode.LeftCurly, _KeyCode.Pipe, _KeyCode.RightCurly, _KeyCode.Tilde, _KeyCode.Delete, _KeyCode.KeypadZero, _KeyCode.KeypadOne, _KeyCode.KeypadTwo, _KeyCode.KeypadThree, _KeyCode.KeypadFour, _KeyCode.KeypadFive, _KeyCode.KeypadSix, _KeyCode.KeypadSeven, _KeyCode.KeypadEight, _KeyCode.KeypadNine, _KeyCode.KeypadPeriod, _KeyCode.KeypadDivide, _KeyCode.KeypadMultiply, _KeyCode.KeypadMinus, _KeyCode.KeypadPlus, _KeyCode.KeypadEnter, _KeyCode.KeypadEquals, _KeyCode.Up, _KeyCode.Down, _KeyCode.Right, _KeyCode.Left, _KeyCode.Insert, _KeyCode.Home, _KeyCode.End, _KeyCode.PageUp, _KeyCode.PageDown, _KeyCode.F1, _KeyCode.F2, _KeyCode.F3, _KeyCode.F4, _KeyCode.F5, _KeyCode.F6, _KeyCode.F7, _KeyCode.F8, _KeyCode.F9, _KeyCode.F10, _KeyCode.F11, _KeyCode.F12, _KeyCode.F13, _KeyCode.F14, _KeyCode.F15, _KeyCode.NumLock, _KeyCode.CapsLock, _KeyCode.ScrollLock, _KeyCode.RightShift, _KeyCode.LeftShift, _KeyCode.RightControl, _KeyCode.LeftControl, _KeyCode.RightAlt, _KeyCode.LeftAlt, _KeyCode.RightMeta, _KeyCode.LeftMeta, _KeyCode.LeftSuper, _KeyCode.RightSuper, _KeyCode.Mode, _KeyCode.Compose, _KeyCode.Help, _KeyCode.Print, _KeyCode.SysReq, _KeyCode.Break, _KeyCode.Menu, _KeyCode.Power, _KeyCode.Euro, _KeyCode.Undo, _KeyCode.ButtonX, _KeyCode.ButtonY, _KeyCode.ButtonA, _KeyCode.ButtonB, _KeyCode.ButtonR1, _KeyCode.ButtonL1, _KeyCode.ButtonR2, _KeyCode.ButtonL2, _KeyCode.ButtonR3, _KeyCode.ButtonL3, _KeyCode.ButtonStart, _KeyCode.ButtonSelect, _KeyCode.DPadLeft, _KeyCode.DPadRight, _KeyCode.DPadUp, _KeyCode.DPadDown, _KeyCode.Thumbstick1, _KeyCode.Thumbstick2, _KeyCode.World0, _KeyCode.World1, _KeyCode.World2, _KeyCode.World3, _KeyCode.World4, _KeyCode.World5, _KeyCode.World6, _KeyCode.World7, _KeyCode.World8, _KeyCode.World9, _KeyCode.World10, _KeyCode.World11, _KeyCode.World12, _KeyCode.World13, _KeyCode.World14, _KeyCode.World15, _KeyCode.World16, _KeyCode.World17, _KeyCode.World18, _KeyCode.World19, _KeyCode.World20, _KeyCode.World21, _KeyCode.World22, _KeyCode.World23, _KeyCode.World24, _KeyCode.World25, _KeyCode.World26, _KeyCode.World27, _KeyCode.World28, _KeyCode.World29, _KeyCode.World30, _KeyCode.World31, _KeyCode.World32, _KeyCode.World33, _KeyCode.World34, _KeyCode.World35, _KeyCode.World36, _KeyCode.World37, _KeyCode.World38, _KeyCode.World39, _KeyCode.World40, _KeyCode.World41, _KeyCode.World42, _KeyCode.World43, _KeyCode.World44, _KeyCode.World45, _KeyCode.World46, _KeyCode.World47, _KeyCode.World48, _KeyCode.World49, _KeyCode.World50, _KeyCode.World51, _KeyCode.World52, _KeyCode.World53, _KeyCode.World54, _KeyCode.World55, _KeyCode.World56, _KeyCode.World57, _KeyCode.World58, _KeyCode.World59, _KeyCode.World60, _KeyCode.World61, _KeyCode.World62, _KeyCode.World63, _KeyCode.World64, _KeyCode.World65, _KeyCode.World66, _KeyCode.World67, _KeyCode.World68, _KeyCode.World69, _KeyCode.World70, _KeyCode.World71, _KeyCode.World72, _KeyCode.World73, _KeyCode.World74, _KeyCode.World75, _KeyCode.World76, _KeyCode.World77, _KeyCode.World78, _KeyCode.World79, _KeyCode.World80, _KeyCode.World81, _KeyCode.World82, _KeyCode.World83, _KeyCode.World84, _KeyCode.World85, _KeyCode.World86, _KeyCode.World87, _KeyCode.World88, _KeyCode.World89, _KeyCode.World90, _KeyCode.World91, _KeyCode.World92, _KeyCode.World93, _KeyCode.World94, _KeyCode.World95, _KeyCode.MouseLeftButton, _KeyCode.MouseRightButton, _KeyCode.MouseMiddleButton, _KeyCode.MouseBackButton, _KeyCode.MouseNoButton, _KeyCode.MouseX, _KeyCode.MouseY];
  }
  static FromValue(value) {
    return _KeyCode.Items.find((item) => item._value === value);
  }
};
var LeftRight = class _LeftRight extends EnumItem {
  static Left = new _LeftRight("Left", 0);
  static Center = new _LeftRight("Center", 1);
  static Right = new _LeftRight("Right", 2);
  static get Items() {
    return [_LeftRight.Left, _LeftRight.Center, _LeftRight.Right];
  }
  static FromValue(value) {
    return _LeftRight.Items.find((item) => item._value === value);
  }
};
var LightingStyle = class _LightingStyle extends EnumItem {
  static Realistic = new _LightingStyle("Realistic", 0);
  static Soft = new _LightingStyle("Soft", 1);
  static get Items() {
    return [_LightingStyle.Realistic, _LightingStyle.Soft];
  }
  static FromValue(value) {
    return _LightingStyle.Items.find((item) => item._value === value);
  }
};
var LineJoinMode = class _LineJoinMode extends EnumItem {
  static Round = new _LineJoinMode("Round", 0);
  static Bevel = new _LineJoinMode("Bevel", 1);
  static Miter = new _LineJoinMode("Miter", 2);
  static get Items() {
    return [_LineJoinMode.Round, _LineJoinMode.Bevel, _LineJoinMode.Miter];
  }
  static FromValue(value) {
    return _LineJoinMode.Items.find((item) => item._value === value);
  }
};
var ListenerLocation = class _ListenerLocation extends EnumItem {
  static Default = new _ListenerLocation("Default", 0);
  static None = new _ListenerLocation("None", 1);
  static Character = new _ListenerLocation("Character", 2);
  static Camera = new _ListenerLocation("Camera", 3);
  static get Items() {
    return [_ListenerLocation.Default, _ListenerLocation.None, _ListenerLocation.Character, _ListenerLocation.Camera];
  }
  static FromValue(value) {
    return _ListenerLocation.Items.find((item) => item._value === value);
  }
};
var LoadCharacterLayeredClothing = class _LoadCharacterLayeredClothing extends EnumItem {
  static Default = new _LoadCharacterLayeredClothing("Default", 0);
  static Disabled = new _LoadCharacterLayeredClothing("Disabled", 1);
  static Enabled = new _LoadCharacterLayeredClothing("Enabled", 2);
  static get Items() {
    return [_LoadCharacterLayeredClothing.Default, _LoadCharacterLayeredClothing.Disabled, _LoadCharacterLayeredClothing.Enabled];
  }
  static FromValue(value) {
    return _LoadCharacterLayeredClothing.Items.find((item) => item._value === value);
  }
};
var LoadDynamicHeads = class _LoadDynamicHeads extends EnumItem {
  static Default = new _LoadDynamicHeads("Default", 0);
  static Disabled = new _LoadDynamicHeads("Disabled", 1);
  static Enabled = new _LoadDynamicHeads("Enabled", 2);
  static get Items() {
    return [_LoadDynamicHeads.Default, _LoadDynamicHeads.Disabled, _LoadDynamicHeads.Enabled];
  }
  static FromValue(value) {
    return _LoadDynamicHeads.Items.find((item) => item._value === value);
  }
};
var Material = class _Material extends EnumItem {
  static Plastic = new _Material("Plastic", 256);
  static SmoothPlastic = new _Material("SmoothPlastic", 272);
  static Neon = new _Material("Neon", 288);
  static Wood = new _Material("Wood", 512);
  static WoodPlanks = new _Material("WoodPlanks", 528);
  static Marble = new _Material("Marble", 784);
  static Slate = new _Material("Slate", 800);
  static Concrete = new _Material("Concrete", 816);
  static Granite = new _Material("Granite", 832);
  static Brick = new _Material("Brick", 848);
  static Pebble = new _Material("Pebble", 864);
  static Cobblestone = new _Material("Cobblestone", 880);
  static Rock = new _Material("Rock", 896);
  static Sandstone = new _Material("Sandstone", 912);
  static Basalt = new _Material("Basalt", 788);
  static CrackedLava = new _Material("CrackedLava", 804);
  static Limestone = new _Material("Limestone", 820);
  static Pavement = new _Material("Pavement", 836);
  static CorrodedMetal = new _Material("CorrodedMetal", 1040);
  static DiamondPlate = new _Material("DiamondPlate", 1056);
  static Foil = new _Material("Foil", 1072);
  static Metal = new _Material("Metal", 1088);
  static Grass = new _Material("Grass", 1280);
  static LeafyGrass = new _Material("LeafyGrass", 1284);
  static Sand = new _Material("Sand", 1296);
  static Fabric = new _Material("Fabric", 1312);
  static Snow = new _Material("Snow", 1328);
  static Mud = new _Material("Mud", 1344);
  static Ground = new _Material("Ground", 1360);
  static Asphalt = new _Material("Asphalt", 1376);
  static Salt = new _Material("Salt", 1392);
  static Ice = new _Material("Ice", 1536);
  static Glacier = new _Material("Glacier", 1552);
  static Glass = new _Material("Glass", 1568);
  static ForceField = new _Material("ForceField", 1584);
  static Air = new _Material("Air", 1792);
  static Water = new _Material("Water", 2048);
  static Cardboard = new _Material("Cardboard", 2304);
  static Carpet = new _Material("Carpet", 2305);
  static CeramicTiles = new _Material("CeramicTiles", 2306);
  static ClayRoofTiles = new _Material("ClayRoofTiles", 2307);
  static RoofShingles = new _Material("RoofShingles", 2308);
  static Leather = new _Material("Leather", 2309);
  static Plaster = new _Material("Plaster", 2310);
  static Rubber = new _Material("Rubber", 2311);
  static get Items() {
    return [_Material.Plastic, _Material.SmoothPlastic, _Material.Neon, _Material.Wood, _Material.WoodPlanks, _Material.Marble, _Material.Slate, _Material.Concrete, _Material.Granite, _Material.Brick, _Material.Pebble, _Material.Cobblestone, _Material.Rock, _Material.Sandstone, _Material.Basalt, _Material.CrackedLava, _Material.Limestone, _Material.Pavement, _Material.CorrodedMetal, _Material.DiamondPlate, _Material.Foil, _Material.Metal, _Material.Grass, _Material.LeafyGrass, _Material.Sand, _Material.Fabric, _Material.Snow, _Material.Mud, _Material.Ground, _Material.Asphalt, _Material.Salt, _Material.Ice, _Material.Glacier, _Material.Glass, _Material.ForceField, _Material.Air, _Material.Water, _Material.Cardboard, _Material.Carpet, _Material.CeramicTiles, _Material.ClayRoofTiles, _Material.RoofShingles, _Material.Leather, _Material.Plaster, _Material.Rubber];
  }
  static FromValue(value) {
    return _Material.Items.find((item) => item._value === value);
  }
};
var MaterialPattern = class _MaterialPattern extends EnumItem {
  static Regular = new _MaterialPattern("Regular", 0);
  static Organic = new _MaterialPattern("Organic", 1);
  static get Items() {
    return [_MaterialPattern.Regular, _MaterialPattern.Organic];
  }
  static FromValue(value) {
    return _MaterialPattern.Items.find((item) => item._value === value);
  }
};
var MeshPartDetailLevel = class _MeshPartDetailLevel extends EnumItem {
  static DistanceBased = new _MeshPartDetailLevel("DistanceBased", 0);
  static Level00 = new _MeshPartDetailLevel("Level00", 1);
  static Level01 = new _MeshPartDetailLevel("Level01", 2);
  static Level02 = new _MeshPartDetailLevel("Level02", 3);
  static Level03 = new _MeshPartDetailLevel("Level03", 4);
  static Level04 = new _MeshPartDetailLevel("Level04", 5);
  static get Items() {
    return [_MeshPartDetailLevel.DistanceBased, _MeshPartDetailLevel.Level00, _MeshPartDetailLevel.Level01, _MeshPartDetailLevel.Level02, _MeshPartDetailLevel.Level03, _MeshPartDetailLevel.Level04];
  }
  static FromValue(value) {
    return _MeshPartDetailLevel.Items.find((item) => item._value === value);
  }
};
var MeshPartHeadsAndAccessories = class _MeshPartHeadsAndAccessories extends EnumItem {
  static Default = new _MeshPartHeadsAndAccessories("Default", 0);
  static Disabled = new _MeshPartHeadsAndAccessories("Disabled", 1);
  static Enabled = new _MeshPartHeadsAndAccessories("Enabled", 2);
  static get Items() {
    return [_MeshPartHeadsAndAccessories.Default, _MeshPartHeadsAndAccessories.Disabled, _MeshPartHeadsAndAccessories.Enabled];
  }
  static FromValue(value) {
    return _MeshPartHeadsAndAccessories.Items.find((item) => item._value === value);
  }
};
var MeshType = class _MeshType extends EnumItem {
  static Head = new _MeshType("Head", 0);
  static Torso = new _MeshType("Torso", 1);
  static Wedge = new _MeshType("Wedge", 2);
  static Sphere = new _MeshType("Sphere", 3);
  static Cylinder = new _MeshType("Cylinder", 4);
  static FileMesh = new _MeshType("FileMesh", 5);
  static Brick = new _MeshType("Brick", 6);
  static Prism = new _MeshType("Prism", 7);
  static Pyramid = new _MeshType("Pyramid", 8);
  static ParallelRamp = new _MeshType("ParallelRamp", 9);
  static RightAngleRamp = new _MeshType("RightAngleRamp", 10);
  static CornerWedge = new _MeshType("CornerWedge", 11);
  static get Items() {
    return [_MeshType.Head, _MeshType.Torso, _MeshType.Wedge, _MeshType.Sphere, _MeshType.Cylinder, _MeshType.FileMesh, _MeshType.Brick, _MeshType.Prism, _MeshType.Pyramid, _MeshType.ParallelRamp, _MeshType.RightAngleRamp, _MeshType.CornerWedge];
  }
  static FromValue(value) {
    return _MeshType.Items.find((item) => item._value === value);
  }
};
var ModelLevelOfDetail = class _ModelLevelOfDetail extends EnumItem {
  static Automatic = new _ModelLevelOfDetail("Automatic", 0);
  static StreamingMesh = new _ModelLevelOfDetail("StreamingMesh", 1);
  static Disabled = new _ModelLevelOfDetail("Disabled", 2);
  static get Items() {
    return [_ModelLevelOfDetail.Automatic, _ModelLevelOfDetail.StreamingMesh, _ModelLevelOfDetail.Disabled];
  }
  static FromValue(value) {
    return _ModelLevelOfDetail.Items.find((item) => item._value === value);
  }
};
var ModelStreamingBehavior = class _ModelStreamingBehavior extends EnumItem {
  static Default = new _ModelStreamingBehavior("Default", 0);
  static Legacy = new _ModelStreamingBehavior("Legacy", 1);
  static Improved = new _ModelStreamingBehavior("Improved", 2);
  static get Items() {
    return [_ModelStreamingBehavior.Default, _ModelStreamingBehavior.Legacy, _ModelStreamingBehavior.Improved];
  }
  static FromValue(value) {
    return _ModelStreamingBehavior.Items.find((item) => item._value === value);
  }
};
var ModelStreamingMode = class _ModelStreamingMode extends EnumItem {
  static Default = new _ModelStreamingMode("Default", 0);
  static Atomic = new _ModelStreamingMode("Atomic", 1);
  static Persistent = new _ModelStreamingMode("Persistent", 2);
  static PersistentPerPlayer = new _ModelStreamingMode("PersistentPerPlayer", 3);
  static Nonatomic = new _ModelStreamingMode("Nonatomic", 4);
  static get Items() {
    return [_ModelStreamingMode.Default, _ModelStreamingMode.Atomic, _ModelStreamingMode.Persistent, _ModelStreamingMode.PersistentPerPlayer, _ModelStreamingMode.Nonatomic];
  }
  static FromValue(value) {
    return _ModelStreamingMode.Items.find((item) => item._value === value);
  }
};
var MouseBehavior = class _MouseBehavior extends EnumItem {
  static Default = new _MouseBehavior("Default", 0);
  static LockCenter = new _MouseBehavior("LockCenter", 1);
  static LockCurrentPosition = new _MouseBehavior("LockCurrentPosition", 2);
  static get Items() {
    return [_MouseBehavior.Default, _MouseBehavior.LockCenter, _MouseBehavior.LockCurrentPosition];
  }
  static FromValue(value) {
    return _MouseBehavior.Items.find((item) => item._value === value);
  }
};
var MoverConstraintRootBehaviorMode = class _MoverConstraintRootBehaviorMode extends EnumItem {
  static Default = new _MoverConstraintRootBehaviorMode("Default", 0);
  static Disabled = new _MoverConstraintRootBehaviorMode("Disabled", 1);
  static Enabled = new _MoverConstraintRootBehaviorMode("Enabled", 2);
  static get Items() {
    return [_MoverConstraintRootBehaviorMode.Default, _MoverConstraintRootBehaviorMode.Disabled, _MoverConstraintRootBehaviorMode.Enabled];
  }
  static FromValue(value) {
    return _MoverConstraintRootBehaviorMode.Items.find((item) => item._value === value);
  }
};
var NameOcclusion = class _NameOcclusion extends EnumItem {
  static NoOcclusion = new _NameOcclusion("NoOcclusion", 0);
  static EnemyOcclusion = new _NameOcclusion("EnemyOcclusion", 1);
  static OccludeAll = new _NameOcclusion("OccludeAll", 2);
  static get Items() {
    return [_NameOcclusion.NoOcclusion, _NameOcclusion.EnemyOcclusion, _NameOcclusion.OccludeAll];
  }
  static FromValue(value) {
    return _NameOcclusion.Items.find((item) => item._value === value);
  }
};
var NoiseType = class _NoiseType extends EnumItem {
  static SimplexGabor = new _NoiseType("SimplexGabor", 0);
  static get Items() {
    return [_NoiseType.SimplexGabor];
  }
  static FromValue(value) {
    return _NoiseType.Items.find((item) => item._value === value);
  }
};
var NormalId = class _NormalId extends EnumItem {
  static Right = new _NormalId("Right", 0);
  static Top = new _NormalId("Top", 1);
  static Back = new _NormalId("Back", 2);
  static Left = new _NormalId("Left", 3);
  static Bottom = new _NormalId("Bottom", 4);
  static Front = new _NormalId("Front", 5);
  static get Items() {
    return [_NormalId.Right, _NormalId.Top, _NormalId.Back, _NormalId.Left, _NormalId.Bottom, _NormalId.Front];
  }
  static FromValue(value) {
    return _NormalId.Items.find((item) => item._value === value);
  }
};
var OrientationAlignmentMode = class _OrientationAlignmentMode extends EnumItem {
  static OneAttachment = new _OrientationAlignmentMode("OneAttachment", 0);
  static TwoAttachment = new _OrientationAlignmentMode("TwoAttachment", 1);
  static get Items() {
    return [_OrientationAlignmentMode.OneAttachment, _OrientationAlignmentMode.TwoAttachment];
  }
  static FromValue(value) {
    return _OrientationAlignmentMode.Items.find((item) => item._value === value);
  }
};
var PartType = class _PartType extends EnumItem {
  static Ball = new _PartType("Ball", 0);
  static Block = new _PartType("Block", 1);
  static Cylinder = new _PartType("Cylinder", 2);
  static Wedge = new _PartType("Wedge", 3);
  static CornerWedge = new _PartType("CornerWedge", 4);
  static get Items() {
    return [_PartType.Ball, _PartType.Block, _PartType.Cylinder, _PartType.Wedge, _PartType.CornerWedge];
  }
  static FromValue(value) {
    return _PartType.Items.find((item) => item._value === value);
  }
};
var ParticleEmitterShape = class _ParticleEmitterShape extends EnumItem {
  static Box = new _ParticleEmitterShape("Box", 0);
  static Sphere = new _ParticleEmitterShape("Sphere", 1);
  static Cylinder = new _ParticleEmitterShape("Cylinder", 2);
  static Disc = new _ParticleEmitterShape("Disc", 3);
  static get Items() {
    return [_ParticleEmitterShape.Box, _ParticleEmitterShape.Sphere, _ParticleEmitterShape.Cylinder, _ParticleEmitterShape.Disc];
  }
  static FromValue(value) {
    return _ParticleEmitterShape.Items.find((item) => item._value === value);
  }
};
var ParticleEmitterShapeInOut = class _ParticleEmitterShapeInOut extends EnumItem {
  static Outward = new _ParticleEmitterShapeInOut("Outward", 0);
  static Inward = new _ParticleEmitterShapeInOut("Inward", 1);
  static InAndOut = new _ParticleEmitterShapeInOut("InAndOut", 2);
  static get Items() {
    return [_ParticleEmitterShapeInOut.Outward, _ParticleEmitterShapeInOut.Inward, _ParticleEmitterShapeInOut.InAndOut];
  }
  static FromValue(value) {
    return _ParticleEmitterShapeInOut.Items.find((item) => item._value === value);
  }
};
var ParticleEmitterShapeStyle = class _ParticleEmitterShapeStyle extends EnumItem {
  static Volume = new _ParticleEmitterShapeStyle("Volume", 0);
  static Surface = new _ParticleEmitterShapeStyle("Surface", 1);
  static get Items() {
    return [_ParticleEmitterShapeStyle.Volume, _ParticleEmitterShapeStyle.Surface];
  }
  static FromValue(value) {
    return _ParticleEmitterShapeStyle.Items.find((item) => item._value === value);
  }
};
var ParticleFlipbookLayout = class _ParticleFlipbookLayout extends EnumItem {
  static None = new _ParticleFlipbookLayout("None", 0);
  static Grid2x2 = new _ParticleFlipbookLayout("Grid2x2", 1);
  static Grid4x4 = new _ParticleFlipbookLayout("Grid4x4", 2);
  static Grid8x8 = new _ParticleFlipbookLayout("Grid8x8", 3);
  static get Items() {
    return [_ParticleFlipbookLayout.None, _ParticleFlipbookLayout.Grid2x2, _ParticleFlipbookLayout.Grid4x4, _ParticleFlipbookLayout.Grid8x8];
  }
  static FromValue(value) {
    return _ParticleFlipbookLayout.Items.find((item) => item._value === value);
  }
};
var ParticleFlipbookMode = class _ParticleFlipbookMode extends EnumItem {
  static Loop = new _ParticleFlipbookMode("Loop", 0);
  static OneShot = new _ParticleFlipbookMode("OneShot", 1);
  static PingPong = new _ParticleFlipbookMode("PingPong", 2);
  static Random = new _ParticleFlipbookMode("Random", 3);
  static get Items() {
    return [_ParticleFlipbookMode.Loop, _ParticleFlipbookMode.OneShot, _ParticleFlipbookMode.PingPong, _ParticleFlipbookMode.Random];
  }
  static FromValue(value) {
    return _ParticleFlipbookMode.Items.find((item) => item._value === value);
  }
};
var ParticleOrientation = class _ParticleOrientation extends EnumItem {
  static FacingCamera = new _ParticleOrientation("FacingCamera", 0);
  static FacingCameraWorldUp = new _ParticleOrientation("FacingCameraWorldUp", 1);
  static VelocityParallel = new _ParticleOrientation("VelocityParallel", 2);
  static VelocityPerpendicular = new _ParticleOrientation("VelocityPerpendicular", 3);
  static get Items() {
    return [_ParticleOrientation.FacingCamera, _ParticleOrientation.FacingCameraWorldUp, _ParticleOrientation.VelocityParallel, _ParticleOrientation.VelocityPerpendicular];
  }
  static FromValue(value) {
    return _ParticleOrientation.Items.find((item) => item._value === value);
  }
};
var PathfindingUseImprovedSearch = class _PathfindingUseImprovedSearch extends EnumItem {
  static Default = new _PathfindingUseImprovedSearch("Default", 0);
  static Disabled = new _PathfindingUseImprovedSearch("Disabled", 1);
  static Enabled = new _PathfindingUseImprovedSearch("Enabled", 2);
  static get Items() {
    return [_PathfindingUseImprovedSearch.Default, _PathfindingUseImprovedSearch.Disabled, _PathfindingUseImprovedSearch.Enabled];
  }
  static FromValue(value) {
    return _PathfindingUseImprovedSearch.Items.find((item) => item._value === value);
  }
};
var PhysicsSteppingMethod = class _PhysicsSteppingMethod extends EnumItem {
  static Default = new _PhysicsSteppingMethod("Default", 0);
  static Fixed = new _PhysicsSteppingMethod("Fixed", 1);
  static Adaptive = new _PhysicsSteppingMethod("Adaptive", 2);
  static get Items() {
    return [_PhysicsSteppingMethod.Default, _PhysicsSteppingMethod.Fixed, _PhysicsSteppingMethod.Adaptive];
  }
  static FromValue(value) {
    return _PhysicsSteppingMethod.Items.find((item) => item._value === value);
  }
};
var PlayerCharacterDestroyBehavior = class _PlayerCharacterDestroyBehavior extends EnumItem {
  static Default = new _PlayerCharacterDestroyBehavior("Default", 0);
  static Disabled = new _PlayerCharacterDestroyBehavior("Disabled", 1);
  static Enabled = new _PlayerCharacterDestroyBehavior("Enabled", 2);
  static get Items() {
    return [_PlayerCharacterDestroyBehavior.Default, _PlayerCharacterDestroyBehavior.Disabled, _PlayerCharacterDestroyBehavior.Enabled];
  }
  static FromValue(value) {
    return _PlayerCharacterDestroyBehavior.Items.find((item) => item._value === value);
  }
};
var PlayerDataLoadFailureBehavior = class _PlayerDataLoadFailureBehavior extends EnumItem {
  static Failure = new _PlayerDataLoadFailureBehavior("Failure", 0);
  static FallbackToDefault = new _PlayerDataLoadFailureBehavior("FallbackToDefault", 1);
  static Kick = new _PlayerDataLoadFailureBehavior("Kick", 2);
  static get Items() {
    return [_PlayerDataLoadFailureBehavior.Failure, _PlayerDataLoadFailureBehavior.FallbackToDefault, _PlayerDataLoadFailureBehavior.Kick];
  }
  static FromValue(value) {
    return _PlayerDataLoadFailureBehavior.Items.find((item) => item._value === value);
  }
};
var PoseEasingDirection = class _PoseEasingDirection extends EnumItem {
  static In = new _PoseEasingDirection("In", 0);
  static Out = new _PoseEasingDirection("Out", 1);
  static InOut = new _PoseEasingDirection("InOut", 2);
  static get Items() {
    return [_PoseEasingDirection.In, _PoseEasingDirection.Out, _PoseEasingDirection.InOut];
  }
  static FromValue(value) {
    return _PoseEasingDirection.Items.find((item) => item._value === value);
  }
};
var PoseEasingStyle = class _PoseEasingStyle extends EnumItem {
  static Linear = new _PoseEasingStyle("Linear", 0);
  static Constant = new _PoseEasingStyle("Constant", 1);
  static Elastic = new _PoseEasingStyle("Elastic", 2);
  static Cubic = new _PoseEasingStyle("Cubic", 3);
  static Bounce = new _PoseEasingStyle("Bounce", 4);
  static CubicV2 = new _PoseEasingStyle("CubicV2", 5);
  static get Items() {
    return [_PoseEasingStyle.Linear, _PoseEasingStyle.Constant, _PoseEasingStyle.Elastic, _PoseEasingStyle.Cubic, _PoseEasingStyle.Bounce, _PoseEasingStyle.CubicV2];
  }
  static FromValue(value) {
    return _PoseEasingStyle.Items.find((item) => item._value === value);
  }
};
var PositionAlignmentMode = class _PositionAlignmentMode extends EnumItem {
  static OneAttachment = new _PositionAlignmentMode("OneAttachment", 0);
  static TwoAttachment = new _PositionAlignmentMode("TwoAttachment", 1);
  static get Items() {
    return [_PositionAlignmentMode.OneAttachment, _PositionAlignmentMode.TwoAttachment];
  }
  static FromValue(value) {
    return _PositionAlignmentMode.Items.find((item) => item._value === value);
  }
};
var PrimalPhysicsSolver = class _PrimalPhysicsSolver extends EnumItem {
  static Default = new _PrimalPhysicsSolver("Default", 0);
  static Experimental = new _PrimalPhysicsSolver("Experimental", 1);
  static Disabled = new _PrimalPhysicsSolver("Disabled", 2);
  static get Items() {
    return [_PrimalPhysicsSolver.Default, _PrimalPhysicsSolver.Experimental, _PrimalPhysicsSolver.Disabled];
  }
  static FromValue(value) {
    return _PrimalPhysicsSolver.Items.find((item) => item._value === value);
  }
};
var ProximityPromptExclusivity = class _ProximityPromptExclusivity extends EnumItem {
  static OnePerButton = new _ProximityPromptExclusivity("OnePerButton", 0);
  static OneGlobally = new _ProximityPromptExclusivity("OneGlobally", 1);
  static AlwaysShow = new _ProximityPromptExclusivity("AlwaysShow", 2);
  static get Items() {
    return [_ProximityPromptExclusivity.OnePerButton, _ProximityPromptExclusivity.OneGlobally, _ProximityPromptExclusivity.AlwaysShow];
  }
  static FromValue(value) {
    return _ProximityPromptExclusivity.Items.find((item) => item._value === value);
  }
};
var ProximityPromptStyle = class _ProximityPromptStyle extends EnumItem {
  static Default = new _ProximityPromptStyle("Default", 0);
  static Custom = new _ProximityPromptStyle("Custom", 1);
  static get Items() {
    return [_ProximityPromptStyle.Default, _ProximityPromptStyle.Custom];
  }
  static FromValue(value) {
    return _ProximityPromptStyle.Items.find((item) => item._value === value);
  }
};
var QualityLevel = class _QualityLevel extends EnumItem {
  static Automatic = new _QualityLevel("Automatic", 0);
  static Level01 = new _QualityLevel("Level01", 1);
  static Level02 = new _QualityLevel("Level02", 2);
  static Level03 = new _QualityLevel("Level03", 3);
  static Level04 = new _QualityLevel("Level04", 4);
  static Level05 = new _QualityLevel("Level05", 5);
  static Level06 = new _QualityLevel("Level06", 6);
  static Level07 = new _QualityLevel("Level07", 7);
  static Level08 = new _QualityLevel("Level08", 8);
  static Level09 = new _QualityLevel("Level09", 9);
  static Level10 = new _QualityLevel("Level10", 10);
  static Level11 = new _QualityLevel("Level11", 11);
  static Level12 = new _QualityLevel("Level12", 12);
  static Level13 = new _QualityLevel("Level13", 13);
  static Level14 = new _QualityLevel("Level14", 14);
  static Level15 = new _QualityLevel("Level15", 15);
  static Level16 = new _QualityLevel("Level16", 16);
  static Level17 = new _QualityLevel("Level17", 17);
  static Level18 = new _QualityLevel("Level18", 18);
  static Level19 = new _QualityLevel("Level19", 19);
  static Level20 = new _QualityLevel("Level20", 20);
  static Level21 = new _QualityLevel("Level21", 21);
  static get Items() {
    return [_QualityLevel.Automatic, _QualityLevel.Level01, _QualityLevel.Level02, _QualityLevel.Level03, _QualityLevel.Level04, _QualityLevel.Level05, _QualityLevel.Level06, _QualityLevel.Level07, _QualityLevel.Level08, _QualityLevel.Level09, _QualityLevel.Level10, _QualityLevel.Level11, _QualityLevel.Level12, _QualityLevel.Level13, _QualityLevel.Level14, _QualityLevel.Level15, _QualityLevel.Level16, _QualityLevel.Level17, _QualityLevel.Level18, _QualityLevel.Level19, _QualityLevel.Level20, _QualityLevel.Level21];
  }
  static FromValue(value) {
    return _QualityLevel.Items.find((item) => item._value === value);
  }
};
var R15CollisionType = class _R15CollisionType extends EnumItem {
  static OuterBox = new _R15CollisionType("OuterBox", 0);
  static InnerBox = new _R15CollisionType("InnerBox", 1);
  static get Items() {
    return [_R15CollisionType.OuterBox, _R15CollisionType.InnerBox];
  }
  static FromValue(value) {
    return _R15CollisionType.Items.find((item) => item._value === value);
  }
};
var RejectCharacterDeletions = class _RejectCharacterDeletions extends EnumItem {
  static Default = new _RejectCharacterDeletions("Default", 0);
  static Disabled = new _RejectCharacterDeletions("Disabled", 1);
  static Enabled = new _RejectCharacterDeletions("Enabled", 2);
  static get Items() {
    return [_RejectCharacterDeletions.Default, _RejectCharacterDeletions.Disabled, _RejectCharacterDeletions.Enabled];
  }
  static FromValue(value) {
    return _RejectCharacterDeletions.Items.find((item) => item._value === value);
  }
};
var RenderFidelity = class _RenderFidelity extends EnumItem {
  static Automatic = new _RenderFidelity("Automatic", 0);
  static Precise = new _RenderFidelity("Precise", 1);
  static Performance = new _RenderFidelity("Performance", 2);
  static get Items() {
    return [_RenderFidelity.Automatic, _RenderFidelity.Precise, _RenderFidelity.Performance];
  }
  static FromValue(value) {
    return _RenderFidelity.Items.find((item) => item._value === value);
  }
};
var RenderingCacheOptimizationMode = class _RenderingCacheOptimizationMode extends EnumItem {
  static Default = new _RenderingCacheOptimizationMode("Default", 0);
  static Disabled = new _RenderingCacheOptimizationMode("Disabled", 1);
  static Enabled = new _RenderingCacheOptimizationMode("Enabled", 2);
  static get Items() {
    return [_RenderingCacheOptimizationMode.Default, _RenderingCacheOptimizationMode.Disabled, _RenderingCacheOptimizationMode.Enabled];
  }
  static FromValue(value) {
    return _RenderingCacheOptimizationMode.Items.find((item) => item._value === value);
  }
};
var RenderingTestComparisonMethod = class _RenderingTestComparisonMethod extends EnumItem {
  static psnr = new _RenderingTestComparisonMethod("psnr", 0);
  static diff = new _RenderingTestComparisonMethod("diff", 1);
  static get Items() {
    return [_RenderingTestComparisonMethod.psnr, _RenderingTestComparisonMethod.diff];
  }
  static FromValue(value) {
    return _RenderingTestComparisonMethod.Items.find((item) => item._value === value);
  }
};
var ReplicateInstanceDestroySetting = class _ReplicateInstanceDestroySetting extends EnumItem {
  static Default = new _ReplicateInstanceDestroySetting("Default", 0);
  static Disabled = new _ReplicateInstanceDestroySetting("Disabled", 1);
  static Enabled = new _ReplicateInstanceDestroySetting("Enabled", 2);
  static get Items() {
    return [_ReplicateInstanceDestroySetting.Default, _ReplicateInstanceDestroySetting.Disabled, _ReplicateInstanceDestroySetting.Enabled];
  }
  static FromValue(value) {
    return _ReplicateInstanceDestroySetting.Items.find((item) => item._value === value);
  }
};
var ResamplerMode = class _ResamplerMode extends EnumItem {
  static Default = new _ResamplerMode("Default", 0);
  static Pixelated = new _ResamplerMode("Pixelated", 1);
  static get Items() {
    return [_ResamplerMode.Default, _ResamplerMode.Pixelated];
  }
  static FromValue(value) {
    return _ResamplerMode.Items.find((item) => item._value === value);
  }
};
var ReverbType = class _ReverbType extends EnumItem {
  static NoReverb = new _ReverbType("NoReverb", 0);
  static GenericReverb = new _ReverbType("GenericReverb", 1);
  static PaddedCell = new _ReverbType("PaddedCell", 2);
  static Room = new _ReverbType("Room", 3);
  static Bathroom = new _ReverbType("Bathroom", 4);
  static LivingRoom = new _ReverbType("LivingRoom", 5);
  static StoneRoom = new _ReverbType("StoneRoom", 6);
  static Auditorium = new _ReverbType("Auditorium", 7);
  static ConcertHall = new _ReverbType("ConcertHall", 8);
  static Cave = new _ReverbType("Cave", 9);
  static Arena = new _ReverbType("Arena", 10);
  static Hangar = new _ReverbType("Hangar", 11);
  static CarpettedHallway = new _ReverbType("CarpettedHallway", 12);
  static Hallway = new _ReverbType("Hallway", 13);
  static StoneCorridor = new _ReverbType("StoneCorridor", 14);
  static Alley = new _ReverbType("Alley", 15);
  static Forest = new _ReverbType("Forest", 16);
  static City = new _ReverbType("City", 17);
  static Mountains = new _ReverbType("Mountains", 18);
  static Quarry = new _ReverbType("Quarry", 19);
  static Plain = new _ReverbType("Plain", 20);
  static ParkingLot = new _ReverbType("ParkingLot", 21);
  static SewerPipe = new _ReverbType("SewerPipe", 22);
  static UnderWater = new _ReverbType("UnderWater", 23);
  static get Items() {
    return [_ReverbType.NoReverb, _ReverbType.GenericReverb, _ReverbType.PaddedCell, _ReverbType.Room, _ReverbType.Bathroom, _ReverbType.LivingRoom, _ReverbType.StoneRoom, _ReverbType.Auditorium, _ReverbType.ConcertHall, _ReverbType.Cave, _ReverbType.Arena, _ReverbType.Hangar, _ReverbType.CarpettedHallway, _ReverbType.Hallway, _ReverbType.StoneCorridor, _ReverbType.Alley, _ReverbType.Forest, _ReverbType.City, _ReverbType.Mountains, _ReverbType.Quarry, _ReverbType.Plain, _ReverbType.ParkingLot, _ReverbType.SewerPipe, _ReverbType.UnderWater];
  }
  static FromValue(value) {
    return _ReverbType.Items.find((item) => item._value === value);
  }
};
var RollOffMode = class _RollOffMode extends EnumItem {
  static Inverse = new _RollOffMode("Inverse", 0);
  static Linear = new _RollOffMode("Linear", 1);
  static LinearSquare = new _RollOffMode("LinearSquare", 2);
  static InverseTapered = new _RollOffMode("InverseTapered", 3);
  static get Items() {
    return [_RollOffMode.Inverse, _RollOffMode.Linear, _RollOffMode.LinearSquare, _RollOffMode.InverseTapered];
  }
  static FromValue(value) {
    return _RollOffMode.Items.find((item) => item._value === value);
  }
};
var RolloutState = class _RolloutState extends EnumItem {
  static Default = new _RolloutState("Default", 0);
  static Disabled = new _RolloutState("Disabled", 1);
  static Enabled = new _RolloutState("Enabled", 2);
  static get Items() {
    return [_RolloutState.Default, _RolloutState.Disabled, _RolloutState.Enabled];
  }
  static FromValue(value) {
    return _RolloutState.Items.find((item) => item._value === value);
  }
};
var RotationOrder = class _RotationOrder extends EnumItem {
  static XYZ = new _RotationOrder("XYZ", 0);
  static XZY = new _RotationOrder("XZY", 1);
  static YZX = new _RotationOrder("YZX", 2);
  static YXZ = new _RotationOrder("YXZ", 3);
  static ZXY = new _RotationOrder("ZXY", 4);
  static ZYX = new _RotationOrder("ZYX", 5);
  static get Items() {
    return [_RotationOrder.XYZ, _RotationOrder.XZY, _RotationOrder.YZX, _RotationOrder.YXZ, _RotationOrder.ZXY, _RotationOrder.ZYX];
  }
  static FromValue(value) {
    return _RotationOrder.Items.find((item) => item._value === value);
  }
};
var RtlTextSupport = class _RtlTextSupport extends EnumItem {
  static Default = new _RtlTextSupport("Default", 0);
  static Disabled = new _RtlTextSupport("Disabled", 1);
  static Enabled = new _RtlTextSupport("Enabled", 2);
  static get Items() {
    return [_RtlTextSupport.Default, _RtlTextSupport.Disabled, _RtlTextSupport.Enabled];
  }
  static FromValue(value) {
    return _RtlTextSupport.Items.find((item) => item._value === value);
  }
};
var RunContext = class _RunContext extends EnumItem {
  static Legacy = new _RunContext("Legacy", 0);
  static Server = new _RunContext("Server", 1);
  static Client = new _RunContext("Client", 2);
  static Plugin = new _RunContext("Plugin", 3);
  static get Items() {
    return [_RunContext.Legacy, _RunContext.Server, _RunContext.Client, _RunContext.Plugin];
  }
  static FromValue(value) {
    return _RunContext.Items.find((item) => item._value === value);
  }
};
var SafeAreaCompatibility = class _SafeAreaCompatibility extends EnumItem {
  static None = new _SafeAreaCompatibility("None", 0);
  static FullscreenExtension = new _SafeAreaCompatibility("FullscreenExtension", 1);
  static get Items() {
    return [_SafeAreaCompatibility.None, _SafeAreaCompatibility.FullscreenExtension];
  }
  static FromValue(value) {
    return _SafeAreaCompatibility.Items.find((item) => item._value === value);
  }
};
var SandboxedInstanceMode = class _SandboxedInstanceMode extends EnumItem {
  static Default = new _SandboxedInstanceMode("Default", 0);
  static Experimental = new _SandboxedInstanceMode("Experimental", 1);
  static get Items() {
    return [_SandboxedInstanceMode.Default, _SandboxedInstanceMode.Experimental];
  }
  static FromValue(value) {
    return _SandboxedInstanceMode.Items.find((item) => item._value === value);
  }
};
var ScaleType = class _ScaleType extends EnumItem {
  static Stretch = new _ScaleType("Stretch", 0);
  static Slice = new _ScaleType("Slice", 1);
  static Tile = new _ScaleType("Tile", 2);
  static Fit = new _ScaleType("Fit", 3);
  static Crop = new _ScaleType("Crop", 4);
  static get Items() {
    return [_ScaleType.Stretch, _ScaleType.Slice, _ScaleType.Tile, _ScaleType.Fit, _ScaleType.Crop];
  }
  static FromValue(value) {
    return _ScaleType.Items.find((item) => item._value === value);
  }
};
var ScreenInsets = class _ScreenInsets extends EnumItem {
  static None = new _ScreenInsets("None", 0);
  static DeviceSafeInsets = new _ScreenInsets("DeviceSafeInsets", 1);
  static CoreUISafeInsets = new _ScreenInsets("CoreUISafeInsets", 2);
  static TopbarSafeInsets = new _ScreenInsets("TopbarSafeInsets", 3);
  static get Items() {
    return [_ScreenInsets.None, _ScreenInsets.DeviceSafeInsets, _ScreenInsets.CoreUISafeInsets, _ScreenInsets.TopbarSafeInsets];
  }
  static FromValue(value) {
    return _ScreenInsets.Items.find((item) => item._value === value);
  }
};
var ScreenOrientation = class _ScreenOrientation extends EnumItem {
  static LandscapeLeft = new _ScreenOrientation("LandscapeLeft", 0);
  static LandscapeRight = new _ScreenOrientation("LandscapeRight", 1);
  static LandscapeSensor = new _ScreenOrientation("LandscapeSensor", 2);
  static Portrait = new _ScreenOrientation("Portrait", 3);
  static Sensor = new _ScreenOrientation("Sensor", 4);
  static get Items() {
    return [_ScreenOrientation.LandscapeLeft, _ScreenOrientation.LandscapeRight, _ScreenOrientation.LandscapeSensor, _ScreenOrientation.Portrait, _ScreenOrientation.Sensor];
  }
  static FromValue(value) {
    return _ScreenOrientation.Items.find((item) => item._value === value);
  }
};
var ScrollBarInset = class _ScrollBarInset extends EnumItem {
  static None = new _ScrollBarInset("None", 0);
  static ScrollBar = new _ScrollBarInset("ScrollBar", 1);
  static Always = new _ScrollBarInset("Always", 2);
  static get Items() {
    return [_ScrollBarInset.None, _ScrollBarInset.ScrollBar, _ScrollBarInset.Always];
  }
  static FromValue(value) {
    return _ScrollBarInset.Items.find((item) => item._value === value);
  }
};
var ScrollingDirection = class _ScrollingDirection extends EnumItem {
  static X = new _ScrollingDirection("X", 1);
  static Y = new _ScrollingDirection("Y", 2);
  static XY = new _ScrollingDirection("XY", 4);
  static get Items() {
    return [_ScrollingDirection.X, _ScrollingDirection.Y, _ScrollingDirection.XY];
  }
  static FromValue(value) {
    return _ScrollingDirection.Items.find((item) => item._value === value);
  }
};
var SelectionBehavior = class _SelectionBehavior extends EnumItem {
  static Escape = new _SelectionBehavior("Escape", 0);
  static Stop = new _SelectionBehavior("Stop", 1);
  static get Items() {
    return [_SelectionBehavior.Escape, _SelectionBehavior.Stop];
  }
  static FromValue(value) {
    return _SelectionBehavior.Items.find((item) => item._value === value);
  }
};
var SensorMode = class _SensorMode extends EnumItem {
  static Floor = new _SensorMode("Floor", 0);
  static Ladder = new _SensorMode("Ladder", 1);
  static get Items() {
    return [_SensorMode.Floor, _SensorMode.Ladder];
  }
  static FromValue(value) {
    return _SensorMode.Items.find((item) => item._value === value);
  }
};
var SensorUpdateType = class _SensorUpdateType extends EnumItem {
  static OnRead = new _SensorUpdateType("OnRead", 0);
  static Manual = new _SensorUpdateType("Manual", 1);
  static get Items() {
    return [_SensorUpdateType.OnRead, _SensorUpdateType.Manual];
  }
  static FromValue(value) {
    return _SensorUpdateType.Items.find((item) => item._value === value);
  }
};
var ServiceVisibility = class _ServiceVisibility extends EnumItem {
  static Always = new _ServiceVisibility("Always", 0);
  static Off = new _ServiceVisibility("Off", 1);
  static WithChildren = new _ServiceVisibility("WithChildren", 2);
  static get Items() {
    return [_ServiceVisibility.Always, _ServiceVisibility.Off, _ServiceVisibility.WithChildren];
  }
  static FromValue(value) {
    return _ServiceVisibility.Items.find((item) => item._value === value);
  }
};
var SignalBehavior = class _SignalBehavior extends EnumItem {
  static Default = new _SignalBehavior("Default", 0);
  static Immediate = new _SignalBehavior("Immediate", 1);
  static Deferred = new _SignalBehavior("Deferred", 2);
  static AncestryDeferred = new _SignalBehavior("AncestryDeferred", 3);
  static get Items() {
    return [_SignalBehavior.Default, _SignalBehavior.Immediate, _SignalBehavior.Deferred, _SignalBehavior.AncestryDeferred];
  }
  static FromValue(value) {
    return _SignalBehavior.Items.find((item) => item._value === value);
  }
};
var SizeConstraint = class _SizeConstraint extends EnumItem {
  static RelativeXY = new _SizeConstraint("RelativeXY", 0);
  static RelativeXX = new _SizeConstraint("RelativeXX", 1);
  static RelativeYY = new _SizeConstraint("RelativeYY", 2);
  static get Items() {
    return [_SizeConstraint.RelativeXY, _SizeConstraint.RelativeXX, _SizeConstraint.RelativeYY];
  }
  static FromValue(value) {
    return _SizeConstraint.Items.find((item) => item._value === value);
  }
};
var SortOrder = class _SortOrder extends EnumItem {
  static Name = new _SortOrder("Name", 0);
  static Custom = new _SortOrder("Custom", 1);
  static LayoutOrder = new _SortOrder("LayoutOrder", 2);
  static get Items() {
    return [_SortOrder.Name, _SortOrder.Custom, _SortOrder.LayoutOrder];
  }
  static FromValue(value) {
    return _SortOrder.Items.find((item) => item._value === value);
  }
};
var StartCorner = class _StartCorner extends EnumItem {
  static TopLeft = new _StartCorner("TopLeft", 0);
  static TopRight = new _StartCorner("TopRight", 1);
  static BottomLeft = new _StartCorner("BottomLeft", 2);
  static BottomRight = new _StartCorner("BottomRight", 3);
  static get Items() {
    return [_StartCorner.TopLeft, _StartCorner.TopRight, _StartCorner.BottomLeft, _StartCorner.BottomRight];
  }
  static FromValue(value) {
    return _StartCorner.Items.find((item) => item._value === value);
  }
};
var StreamOutBehavior = class _StreamOutBehavior extends EnumItem {
  static Default = new _StreamOutBehavior("Default", 0);
  static LowMemory = new _StreamOutBehavior("LowMemory", 1);
  static Opportunistic = new _StreamOutBehavior("Opportunistic", 2);
  static get Items() {
    return [_StreamOutBehavior.Default, _StreamOutBehavior.LowMemory, _StreamOutBehavior.Opportunistic];
  }
  static FromValue(value) {
    return _StreamOutBehavior.Items.find((item) => item._value === value);
  }
};
var StreamingIntegrityMode = class _StreamingIntegrityMode extends EnumItem {
  static Default = new _StreamingIntegrityMode("Default", 0);
  static Disabled = new _StreamingIntegrityMode("Disabled", 1);
  static MinimumRadiusPause = new _StreamingIntegrityMode("MinimumRadiusPause", 2);
  static PauseOutsideLoadedArea = new _StreamingIntegrityMode("PauseOutsideLoadedArea", 3);
  static get Items() {
    return [_StreamingIntegrityMode.Default, _StreamingIntegrityMode.Disabled, _StreamingIntegrityMode.MinimumRadiusPause, _StreamingIntegrityMode.PauseOutsideLoadedArea];
  }
  static FromValue(value) {
    return _StreamingIntegrityMode.Items.find((item) => item._value === value);
  }
};
var Style = class _Style extends EnumItem {
  static AlternatingSupports = new _Style("AlternatingSupports", 0);
  static BridgeStyleSupports = new _Style("BridgeStyleSupports", 1);
  static NoSupports = new _Style("NoSupports", 2);
  static get Items() {
    return [_Style.AlternatingSupports, _Style.BridgeStyleSupports, _Style.NoSupports];
  }
  static FromValue(value) {
    return _Style.Items.find((item) => item._value === value);
  }
};
var SurfaceGuiSizingMode = class _SurfaceGuiSizingMode extends EnumItem {
  static FixedSize = new _SurfaceGuiSizingMode("FixedSize", 0);
  static PixelsPerStud = new _SurfaceGuiSizingMode("PixelsPerStud", 1);
  static get Items() {
    return [_SurfaceGuiSizingMode.FixedSize, _SurfaceGuiSizingMode.PixelsPerStud];
  }
  static FromValue(value) {
    return _SurfaceGuiSizingMode.Items.find((item) => item._value === value);
  }
};
var SurfaceType = class _SurfaceType extends EnumItem {
  static Smooth = new _SurfaceType("Smooth", 0);
  static Glue = new _SurfaceType("Glue", 1);
  static Weld = new _SurfaceType("Weld", 2);
  static Studs = new _SurfaceType("Studs", 3);
  static Inlet = new _SurfaceType("Inlet", 4);
  static Universal = new _SurfaceType("Universal", 5);
  static Hinge = new _SurfaceType("Hinge", 6);
  static Motor = new _SurfaceType("Motor", 7);
  static SteppingMotor = new _SurfaceType("SteppingMotor", 8);
  static SmoothNoOutlines = new _SurfaceType("SmoothNoOutlines", 10);
  static get Items() {
    return [_SurfaceType.Smooth, _SurfaceType.Glue, _SurfaceType.Weld, _SurfaceType.Studs, _SurfaceType.Inlet, _SurfaceType.Universal, _SurfaceType.Hinge, _SurfaceType.Motor, _SurfaceType.SteppingMotor, _SurfaceType.SmoothNoOutlines];
  }
  static FromValue(value) {
    return _SurfaceType.Items.find((item) => item._value === value);
  }
};
var TableMajorAxis = class _TableMajorAxis extends EnumItem {
  static RowMajor = new _TableMajorAxis("RowMajor", 0);
  static ColumnMajor = new _TableMajorAxis("ColumnMajor", 1);
  static get Items() {
    return [_TableMajorAxis.RowMajor, _TableMajorAxis.ColumnMajor];
  }
  static FromValue(value) {
    return _TableMajorAxis.Items.find((item) => item._value === value);
  }
};
var Technology = class _Technology extends EnumItem {
  static Voxel = new _Technology("Voxel", 1);
  static Compatibility = new _Technology("Compatibility", 2);
  static ShadowMap = new _Technology("ShadowMap", 3);
  static Future = new _Technology("Future", 4);
  static Legacy = new _Technology("Legacy", 0);
  static Unified = new _Technology("Unified", 5);
  static get Items() {
    return [_Technology.Voxel, _Technology.Compatibility, _Technology.ShadowMap, _Technology.Future, _Technology.Legacy, _Technology.Unified];
  }
  static FromValue(value) {
    return _Technology.Items.find((item) => item._value === value);
  }
};
var TerrainAcquisitionMethod = class _TerrainAcquisitionMethod extends EnumItem {
  static None = new _TerrainAcquisitionMethod("None", 0);
  static Legacy = new _TerrainAcquisitionMethod("Legacy", 1);
  static Template = new _TerrainAcquisitionMethod("Template", 2);
  static Generate = new _TerrainAcquisitionMethod("Generate", 3);
  static Import = new _TerrainAcquisitionMethod("Import", 4);
  static Convert = new _TerrainAcquisitionMethod("Convert", 5);
  static EditAddTool = new _TerrainAcquisitionMethod("EditAddTool", 6);
  static EditSeaLevelTool = new _TerrainAcquisitionMethod("EditSeaLevelTool", 7);
  static EditReplaceTool = new _TerrainAcquisitionMethod("EditReplaceTool", 8);
  static RegionFillTool = new _TerrainAcquisitionMethod("RegionFillTool", 9);
  static RegionPasteTool = new _TerrainAcquisitionMethod("RegionPasteTool", 10);
  static Other = new _TerrainAcquisitionMethod("Other", 11);
  static get Items() {
    return [_TerrainAcquisitionMethod.None, _TerrainAcquisitionMethod.Legacy, _TerrainAcquisitionMethod.Template, _TerrainAcquisitionMethod.Generate, _TerrainAcquisitionMethod.Import, _TerrainAcquisitionMethod.Convert, _TerrainAcquisitionMethod.EditAddTool, _TerrainAcquisitionMethod.EditSeaLevelTool, _TerrainAcquisitionMethod.EditReplaceTool, _TerrainAcquisitionMethod.RegionFillTool, _TerrainAcquisitionMethod.RegionPasteTool, _TerrainAcquisitionMethod.Other];
  }
  static FromValue(value) {
    return _TerrainAcquisitionMethod.Items.find((item) => item._value === value);
  }
};
var TerrainFace = class _TerrainFace extends EnumItem {
  static Top = new _TerrainFace("Top", 0);
  static Side = new _TerrainFace("Side", 1);
  static Bottom = new _TerrainFace("Bottom", 2);
  static get Items() {
    return [_TerrainFace.Top, _TerrainFace.Side, _TerrainFace.Bottom];
  }
  static FromValue(value) {
    return _TerrainFace.Items.find((item) => item._value === value);
  }
};
var TextDirection = class _TextDirection extends EnumItem {
  static Auto = new _TextDirection("Auto", 0);
  static LeftToRight = new _TextDirection("LeftToRight", 1);
  static RightToLeft = new _TextDirection("RightToLeft", 2);
  static get Items() {
    return [_TextDirection.Auto, _TextDirection.LeftToRight, _TextDirection.RightToLeft];
  }
  static FromValue(value) {
    return _TextDirection.Items.find((item) => item._value === value);
  }
};
var TextTruncate = class _TextTruncate extends EnumItem {
  static None = new _TextTruncate("None", 0);
  static AtEnd = new _TextTruncate("AtEnd", 1);
  static SplitWord = new _TextTruncate("SplitWord", 2);
  static get Items() {
    return [_TextTruncate.None, _TextTruncate.AtEnd, _TextTruncate.SplitWord];
  }
  static FromValue(value) {
    return _TextTruncate.Items.find((item) => item._value === value);
  }
};
var TextXAlignment = class _TextXAlignment extends EnumItem {
  static Left = new _TextXAlignment("Left", 0);
  static Right = new _TextXAlignment("Right", 1);
  static Center = new _TextXAlignment("Center", 2);
  static get Items() {
    return [_TextXAlignment.Left, _TextXAlignment.Right, _TextXAlignment.Center];
  }
  static FromValue(value) {
    return _TextXAlignment.Items.find((item) => item._value === value);
  }
};
var TextYAlignment = class _TextYAlignment extends EnumItem {
  static Top = new _TextYAlignment("Top", 0);
  static Center = new _TextYAlignment("Center", 1);
  static Bottom = new _TextYAlignment("Bottom", 2);
  static get Items() {
    return [_TextYAlignment.Top, _TextYAlignment.Center, _TextYAlignment.Bottom];
  }
  static FromValue(value) {
    return _TextYAlignment.Items.find((item) => item._value === value);
  }
};
var TextureMode = class _TextureMode extends EnumItem {
  static Stretch = new _TextureMode("Stretch", 0);
  static Wrap = new _TextureMode("Wrap", 1);
  static Static = new _TextureMode("Static", 2);
  static get Items() {
    return [_TextureMode.Stretch, _TextureMode.Wrap, _TextureMode.Static];
  }
  static FromValue(value) {
    return _TextureMode.Items.find((item) => item._value === value);
  }
};
var ThreadPoolConfig = class _ThreadPoolConfig extends EnumItem {
  static PerCore4 = new _ThreadPoolConfig("PerCore4", 104);
  static PerCore3 = new _ThreadPoolConfig("PerCore3", 103);
  static PerCore2 = new _ThreadPoolConfig("PerCore2", 102);
  static PerCore1 = new _ThreadPoolConfig("PerCore1", 101);
  static Auto = new _ThreadPoolConfig("Auto", 0);
  static Threads1 = new _ThreadPoolConfig("Threads1", 1);
  static Threads2 = new _ThreadPoolConfig("Threads2", 2);
  static Threads3 = new _ThreadPoolConfig("Threads3", 3);
  static Threads4 = new _ThreadPoolConfig("Threads4", 4);
  static Threads8 = new _ThreadPoolConfig("Threads8", 8);
  static Threads16 = new _ThreadPoolConfig("Threads16", 16);
  static get Items() {
    return [_ThreadPoolConfig.PerCore4, _ThreadPoolConfig.PerCore3, _ThreadPoolConfig.PerCore2, _ThreadPoolConfig.PerCore1, _ThreadPoolConfig.Auto, _ThreadPoolConfig.Threads1, _ThreadPoolConfig.Threads2, _ThreadPoolConfig.Threads3, _ThreadPoolConfig.Threads4, _ThreadPoolConfig.Threads8, _ThreadPoolConfig.Threads16];
  }
  static FromValue(value) {
    return _ThreadPoolConfig.Items.find((item) => item._value === value);
  }
};
var TonemapperPreset = class _TonemapperPreset extends EnumItem {
  static Default = new _TonemapperPreset("Default", 0);
  static Retro = new _TonemapperPreset("Retro", 1);
  static get Items() {
    return [_TonemapperPreset.Default, _TonemapperPreset.Retro];
  }
  static FromValue(value) {
    return _TonemapperPreset.Items.find((item) => item._value === value);
  }
};
var TopBottom = class _TopBottom extends EnumItem {
  static Top = new _TopBottom("Top", 0);
  static Center = new _TopBottom("Center", 1);
  static Bottom = new _TopBottom("Bottom", 2);
  static get Items() {
    return [_TopBottom.Top, _TopBottom.Center, _TopBottom.Bottom];
  }
  static FromValue(value) {
    return _TopBottom.Items.find((item) => item._value === value);
  }
};
var TriStateBoolean = class _TriStateBoolean extends EnumItem {
  static False = new _TriStateBoolean("False", 2);
  static True = new _TriStateBoolean("True", 1);
  static Unknown = new _TriStateBoolean("Unknown", 0);
  static get Items() {
    return [_TriStateBoolean.False, _TriStateBoolean.True, _TriStateBoolean.Unknown];
  }
  static FromValue(value) {
    return _TriStateBoolean.Items.find((item) => item._value === value);
  }
};
var UIDragDetectorBoundingBehavior = class _UIDragDetectorBoundingBehavior extends EnumItem {
  static Automatic = new _UIDragDetectorBoundingBehavior("Automatic", 0);
  static EntireObject = new _UIDragDetectorBoundingBehavior("EntireObject", 1);
  static HitPoint = new _UIDragDetectorBoundingBehavior("HitPoint", 2);
  static get Items() {
    return [_UIDragDetectorBoundingBehavior.Automatic, _UIDragDetectorBoundingBehavior.EntireObject, _UIDragDetectorBoundingBehavior.HitPoint];
  }
  static FromValue(value) {
    return _UIDragDetectorBoundingBehavior.Items.find((item) => item._value === value);
  }
};
var UIDragDetectorDragRelativity = class _UIDragDetectorDragRelativity extends EnumItem {
  static Absolute = new _UIDragDetectorDragRelativity("Absolute", 0);
  static Relative = new _UIDragDetectorDragRelativity("Relative", 1);
  static get Items() {
    return [_UIDragDetectorDragRelativity.Absolute, _UIDragDetectorDragRelativity.Relative];
  }
  static FromValue(value) {
    return _UIDragDetectorDragRelativity.Items.find((item) => item._value === value);
  }
};
var UIDragDetectorDragSpace = class _UIDragDetectorDragSpace extends EnumItem {
  static Parent = new _UIDragDetectorDragSpace("Parent", 0);
  static LayerCollector = new _UIDragDetectorDragSpace("LayerCollector", 1);
  static Reference = new _UIDragDetectorDragSpace("Reference", 2);
  static get Items() {
    return [_UIDragDetectorDragSpace.Parent, _UIDragDetectorDragSpace.LayerCollector, _UIDragDetectorDragSpace.Reference];
  }
  static FromValue(value) {
    return _UIDragDetectorDragSpace.Items.find((item) => item._value === value);
  }
};
var UIDragDetectorDragStyle = class _UIDragDetectorDragStyle extends EnumItem {
  static TranslatePlane = new _UIDragDetectorDragStyle("TranslatePlane", 0);
  static TranslateLine = new _UIDragDetectorDragStyle("TranslateLine", 1);
  static Rotate = new _UIDragDetectorDragStyle("Rotate", 2);
  static Scriptable = new _UIDragDetectorDragStyle("Scriptable", 3);
  static get Items() {
    return [_UIDragDetectorDragStyle.TranslatePlane, _UIDragDetectorDragStyle.TranslateLine, _UIDragDetectorDragStyle.Rotate, _UIDragDetectorDragStyle.Scriptable];
  }
  static FromValue(value) {
    return _UIDragDetectorDragStyle.Items.find((item) => item._value === value);
  }
};
var UIDragDetectorResponseStyle = class _UIDragDetectorResponseStyle extends EnumItem {
  static Offset = new _UIDragDetectorResponseStyle("Offset", 0);
  static Scale = new _UIDragDetectorResponseStyle("Scale", 1);
  static CustomOffset = new _UIDragDetectorResponseStyle("CustomOffset", 2);
  static CustomScale = new _UIDragDetectorResponseStyle("CustomScale", 3);
  static get Items() {
    return [_UIDragDetectorResponseStyle.Offset, _UIDragDetectorResponseStyle.Scale, _UIDragDetectorResponseStyle.CustomOffset, _UIDragDetectorResponseStyle.CustomScale];
  }
  static FromValue(value) {
    return _UIDragDetectorResponseStyle.Items.find((item) => item._value === value);
  }
};
var UIDragSpeedAxisMapping = class _UIDragSpeedAxisMapping extends EnumItem {
  static XY = new _UIDragSpeedAxisMapping("XY", 0);
  static XX = new _UIDragSpeedAxisMapping("XX", 1);
  static YY = new _UIDragSpeedAxisMapping("YY", 2);
  static get Items() {
    return [_UIDragSpeedAxisMapping.XY, _UIDragSpeedAxisMapping.XX, _UIDragSpeedAxisMapping.YY];
  }
  static FromValue(value) {
    return _UIDragSpeedAxisMapping.Items.find((item) => item._value === value);
  }
};
var UIFlexAlignment = class _UIFlexAlignment extends EnumItem {
  static None = new _UIFlexAlignment("None", 0);
  static Fill = new _UIFlexAlignment("Fill", 1);
  static SpaceAround = new _UIFlexAlignment("SpaceAround", 2);
  static SpaceBetween = new _UIFlexAlignment("SpaceBetween", 3);
  static SpaceEvenly = new _UIFlexAlignment("SpaceEvenly", 4);
  static get Items() {
    return [_UIFlexAlignment.None, _UIFlexAlignment.Fill, _UIFlexAlignment.SpaceAround, _UIFlexAlignment.SpaceBetween, _UIFlexAlignment.SpaceEvenly];
  }
  static FromValue(value) {
    return _UIFlexAlignment.Items.find((item) => item._value === value);
  }
};
var UIFlexMode = class _UIFlexMode extends EnumItem {
  static None = new _UIFlexMode("None", 0);
  static Grow = new _UIFlexMode("Grow", 1);
  static Shrink = new _UIFlexMode("Shrink", 2);
  static Fill = new _UIFlexMode("Fill", 3);
  static Custom = new _UIFlexMode("Custom", 4);
  static get Items() {
    return [_UIFlexMode.None, _UIFlexMode.Grow, _UIFlexMode.Shrink, _UIFlexMode.Fill, _UIFlexMode.Custom];
  }
  static FromValue(value) {
    return _UIFlexMode.Items.find((item) => item._value === value);
  }
};
var VRControllerModelMode = class _VRControllerModelMode extends EnumItem {
  static Disabled = new _VRControllerModelMode("Disabled", 0);
  static Transparent = new _VRControllerModelMode("Transparent", 1);
  static get Items() {
    return [_VRControllerModelMode.Disabled, _VRControllerModelMode.Transparent];
  }
  static FromValue(value) {
    return _VRControllerModelMode.Items.find((item) => item._value === value);
  }
};
var VRLaserPointerMode = class _VRLaserPointerMode extends EnumItem {
  static Disabled = new _VRLaserPointerMode("Disabled", 0);
  static Pointer = new _VRLaserPointerMode("Pointer", 1);
  static DualPointer = new _VRLaserPointerMode("DualPointer", 2);
  static get Items() {
    return [_VRLaserPointerMode.Disabled, _VRLaserPointerMode.Pointer, _VRLaserPointerMode.DualPointer];
  }
  static FromValue(value) {
    return _VRLaserPointerMode.Items.find((item) => item._value === value);
  }
};
var VRScaling = class _VRScaling extends EnumItem {
  static World = new _VRScaling("World", 0);
  static Off = new _VRScaling("Off", 1);
  static get Items() {
    return [_VRScaling.World, _VRScaling.Off];
  }
  static FromValue(value) {
    return _VRScaling.Items.find((item) => item._value === value);
  }
};
var VelocityConstraintMode = class _VelocityConstraintMode extends EnumItem {
  static Line = new _VelocityConstraintMode("Line", 0);
  static Plane = new _VelocityConstraintMode("Plane", 1);
  static Vector = new _VelocityConstraintMode("Vector", 2);
  static get Items() {
    return [_VelocityConstraintMode.Line, _VelocityConstraintMode.Plane, _VelocityConstraintMode.Vector];
  }
  static FromValue(value) {
    return _VelocityConstraintMode.Items.find((item) => item._value === value);
  }
};
var VerticalAlignment = class _VerticalAlignment extends EnumItem {
  static Center = new _VerticalAlignment("Center", 0);
  static Top = new _VerticalAlignment("Top", 1);
  static Bottom = new _VerticalAlignment("Bottom", 2);
  static get Items() {
    return [_VerticalAlignment.Center, _VerticalAlignment.Top, _VerticalAlignment.Bottom];
  }
  static FromValue(value) {
    return _VerticalAlignment.Items.find((item) => item._value === value);
  }
};
var VerticalScrollBarPosition = class _VerticalScrollBarPosition extends EnumItem {
  static Right = new _VerticalScrollBarPosition("Right", 0);
  static Left = new _VerticalScrollBarPosition("Left", 1);
  static get Items() {
    return [_VerticalScrollBarPosition.Right, _VerticalScrollBarPosition.Left];
  }
  static FromValue(value) {
    return _VerticalScrollBarPosition.Items.find((item) => item._value === value);
  }
};
var VideoDeviceCaptureQuality = class _VideoDeviceCaptureQuality extends EnumItem {
  static Default = new _VideoDeviceCaptureQuality("Default", 0);
  static Low = new _VideoDeviceCaptureQuality("Low", 1);
  static Medium = new _VideoDeviceCaptureQuality("Medium", 2);
  static High = new _VideoDeviceCaptureQuality("High", 3);
  static get Items() {
    return [_VideoDeviceCaptureQuality.Default, _VideoDeviceCaptureQuality.Low, _VideoDeviceCaptureQuality.Medium, _VideoDeviceCaptureQuality.High];
  }
  static FromValue(value) {
    return _VideoDeviceCaptureQuality.Items.find((item) => item._value === value);
  }
};
var ViewMode = class _ViewMode extends EnumItem {
  static None = new _ViewMode("None", 0);
  static GeometryComplexity = new _ViewMode("GeometryComplexity", 1);
  static Transparent = new _ViewMode("Transparent", 2);
  static Decal = new _ViewMode("Decal", 3);
  static get Items() {
    return [_ViewMode.None, _ViewMode.GeometryComplexity, _ViewMode.Transparent, _ViewMode.Decal];
  }
  static FromValue(value) {
    return _ViewMode.Items.find((item) => item._value === value);
  }
};
var VirtualCursorMode = class _VirtualCursorMode extends EnumItem {
  static Default = new _VirtualCursorMode("Default", 0);
  static Disabled = new _VirtualCursorMode("Disabled", 1);
  static Enabled = new _VirtualCursorMode("Enabled", 2);
  static get Items() {
    return [_VirtualCursorMode.Default, _VirtualCursorMode.Disabled, _VirtualCursorMode.Enabled];
  }
  static FromValue(value) {
    return _VirtualCursorMode.Items.find((item) => item._value === value);
  }
};
var VoiceChatDistanceAttenuationType = class _VoiceChatDistanceAttenuationType extends EnumItem {
  static Inverse = new _VoiceChatDistanceAttenuationType("Inverse", 0);
  static Legacy = new _VoiceChatDistanceAttenuationType("Legacy", 1);
  static get Items() {
    return [_VoiceChatDistanceAttenuationType.Inverse, _VoiceChatDistanceAttenuationType.Legacy];
  }
  static FromValue(value) {
    return _VoiceChatDistanceAttenuationType.Items.find((item) => item._value === value);
  }
};
var VolumetricAudio = class _VolumetricAudio extends EnumItem {
  static Disabled = new _VolumetricAudio("Disabled", 0);
  static Automatic = new _VolumetricAudio("Automatic", 1);
  static Enabled = new _VolumetricAudio("Enabled", 2);
  static get Items() {
    return [_VolumetricAudio.Disabled, _VolumetricAudio.Automatic, _VolumetricAudio.Enabled];
  }
  static FromValue(value) {
    return _VolumetricAudio.Items.find((item) => item._value === value);
  }
};
var WrapLayerAutoSkin = class _WrapLayerAutoSkin extends EnumItem {
  static Disabled = new _WrapLayerAutoSkin("Disabled", 0);
  static EnabledPreserve = new _WrapLayerAutoSkin("EnabledPreserve", 1);
  static EnabledOverride = new _WrapLayerAutoSkin("EnabledOverride", 2);
  static get Items() {
    return [_WrapLayerAutoSkin.Disabled, _WrapLayerAutoSkin.EnabledPreserve, _WrapLayerAutoSkin.EnabledOverride];
  }
  static FromValue(value) {
    return _WrapLayerAutoSkin.Items.find((item) => item._value === value);
  }
};
var ZIndexBehavior = class _ZIndexBehavior extends EnumItem {
  static Global = new _ZIndexBehavior("Global", 0);
  static Sibling = new _ZIndexBehavior("Sibling", 1);
  static get Items() {
    return [_ZIndexBehavior.Global, _ZIndexBehavior.Sibling];
  }
  static FromValue(value) {
    return _ZIndexBehavior.Items.find((item) => item._value === value);
  }
};
var EnumMap = class {
  _map = getEnumMap();
  getFactory(className, propName) {
    return this._map.get(`${className},${propName}`);
  }
};
function getEnumMap() {
  const map = /* @__PURE__ */ new Map();
  map.set("AccessoryDescription,AccessoryType", AccessoryType.FromValue);
  map.set("Accessory,AccessoryType", AccessoryType.FromValue);
  map.set("AnimationClip,Priority", AnimationPriority.FromValue);
  map.set("AudioAnalyzer,WindowSize", AudioWindowSize.FromValue);
  map.set("AudioChannelMixer,Layout", AudioChannelLayout.FromValue);
  map.set("AudioChannelSplitter,Layout", AudioChannelLayout.FromValue);
  map.set("AudioDeviceInput,AccessType", AccessModifierType.FromValue);
  map.set("AudioEmitter,SimulationFidelity", AudioSimulationFidelity.FromValue);
  map.set("AudioFilter,FilterType", AudioFilterType.FromValue);
  map.set("AudioListener,SimulationFidelity", AudioSimulationFidelity.FromValue);
  map.set("AudioPitchShifter,WindowSize", AudioWindowSize.FromValue);
  map.set("AudioSearchParams,AudioSubType", AudioSubType.FromValue);
  map.set("AudioSearchParams,AudioSubtype", AudioSubType.FromValue);
  map.set("AvatarAccessoryRules,AccessoryMode", AvatarSettingsAccessoryMode.FromValue);
  map.set("AvatarAccessoryRules,CustomAccessoryMode", AvatarSettingsCustomAccessoryMode.FromValue);
  map.set("AvatarAccessoryRules,LimitMethod", AvatarSettingsAccessoryLimitMethod.FromValue);
  map.set("AvatarAnimationRules,AnimationClipsMode", AvatarSettingsAnimationClipsMode.FromValue);
  map.set("AvatarAnimationRules,AnimationPacksMode", AvatarSettingsAnimationPacksMode.FromValue);
  map.set("AvatarBodyRules,AppearanceMode", AvatarSettingsAppearanceMode.FromValue);
  map.set("AvatarBodyRules,BuildMode", AvatarSettingsBuildMode.FromValue);
  map.set("AvatarBodyRules,CustomBodyType", AvatarSettingsCustomBodyType.FromValue);
  map.set("AvatarBodyRules,ScaleMode", AvatarSettingsScaleMode.FromValue);
  map.set("AvatarClothingRules,ClothingMode", AvatarSettingsClothingMode.FromValue);
  map.set("AvatarClothingRules,CustomClothingMode", AvatarSettingsCustomClothingMode.FromValue);
  map.set("AvatarCollisionRules,CollisionMode", AvatarSettingsCollisionMode.FromValue);
  map.set("AvatarCollisionRules,HitAndTouchDetectionMode", AvatarSettingsHitAndTouchDetectionMode.FromValue);
  map.set("AvatarCollisionRules,LegacyCollisionMode", AvatarSettingsLegacyCollisionMode.FromValue);
  map.set("AvatarRules,AvatarType", GameAvatarType.FromValue);
  map.set("StarterGui,RtlTextSupport", RtlTextSupport.FromValue);
  map.set("StarterGui,ScreenOrientation", ScreenOrientation.FromValue);
  map.set("StarterGui,VirtualCursorMode", VirtualCursorMode.FromValue);
  map.set("WrapLayer,AutoSkin", WrapLayerAutoSkin.FromValue);
  map.set("Beam,TextureMode", TextureMode.FromValue);
  map.set("BodyPartDescription,BodyPart", BodyPart.FromValue);
  map.set("CharacterMesh,BodyPart", BodyPart.FromValue);
  map.set("DragDetector,DragStyle", DragDetectorDragStyle.FromValue);
  map.set("DragDetector,GamepadModeSwitchKeyCode", KeyCode.FromValue);
  map.set("DragDetector,KeyboardModeSwitchKeyCode", KeyCode.FromValue);
  map.set("DragDetector,PermissionPolicy", DragDetectorPermissionPolicy.FromValue);
  map.set("DragDetector,ResponseStyle", DragDetectorResponseStyle.FromValue);
  map.set("DragDetector,VRSwitchKeyCode", KeyCode.FromValue);
  map.set("AlignOrientation,AlignType", AlignType.FromValue);
  map.set("AlignOrientation,Mode", OrientationAlignmentMode.FromValue);
  map.set("AlignPosition,ForceLimitMode", ForceLimitMode.FromValue);
  map.set("AlignPosition,ForceRelativeTo", ActuatorRelativeTo.FromValue);
  map.set("AlignPosition,Mode", PositionAlignmentMode.FromValue);
  map.set("AngularVelocity,RelativeTo", ActuatorRelativeTo.FromValue);
  map.set("HingeConstraint,ActuatorType", ActuatorType.FromValue);
  map.set("LinearVelocity,ForceLimitMode", ForceLimitMode.FromValue);
  map.set("LinearVelocity,RelativeTo", ActuatorRelativeTo.FromValue);
  map.set("LinearVelocity,VelocityConstraintMode", VelocityConstraintMode.FromValue);
  map.set("SlidingBallConstraint,ActuatorType", ActuatorType.FromValue);
  map.set("CylindricalConstraint,AngularActuatorType", ActuatorType.FromValue);
  map.set("Torque,RelativeTo", ActuatorRelativeTo.FromValue);
  map.set("VectorForce,RelativeTo", ActuatorRelativeTo.FromValue);
  map.set("SpecialMesh,MeshType", MeshType.FromValue);
  map.set("Dialog,BehaviorType", DialogBehaviorType.FromValue);
  map.set("Dialog,Purpose", DialogPurpose.FromValue);
  map.set("Dialog,Tone", DialogTone.FromValue);
  map.set("EulerRotationCurve,RotationOrder", RotationOrder.FromValue);
  map.set("Explosion,ExplosionType", ExplosionType.FromValue);
  map.set("FaceInstance,Face", NormalId.FromValue);
  map.set("Feature,FaceId", NormalId.FromValue);
  map.set("Feature,InOut", InOut.FromValue);
  map.set("Feature,LeftRight", LeftRight.FromValue);
  map.set("Feature,TopBottom", TopBottom.FromValue);
  map.set("GuiBase2d,SelectionBehaviorDown", SelectionBehavior.FromValue);
  map.set("GuiBase2d,SelectionBehaviorLeft", SelectionBehavior.FromValue);
  map.set("GuiBase2d,SelectionBehaviorRight", SelectionBehavior.FromValue);
  map.set("GuiBase2d,SelectionBehaviorUp", SelectionBehavior.FromValue);
  map.set("GuiObject,AutomaticSize", AutomaticSize.FromValue);
  map.set("GuiObject,BorderMode", BorderMode.FromValue);
  map.set("GuiObject,SizeConstraint", SizeConstraint.FromValue);
  map.set("Frame,Style", FrameStyle.FromValue);
  map.set("GuiButton,Style", ButtonStyle.FromValue);
  map.set("ImageButton,ResampleMode", ResamplerMode.FromValue);
  map.set("ImageButton,ScaleType", ScaleType.FromValue);
  map.set("TextButton,FontSize", FontSize.FromValue);
  map.set("TextButton,TextDirection", TextDirection.FromValue);
  map.set("TextButton,TextTruncate", TextTruncate.FromValue);
  map.set("TextButton,TextXAlignment", TextXAlignment.FromValue);
  map.set("TextButton,TextYAlignment", TextYAlignment.FromValue);
  map.set("ImageLabel,ResampleMode", ResamplerMode.FromValue);
  map.set("ImageLabel,ScaleType", ScaleType.FromValue);
  map.set("TextLabel,FontSize", FontSize.FromValue);
  map.set("TextLabel,TextDirection", TextDirection.FromValue);
  map.set("TextLabel,TextTruncate", TextTruncate.FromValue);
  map.set("TextLabel,TextXAlignment", TextXAlignment.FromValue);
  map.set("TextLabel,TextYAlignment", TextYAlignment.FromValue);
  map.set("ScrollingFrame,AutomaticCanvasSize", AutomaticSize.FromValue);
  map.set("ScrollingFrame,ElasticBehavior", ElasticBehavior.FromValue);
  map.set("ScrollingFrame,HorizontalScrollBarInset", ScrollBarInset.FromValue);
  map.set("ScrollingFrame,ScrollingDirection", ScrollingDirection.FromValue);
  map.set("ScrollingFrame,VerticalScrollBarInset", ScrollBarInset.FromValue);
  map.set("ScrollingFrame,VerticalScrollBarPosition", VerticalScrollBarPosition.FromValue);
  map.set("TextBox,FontSize", FontSize.FromValue);
  map.set("TextBox,TextDirection", TextDirection.FromValue);
  map.set("TextBox,TextTruncate", TextTruncate.FromValue);
  map.set("TextBox,TextXAlignment", TextXAlignment.FromValue);
  map.set("TextBox,TextYAlignment", TextYAlignment.FromValue);
  map.set("VideoDisplay,ResampleMode", ResamplerMode.FromValue);
  map.set("VideoDisplay,ScaleType", ScaleType.FromValue);
  map.set("LayerCollector,ZIndexBehavior", ZIndexBehavior.FromValue);
  map.set("ScreenGui,SafeAreaCompatibility", SafeAreaCompatibility.FromValue);
  map.set("ScreenGui,ScreenInsets", ScreenInsets.FromValue);
  map.set("SurfaceGuiBase,Face", NormalId.FromValue);
  map.set("AdGui,AdShape", AdShape.FromValue);
  map.set("SurfaceGui,SizingMode", SurfaceGuiSizingMode.FromValue);
  map.set("HandleAdornment,AdornCullingMode", AdornCullingMode.FromValue);
  map.set("Handles,Style", HandlesStyle.FromValue);
  map.set("SurfaceSelection,TargetSurface", NormalId.FromValue);
  map.set("HapticEffect,Type", HapticEffectType.FromValue);
  map.set("Highlight,DepthMode", HighlightDepthMode.FromValue);
  map.set("Humanoid,CollisionType", HumanoidCollisionType.FromValue);
  map.set("Humanoid,DisplayDistanceType", HumanoidDisplayDistanceType.FromValue);
  map.set("Humanoid,HealthDisplayType", HumanoidHealthDisplayType.FromValue);
  map.set("Humanoid,NameOcclusion", NameOcclusion.FromValue);
  map.set("Humanoid,RigType", HumanoidRigType.FromValue);
  map.set("IKControl,Type", IKControlType.FromValue);
  map.set("InputAction,Type", InputActionType.FromValue);
  map.set("InputBinding,Down", KeyCode.FromValue);
  map.set("InputBinding,KeyCode", KeyCode.FromValue);
  map.set("InputBinding,Left", KeyCode.FromValue);
  map.set("InputBinding,Right", KeyCode.FromValue);
  map.set("InputBinding,Up", KeyCode.FromValue);
  map.set("SpotLight,Face", NormalId.FromValue);
  map.set("SurfaceLight,Face", NormalId.FromValue);
  map.set("Lighting,LightingStyle", LightingStyle.FromValue);
  map.set("Lighting,Technology", Technology.FromValue);
  map.set("BaseScript,RunContext", RunContext.FromValue);
  map.set("MaterialVariant,BaseMaterial", Material.FromValue);
  map.set("MaterialVariant,MaterialPattern", MaterialPattern.FromValue);
  map.set("Noise,NoiseType", NoiseType.FromValue);
  map.set("BasePart,BackSurface", SurfaceType.FromValue);
  map.set("BasePart,BackSurfaceInput", InputType.FromValue);
  map.set("BasePart,BottomSurface", SurfaceType.FromValue);
  map.set("BasePart,BottomSurfaceInput", InputType.FromValue);
  map.set("BasePart,FrontSurface", SurfaceType.FromValue);
  map.set("BasePart,FrontSurfaceInput", InputType.FromValue);
  map.set("BasePart,LeftSurface", SurfaceType.FromValue);
  map.set("BasePart,LeftSurfaceInput", InputType.FromValue);
  map.set("BasePart,Material", Material.FromValue);
  map.set("BasePart,RightSurface", SurfaceType.FromValue);
  map.set("BasePart,RightSurfaceInput", InputType.FromValue);
  map.set("BasePart,TopSurface", SurfaceType.FromValue);
  map.set("BasePart,TopSurfaceInput", InputType.FromValue);
  map.set("FormFactorPart,FormFactor", FormFactor.FromValue);
  map.set("FormFactorPart,formFactor", FormFactor.FromValue);
  map.set("FormFactorPart,formFactorRaw", FormFactor.FromValue);
  map.set("Part,shape", PartType.FromValue);
  map.set("Terrain,AcquisitionMethod", TerrainAcquisitionMethod.FromValue);
  map.set("TriangleMeshPart,FluidFidelityInternal", FluidFidelity.FromValue);
  map.set("MeshPart,RenderFidelity", RenderFidelity.FromValue);
  map.set("PartOperation,FormFactor", FormFactor.FromValue);
  map.set("PartOperation,RenderFidelity", RenderFidelity.FromValue);
  map.set("TrussPart,style", Style.FromValue);
  map.set("Camera,CameraType", CameraType.FromValue);
  map.set("Camera,FieldOfViewMode", FieldOfViewMode.FromValue);
  map.set("Model,LevelOfDetail", ModelLevelOfDetail.FromValue);
  map.set("Model,ModelStreamingMode", ModelStreamingMode.FromValue);
  map.set("HopperBin,BinType", BinType.FromValue);
  map.set("Workspace,AvatarUnificationMode", AvatarUnificationMode.FromValue);
  map.set("Workspace,ClientAnimatorThrottling", ClientAnimatorThrottlingMode.FromValue);
  map.set("Workspace,FluidForces", FluidForces.FromValue);
  map.set("Workspace,IKControlConstraintSupport", IKControlConstraintSupport.FromValue);
  map.set("Workspace,MeshPartHeadsAndAccessories", MeshPartHeadsAndAccessories.FromValue);
  map.set("Workspace,ModelStreamingBehavior", ModelStreamingBehavior.FromValue);
  map.set("Workspace,MoverConstraintRootBehavior", MoverConstraintRootBehaviorMode.FromValue);
  map.set("Workspace,PathfindingUseImprovedSearch", PathfindingUseImprovedSearch.FromValue);
  map.set("Workspace,PhysicsImprovedSleep", RolloutState.FromValue);
  map.set("Workspace,PhysicsSteppingMethod", PhysicsSteppingMethod.FromValue);
  map.set("Workspace,PlayerCharacterDestroyBehavior", PlayerCharacterDestroyBehavior.FromValue);
  map.set("Workspace,PrimalPhysicsSolver", PrimalPhysicsSolver.FromValue);
  map.set("Workspace,RejectCharacterDeletions", RejectCharacterDeletions.FromValue);
  map.set("Workspace,RenderingCacheOptimizations", RenderingCacheOptimizationMode.FromValue);
  map.set("Workspace,ReplicateInstanceDestroySetting", ReplicateInstanceDestroySetting.FromValue);
  map.set("Workspace,Retargeting", AnimatorRetargetingMode.FromValue);
  map.set("Workspace,SandboxedInstanceMode", SandboxedInstanceMode.FromValue);
  map.set("Workspace,SignalBehavior2", SignalBehavior.FromValue);
  map.set("Workspace,StreamOutBehavior", StreamOutBehavior.FromValue);
  map.set("Workspace,StreamingIntegrityMode", StreamingIntegrityMode.FromValue);
  map.set("Workspace,TouchEventsUseCollisionGroups", RolloutState.FromValue);
  map.set("ParticleEmitter,EmissionDirection", NormalId.FromValue);
  map.set("ParticleEmitter,FlipbookLayout", ParticleFlipbookLayout.FromValue);
  map.set("ParticleEmitter,FlipbookMode", ParticleFlipbookMode.FromValue);
  map.set("ParticleEmitter,Orientation", ParticleOrientation.FromValue);
  map.set("ParticleEmitter,Shape", ParticleEmitterShape.FromValue);
  map.set("ParticleEmitter,ShapeInOut", ParticleEmitterShapeInOut.FromValue);
  map.set("ParticleEmitter,ShapeStyle", ParticleEmitterShapeStyle.FromValue);
  map.set("Player,CameraMode", CameraMode.FromValue);
  map.set("Player,DevCameraOcclusionMode", DevCameraOcclusionMode.FromValue);
  map.set("Player,DevComputerCameraMode", DevComputerCameraMovementMode.FromValue);
  map.set("Player,DevComputerMovementMode", DevComputerMovementMode.FromValue);
  map.set("Player,DevTouchCameraMode", DevTouchCameraMovementMode.FromValue);
  map.set("Player,DevTouchMovementMode", DevTouchMovementMode.FromValue);
  map.set("PlayerDataService,LoadFailureBehavior", PlayerDataLoadFailureBehavior.FromValue);
  map.set("PolicyService,IsLuobuServer", TriStateBoolean.FromValue);
  map.set("PolicyService,LuobuWhitelisted", TriStateBoolean.FromValue);
  map.set("PoseBase,EasingDirection", PoseEasingDirection.FromValue);
  map.set("PoseBase,EasingStyle", PoseEasingStyle.FromValue);
  map.set("ColorGradingEffect,TonemapperPreset", TonemapperPreset.FromValue);
  map.set("ProximityPrompt,Exclusivity", ProximityPromptExclusivity.FromValue);
  map.set("ProximityPrompt,GamepadKeyCode", KeyCode.FromValue);
  map.set("ProximityPrompt,KeyboardKeyCode", KeyCode.FromValue);
  map.set("ProximityPrompt,Style", ProximityPromptStyle.FromValue);
  map.set("ReflectionMetadataClass,ServiceVisibility", ServiceVisibility.FromValue);
  map.set("RenderSettings,EditQualityLevel", QualityLevel.FromValue);
  map.set("RenderSettings,FrameRateManager", FramerateManagerMode.FromValue);
  map.set("RenderSettings,GraphicsMode", GraphicsMode.FromValue);
  map.set("RenderSettings,MeshPartDetailLevel", MeshPartDetailLevel.FromValue);
  map.set("RenderSettings,QualityLevel", QualityLevel.FromValue);
  map.set("RenderSettings,ViewMode", ViewMode.FromValue);
  map.set("RenderingTest,ComparisonMethod", RenderingTestComparisonMethod.FromValue);
  map.set("SensorBase,UpdateType", SensorUpdateType.FromValue);
  map.set("ControllerPartSensor,SensorMode", SensorMode.FromValue);
  map.set("Sound,RollOffMode", RollOffMode.FromValue);
  map.set("SoundService,AmbientReverb", ReverbType.FromValue);
  map.set("SoundService,AudioApiByDefault", RolloutState.FromValue);
  map.set("SoundService,CharacterSoundsUseNewApi", RolloutState.FromValue);
  map.set("SoundService,DefaultListenerLocation", ListenerLocation.FromValue);
  map.set("SoundService,VolumetricAudio", VolumetricAudio.FromValue);
  map.set("StarterPlayer,AvatarJointUpgrade_SerializedRollout", RolloutState.FromValue);
  map.set("StarterPlayer,CameraMode", CameraMode.FromValue);
  map.set("StarterPlayer,DevCameraOcclusionMode", DevCameraOcclusionMode.FromValue);
  map.set("StarterPlayer,DevComputerCameraMovementMode", DevComputerCameraMovementMode.FromValue);
  map.set("StarterPlayer,DevComputerMovementMode", DevComputerMovementMode.FromValue);
  map.set("StarterPlayer,DevTouchCameraMovementMode", DevTouchCameraMovementMode.FromValue);
  map.set("StarterPlayer,DevTouchMovementMode", DevTouchMovementMode.FromValue);
  map.set("StarterPlayer,EnableDynamicHeads", LoadDynamicHeads.FromValue);
  map.set("StarterPlayer,GameSettingsAvatar", GameAvatarType.FromValue);
  map.set("StarterPlayer,GameSettingsR15Collision", R15CollisionType.FromValue);
  map.set("StarterPlayer,LoadCharacterLayeredClothing", LoadCharacterLayeredClothing.FromValue);
  map.set("StarterPlayer,LuaCharacterController", CharacterControlMode.FromValue);
  map.set("SurfaceAppearance,AlphaMode", AlphaMode.FromValue);
  map.set("TaskScheduler,ThreadPoolConfig", ThreadPoolConfig.FromValue);
  map.set("TerrainDetail,Face", TerrainFace.FromValue);
  map.set("TerrainDetail,MaterialPattern", MaterialPattern.FromValue);
  map.set("BubbleChatConfiguration,Font", Font.FromValue);
  map.set("ChatInputBarConfiguration,KeyboardKeyCode", KeyCode.FromValue);
  map.set("ChatWindowConfiguration,HorizontalAlignment", HorizontalAlignment.FromValue);
  map.set("ChatWindowConfiguration,VerticalAlignment", VerticalAlignment.FromValue);
  map.set("TextChatService,ChatVersion", ChatVersion.FromValue);
  map.set("Trail,TextureMode", TextureMode.FromValue);
  map.set("UIAspectRatioConstraint,AspectType", AspectType.FromValue);
  map.set("UIAspectRatioConstraint,DominantAxis", DominantAxis.FromValue);
  map.set("UIDragDetector,BoundingBehavior", UIDragDetectorBoundingBehavior.FromValue);
  map.set("UIDragDetector,DragRelativity", UIDragDetectorDragRelativity.FromValue);
  map.set("UIDragDetector,DragSpace", UIDragDetectorDragSpace.FromValue);
  map.set("UIDragDetector,DragStyle", UIDragDetectorDragStyle.FromValue);
  map.set("UIDragDetector,ResponseStyle", UIDragDetectorResponseStyle.FromValue);
  map.set("UIDragDetector,UIDragSpeedAxisMapping", UIDragSpeedAxisMapping.FromValue);
  map.set("UIFlexItem,FlexMode", UIFlexMode.FromValue);
  map.set("UIFlexItem,ItemLineAlignment", ItemLineAlignment.FromValue);
  map.set("UIGridStyleLayout,FillDirection", FillDirection.FromValue);
  map.set("UIGridStyleLayout,HorizontalAlignment", HorizontalAlignment.FromValue);
  map.set("UIGridStyleLayout,SortOrder", SortOrder.FromValue);
  map.set("UIGridStyleLayout,VerticalAlignment", VerticalAlignment.FromValue);
  map.set("UIGridLayout,StartCorner", StartCorner.FromValue);
  map.set("UIListLayout,HorizontalFlex", UIFlexAlignment.FromValue);
  map.set("UIListLayout,ItemLineAlignment", ItemLineAlignment.FromValue);
  map.set("UIListLayout,VerticalFlex", UIFlexAlignment.FromValue);
  map.set("UIPageLayout,EasingDirection", EasingDirection.FromValue);
  map.set("UIPageLayout,EasingStyle", EasingStyle.FromValue);
  map.set("UITableLayout,MajorAxis", TableMajorAxis.FromValue);
  map.set("UIStroke,ApplyStrokeMode", ApplyStrokeMode.FromValue);
  map.set("UIStroke,LineJoinMode", LineJoinMode.FromValue);
  map.set("UserInputService,MouseBehavior", MouseBehavior.FromValue);
  map.set("VRService,AutomaticScaling", VRScaling.FromValue);
  map.set("VRService,ControllerModels", VRControllerModelMode.FromValue);
  map.set("VRService,LaserPointer", VRLaserPointerMode.FromValue);
  map.set("VideoDeviceInput,CaptureQuality", VideoDeviceCaptureQuality.FromValue);
  map.set("VoiceChatService,DefaultDistanceAttenuation", VoiceChatDistanceAttenuationType.FromValue);
  map.set("VoiceChatService,UseAudioApi", AudioApiRollout.FromValue);
  return map;
}
var RobloxFileDOMReader = class extends RobloxFileDOM {
  data = new RobloxFileByteReader();
  enumMap = new EnumMap();
  classMap = new ClassMap();
  model = new RobloxFile();
  /**
   * This will parse the DOM and create a RobloxModel object.
   * If the DOM is not valid, this will return null.
   * @param .rbxm bytes
   * @returns a Roblox model or null if the DOM is invalid.
   */
  read(data) {
    this.data = new RobloxFileByteReader(data);
    this.model = new RobloxFile();
    this.classIdToInfo.clear();
    this.referentIdToClassId.clear();
    if (!this.readHeader()) {
      return null;
    }
    let chunkType;
    do {
      chunkType = this.readChunk();
    } while (chunkType !== "END\0");
    this.findRoots();
    if (this.model.Roots.length === 0)
      return null;
    return this.model;
  }
  findRoots() {
    for (const classInfo of this.classIdToInfo.values()) {
      for (const instance of classInfo.instances) {
        if (!instance.Parent) {
          this.model.AddRoot(instance);
        }
      }
    }
  }
  readHeader() {
    if (this.data.length < 48) {
      return false;
    }
    const magicBytes = this.data.getBytesAsString(this.MAGIC_HEADER.length);
    if (magicBytes !== this.MAGIC_HEADER) {
      return false;
    }
    this.data.getUint16();
    this.data.getInt32();
    this.data.getInt32();
    this.data.skipBytes(8);
    return true;
  }
  readChunk() {
    const { chunkType, compressedLength, uncompressedLength } = this.readChunkHeader();
    this.readChunkContent(chunkType, compressedLength, uncompressedLength);
    return chunkType;
  }
  readChunkHeader() {
    const chunkType = this.data.getBytesAsString(4);
    const compressedLength = this.data.getUint32();
    const uncompressedLength = this.data.getUint32();
    this.data.skipBytes(4);
    return { chunkType, compressedLength, uncompressedLength };
  }
  readChunkContent(chunkType, compressedLength, uncompressedLength) {
    if (chunkType === "END\0") {
      return;
    }
    const bytes = this.readChunkContentBytes(compressedLength, uncompressedLength);
    switch (chunkType) {
      case "META":
        this.readMetaChunk(bytes);
        break;
      case "SSTR":
        this.readSstrChunk(bytes);
        break;
      case "INST":
        this.readInstChunk(bytes);
        break;
      case "PROP":
        this.readPropChunk(bytes);
        break;
      case "PRNT":
        this.readPrntChunk(bytes);
        break;
    }
  }
  readChunkContentBytes(compressedLength, uncompressedLength) {
    let byteArray;
    if (compressedLength !== 0) {
      const compressedBytes = this.data.getBytes(compressedLength);
      byteArray = Buffer.allocUnsafe(uncompressedLength);
      if (compressedBytes[0] === 40 && compressedBytes[1] === 181 && compressedBytes[2] === 47 && compressedBytes[3] === 253) {
        decompress(compressedBytes, byteArray);
      } else {
        lz4_browser_default.decodeBlock(Buffer.from(compressedBytes), byteArray);
      }
    } else {
      byteArray = this.data.getBytes(uncompressedLength);
    }
    return new RobloxFileByteReader(byteArray);
  }
  readMetaChunk(bytes) {
    const entries = bytes.getUint32();
    for (let i = 0; i < entries; ++i) {
      const key = bytes.getString();
      const value = bytes.getString();
      this.model.Metadata.set(key, value);
    }
  }
  readSstrChunk(bytes) {
    bytes.getUint32();
    const count = bytes.getUint32();
    for (let i = 0; i < count; ++i) {
      const hash = bytes.getBytesAsString(16);
      const sharedString = bytes.getString();
      this.model.SharedStrings.push(new SharedString(sharedString, hash));
    }
  }
  readInstChunk(bytes) {
    const classId = bytes.getUint32();
    const className = bytes.getString();
    const isService = bytes.getBool();
    const numInstances = bytes.getUint32();
    const referents = bytes.getReferentArray(numInstances);
    const referentIdToIndex = /* @__PURE__ */ new Map();
    const instances = new Array();
    const classFactory = this.classMap.getFactory(className);
    referents.forEach((referent, index) => {
      referentIdToIndex.set(referent, index);
      this.referentIdToClassId.set(referent, classId);
      const instance = classFactory ? classFactory() : new CoreInstance(isService, className);
      instance.ResetProps();
      instances.push(instance);
      this.model.ReferentMap.set(instance, referent);
    });
    this.classIdToInfo.set(classId, {
      name: className,
      isService,
      instances,
      referentIdToIndex
    });
  }
  readPropChunk(bytes) {
    const classId = bytes.getUint32();
    const propName = bytes.getString();
    const dataType = bytes.getUint8();
    const parser = this.dataTypeParsers.get(dataType);
    if (!parser)
      return;
    const classInfo = this.classIdToInfo.get(classId);
    if (!classInfo)
      return;
    const numInstances = classInfo.instances.length;
    const values = [];
    let extraInfo;
    if (dataType === 18) {
      extraInfo = { enumFactory: this.getEnumFactory(classInfo.name, propName) };
    } else if (dataType === 19) {
      extraInfo = { getInstanceFromReferent: this.getInstanceFromReferent.bind(this) };
    }
    parser.read(bytes, numInstances, values, extraInfo);
    values.forEach((value, index) => {
      if (value !== void 0) {
        const instance = classInfo.instances[index];
        instance.SetProp(propName, value.type, value.value);
      }
    });
  }
  getEnumFactory(className, propName) {
    const classFactory = this.classMap.getFactory(className);
    if (classFactory) {
      const fakeInstance = classFactory();
      for (const inheritedClassName of fakeInstance.ClassNameList) {
        const enumFactory = this.enumMap.getFactory(inheritedClassName, propName);
        if (enumFactory) {
          return enumFactory;
        }
      }
    }
    return void 0;
  }
  readPrntChunk(bytes) {
    bytes.getUint8();
    const numInstances = bytes.getInt32();
    const children = bytes.getReferentArray(numInstances);
    const parents = bytes.getReferentArray(numInstances);
    for (let i = 0; i < numInstances; ++i) {
      const childRef = children[i];
      const parentRef = parents[i];
      if (childRef === -1 || parentRef === -1)
        continue;
      const child = this.getInstanceFromReferent(childRef);
      const parent = this.getInstanceFromReferent(parentRef);
      if (!child || !parent)
        continue;
      child.Parent = parent;
    }
  }
  getInstanceFromReferent(referent) {
    if (referent === -1)
      return null;
    const classId = this.referentIdToClassId.get(referent);
    if (classId === void 0)
      return null;
    const classInfo = this.classIdToInfo.get(classId);
    if (!classInfo)
      return null;
    const index = classInfo.referentIdToIndex.get(referent);
    if (index === void 0)
      return null;
    return classInfo.instances[index];
  }
};
var RobloxFileDOMWriter = class extends RobloxFileDOM {
  model;
  bytesArray = [];
  numBytes = 0;
  instToRefId = /* @__PURE__ */ new Map();
  instToClassId = /* @__PURE__ */ new Map();
  sortedClassIds = [];
  numInstances = 0;
  numClasses = 0;
  classMap = new ClassMap();
  constructor(model) {
    super();
    this.model = model;
  }
  write() {
    this.setup();
    this.writeHeader();
    const metaBytes = this.writeMetaChunk();
    const classWriter = new RobloxFileByteWriter();
    for (const classId of this.sortedClassIds) {
      classWriter.putBytes(this.writeInstChunk(classId, this.classIdToInfo.get(classId)));
    }
    const classBytes = classWriter.bytes;
    const propWriter = new RobloxFileByteWriter();
    for (const classId of this.sortedClassIds) {
      const info = this.classIdToInfo.get(classId);
      const props = this.collectProperties(info.instances);
      for (const prop of props) {
        propWriter.putBytes(this.writePropChunk(classId, info.instances, prop.name, prop.type));
      }
    }
    const propBytes = propWriter.bytes;
    const sstrBytes = this.writeSstrChunk();
    const prntBytes = this.writePrntChunk();
    const endBytes = this.writeEndChunk();
    this.writeBytes(metaBytes);
    this.writeBytes(sstrBytes);
    this.writeBytes(classBytes);
    this.writeBytes(propBytes);
    this.writeBytes(prntBytes);
    this.writeBytes(endBytes);
    const buf = Buffer.allocUnsafe(this.numBytes);
    let i = 0;
    for (const bytes of this.bytesArray) {
      for (const byte of bytes) {
        buf[i] = byte;
        ++i;
      }
    }
    return buf;
  }
  collectProperties(instances) {
    const props = /* @__PURE__ */ new Map();
    const sortedProps = [];
    for (const inst of instances) {
      for (const [name, value] of inst.Props) {
        if (!props.has(name)) {
          props.set(name, value.type);
          sortedProps.push({ name, type: value.type });
        } else if (props.get(name) !== value.type) {
          throw new Error(`Found instances with non-unique property types (class ${inst.ClassName}, property: ${name}, types: ${DataType[props.get(name)]} and ${DataType[value.type]})`);
        }
      }
    }
    sortedProps.sort((prop1, prop2) => prop1.name > prop2.name ? 1 : -1);
    return sortedProps;
  }
  setup() {
    const instances = this.model.GetAllDescendants();
    this.numInstances = instances.length;
    const classNameToId = /* @__PURE__ */ new Map();
    let lastReferent = -1;
    let lastClassId = -1;
    for (const instance of instances) {
      if (instance.IsDestroyed) {
        continue;
      }
      ++lastReferent;
      this.instToRefId.set(instance, lastReferent);
      if (!classNameToId.has(instance.ClassName)) {
        ++lastClassId;
        classNameToId.set(instance.ClassName, lastClassId);
        this.classIdToInfo.set(lastClassId, {
          name: instance.ClassName,
          isService: instance.IsService,
          instances: [instance],
          referentIdToIndex: /* @__PURE__ */ new Map([[lastReferent, 0]])
        });
        this.sortedClassIds.push(lastClassId);
      } else {
        const classId = classNameToId.get(instance.ClassName);
        const info = this.classIdToInfo.get(classId);
        info.instances.push(instance);
        info.referentIdToIndex.set(lastReferent, info.instances.length - 1);
      }
    }
    this.numClasses = this.classIdToInfo.size;
    this.sortedClassIds.sort((id1, id2) => this.classIdToInfo.get(id1).name > this.classIdToInfo.get(id2).name ? 1 : -1);
  }
  writeBytes(bytes) {
    this.numBytes += bytes.length;
    this.bytesArray.push(bytes);
  }
  writeHeader() {
    const writer = new RobloxFileByteWriter();
    writer.putStringAsBytes(this.MAGIC_HEADER);
    writer.putUint16(0);
    writer.putInt32(this.numClasses);
    writer.putInt32(this.numInstances);
    writer.putBytes(new Uint8Array(8));
    this.writeBytes(writer.bytes);
  }
  writeChunk(type, data) {
    const writer = new RobloxFileByteWriter();
    const { compressedLength, uncompressedLength, bytes } = this.compressData(type, data);
    writer.putStringAsBytes(type);
    writer.putUint32(compressedLength);
    writer.putUint32(uncompressedLength);
    writer.putBytes(new Uint8Array(4));
    writer.putBytes(bytes);
    return writer.bytes;
  }
  compressData(type, data) {
    if (type === "END\0") {
      return {
        compressedLength: 0,
        uncompressedLength: data.length,
        bytes: data
      };
    }
    const bytes = Buffer.alloc(lz4_browser_default.encodeBound(data.length));
    const size = lz4_browser_default.encodeBlock(Buffer.from(data), bytes);
    return {
      compressedLength: size,
      uncompressedLength: data.length,
      bytes: bytes.subarray(0, size)
    };
  }
  writeMetaChunk() {
    if (this.model.Metadata.size < 1) {
      return new Uint8Array();
    }
    const writer = new RobloxFileByteWriter();
    writer.putUint32(this.model.Metadata.size);
    for (const [key, value] of this.model.Metadata) {
      writer.putString(key);
      writer.putString(value);
    }
    return this.writeChunk("META", writer.bytes);
  }
  writeSstrChunk() {
    if (this.model.SharedStrings.length < 1) {
      return new Uint8Array();
    }
    const writer = new RobloxFileByteWriter();
    writer.putUint32(0);
    writer.putUint32(this.model.SharedStrings.length);
    for (const sharedString of this.model.SharedStrings) {
      writer.putBytes(sharedString.Hash);
      writer.putString(sharedString.Value);
    }
    return this.writeChunk("SSTR", writer.bytes);
  }
  writeInstChunk(classId, info) {
    const writer = new RobloxFileByteWriter();
    writer.putUint32(classId);
    writer.putString(info.name);
    writer.putBool(info.isService);
    writer.putUint32(info.instances.length);
    const refs = [];
    for (const inst of info.instances) {
      refs.push(this.instToRefId.get(inst));
    }
    writer.putReferentArray(refs);
    if (info.isService) {
      const serviceMarkers = new Uint8Array(info.instances.length);
      for (let i = 0; i < info.instances.length; ++i) {
        serviceMarkers[i] = 1;
      }
      writer.putBytes(serviceMarkers);
    }
    return this.writeChunk("INST", writer.bytes);
  }
  writePropChunk(classId, instances, propName, type) {
    const parser = this.dataTypeParsers.get(type);
    if (!parser)
      return new Uint8Array();
    const writer = new RobloxFileByteWriter();
    writer.putUint32(classId);
    writer.putString(propName);
    writer.putUint8(type);
    let info;
    if (type === 19) {
      info = { getReferentFromInstance: (instance) => this.instToRefId.get(instance) ?? -1 };
    } else if (type === 28) {
      info = { sharedStrings: this.model.SharedStrings };
    }
    parser.write(writer, instances.map((inst) => this.getPropFromInstance(inst, propName)), info);
    return this.writeChunk("PROP", writer.bytes);
  }
  getPropFromInstance(instance, propName) {
    const prop = instance.Props.get(propName);
    if (prop) {
      return prop;
    }
    const classFactory = this.classMap.getFactory(instance.ClassName);
    if (classFactory) {
      const mockInstance = classFactory();
      const mockProp = mockInstance.Props.get(propName);
      return mockProp;
    }
    return void 0;
  }
  writePrntChunk() {
    const writer = new RobloxFileByteWriter();
    writer.putUint8(0);
    writer.putUint32(this.numInstances);
    const sortedInsts = Array.from(this.instToRefId.keys());
    sortedInsts.sort((inst1, inst2) => this.instToRefId.get(inst1) - this.instToRefId.get(inst2));
    const childRefs = [];
    const parentRefs = [];
    for (const inst of sortedInsts) {
      const ref = this.instToRefId.get(inst);
      childRefs.push(ref);
      const parentRef = inst.Parent ? this.instToRefId.get(inst.Parent) : -1;
      parentRefs.push(parentRef);
    }
    writer.putReferentArray(childRefs);
    writer.putReferentArray(parentRefs);
    return this.writeChunk("PRNT", writer.bytes);
  }
  writeEndChunk() {
    const writer = new RobloxFileByteWriter();
    writer.putStringAsBytes(this.MAGIC_END);
    return this.writeChunk("END\0", writer.bytes);
  }
};
var RobloxFile = class extends ChildContainer {
  /**
   * Contains the mapping of metadata strings stored in the file. These come from the META chunk in the DOM.
   */
  Metadata = /* @__PURE__ */ new Map();
  /**
   * Contains the list of shared strings in the file. These come from the SSTR chunk in the DOM.
   */
  SharedStrings = [];
  /**
   * This is used when loading and then saving a file to keep the reference to instance mapping consistent.
   * You probably shouldn't mess with this.
   */
  ReferentMap = /* @__PURE__ */ new Map();
  /**
   * The root instances of this file. This is a readonly array, to add or remove an instance
   * use AddToRoots and RemoveFromRoots
   */
  get Roots() {
    return Array.from(this._children.values());
  }
  /**
   * Adds the given instance as a root of this file.
   * @param instance the instance
   */
  AddRoot(instance) {
    instance.RemoveParent();
    this._children.add(instance);
  }
  /**
   * Removes the given instance as a root of this file.
   * @param instance the instance
   */
  RemoveFromRoots(instance) {
    this._children.delete(instance);
    instance.Destroy();
  }
  /**
   * Writes this model to a Buffer and returns it.
   * @returns a Buffer object that contains the file data in binary form
   * @example const buffer = file.WriteToBuffer();
   * fs.writeFileSync("my_roblox_file.rbxm", buffer);
   */
  WriteToBuffer() {
    return new RobloxFileDOMWriter(this).write();
  }
  /**
   * Create a RobloxFile from a buffer. You could use fs.readFile
   * to load a .rbxm file then pass the result to this function to load it.
   * @param buffer a data buffer
   * @returns a Roblox file object
   * @example const file = RobloxFile.ReadFromBuffer(fs.readFileSync("my_file.rbxm"));
   */
  static ReadFromBuffer(buffer) {
    const data = Uint8Array.from(buffer);
    return new RobloxFileDOMReader().read(data);
  }
};

// ../../AppData/Local/Temp/conblox-rbxm-parser-test/node_modules/rbxm-browser-entry.js
if (!import_buffer.Buffer.prototype.readBigUint64BE) import_buffer.Buffer.prototype.readBigUint64BE = function(offset = 0) {
  let value = 0n;
  for (let index = 0; index < 8; index++) value = value << 8n | BigInt(this[offset + index]);
  return value;
};
if (!import_buffer.Buffer.prototype.readBigInt64BE) import_buffer.Buffer.prototype.readBigInt64BE = function(offset = 0) {
  return BigInt.asIntN(64, this.readBigUint64BE(offset));
};
globalThis.Buffer = globalThis.Buffer || import_buffer.Buffer;
export {
  RobloxFile
};
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
*/
