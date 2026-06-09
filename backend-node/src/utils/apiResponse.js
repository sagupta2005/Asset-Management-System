/**
 * Standardized API response helpers.
 */

class ApiResponse {
  constructor(success, status, message, data = null, errors = null) {
    this.success = success;
    this.status = status;
    this.message = message;
    if (data !== null) this.data = data;
    if (errors !== null) this.errors = errors;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = 'Success') {
    return new ApiResponse(true, 200, message, data);
  }

  static created(data, message = 'Created successfully') {
    return new ApiResponse(true, 201, message, data);
  }

  static noContent(message = 'Operation successful') {
    return new ApiResponse(true, 200, message, null);
  }

  static error(status, message, errors = null) {
    return new ApiResponse(false, status, message, null, errors);
  }
}

/**
 * Paged response wrapper.
 */
class PagedResponse {
  constructor(content, page, size, totalElements, totalPages, last) {
    this.content = content;
    this.page = page;
    this.size = size;
    this.totalElements = totalElements;
    this.totalPages = totalPages;
    this.last = last;
    this.first = page === 0;
  }

  static from(rows, count, page, size) {
    const totalPages = Math.ceil(count / size);
    return new PagedResponse(
      rows,
      page,
      size,
      count,
      totalPages,
      page >= totalPages - 1
    );
  }
}

module.exports = { ApiResponse, PagedResponse };
