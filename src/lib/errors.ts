export type CvErrorDetails = Readonly<Record<string, string | number>>;

export class CvError extends Error {
  readonly details: CvErrorDetails;

  constructor(message: string, details: CvErrorDetails = {}, cause?: unknown) {
    // `{ cause: undefined }` still installs a `cause` property, which error dumps print as "[cause]: undefined".
    super(message, cause === undefined ? undefined : { cause });
    this.name = "CvError";
    this.details = details;
  }
}

export class DataSourceError extends CvError {
  constructor(message: string, details: CvErrorDetails = {}, cause?: unknown) {
    super(message, details, cause);
    this.name = "DataSourceError";
  }
}

export class CollectionError extends CvError {
  constructor(message: string, details: CvErrorDetails = {}, cause?: unknown) {
    super(message, details, cause);
    this.name = "CollectionError";
  }
}
