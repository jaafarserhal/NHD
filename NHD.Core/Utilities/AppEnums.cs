


namespace NHD.Core.Utilities
{

    public enum RoleType
    {
        Undefined = 0,
        Admin = 1,
        StoreOwner = 2,
        Customer = 3

    }


    public enum LookupType
    {
        Undefined = 0,
        StoreCategory = 1,
    }

    public enum HttpStatusCodeEnum
    {
        OK = 200,
        BadRequest = 400,
        Unauthorized = 401,
        Forbidden = 403,
        NotFound = 404,
        Conflict = 409,
        InternalServerError = 500,
        // Add more as needed
    }

    public enum UserStatusLookup
    {
        Undefined = 0,
        Active = 100,
        Blocked = 101,
        ChangePasswordRequired = 102,
        Deleted = 103
    }

    public enum UserCodeStatusLookup
    {
        Pending = 200,
        Processed = 201,
        Canceled = 202

    }


}
