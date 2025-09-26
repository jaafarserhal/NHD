


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
        ProductCategory = 100,
        ProductType = 200,
        ProductSize = 300,
    }

    public enum ProductSizeEnum
    {
        Pieces_8 = 300,
        Pieces_20 = 301,
        Pieces_35 = 302,
        Grams_250 = 303,
        Grams_400 = 305,
        Grams_450 = 311,
        Grams_500 = 304,
        Pieces_3 = 308,
        Piece_1 = 309,
        Milliliters_400 = 310
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
