import { Location } from ".";

export interface TestError {
  /**
   * Error location in the source code.
   */
  location?: Location;

  /**
   * Error message. Set when [Error] (or its subclass) has been thrown.
   */
  message?: string;

  /**
   * Source code snippet with highlighted error.
   */
  snippet?: string;

  /**
   * Error stack. Set when [Error] (or its subclass) has been thrown.
   */
  stack?: string;

  /**
   * The value that was thrown. Set when anything except the [Error] (or its subclass) has been thrown.
   */
  value?: string;
}
