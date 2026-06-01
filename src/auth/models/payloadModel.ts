/**
 * Represents the payload data structure for authentication tokens.
 * Contains essential user information that is typically encoded in JWT tokens.
 *
 * @interface PayloadModel
 */
export interface PayloadModel {
  id: string;
  email: string;
  name?: string;
  /**
   * @deprecated Use roles[] instead. Kept for backward compatibility
   */
  role?: string;
  /**
   * Array of role codes assigned to the user
   * @example ['admin', 'accountant']
   */
  roles?: string[];
}
