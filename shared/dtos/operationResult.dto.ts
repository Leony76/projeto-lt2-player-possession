export type SuccessfulOperationResponse<T> = {
  message : string;
  success : true;
  body    : T
}

export type FailedOperationResponse = {
  message : string;
  success : false;
  error   : unknown;
}

export type OperationResultResponse<T> = 
| SuccessfulOperationResponse<T> 
| FailedOperationResponse
;