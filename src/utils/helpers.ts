export const setParams = <T extends ParamsObject>(params: T): URLSearchParams => {
  const newParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          newParams.append(key, item.toString());
        }
      });
    } else {
      newParams.append(key, value.toString());
    }
  }

  return newParams;
};

export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

enum DocumentStatusEnum {
  UPLOADED = "uploaded",
  PENDING_REPLACE = "pending_replace",
  PENDING_REMOVE = "pending_remove",
  APPROVED_REPLACE = "approved_replace",
  APPROVED_REMOVE = "approved_remove",
  REJECTED_REPLACE = "rejected_replace",
  REJECTED_REMOVE = "rejected_remove",
}

export const getStatus = (status: DocumentStatusEnum) => {
  switch (status) {
    case DocumentStatusEnum.UPLOADED:
      return "Uploaded";
    case DocumentStatusEnum.PENDING_REPLACE:
      return "Pending Replace";
    case DocumentStatusEnum.PENDING_REMOVE:
      return "Pending Remove";
    case DocumentStatusEnum.APPROVED_REPLACE:
      return "Approved Replace";
    case DocumentStatusEnum.APPROVED_REMOVE:
      return "Approved Remove";
    case DocumentStatusEnum.REJECTED_REPLACE:
      return "Rejected Replace";
    case DocumentStatusEnum.REJECTED_REMOVE:
      return "Rejected Remove";
    default:
      return "Unknown Status";
  }
};

export const getSeverity = (status: DocumentStatusEnum) => {
  switch (status) {
    case DocumentStatusEnum.UPLOADED:
      return "success";
    case DocumentStatusEnum.PENDING_REPLACE:
    case DocumentStatusEnum.PENDING_REMOVE:
      return "warning";
    case DocumentStatusEnum.APPROVED_REPLACE:
    case DocumentStatusEnum.APPROVED_REMOVE:
      return "info";
    case DocumentStatusEnum.REJECTED_REPLACE:
    case DocumentStatusEnum.REJECTED_REMOVE:
      return "danger";
    default:
      return "secondary";
  }
};
