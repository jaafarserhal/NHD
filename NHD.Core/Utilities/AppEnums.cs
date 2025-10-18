﻿


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
        Piece_1 = 300,
        Pieces_3 = 301,
        Pieces_8 = 302,
        Pieces_9 = 303,
        Pieces_12 = 304,
        Pieces_20 = 305,
        Pieces_35 = 306,
        Grams_250 = 307,
        Grams_400 = 308,
        Grams_450 = 309,
        Grams_500 = 310,
        Milliliters_400 = 311
    }


    public enum BoxCategoryEnum
    {
        SignatureDateGifts = 100,
        SignatureDates = 101,
        ChocolateDates = 102,
        ClassicDatePouches = 103,
        DateSnacks = 104,
        DateSweetners = 105
    }

    public enum BoxTypeEnum
    {
        PlainDate = 200,
        AssortedDate = 201,
        FilledDate = 202,
        None = 203
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
