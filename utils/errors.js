export const createError = (errMsg, status) => {
    const err = new Error(errMsg);
    err.status = status;
    return err;
  };
  