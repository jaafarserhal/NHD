using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Common.Models
{
    public class PagedServiceResult<T> : ServiceResult<T>
    {
        public int Total { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)Total / Limit);

        public static PagedServiceResult<T> Success(T data, int total, int page, int limit)
        {
            return new PagedServiceResult<T>
            {
                IsSuccess = true,
                Data = data,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public new static PagedServiceResult<T> Failure(string errorMessage)
        {
            return new PagedServiceResult<T> { IsSuccess = false, ErrorMessage = errorMessage };
        }

        public new static PagedServiceResult<T> ValidationFailure(List<string> validationErrors)
        {
            return new PagedServiceResult<T>
            {
                IsSuccess = false,
                ValidationErrors = validationErrors,
                ErrorMessage = "Validation failed"
            };
        }
    }
}