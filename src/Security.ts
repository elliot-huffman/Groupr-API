import { SecurityConfig } from "./Config"
import * as Crypto from "crypto";

// Create and export the password hashing function used for user passwords.
export function HashPassword(Password: string) {
    // Instantiate the crypto hash class and configure the algorithm that is used.
    const hash = Crypto.createHash(SecurityConfig.HashAlgorithm);
    // Hash the given password.
    hash.update(Password);
    // Return the results of the hash operation in hexadecimal (standard hash).
    return hash.digest('hex');
}

export function CompareHash(toHash: string, existingHash: string) {
    if (HashPassword(toHash) === existingHash) {
        return true;
    } else {
        return false;
    }
}