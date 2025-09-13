using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Utilities;

namespace NHD.Core.Common.Models
{
    public class AppApiResponse<T>
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
        public int StatusCode { get; set; }

        public static AppApiResponse<T> Success(T data, string message = "Success")
        {
            return new AppApiResponse<T>
            {
                IsSuccess = true,
                Data = data,
                Message = message,
                StatusCode = HttpStatusCodeEnum.OK.AsInt()
            };
        }

        public static AppApiResponse<T> Failure(string message, HttpStatusCodeEnum statusCode = HttpStatusCodeEnum.InternalServerError)
        {
            return new AppApiResponse<T>
            {
                IsSuccess = statusCode == HttpStatusCodeEnum.InternalServerError ? false : true,
                Data = default,
                Message = message,
                StatusCode = statusCode.AsInt()
            };
        }
    }


}