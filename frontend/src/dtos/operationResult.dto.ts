export type SuccessfulOperationDTO<T> = {
  message : string;
  success : true;
  body    : T
}

export type FailedOperationDTO = {
  message : string;
  success : false;
  error   : string;
}

export type OperationResult<T> = SuccessfulOperationDTO<T> | FailedOperationDTO;