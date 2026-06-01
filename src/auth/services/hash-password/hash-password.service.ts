import { Injectable } from '@nestjs/common';
import { hash, argon2id, verify } from 'argon2';
import { randomBytes } from 'node:crypto';
/**
 * Service responsible for hashing and verifying passwords using Argon2id algorithm.
 *
 * This service provides secure password hashing functionality with configurable
 * parameters for memory cost, time cost, and parallelism to ensure strong
 * protection against brute-force and rainbow table attacks.
 */

@Injectable()
export class HashPasswordService {
  /**
   * Hashes a plain text password using Argon2id algorithm with predefined security parameters.
   *
   * @param password - The plain text password to be hashed
   * @returns A promise that resolves to the hashed password string
   *
   * @example
   * ```typescript
   * const hashedPassword = await hashPasswordService.hashPassword('mySecretPassword');
   * ```
   */
  async hashPassword(password: string, salt: string): Promise<string> {
    return await hash(password, {
      type: argon2id,
      memoryCost: 2 ** 5, // 32 KB
      timeCost: 3,
      parallelism: 2,
      salt: Buffer.from(salt, 'hex'),
    });
  }
  /**
   * Verifies a plain text password against a previously hashed password.
   *
   * @param password - The plain text password to verify
   * @param hash - The hashed password to compare against
   * @returns A promise that resolves to true if the password matches, false otherwise
   *
   * @example
   * ```typescript
   * const isValid = await hashPasswordService.verifyPassword('mySecretPassword', hashedPassword);
   * ```
   */
  async verifyPassword(password, hash) {
    return await verify(hash, password);
  }

  /**
   * Generates a cryptographically secure random salt for password hashing.
   *
   * @returns A promise that resolves to a 32-character hexadecimal string
   * representing a 16-byte random salt.
   *
   * @example
   * ```typescript
   * const salt = await hashPasswordService.generateSalt();
   * console.log(salt); // "a1b2c3d4e5f6789012345678901234ab"
   * ```
   */
  generateSalt() {
    return randomBytes(16).toString('hex');
  }
}
