import { Injectable } from '@nestjs/common';
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHmac,
} from 'node:crypto';
import { AlGORITHM } from './constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  constructor(private readonly configService: ConfigService) {}
  /**
   * Encrypts plain text data using AES-GCM encryption algorithm.
   *
   * @param plainText - The plain text string to be encrypted
   * @returns A base64-encoded string containing the concatenated IV, authentication tag, and encrypted data
   *
   * @remarks
   * This method uses a 12-byte random initialization vector (IV) and creates an authenticated encryption
   * using the AES-GCM mode. The returned string contains the IV (12 bytes), authentication tag (16 bytes),
   * and encrypted data concatenated together and encoded in base64 format.
   *
   * @example
   * ```typescript
   * const encrypted = encryptData("Hello, World!");
   * // Returns: base64 string like "dGVzdGl2MTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6"
   * ```
   */
  encryptData(plainText: string) {
    const iv = randomBytes(12);
    console.log('IV:', iv.toString('hex'));
    const key = Buffer.from(
      this.configService.get<string>('DATA_KEY'),
      'base64',
    );
    console.log('DATA_KEY:', key.toString('hex'));
    const cipher = createCipheriv(AlGORITHM, key, iv);
    console.log('CIPHER:', cipher);
    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  /**
   * Decrypts base64-encoded encrypted data using AES-GCM algorithm.
   *
   * @param encryptedB64 - The base64-encoded string containing the encrypted data,
   *                       which includes the IV (first 12 bytes), authentication tag
   *                       (next 16 bytes), and ciphertext (remaining bytes)
   * @returns The decrypted data as a UTF-8 string
   *
   * @throws Will throw an error if the authentication tag verification fails
   * @throws Will throw an error if the input is not valid base64 or has incorrect format
   *
   * @example
   * ```typescript
   * const encrypted = "base64EncodedEncryptedData...";
   * const decrypted = service.decryptData(encrypted);
   * console.log(decrypted); // "Original plain text"
   * ```
   */
  decryptData(encryptedB64: string) {
    const data = Buffer.from(encryptedB64, 'base64');
    const iv = data.subarray(0, 12);
    const tag = data.subarray(12, 28);
    const ciphertext = data.subarray(28);
    const key = Buffer.from(
      this.configService.get<string>('DATA_KEY'),
      'base64',
    );
    const decipher = createDecipheriv(AlGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');
  }

  /**
   * Generates an HMAC (Hash-based Message Authentication Code) using SHA-256 algorithm.
   *
   * @param value - The input string to be hashed
   * @returns A hexadecimal string representation of the HMAC-SHA256 hash
   *
   * @example
   * ```typescript
   * const hmac = generateHMAC('mySecretData');
   * console.log(hmac); // Returns a 64-character hex string
   * ```
   */
  generateHMAC(value: string) {
    return createHmac('sha256', this.configService.get<string>('HMAC_KEY'))
      .update(value)
      .digest('hex');
  }
}
