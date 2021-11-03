export interface Encoder {
  encode(bytes: Uint8Array): string;
}

export interface Decoder {
  decode(bytes: string): Uint8Array;
}
